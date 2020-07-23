const log = require('../lib/log');
const { sleep } = require('../lib/utils');

class Contract {
  constructor(chain, abi, contractAddress, ownerPrivateKey, ownerPrivateAddress) {
    this.address = contractAddress.toLowerCase();
    this.pv_key = ownerPrivateKey.toLowerCase();
    this.pv_address = ownerPrivateAddress.toLowerCase();
    this.price_decimal = parseInt(process.env.PRICE_DECIMAL);
    this.abi = abi;

    this.contract = new chain.web3.eth.Contract(abi, this.address);
    this.web3 = chain.web3;
    this.core = chain.core;
    this.signTx = chain.signTx;
    this.retryTimes = parseInt(process.env.RECEIPT_RETRY_TIMES);
  }

  async doOperator(opName, data, gasLimit, value, count, privateKey, pkAddress) {
    log.debug(`do operator: ${opName}`);
    const nonce = await this.core.getTxCount(pkAddress);
    const gas = gasLimit ? gasLimit : await this.core.estimateGas(pkAddress, this.address, value, data) + 200000;
    const rawTx = this.signTx(gas, nonce, data, privateKey, value, this.address);
    const txHash = await this.core.sendRawTxByWeb3(rawTx);
    log.info(`${opName} hash: ${txHash}`);
    let receipt = null;
    let tryTimes = 0;
    do {
        await sleep(parseInt(process.env.RECEIPT_RETRY_INTERVAL));
        receipt = await this.core.getTransactionReceipt(txHash);
        tryTimes ++;
    } while (!receipt && tryTimes < count);
    if (!receipt) {
        const content = `${opName} failed to get receipt, tx=${txHash} receipt, data: ${data}, nonce:${nonce}`;
        log.error(content);
        throw new Error(content);
    }

    log.debug(`${opName} receipt: ${JSON.stringify(receipt)}`);
    return  { status: receipt.status, logs: receipt.logs};
  }
}

module.exports = Contract;

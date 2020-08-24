const log = require('../lib/log');
const { sleep } = require('../lib/utils');

class Contract {
  constructor(chain, abi, contractAddress, ownerPrivateKey, ownerPrivateAddress) {
    this.address = contractAddress.toLowerCase();
    this.pv_key = ownerPrivateKey ? ownerPrivateKey.toLowerCase() : ownerPrivateKey;
    this.pv_address = ownerPrivateAddress ? ownerPrivateAddress.toLowerCase() : ownerPrivateAddress;
    this.price_decimal = parseInt(process.env.PRICE_DECIMAL);
    this.abi = abi;

    this.contract = new chain.web3.eth.Contract(abi, this.address);
    this.web3 = chain.web3;
    this.core = chain.core;
    this.signTx = chain.signTx;
    this.retryTimes = parseInt(process.env.RECEIPT_RETRY_TIMES);
  }

  async implementation() {
    return await this.core.getScFun("implementation", [], this.contract, this.abi);
  }

  async getOwner() {
    return await this.core.getScVar("owner", this.contract, this.abi);
  }

  async acceptOwnership(newSk, newOwner) {
    const data2 = this.contract.methods.acceptOwnership().encodeABI();
    const obj2 = await this.doOperator("acceptOwnership", data2, null, '0x00', this.retryTimes, newSk, newOwner);
    if (obj2.status) {
      this.pv_key = newSk.toLowerCase();
      this.pv_address = newOwner.toLowerCase();
    }
  }

  async changeOwner(oldOwner, oldSk, newOwner, newSk) {
    const old = await this.getOwner();
    if (old.toLowerCase() === oldOwner.toLowerCase()) {
      const data = this.contract.methods.changeOwner(newOwner).encodeABI();
      const obj = await this.doOperator(this.changeOwner.name, data, null, '0x00', this.retryTimes, oldSk, oldOwner);
      if (obj.status) {
        await this.acceptOwnership(newSk, newOwner);
      }
    }
  }

  async upgradeTo(impl) {
    const data = this.contract.methods.upgradeTo(impl).encodeABI();
    this.doOperator(this.upgradeTo.name, data, null, '0x00', this.retryTimes, this.pv_key, this.pv_address);
  }

  async doOperator(opName, data, gasLimit, value, count, privateKey, pkAddress) {
    log.debug(`${this.core.chainType} do operator: ${opName}`);
    const nonce = await this.core.getTxCount(pkAddress);

    const gas = gasLimit ? gasLimit : await this.core.estimateGas(pkAddress, this.address, value, data) + 200000;
    const rawTx = this.signTx(gas, nonce, data, privateKey, value, this.address);
    const txHash = await this.core.sendRawTxByWeb3(rawTx);

    log.info(`${this.core.chainType} ${opName} hash: ${txHash}`);
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

    log.debug(`${this.core.chainType} ${opName} receipt: ${JSON.stringify(receipt)}`);
    return  { status: receipt.status, logs: receipt.logs};
  }
}

module.exports = Contract;

const abiOracle = require('../../abi/oracleDelegate');
const log = require('./log');
const wanHelper = require('./wanchain-helper');
const wanChain = require(`./${process.env.CHAIN_ENGINE}`).wanChain;
const web3 = require(`./${process.env.CHAIN_ENGINE}`).web3;
const { sleep } = require('./utils');

log.info("contract init");

class Contract {
  constructor(contractAddress, ownerPrivateKey, ownerPrivateAddress, abi) {
    this.address = contractAddress.toLowerCase();
    this.pv_key = ownerPrivateKey.toLowerCase();
    this.pv_address = ownerPrivateAddress.toLowerCase();
    this.price_decimal = parseInt(process.env.PRICE_DECIMAL);
    this.abi = abi;

    this.contract = new web3.eth.Contract(abi, this.address);
    this.web3 = web3;
    this.wanChain = wanChain;
  }

  async doOperator(opName, data, gasLimit, value, count, privateKey, pkAddress) {
    log.debug(`do operator: ${opName}`);
    const nonce = await wanChain.getTxCount(pkAddress);
    let gas = gasLimit ? gasLimit : await wanChain.estimateGas(pkAddress, this.address, value, data) + 200000;
    const maxGas = parseInt(process.env.GASLIMIT);
    if (gas > maxGas) {
      gas = maxGas;
    }
    const rawTx = wanHelper.signTx(gas, nonce, data, privateKey, value, this.address);
    const txHash = await wanChain.sendRawTxByWeb3(rawTx);
    log.info(`${opName} hash: ${txHash}`);
    let receipt = null;
    let tryTimes = 0;
    do {
        await sleep(5000);
        receipt = await wanChain.getTransactionReceipt(txHash);
        tryTimes ++;
    } while (!receipt && tryTimes < count);
    if (!receipt) {
        const content = `${opName} failed to get receipt, tx=${txHash} receipt, data: ${data}, nonce:${nonce}`;
        log.error(content);
        throw content;
    }

    log.debug(`${opName} receipt: ${JSON.stringify(receipt)}`);
    return  { status: receipt.status, logs: receipt.logs};
  }
}

class Oracle extends Contract {
  constructor() {
    super(process.env.ORACLE_ADDRESS, process.env.ORACLE_PV_KEY, process.env.ORACLE_PV_ADDRESS, abiOracle);
  }

  async addWhitelist(whiterAddress, owner_pv_key, owner_pv_address) {
    const data = this.contract.methods.addWhitelist(whiterAddress).encodeABI();
    return await this.doOperator(this.addWhitelist.name, data, null, '0x00', 7, owner_pv_key, owner_pv_address);
  }

  fractionToDecimalString(priceRaw, price_decimal) {
    let leftDecimal = price_decimal;
    let decimal = 0;

    const priceRawSplit = (priceRaw + "").split('.');
    let priceStr = priceRawSplit[0];
    if (priceRawSplit.length > 0) {
      decimal = priceRawSplit[1].length;
      priceStr += priceRawSplit[1];
    }
    const price = web3.utils.toBN(priceStr);
    if (decimal > price_decimal) {
      throw `${it} decimal > ${price_decimal}, price = ${symbolPriceMap[it]}`;
    }

    return '0x' + price.mul(web3.utils.toBN(Math.pow(10, price_decimal - decimal))).toString('hex');
  }

  async updatePrice(symbolPriceMap) {
    const keys = Object.keys(symbolPriceMap);
    const priceUintArray = [];
    const symbolByteArray = [];

    keys.map(it => {
      const priceRaw = symbolPriceMap[it];
      const priceUnit = this.fractionToDecimalString(priceRaw, this.price_decimal)
      symbolByteArray.push(web3.utils.toHex(it));
      priceUintArray.push(priceUnit);
    })

    const data = this.contract.methods.updatePrice(symbolByteArray, priceUintArray).encodeABI();
    return await this.doOperator(this.updatePrice.name, data, null, '0x00', 7, this.pv_key, this.pv_address);
  }
}

module.exports = {
  Oracle
}

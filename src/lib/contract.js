const abiOracle = require('../../abi/oracleDelegate.json');
const abiTokenManager = require('../../abi/tokenManagerDelegate.json');
const log = require('./log');

const { sleep } = require('./utils');

log.info("contract init");

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
        await sleep(5000);
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

class Oracle extends Contract {
  constructor(chain, address, ownerPV, ownerAddress) {
    super(chain, abiOracle, address, ownerPV, ownerAddress);
  }

  async updatePrice(symbolPriceMap) {
    const keys = Object.keys(symbolPriceMap);
    if (keys.length === 0) {
      return ;
    }
    const priceUintArray = [];
    const symbolByteArray = [];

    keys.forEach(it => {
      // const priceRaw = symbolPriceMap[it];
      // const priceUnit = this.fractionToDecimalString(priceRaw, this.price_decimal)

      const priceUnit = symbolPriceMap[it];
      symbolByteArray.push(this.web3.utils.toHex(it));
      priceUintArray.push(priceUnit);
    })

    const data = this.contract.methods.updatePrice(symbolByteArray, priceUintArray).encodeABI();
    return await this.doOperator(this.updatePrice.name, data, null, '0x00', 7, this.pv_key, this.pv_address);
  }

  async updateDeposit(smgID, amount) {
    const data = this.contract.methods.updateDeposit(smgID, amount).encodeABI();
    return await this.doOperator(this.updateDeposit.name, data, null, '0x00', 7, this.pv_key, this.pv_address);
  }

  async setStoremanGroupStatus(id, status) {
    const data = this.contract.methods.setStoremanGroupStatus(id, status).encodeABI();
    return await this.doOperator(this.setStoremanGroupStatus.name, data, null, '0x00', 7, this.pv_key, this.pv_address);
  }

  async setStoremanGroupConfig(id, status, deposit, chain, curve, gpk1, gpk2, startTime, endTime) {
    const data = this.contract.methods.setStoremanGroupConfig(id, status, deposit, chain, curve, gpk1, gpk2, startTime, endTime).encodeABI();
    return await this.doOperator(this.setStoremanGroupConfig.name, data, null, '0x00', 7, this.pv_key, this.pv_address);
  }

  async getValue(key) {
    return await this.core.getScFun("getValue", [this.web3.utils.toHex(key)], this.contract, this.abi);
  }

  async getValues(keys) {
    const symbolsStringArray = keys.replace(/\s+/g,"").split(',');
    const symbolsArray = symbolsStringArray.map(i => {return this.web3.utils.toHex(i);})
    return await this.core.getScFun("getValues", [symbolsArray], this.contract, this.abi);
  }

  async getDeposit(smgID) {
    return await this.core.getScFun("getDeposit", [smgID], this.contract, this.abi);
  }

  async getStoremanGroupConfig(id) {
    return await this.core.getScFun("getStoremanGroupConfig", [id], this.contract, this.abi);
  }
}

class TokenManager extends Contract {
  constructor(chain) {
    super(chain, abiTokenManager, process.env.TOKEN_MANAGER_ADDRESS, process.env.TOKEN_MANAGER_PV_KEY, process.env.TOKEN_MANAGER_PV_ADDRESS);
  }
}

module.exports = {
  Contract,
  Oracle,
  TokenManager
}

const Contract = require('./contract');
const abiTokenManager = require('../../abi/abi.TokenManagerDelegate.json');
const { web3 } = require('../../src/lib/utils');

const hexToBytes = web3.utils.hexToBytes;

class TokenManager extends Contract {
  constructor(chain, address, ownerPV, ownerAddress, abi) {
    super(chain, abi ? abi : abiTokenManager, address, ownerPV, ownerAddress);
  }

  async addToken(name, symbol, decimals) {
    const data = await this.contract.methods.addToken(name, symbol, decimals).encodeABI();
    return await this.doOperator(this.addToken.name, data, null, '0x00', this.retryTimes, this.pv_key, this.pv_address);
  }

  async addTokenPair(id, aInfo, fromChainID, fromAccount, toChainID, toAccount) {
    const aInfoParam = Array.from(aInfo);
    if (typeof (aInfo[0]) === 'string') {
      aInfoParam[0] = hexToBytes(aInfo[0])
    }
    const fromAccountParam = typeof (fromAccount) === 'string' ? hexToBytes(fromAccount) : fromAccount 

    const data = await this.contract.methods.addTokenPair(id, aInfoParam, fromChainID, fromAccountParam, toChainID, toAccount).encodeABI();
    return await this.doOperator(this.addTokenPair.name, data, null, '0x00', this.retryTimes, this.pv_key, this.pv_address);
  }

  async updateTokenPair(id, aInfo, fromChainID, fromAccount, toChainID, toAccount) {
    const aInfoParam = Array.from(aInfo);
    if (typeof (aInfo[0]) === 'string') {
      aInfoParam[0] = hexToBytes(aInfo[0])
    }
    const fromAccountParam = typeof (fromAccount) === 'string' ? hexToBytes(fromAccount) : fromAccount 

    const data = await this.contract.methods.updateTokenPair(id, aInfoParam, fromChainID, fromAccountParam, toChainID, toAccount).encodeABI();
    return await this.doOperator(this.updateTokenPair.name, data, null, '0x00', this.retryTimes, this.pv_key, this.pv_address);
  }

  async getTokenPairs() {
    return await this.core.getScFun("getTokenPairs", [], this.contract, this.abi);
  }

  async getTokenPairInfo(id) {
    return await this.core.getScFun("getTokenPairInfo", [id], this.contract, this.abi);
  }

  async getTokenPairsFullFields(id) {
    return await this.core.getScFun("getTokenPairsFullFields", [], this.contract, this.abi);
  }
  async getTokenPairsByChainID(fromChainId, toChainId) {
    return await this.core.getScFun("getTokenPairsByChainID", [fromChainId, toChainId], this.contract, this.abi);
  }
  async getTokenPairsByChainID2(fromChainId, toChainId) {
    return await this.core.getScFun("getTokenPairsByChainID2", [fromChainId, toChainId], this.contract, this.abi);
  }
  async getAncestorInfo(id) {
    return await this.core.getScFun("getAncestorInfo", [id], this.contract, this.abi);
  }

  async getTokenInfo(id) {
    return await this.core.getScFun("getTokenInfo", [id], this.contract, this.abi);
  }

  async updateToken(address, name, symbol) {
    const data = await this.contract.methods.updateToken(address, name, symbol).encodeABI();
    return await this.doOperator(this.updateToken.name, data, null, '0x00', this.retryTimes, this.pv_key, this.pv_address);
  }

  async totalTokenPairs() {
    return await this.core.getScVar('totalTokenPairs', this.contract, this.abi);
  }

  async mapTokenPairIndex(index) {
    return await this.core.getScMap('mapTokenPairIndex', index, this.contract, this.abi);
  }

  async mapTokenPairInfo(id) {
    return await this.core.getScMap('mapTokenPairInfo', id, this.contract, this.abi);
  }

  async removeTokenPair(id) {
    const data = this.contract.methods.removeTokenPair(id).encodeABI();
    return await this.doOperator(this.removeTokenPair.name, data, null, '0x00', this.retryTimes, this.pv_key, this.pv_address);
  }
}

module.exports = TokenManager;
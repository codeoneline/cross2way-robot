const Contract = require('./contract');
const abiTokenManager = require('../../abi/token-manager-delegate.json');

class TokenManager extends Contract {
  constructor(chain, address, ownerPV, ownerAddress) {
    super(chain, abiTokenManager, address, ownerPV, ownerAddress);
  }

  async addToken(name, symbol, decimals) {
    const data = await this.contract.methods.addToken(name, symbol, decimals).encodeABI();
    return await this.doOperator(this.addToken.name, data, null, '0x00', this.retryTimes, this.pv_key, this.pv_address);
  }

  async addTokenPair(id, aInfo, fromChainID, fromAccount, toChainID, toAccount) {
    const data = await this.contract.methods.addTokenPair(id, aInfo, fromChainID, fromAccount, toChainID, toAccount).encodeABI();
    return await this.doOperator(this.addTokenPair.name, data, null, '0x00', this.retryTimes, this.pv_key, this.pv_address);
  }

  async updateTokenPair(id, aInfo, fromChainID, fromAccount, toChainID, toAccount) {
    const data = await this.contract.methods.updateTokenPair(id, aInfo, fromChainID, fromAccount, toChainID, toAccount).encodeABI();
    return await this.doOperator(this.updateTokenPair.name, data, null, '0x00', this.retryTimes, this.pv_key, this.pv_address);
  }

  async getTokenPairs() {
    return await this.core.getScFun("getTokenPairs", [], this.contract, this.abi);
  }

  async getTokenPairInfo(id) {
    return await this.core.getScFun("getTokenPairInfo", [id], this.contract, this.abi);
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
}

module.exports = TokenManager;
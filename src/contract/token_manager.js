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
}

module.exports = TokenManager;
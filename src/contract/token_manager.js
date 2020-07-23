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

  async addTokenPair(id, aInfo, fromChainID, fromAccount, toChainID, tokenAddress) {
    const data = await this.contract.methods.addTokenPair(id, aInfo, fromChainID, fromAccount, toChainID, tokenAddress).encodeABI();
    return await this.doOperator(this.addTokenPair.name, data, null, '0x00', this.retryTimes, this.pv_key, this.pv_address);
  }
}

module.exports = TokenManager;
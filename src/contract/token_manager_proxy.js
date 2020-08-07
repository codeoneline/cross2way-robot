const Contract = require('./contract');
const abiTokenManager = require('../../abi/token-manager-proxy.json');

class TokenManager extends Contract {
  constructor(chain, address, ownerPV, ownerAddress) {
    super(chain, abiTokenManager, address, ownerPV, ownerAddress);
  }
}

module.exports = TokenManager;
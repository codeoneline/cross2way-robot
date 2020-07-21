const Contract = require('./contract');
const abiStoremanGroupAdmin = require('../../abi/tokenManagerDelegate.json');

class TokenManager extends Contract {
  constructor(chain, address, ownerPV, ownerAddress) {
    super(chain, abiTokenManager, address, ownerPV, ownerAddress);
  }
}

module.exports = TokenManager;
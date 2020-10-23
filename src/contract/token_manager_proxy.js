const Contract = require('./contract');
const abiTokenManager = require('../../abi/token-manager-proxy.json');

class TokenManagerProxy extends Contract {
  constructor(chain, address, ownerPV, ownerAddress, abi) {
    super(chain, abi ? abi : abiTokenManager, address, ownerPV, ownerAddress);
  }
}

module.exports = TokenManagerProxy;
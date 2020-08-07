const Contract = require('./contract');
const abiOracle = require('../../abi/oracle-proxy.json');
const { web3 } = require('../lib/utils');

class Oracle extends Contract {
  constructor(chain, address, ownerPV, ownerAddress) {
    super(chain, abiOracle, address, ownerPV, ownerAddress);
  }
}

module.exports = Oracle;
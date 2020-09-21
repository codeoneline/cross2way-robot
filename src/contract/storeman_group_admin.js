const Contract = require('./contract');
const abiStoremanGroupAdmin = require('../../abi/abi.StoremanGroupDelegate.json');

class StoremanGroupAdmin extends Contract {
  constructor(chain, address, ownerPV, ownerAddress) {
    super(chain, abiStoremanGroupAdmin, address, ownerPV, ownerAddress);
  }

  async getStoremanGroupConfig(id) {
    return await this.core.getScFun("getStoremanGroupConfig", [id], this.contract, this.abi);
  }
}

module.exports = StoremanGroupAdmin;
const Contract = require('./contract');
const abiStoremanGroupAdmin = require('../../abi/abi.StoremanGroupDelegate.json');

class StoremanGroupAdmin extends Contract {
  constructor(chain, address, ownerPV, ownerAddress, abi) {
    super(chain, abi ? abi : abiStoremanGroupAdmin, address, ownerPV, ownerAddress);
  }

  async getStoremanGroupConfig(id) {
    return await this.core.getScFun("getStoremanGroupConfig", [id], this.contract, this.abi);
  }

  async quotaInst() {
    return await this.getVar('quotaInst')
  }
}

module.exports = StoremanGroupAdmin;
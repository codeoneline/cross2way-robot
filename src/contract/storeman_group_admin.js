const Contract = require('./contract');
const abiStoremanGroupAdmin = require('../../abi/smg.json');

class StoremanGroupAdmin extends Contract {
  constructor(chain, address, ownerPV, ownerAddress) {
    super(chain, abiStoremanGroupAdmin, address, ownerPV, ownerAddress);
  }

  async setStoremanGroupConfig(id, status, deposit, chain, curve, gpk1, gpk2, startTime, endTime) {
    const data = this.contract.methods.setStoremanGroupConfig(id, status, deposit, chain, curve, gpk1, gpk2, startTime, endTime).encodeABI();
    return await this.doOperator(this.setStoremanGroupConfig.name, data, null, '0x00', 7, this.pv_key, this.pv_address);
  }

  async registerStart(id, workStart, workDuration, registerDuration,  preGroupId) {
    const data = this.contract.methods.registerStart(id, workStart, workDuration, registerDuration,  preGroupId).encodeABI();
    return await this.doOperator(this.registerStart.name, data, null, '0x00', 7, this.pv_key, this.pv_address);
  }

  async getStoremanGroupConfig(id) {
    return await this.core.getScFun("getStoremanGroupConfig", [id], this.contract, this.abi);
  }
}

module.exports = StoremanGroupAdmin;
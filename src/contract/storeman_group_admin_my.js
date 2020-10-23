const Contract = require('./contract');
const abiStoremanGroupAdmin = require('../../abi/smg_my.json');
const { web3 } = require('../lib/utils');

class StoremanGroupAdmin extends Contract {
  constructor(chain, address, ownerPV, ownerAddress, abi) {
    super(chain, abi ? abi : abiStoremanGroupAdmin, address, ownerPV, ownerAddress);
  }

  async setStoremanGroupConfig(id, status, deposit, chain, curve, gpk1, gpk2, startTime, endTime) {
    const _deposit = "0x" + web3.utils.toBN(deposit).toString('hex');
    const _chain = ["0x" + web3.utils.toBN(chain[0]).toString('hex'),
                  "0x" + web3.utils.toBN(chain[1]).toString('hex')];
    const _curve = ["0x" + web3.utils.toBN(curve[0]).toString('hex'),
                  "0x" + web3.utils.toBN(curve[1]).toString('hex')];
    const _startTime = "0x" + web3.utils.toBN(startTime).toString('hex');
    const _endTime = "0x" + web3.utils.toBN(endTime).toString('hex');

    const data = this.contract.methods.setStoremanGroupConfig(id, status, _deposit, _chain, _curve, gpk1, gpk2, _startTime, _endTime).encodeABI();
    return await this.doOperator(this.setStoremanGroupConfig.name, data, null, '0x00', this.retryTimes, this.pv_key, this.pv_address);
  }

  async registerStart(id, workStart, workDuration, registerDuration,  preGroupId) {
    const _workStart = "0x" + web3.utils.toBN(workStart).toString('hex');
    const _workDuration = "0x" + web3.utils.toBN(workDuration).toString('hex');
    const _registerDuration = "0x" + web3.utils.toBN(registerDuration).toString('hex');

    const data = this.contract.methods.registerStart(id, _workStart, _workDuration, _registerDuration,  preGroupId).encodeABI();
    return await this.doOperator(this.registerStart.name, data, null, '0x00', this.retryTimes, this.pv_key, this.pv_address);
  }
  
  async getStoremanGroupConfig(id) {
    return await this.core.getScFun("getStoremanGroupConfig", [id], this.contract, this.abi);
  }
}

module.exports = StoremanGroupAdmin;
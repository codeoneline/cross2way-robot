const Contract = require('./contract');
const abi = require('../../abi/abi.CrossDelegate.json');

class Cross extends Contract {
  constructor(chain, address, ownerPV, ownerAddress) {
    super(chain, abi, address, ownerPV, ownerAddress);
  }

  // returns(address tokenManager, address smgAdminProxy, address smgFeeProxy, address quota, address sigVerifier)
  async getPartners() {
    await this.getFun(this.getPartners.name)
  }

  // returns(uint lockFee, uint revokeFee)
  async getFees(fromChainId, toChainId) {
    await this.getFun(this.getPartners.name, fromChainId, toChainId)
  }

  // htlc time uint256
  async lockedTime() {
    await this.getVar('lockedTime')
  }

  // smgFeeReceiverTimeout time uint256
  async smgFeeReceiverTimeout() {
    await this.getVar('smgFeeReceiverTimeout')
  }
}

module.exports = Cross
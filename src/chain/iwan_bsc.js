const { signTx } = require('../lib/ethereum-helper');
const IWan = require('../lib/iwan_chain');

class IWanEth extends IWan {
  constructor() {
    super(process.env.CHAINTYPE_BSC);
  }
}

const iWanBSC = new IWanEth();

module.exports = {
  core: iWanBSC,
  web3: iWanBSC.web3,
  signTx: signTx,
};
const { signTx } = require('../lib/ethereum-helper');
const IWan = require('../lib/iwan_chain');

class IWanEth extends IWan {
  constructor() {
    super(process.env.CHAINTYPE_ETH);
  }
}

const iWanEth = new IWanEth();

module.exports = {
  core: iWanEth,
  web3: iWanEth.web3,
  signTx: signTx,
};
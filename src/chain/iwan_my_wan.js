const { signTx } = require('../lib/wanchain-helper');
const IWan = require('../lib/iwan_chain');

class IWanWan extends IWan {
  constructor() {
    super(process.env.IWAN_CHAINTYPE_WAN, "WAN");
  }
}

const iWanWan = new IWanWan();

module.exports = {
  core: iWanWan,
  web3: iWanWan.web3,
  signTx: signTx,
};
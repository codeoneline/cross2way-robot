const IWan = require('../lib/iwan_chain');
const { signTx } = require('../lib/etc-helper');

class IWanEtc extends IWan {
  constructor() {
    super(process.env.IWAN_CHAINTYPE_ETC, "ETC");
  }
}

const iWanEtc = new IWanEtc();

module.exports = {
  core: iWanEtc,
  web3: iWanEtc.web3,
  signTx: signTx,
};
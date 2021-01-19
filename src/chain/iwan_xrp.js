const IWan = require('../lib/iwan_chain');
const { pkToAddress } = require('../lib/btc');

class IWanXrp extends IWan {
  constructor() {
    super(process.env.CHAINTYPE_XRP);
  }
}

const iWanXrp = new IWanXrp();

module.exports = {
  core: iWanXrp
};
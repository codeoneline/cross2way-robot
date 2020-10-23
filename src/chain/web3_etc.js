const BaseChain = require('../lib/web3_chain');
const { signTx } = require('../lib/etc-helper');

class EtcChain extends BaseChain {
  constructor() {
    super(process.env.RPC_URL_ETC, process.env.CHAINTYPE_ETC);
  }
}

const etcChain = new EtcChain();

module.exports = {
  core: etcChain,
  web3: etcChain.web3,
  signTx: signTx,
}
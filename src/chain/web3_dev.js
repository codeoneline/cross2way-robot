const BaseChain = require('../lib/web3_chain');
const { signTx } = require('../lib/dev-helper');

class DevChain extends BaseChain {
  constructor() {
    super(process.env.RPC_URL_DEV, process.env.CHAINTYPE_DEV);
  }
}

const devChain = new DevChain();

module.exports = {
  core: devChain,
  web3: devChain.web3,
  signTx: signTx,
}
const BaseChain = require('../lib/web3_chain');
const { signTx } = require('../lib/avax-helper');

class AvaxChain extends BaseChain {
  constructor() {
    super(process.env.RPC_URL_AVAX, process.env.CHAINTYPE_AVAX);
  }
}

const avaxChain = new AvaxChain();

module.exports = {
  core: avaxChain,
  web3: avaxChain.web3,
  signTx: signTx,
}
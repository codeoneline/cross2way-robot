const BaseChain = require('../lib/web3_chain');
const { signTx } = require('../lib/bsc-helper');

class BscChain extends BaseChain {
  constructor() {
    super(process.env.RPC_URL_BSC, process.env.CHAINTYPE_BSC);
  }
}

const bscChain = new BscChain();

module.exports = {
  core: bscChain,
  web3: bscChain.web3,
  signTx: signTx,
}
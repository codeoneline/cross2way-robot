const BaseChain = require('../lib/web3_chain');
const { signTx } = require('../lib/ethereum-helper');

class EthChain extends BaseChain {
  constructor() {
    super(process.env.RPC_URL_ETH, "ETH");
  }
}

const ethChain = new EthChain();

module.exports = {
  core: ethChain,
  web3: ethChain.web3,
  signTx: signTx,
}
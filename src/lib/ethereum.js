const BaseChain = require('./rpc_chain');
const { signTx } = require('./ethereum-helper');

class EthChain extends BaseChain {
  constructor() {
    super(process.env.RPC_URL_ETH);
  }
}

const ethChain = new EthChain();

module.exports = {
  core: ethChain,
  web3: ethChain.web3,
  signTx: signTx,
}
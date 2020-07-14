const BaseChain = require('./baseChain');
const { signTx } = require('./ethereum-helper');

class EthChain extends BaseChain {
  constructor() {
    super();
  }
}

const ethChain = new EthChain();

module.exports = {
  core: ethChain,
  web3: ethChain.web3,
  signTx: signTx,
}
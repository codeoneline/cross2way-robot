const IWan = require('../lib/iwan_chain');
const { ChainHelper } = require('../lib/chain-helper');

class IWanChain extends IWan {
  constructor(chainConfig) {
    super(chainConfig.chainType);

    this.signTx = new ChainHelper(chainConfig).signTx
  }
}

const chains = {}

// params e.g. : eth, testnet
function getChain(name, network) {
  if (!chains.hasOwnProperty[name]) {
    chains[name] = {}
  }
  if (!chains[name].hasOwnProperty(network)) {
    if (!configs.hasOwnProperty(name) || !configs.hasOwnProperty(network)) {
      console.error(`${name} ${network} config not exist`)
      return null
    }
    const chain = new IWanChain(configs[name][network])
    chains[name][network] = {
      core: chain,
      web3: chain.web3,
      signTx: chain.signTx,
    }
  }

  return chains[name][network]
}

module.exports = {
  getChain
};
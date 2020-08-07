const Web3Chain = require('../lib/web3_chain');
const { signTx } = require('../lib/wanchain-helper');

class WanChain extends Web3Chain {
  constructor(url) {
    super(url);
    this.web3.pos = new (require('../lib/wanchain-pos'))(this.web3);
    this.chainType = "WAN";
  }
  // pos
  async getStakerInfo(blockNumber) {
    return await this.web3.pos.getStakerInfo(blockNumber);
  };
  ///////////////////////////////////////////////////////////
  // those are for test
  async getRandom(epochId, blockNumber) {
    return await this.web3.pos.getRandom(epochId, blockNumber);
  }

  async getEpochID() {
    return await this.web3.pos.getEpochID();
  }

  async getTimeByEpochID(epochId) {
    return await this.web3.pos.getTimeByEpochID(epochId);
  }
}

const wanChain = new WanChain(process.env.RPC_URL);

function createWanChain(url) {
  const chain = new WanChain(url);
  const rt = {
    core: chain,
    web3: chain.web3,
    signTx: signTx
  }
  return rt;
}

module.exports = {
  core: wanChain,
  web3: wanChain.web3,
  signTx: signTx,
  createWanChain: createWanChain,
};

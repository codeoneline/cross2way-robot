const Web3Chain = require('../lib/web3_chain');
const { signTx } = require('../lib/wanchain-helper');

class WanChain extends Web3Chain {
  constructor(url) {
    super(url, process.env.CHAINTYPE_WAN);
    this.web3.pos = new (require('../lib/wanchain-pos'))(this.web3);
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

module.exports = {
  core: wanChain,
  web3: wanChain.web3,
  signTx: signTx
};

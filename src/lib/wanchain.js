const RpcChain = require('./rpc_chain');
const { signTx } = require('./wanchain-helper');

class WanChain extends RpcChain {
  constructor() {
    super(process.env.RPC_URL);
    this.web3.pos = new (require('./wanchain-pos'))(this.web3);
    this.chainName = "wan_rpc_chain";
  }
  // pos
  async getStakerInfo(blockNumber) {
    return await this.web3.pos.getStakerInfo(blockNumber);
  };
  // close
  closeEngine() {
  }
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

const wanChain = new WanChain();

module.exports = {
  core: wanChain,
  web3: wanChain.web3,
  signTx: signTx,
};

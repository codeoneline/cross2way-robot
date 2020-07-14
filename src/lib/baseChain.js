const Web3 = require("web3");
const { promisify } = require("./utils");

class BaseChain {
  constructor() {
    this.web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL));
  }

  sendRawTxByWeb3(singedData) {
    return new Promise((resolve, reject) => {
      if (this.web3.currentProvider.connected) {
        this.web3.eth.sendSignedTransaction(singedData, (error, hash) => {
          if (error) {
            reject(error);
          } else {
            resolve(hash);
          }
        });
      } else {
        reject("web3 is not connected");
      }
    });
  };

  async getTxCount(addr) {
    return await this.web3.eth.getTransactionCount(addr);
  };

  async getBalance(addr) {
    return await this.web3.eth.getBalance(addr);
  };

  async getScVar(name, contract, abi) {
    return await contract.methods[name]().call();
  }

  async getScFun(name, args, contract, abi) {
    return await contract.methods[name](...args).call();
  }

  async getBlockNumber() {
    return await this.web3.eth.getBlockNumber();
  };

  async getTransactionReceipt(txHash) {
    return await this.web3.eth.getTransactionReceipt(txHash);
  }

  async getBlock(blockNumber) {
    return await this.web3.eth.getBlock(blockNumber);
  }

  async estimateGas(from, to, value, data) {
    return await this.web3.eth.estimateGas({from, to, value, data});
  }

  // get txs on address between [fromBlock, toBlock]
  async getTxsBetween(address, from, to) {
    // scan all blocks
    const blocksPromise = [];
    for (let j = from; j <= to; j++) {
      // blocksPromise.push(new promisify(web3.eth.getBlock, [j, true], web3.eth));
      blocksPromise.push(new promisify(this.web3.eth.getBlock, [j, true], this.web3.eth));
    }
    const blocks = await Promise.all(blocksPromise);

    // scan all jackpot txs
    const receiptsPromise = [];
    if (blocks) {
      blocks.forEach((block) => {
        if (block.transactions) {
          if (!block.transactions) {
            console.log("transactions null")
          }
          block.transactions.forEach(tx => {
            if (tx.to !== null && address === tx.to.toLowerCase()) {
              receiptsPromise.push(new promisify(this.web3.eth.getTransactionReceipt, [tx.hash], this.web3.eth));
            }
          })
        }
      })
    }
    const receipts = await Promise.all(receiptsPromise);
    if (receipts.length > 1) {
      receipts.sort((a, b) => {
        if (a.blockNumber < b.blockNumber) {
          return -1;
        } else if (a.blockNumber > b.blockNumber) {
          return 1;
        } else if (a.blockNumber === b.blockNumber) {
          a.transactionIndex > b.transactionIndex ? 1 : -1;
        }
      })
    }
    return receipts;
  }

  ////////////////////////////////////////////////////////////////////
  // only rpc support, iWan not support
  getSlot(key, slot, offset = 0) {
    const dynSlot = this.web3.utils.soliditySha3(this.web3.utils.toBN(key), this.web3.utils.toBN(slot));
    const newSlot = this.web3.utils.toBN(dynSlot).add(this.web3.utils.toBN(offset));
    return "0x" + newSlot.toString("hex");
  }

  async unlockAccount(addr, password, duration) {
    return await this.web3.eth.personal.unlockAccount(addr, password, duration);
  }

  async getScMap(key, slt) {
    const sltStr = slt.toString();
    const slot = "0".repeat(64 - sltStr.length) + sltStr;

    const result = await this.web3.eth.getStorageAt(
        this.address,
        slot
    );

    return result;
  }

  async getBalanceByBlockNumber(addr, blockNumber) {
    return await this.web3.eth.getBalance(addr, blockNumber);
  };

  async getScMember(slot, blockNumber) {
    const result = await this.web3.eth.getStorageAt(
      this.address,
      slot,
      blockNumber
    );
  
    return result;
  }

  async getScPositionMember(position, blockNumber) {
    const positionSlot = "0x" + this.web3.utils.leftPad(position.toString(16).replace(/^0x/i,''), 64);
    const result = await getScMember(positionSlot, blockNumber);
    return result;
  }
}

module.exports = BaseChain;
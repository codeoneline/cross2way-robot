const assert = require("assert");
const { Oracle } = require('../src/lib/contract');
const getPrices_cmc = require("../src/lib/cmc");
const getPrices_crypto = require("../src/lib/crypto_compare");

const ORACLE_OWNER_PV_KEY = "a4369e77024c2ade4994a9345af5c47598c7cfb36c65e8a4a3117519883d9014";
const ORACLE_OWNER_PV_ADDRESS = "0x2d0e7c0813a51d3bd1d08246af2a8a7a57d8922e";

const ContractTest = (C) => class extends C {
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

class OracleTest extends ContractTest(Oracle) {
  async getValue(key) {
    return await this.chain.getScFun("getValue", [this.web3.utils.toHex(key)], this.contract, this.abi);
  }
}

const oracle = new OracleTest();

before("init", async function () {
  this.timeout(30000);
  console.log("test contract begin");
  await oracle.addWhitelist(process.env.ORACLE_PV_ADDRESS, ORACLE_OWNER_PV_KEY, ORACLE_OWNER_PV_ADDRESS);
});

after("end", function () {
  console.log("test contract end");
});

describe('oracle', function() {
  this.timeout(30000);
  console.log("oracle begin");

  it('updatePrice', async function() {
    console.log("updatePrice begin");
    const prices = await getPrices_crypto("BTC,ETH");
    await oracle.updatePrice(prices);
    const btcPrice = '0x' + oracle.web3.utils.toBN(await oracle.getValue("BTC")).toString('hex');
    const btcTruePrice = oracle.fractionToDecimalString(prices.BTC, oracle.price_decimal);
    assert.equal(btcPrice === btcTruePrice, true);
  });

  it('updateDeposit', async function() {

  });
})

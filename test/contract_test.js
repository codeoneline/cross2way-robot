const assert = require("assert");
const { Oracle } = require('../src/lib/contract');
const getPrices_cmc = require("../src/lib/cmc");
const getPrices_crypto = require("../src/lib/crypto_compare");
const chain = require(`../src/lib/${process.env.CHAIN_ENGINE}`);

class OracleTest extends Oracle {
  constructor(chain) {
    super(chain);
  }

  async getValue(key) {
    return await this.core.getScFun("getValue", [this.web3.utils.toHex(key)], this.contract, this.abi);
  }

  async getDeposit(smgID) {
    return await this.core.getScFun("getDeposit", [smgID], this.contract, this.abi);
  }
}

const oracle = new OracleTest(chain);

before("init", async function () {
  this.timeout(1000);
  console.log("test contract begin");
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
    console.log("updateDeposit begin");
    // const smgID = web3.utils.hexToBytes("0x6b175474e89094c44da98b954eedeac495271d0f");
    const smgID = "0x6b175474e89094c44da98b954eedeac495271d0f";
    const amount = 80000;
    await oracle.updateDeposit(smgID, amount);
    const deposit = oracle.web3.utils.toBN(await oracle.getDeposit(smgID)).toNumber();
    assert.equal(amount === deposit, true);
  });

  it('', async function() {

  });
})
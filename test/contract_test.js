const assert = require("assert");
const { Oracle } = require('../src/contract/oracle');
const getPrices_cmc = require("../src/lib/cmc");
const getPrices_crypto = require("../src/lib/crypto_compare");

const wanChain = require(`../src/lib/${process.env.WAN_CHAIN_ENGINE}`);

// wan oracle
const oracle = new Oracle(wanChain, process.env.OR_ADDR, process.env.OR_OWNER_SK, process.env.OR_OWNER_ADDR);

before("init", async function () {
  this.timeout(1000);
  console.log("test contract begin");
});

after("end", function () {
  console.log("test contract end");
});

describe('oracle', function() {
  this.timeout(300000);
  console.log("oracle begin");

  it.only('updatePrice', async function() {
    console.log("updatePrice begin");
    const prices = await getPrices_crypto("BTC,ETH");
    await oracle.updatePrice(prices);
    const btcPrice = '0x' + oracle.web3.utils.toBN(await oracle.getValue("BTC")).toString('hex');
    const btcTruePrice = prices.BTC;
    assert.equal(btcPrice === btcTruePrice, true);

    const prices_get = await oracle.getValues("BTC,ETH");
    const btcPrice2 = '0x' + oracle.web3.utils.toBN(prices_get[0]).toString('hex');
    const ethPrice = '0x' + oracle.web3.utils.toBN(prices_get[1]).toString('hex');
    const ethTruePrice = prices.ETH;
    assert.equal(ethPrice === ethTruePrice, true);
    assert.equal(btcPrice === btcPrice2, true);

  });

  it('updateDeposit', async function() {
    console.log("updateDeposit begin");
    const smgID = "0x6b175474e89094c44da98b954eedeac495271d0f";
    const amount = 80000;
    await oracle.updateDeposit(smgID, amount);
    const deposit = oracle.web3.utils.toBN(await oracle.getDeposit(smgID)).toNumber();
    assert.equal(amount === deposit, true);
  });

  it('setStoremanGroupConfig setStoremanGroupStatus', async function() {
    const smgID = "0x6b175474e89094c44da98b954eedeac495271d0f";
    const status = 1;
    const deposit = 2;
    const chain1 = 3;
    const chain2 = 4;
    const curve1 = 5;
    const curve2 = 6;
    const gpk1 = oracle.web3.utils.hexToBytes("0x1234");
    const gpk2 = oracle.web3.utils.hexToBytes("0x5678");
    const startTime = 7;
    const endTime = 8;
    await oracle.setStoremanGroupConfig(smgID, status, deposit, [chain1, chain2], [curve1, curve2], gpk1, gpk2, startTime, endTime);
    
    let config = await oracle.getStoremanGroupConfig(smgID);
    assert.equal(oracle.web3.utils.padRight(smgID, 64), config.groupId);
    assert.equal(status.toString(), config.status);
    assert.equal(deposit.toString(), config.deposit);
    assert.equal(chain1.toString(), config.chain1);
    assert.equal(chain2.toString(), config.chain2);
    assert.equal(curve1.toString(), config.curve1);
    assert.equal(curve2.toString(), config.curve2);
    assert.equal(oracle.web3.utils.bytesToHex(gpk1), config.gpk1);
    assert.equal(oracle.web3.utils.bytesToHex(gpk2), config.gpk2);
    assert.equal(startTime.toString(), config.startTime);
    assert.equal(endTime.toString(), config.endTime);

    const status_new = 20;
    await oracle.setStoremanGroupStatus(smgID, status_new);
    config = await oracle.getStoremanGroupConfig(smgID);
    assert.equal(status_new.toString(), config.status);
  });
})
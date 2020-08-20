const assert = require("assert");

require("dotenv").config({path: `${__dirname}/../.env.development`});

const web3Wan = require(`../src/chain/web3_wan`).core;
const iWanWan = require(`../src/chain/iwan_wan`).core;
// const web3Eth = require(`../src/chain/web3_eth`).core;
// const iWanEth = require(`../src/chain/iwan_eth`).core;

const ownerAddress = process.env.OR_OWNER_ADDR

before(function () {
  console.log("init jack-pot test");
});

after(function () {
  iWanWan.closeEngine();
  web3Wan.closeEngine();
  console.log("done test");
});

describe("iWanWan == web3Wan test", function () {
  this.timeout(16000);

  it.only('getTxCount', async function() {
    const a = await web3Wan.getTxCount(ownerAddress);
    const b = await iWanWan.getTxCount(ownerAddress);
    assert.strictEqual(a > 0, true, "nonce should > 0");
    assert.strictEqual(a, b, "count should be same");
  });

  it('getBalance', async function() {
    const a = await web3Wan.getBalance(ownerAddress);
    const b = await iWanWan.getBalance(ownerAddress);
    assert.strictEqual(a > 0, true, "balance should > 0");
    assert.strictEqual(a, b);
  });
  it('getBalanceByBlockNumber', async function() {
    console.log("getBalanceByBlockNumber...");
    const a = await web3Wan.getBalanceByBlockNumber("0xa4626e2bb450204c4b34bcc7525e585e8f678c0d", 7800000);
    // const b = await iWanWan.getBalance("0xa4626e2bb450204c4b34bcc7525e585e8f678c0d", 7800000);
    // assert.strictEqual(a > 0, true, "balance should > 0");
    // assert.strictEqual(a, b);
    assert.strictEqual(a, "288470142661951688668");
  });

  // it('getScVar', async function() {
  //   const a = await web3Wan.getScVar("poolInfo", wanChain_contract, jpApi);
  //   const b = await iWanWan.getScVar("poolInfo", iWan_contract, jpApi);

  //   const keys = Object.keys(a);
  //   assert.strictEqual(keys.length > 0 && keys.length === Object.keys(b).length, true, "fields's length should be same");
  //   Object.keys(a).forEach((k) => {
  //     assert.strictEqual(web3.utils.toBN(a[k]).toString(10), web3.utils.toBN(b[k]).toString(10))
  //   })
  // });

  // it('getScFun', async function() {
  //   const a = await web3Wan.getScFun("getPendingAmount", [], wanChain_contract, jpApi);
  //   const b = await iWanWan.getScFun("getPendingAmount", [], iWan_contract, jpApi);
  //   assert.strictEqual(a, b, "getPendingAmount failed");
  // });


  it('getBlockNumber', async function() {
    const a = await web3Wan.getBlockNumber();
    const b = await iWanWan.getBlockNumber();
    assert.strictEqual(a + 1 >= b, true);
    assert.strictEqual(a - 1 <= b, true);
  });

  it('getTransactionReceipt', async function() {
    const a = await web3Wan.getTransactionReceipt("0xf7bca2f5123fe448a8093bd025811a816c3be9e84bc7e11074122c95cc6d540f");
    const b = await iWanWan.getTransactionReceipt("0xf7bca2f5123fe448a8093bd025811a816c3be9e84bc7e11074122c95cc6d540f");

    assert.strictEqual(a.logs.length, 1, "log error");
    assert.deepStrictEqual(a.logs[0].topics, b.logs[0].topics, "receipt should be same");
  });

  it('getStakerInfo', async function() {
    const blockNumber = await web3Wan.getBlockNumber();
    const a = await web3Wan.getStakerInfo(blockNumber);
    const b = await iWanWan.getStakerInfo(blockNumber);
    assert.strictEqual(a.length > 0, true, "stake info should has many");
    assert.deepStrictEqual(a, b, " info should same");
  });

  it('getTxsBetween', async function() {
    const from = 7607124;
    const to = 7607124;
    const txs1 = await web3Wan.getTxsBetween(process.env.JACKPOT_ADDRESS, from, to);
    const txs = await iWanWan.getTxsBetween(process.env.JACKPOT_ADDRESS, from, to);
    console.log(JSON.stringify(txs1));
    console.log(JSON.stringify(txs));
  });

  it('getRandom', async function() {
    const epochId = 18397;
    const blockNumber = 7384591;
    const ra = await web3Wan.getRandom(epochId, blockNumber);
    const rb = await iWanWan.getRandom(epochId, blockNumber);
    assert.strictEqual(ra, rb, "random should be same");
  });

  it('getEpochID', async function() {
    const a = await web3Wan.getEpochID();
    const b = await iWanWan.getEpochID();
    assert.strictEqual(a + 1 >= b, true);
    assert.strictEqual(a <= b, true);
  });

  it('getTimeByEpochID', async function() {
    const epochId = 18397;
    const a = await web3Wan.getTimeByEpochID(epochId);
    const b = await iWanWan.getTimeByEpochID(epochId);
    assert.strictEqual(a, 1589500800);
    assert.strictEqual(a, b);
  });

});


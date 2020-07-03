const assert = require("assert");
const { oracle } = require('../src/lib/contract');
const getPrices_cmc = require("../src/lib/cmc");

before(async function () {
  console.log("test contract begin");
  await oracle.addWhitelist(process.env.ORACLE_PV_ADDRESS, {from: process.env.ORACLE_OWNER_PV_ADDRESS});
});

after(function () {
  console.log("test contract end");
});

describe('oracle', function() {
  this.timeout(300000);

  it.only('updatePrice', async function() {
    const prices = await getPrices_cmc("BTC,ETH");
    const r = await oracle.updatePrice(prices);
    console.log(JSON.stringify(r));
  });
})
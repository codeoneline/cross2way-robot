const assert = require("assert");
const { oracle } = require('../src/lib/contract');
const getPrices_cmc = require("../src/lib/cmc");

before(function () {
  console.log("test contract begin");
});

after(function () {
  console.log("test contract end");
});

describe('oracle', function() {
  this.timeout(16000);

  it.only('updatePrice', async function() {
    const prices = await getPrices_cmc("BTC,ETH");
    const r = await oracle.updatePrice(prices);
    console.log(JSON.stringify(r));
  });
})
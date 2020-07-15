const assert = require("assert");
const getPrices_cmc = require("../src/lib/cmc");
const getPrices_crypto = require("../src/lib/crypto_compare");

before(function () {
  console.log("test cmc crypto begin");
});

after(function () {
  console.log("test cmc crypto end");
});

describe("getPrices", function () {
  this.timeout(160000);

  it("getPrices", async function() {
    let btc_cmc_price = await getPrices_cmc("BTC");
    let btc_crypto_price = await getPrices_crypto("BTC");
    console.log(JSON.stringify(btc_cmc_price));
    console.log(JSON.stringify(btc_crypto_price));
    assert.equal(btc_cmc_price.BTC.price > 0, true);
    assert.equal(btc_crypto_price.BTC.price > 0, true);

    btc_cmc_price = await getPrices_cmc("BTC,ETH");
    btc_crypto_price = await getPrices_crypto("BTC,ETH");
    console.log(JSON.stringify(btc_cmc_price));
    console.log(JSON.stringify(btc_crypto_price));
    assert.equal(btc_cmc_price.BTC.price > 0, true);
    assert.equal(btc_crypto_price.BTC.price > 0, true);
    assert.equal(btc_cmc_price.ETH.price > 0, true);
    assert.equal(btc_crypto_price.ETH.price > 0, true);
  });
})
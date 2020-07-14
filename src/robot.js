const schedule = require('node-schedule');
const log = require('./lib/log');
const getPrices_cmc = require("../src/lib/cmc");
const getPrices_crypto = require("../src/lib/crypto_compare");
const chain = require(`../src/lib/${process.env.CHAIN_ENGINE}`);

const robotSchedules = ()=>{
  schedule.scheduleJob('0 */5 * * * *', async () => {
    const prices = await getPrices_crypto("BTC,ETH");
    const obj = await oracle.updatePrice(prices);
    // check log
  });
};

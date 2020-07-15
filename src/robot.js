const schedule = require('node-schedule');
const log = require('./lib/log');
const { Oracle } = require('./lib/contract');
const getPrices_cmc = require("./lib/cmc");
const getPrices_crypto = require("./lib/crypto_compare");
const { sleep } = require('./lib/utils');
const logAndSendMail = require('./lib/email');
const chain = require(`./lib/${process.env.CHAIN_ENGINE}`);

const oracle = new Oracle(chain);

async function doSchedule(func, args, tryTimes = process.env.RETRY_TIMES) {
  log.info(`${func.name} begin`);
  let leftTime = parseInt(tryTimes);

  while (leftTime > 0) {
    try {
      leftTime --;
      return await func(...args);
    } catch (e) {
      if (leftTime === 0) {
        await logAndSendMail(`${func.name} exception`, `args=${args}, tried ${tryTimes} still failed, ${e instanceof Error ? e.stack : e}`);
        return;
      }
      log.error(`${func.name} exception : ${e}`);
      await sleep(parseInt(process.env.RETRY_INTERVAL));
    }
  }
}

async function updatePrice() {
  const pricesMap = await doSchedule(getPrices_crypto, [process.env.SYMBOLS]);
  log.info(`prices: ${pricesMap}`);
  if (pricesMap) {
    const symbols = Object.keys(pricesMap);

    if (symbols.length > 0) {
      const prePricesArray = await oracle.getValues(process.env.SYMBOLS);
      const prePricesMap = {}
      const symbolsStringArray = process.env.SYMBOLS.replace(/\s+/g,"").split(',');
      symbolsStringArray.forEach((v,i) => {prePricesMap[v] = prePricesArray[i];})
      const needUpdateMap = {};
      const times = oracle.web3.utils.toBN(process.env.THRESHOLD_TIMES);
      const threshold = oracle.web3.utils.toBN(process.env.THRESHOLD);
      const zero = oracle.web3.utils.toBN(0);
      symbols.forEach(i => {
        const newPrice = oracle.web3.utils.toBN(pricesMap[i]);
        const oldPrice = oracle.web3.utils.toBN(prePricesMap[i]);

        if (oldPrice.cmp(zero) === 0) {
          needUpdateMap[i] = '0x' + newPrice.toString(16);
        } else {
          const deltaTimes = newPrice.sub(oldPrice).mul(times).div(oldPrice).abs();
          console.log(deltaTimes.toString(10));
          if (deltaTimes.cmp(threshold) > 0) {
            needUpdateMap[i] = '0x' + newPrice.toString(16);
          }
        }
      })
      await oracle.updatePrice(needUpdateMap);
    }
  }
}

const robotSchedules = ()=>{
  // update price, if delta price > 1%
  // update deposit, if deposit is change
  schedule.scheduleJob('0 * * * * *', async () => {
    // const prices = await getPrices_crypto(process.env.SYMBOLS);
    // const valid = prices.filter(i => { return i;});


    await updatePrice();
  });
};

robotSchedules();

setTimeout(async () => {
  await updatePrice();
}, 0);

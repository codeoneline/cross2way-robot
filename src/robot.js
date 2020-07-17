const schedule = require('node-schedule');
const log = require('./lib/log');
const { Oracle } = require('./lib/contract');
const getPrices_cmc = require("./lib/cmc");
const getPrices_crypto = require("./lib/crypto_compare");
const { sleep } = require('./lib/utils');
const logAndSendMail = require('./lib/email');

const chainWan = require(`./lib/${process.env.WAN_CHAIN_ENGINE}`);
const chainEth = require(`./lib/${process.env.ETH_CHAIN_ENGINE}`);

const oracleWan = new Oracle(chainWan, process.env.ORACLE_ADDRESS, process.env.ORACLE_OWNER_PV_KEY, process.env.ORACLE_OWNER_PV_ADDRESS);
const oracleEth = new Oracle(chainEth, process.env.ORACLE_ADDRESS_ETH, process.env.ORACLE_OWNER_PV_KEY, process.env.ORACLE_OWNER_PV_ADDRESS);

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

const times = oracleWan.web3.utils.toBN(process.env.THRESHOLD_TIMES);
const threshold = oracleWan.web3.utils.toBN(process.env.THRESHOLD);
const zero = oracleWan.web3.utils.toBN(0);

async function updatePrice(oracle, pricesMap) {
  log.info(`updatePrice$ begin`);
  if (pricesMap) {
    const symbols = Object.keys(pricesMap);

    if (symbols.length > 0) {
      const prePricesArray = await oracle.getValues(process.env.SYMBOLS);
      const symbolsStringArray = process.env.SYMBOLS.replace(/\s+/g,"").split(',');

      const prePricesMap = {}
      symbolsStringArray.forEach((v,i) => {prePricesMap[v] = prePricesArray[i];})

      const needUpdateMap = {};
      symbols.forEach(i => {
        const newPrice = oracle.web3.utils.toBN(pricesMap[i]);
        const oldPrice = oracle.web3.utils.toBN(prePricesMap[i]);

        if (oldPrice.cmp(zero) === 0) {
          needUpdateMap[i] = '0x' + newPrice.toString(16);
        } else {
          const deltaTimes = newPrice.sub(oldPrice).mul(times).div(oldPrice).abs();
          if (deltaTimes.cmp(threshold) > 0) {
            needUpdateMap[i] = '0x' + newPrice.toString(16);
          }
        }
      })
      await oracle.updatePrice(needUpdateMap);
    }
  }
}

//
async function updateDeposit() {

}

const robotSchedules = ()=>{
  schedule.scheduleJob('0 * * * * *', async () => {
    const pricesMap = await doSchedule(getPrices_crypto, [process.env.SYMBOLS]);
    
    log.info(`prices: ${JSON.stringify(pricesMap)}`);

    await updatePrice(oracleWan, pricesMap);
    // await updatePrice(oracleEth, pricesMap);
  });
};

// robotSchedules();

setTimeout(async () => {
  const pricesMap = await doSchedule(getPrices_crypto, [process.env.SYMBOLS]);
  // await updatePrice(oracleWan, pricesMap);
  await updatePrice(oracleEth, pricesMap);
}, 0);

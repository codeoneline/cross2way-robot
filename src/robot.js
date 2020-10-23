const schedule = require('node-schedule');
const log = require('./lib/log');
const getPrices_cmc = require("./lib/cmc");
const getPrices_crypto = require("./lib/crypto_compare");

const { createScanEvent, doSchedule, updatePrice, syncPriceToOtherChain, syncConfigToOtherChain } = require('./robot_core');

const { loadContract } = require('./lib/abi_address');

const chainWan = require(`./chain/${process.env.WAN_CHAIN_ENGINE}`);
const chainEth = require(`./chain/${process.env.ETH_CHAIN_ENGINE}`);

const oracleWan = loadContract(chainWan, 'OracleDelegate')
const oracleEth = loadContract(chainEth, 'OracleDelegate')

const sgaWan = loadContract(chainWan, 'StoremanGroupDelegate')

const scanInst = createScanEvent(
  sgaWan,
  process.env.REGISTER_START_EVENT,
  process.env.CHAINTYPE_WAN,
  parseInt(process.env.SCAN_STEP),
  parseInt(process.env.SCAN_UNCERTAIN_BLOCK),
  parseInt(process.env.SCAN_DELAY),
);

// const updatePriceToChains = async function() {
//   const pricesMap = await doSchedule(getPrices_cmc, [process.env.SYMBOLS]);

//   log.info(`prices: ${JSON.stringify(pricesMap)}`);

//   await updatePrice(oracleWan, pricesMap);
//   await syncPriceToOtherChain(oracleWan, oracleEth);
// }

const updatePriceToChains = async function() {
  const pricesMap = await doSchedule(getPrices_cmc, [process.env.SYMBOLS]);

  log.info(`prices: ${JSON.stringify(pricesMap)}`);

  await doSchedule(updatePrice, [oracleWan, pricesMap]);
  await doSchedule(syncPriceToOtherChain, [oracleWan, oracleEth, pricesMap]);
}

const scanNewStoreMan = () => {
  scanInst.scanEvent();
}

const updateStoreManToChains = async function() {
  console.log("updateStoreManToChains")
  await doSchedule(async () => {
    if (!scanInst.bScanning) {
      await syncConfigToOtherChain(sgaWan, [oracleEth]);
    } else {
      setTimeout(async() => {
        await updateStoreManToChains()
      }, 10000)
    }
  },[])
}

const updateStoreManToChainsPart = async function() {
  console.log("updateStoreManToChainsPart")
  await doSchedule(async () => {
    if (!scanInst.bScanning) {
      await syncConfigToOtherChain(sgaWan, [oracleEth], true);
    }
  },[])
}

const robotSchedules = function() {
  // update price 1 / 12 hour
  schedule.scheduleJob('0 0 */12 * * *', updatePriceToChains);

  // sync sga to sga database, 1 / 5min
  schedule.scheduleJob('0 */5 * * * *', scanNewStoreMan);

  // sync sga config from wan to other chain, sga database, 1 / 1day
  schedule.scheduleJob('30 2 1 * * *', updateStoreManToChains);

  schedule.scheduleJob('0 */8 * * * *', updateStoreManToChainsPart);
};

// helper functions

setTimeout(updatePriceToChains, 0);

setTimeout(scanNewStoreMan, 0);

setTimeout(updateStoreManToChains, 0);

robotSchedules();


process.on('unhandledRejection', (err) => {
  log.error(`unhandledRejection ${err}`);
});
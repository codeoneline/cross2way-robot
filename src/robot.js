const schedule = require('node-schedule');
const log = require('./lib/log');
const getPrices_cmc = require("./lib/cmc");
const getPrices_crypto = require("./lib/crypto_compare");
const Oracle = require('./contract/oracle');
const StoremanGroupAdmin = require('./contract/storeman_group_admin');

const { createScanEvent, doSchedule, updatePrice, syncPriceToOtherChain, syncConfigToOtherChain } = require('./robot_core');

const chainWan = require(`./chain/${process.env.WAN_CHAIN_ENGINE}`);
const chainEth = require(`./chain/${process.env.ETH_CHAIN_ENGINE}`);

const oracleWan = new Oracle(chainWan, process.env.OR_ADDR, process.env.OR_OWNER_SK, process.env.OR_OWNER_ADDR);
const oracleEth = new Oracle(chainEth, process.env.OR_ADDR_ETH, process.env.OR_OWNER_SK_ETH, process.env.OR_OWNER_ADDR_ETH);

const sgaWan = new StoremanGroupAdmin(chainWan, process.env.SGA_ADDR, process.env.SGA_OWNER_SK, process.env.SGA_OWNER_ADDR);

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
  doSchedule(async () => {
    if (!scanInst.bScanning) {
      await syncConfigToOtherChain(sgaWan, [oracleEth]);
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
};

// helper functions

setTimeout(updatePriceToChains, 0);

setTimeout(scanNewStoreMan, 0);

setTimeout(updateStoreManToChains, 0);

robotSchedules();


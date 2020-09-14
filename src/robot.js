const schedule = require('node-schedule');
const log = require('./lib/log');
const getPrices_cmc = require("./lib/cmc");
const getPrices_crypto = require("./lib/crypto_compare");
const Oracle = require('./contract/oracle');
const StoremanGroupAdmin = require('./contract/storeman_group_admin');

const { createScanEvent, doSchedule, updatePrice, updateDeposit, syncConfigToOtherChain } = require('./robot_core');

const chainWan = require(`./chain/${process.env.WAN_CHAIN_ENGINE}`);
const chainEth = require(`./chain/${process.env.ETH_CHAIN_ENGINE}`);

const oracleWan = new Oracle(chainWan, process.env.OR_ADDR, process.env.OR_OWNER_SK, process.env.OR_OWNER_ADDR);
const oracleEth = new Oracle(chainEth, process.env.OR_ADDR_ETH, process.env.OR_OWNER_SK_ETH, process.env.OR_OWNER_ADDR_ETH);

const sgaWan = new StoremanGroupAdmin(chainWan, process.env.SGA_ADDR, process.env.SGA_OWNER_SK, process.env.SGA_OWNER_ADDR);

const scanInst = createScanEvent(
  sgaWan,
  process.env.REGISTER_START_EVENT,
  process.env.IWAN_CHAINTYPE_WAN,
  parseInt(process.env.SCAN_STEP),
  parseInt(process.env.SCAN_UNCERTAIN_BLOCK),
  parseInt(process.env.SCAN_DELAY),
);

const robotSchedules = ()=>{
  // update price
  schedule.scheduleJob('0 0 */2 * * *', async () => {
    const pricesMap = await doSchedule(getPrices_cmc, [process.env.SYMBOLS]);
    
    log.info(`prices: ${JSON.stringify(pricesMap)}`);

    await updatePrice(oracleWan, pricesMap);
    await updatePrice(oracleEth, pricesMap);
  });

  // sync sga to sga database
  schedule.scheduleJob('0 */5 * * * *', () => {
    scanInst.scanEvent();
  });

  // sync sga config from wan to other chain, sga database
  schedule.scheduleJob('50 */5 * * * *', async () => {
    await syncConfigToOtherChain(sgaWan, [oracleEth]);
  });
};

// helper functions

setTimeout(async () => {
  const pricesMap = await doSchedule(getPrices_cmc, [process.env.SYMBOLS]);
  
  log.info(`prices: ${JSON.stringify(pricesMap)}`);

  await updatePrice(oracleWan, pricesMap);
  await updatePrice(oracleEth, pricesMap);
  
  // scanInst.scanEvent();
  // syncConfigToOtherChain(sgaWan, [oracleEth]);
}, 0);

// setTimeout(async() => {
//   syncConfigToOtherChain(sgaWan, [oracleEth]);
// }, 30000);

// robotSchedules();


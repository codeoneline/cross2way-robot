const schedule = require('node-schedule');
const log = require('./lib/log');
const getPrices_cmc = require("./lib/cmc");
const getPrices_crypto = require("./lib/crypto_compare");
const Oracle = require('./contract/oracle');
const StoremanGroupAdmin = require('./contract/storeman_group_admin');

const { createScanEvent, doSchedule, updatePrice, updateDeposit, syncConfigToOtherChain } = require('./robot_core');

const chainWan = require(`./chain/${process.env.WAN_CHAIN_ENGINE}`);
const chainEth = require(`./chain/${process.env.ETH_CHAIN_ENGINE}`);
const chainEtc = require(`./chain/${process.env.ETC_CHAIN_ENGINE}`);

const oracleWan = new Oracle(chainWan, process.env.ORACLE_ADDRESS, process.env.ORACLE_OWNER_PV_KEY, process.env.ORACLE_OWNER_PV_ADDRESS);
const oracleEth = new Oracle(chainEth, process.env.ORACLE_ADDRESS_ETH, process.env.ORACLE_OWNER_PV_KEY, process.env.ORACLE_OWNER_PV_ADDRESS);
const oracleEtc = new Oracle(chainEtc, process.env.ORACLE_ADDRESS_ETC, process.env.ORACLE_OWNER_PV_KEY, process.env.ORACLE_OWNER_PV_ADDRESS);

const sgaWan = new StoremanGroupAdmin(chainWan, process.env.STOREMANGROUPADMIN_ADDRESS, process.env.STOREMANGROUPADMIN_OWNER_PV_KEY, process.env.STOREMANGROUPADMIN_OWNER_PV_ADDRESS);

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
  schedule.scheduleJob('0 */10 * * * *', async () => {
    const pricesMap = await doSchedule(getPrices_cmc, [process.env.SYMBOLS]);
    
    log.info(`prices: ${JSON.stringify(pricesMap)}`);

    await updatePrice(oracleWan, pricesMap);
    await updatePrice(oracleEth, pricesMap);
    await updatePrice(oracleEtc, pricesMap);
  });

  // sync sga to sga database
  schedule.scheduleJob('20 * * * * *', () => {
    scanInst.scanEvent();
  });

  // sync sga config from wan to other chain, sga database
  schedule.scheduleJob('30 * * * * *', async () => {
    await syncConfigToOtherChain(sgaWan, [oracleEth, oracleEtc]);
  });
};

// helper functions

setTimeout(async () => {
  // const pricesMap = await doSchedule(getPrices_cmc, [process.env.SYMBOLS]);
  
  // log.info(`prices: ${JSON.stringify(pricesMap)}`);

  // await updatePrice(oracleWan, pricesMap);
  // await updatePrice(oracleEth, pricesMap);
  // await updatePrice(oracleEtc, pricesMap);
  
  // scanInst.scanEvent();
  syncConfigToOtherChain(sgaWan, [oracleEth, oracleEtc]);
}, 0);

// robotSchedules();


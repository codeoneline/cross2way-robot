const schedule = require('node-schedule');
const log = require('./lib/log');
const getPrices_cmc = require("./lib/cmc");
const getPrices_crypto = require("./lib/crypto_compare");
const Oracle = require('./contract/oracle');
const StoremanGroupAdminMy = require('./contract/storeman_group_admin_my');
const { web3 } = require('./lib/utils');

const { createScanEvent, doSchedule, updatePrice, updateDeposit, syncConfigToOtherChain } = require('./robot_core');

const chainWanMy = require(`./chain/${process.env.WAN_CHAIN_ENGINE_MY}`);
const chainEth = require(`./chain/${process.env.ETH_CHAIN_ENGINE}`);
const chainEtc = require(`./chain/${process.env.ETC_CHAIN_ENGINE}`);

const oracleWanMy = new Oracle(chainWanMy, process.env.ORACLE_ADDRESS_MY, process.env.SK_MY, process.env.ADDRESS_MY);
const oracleEth = new Oracle(chainEth, process.env.ORACLE_ADDRESS_ETH, process.env.ORACLE_OWNER_PV_KEY, process.env.ORACLE_OWNER_PV_ADDRESS);
const oracleEtc = new Oracle(chainEtc, process.env.ORACLE_ADDRESS_ETC, process.env.ORACLE_OWNER_PV_KEY, process.env.ORACLE_OWNER_PV_ADDRESS);

const sgaWanMy = new StoremanGroupAdminMy(chainWanMy, process.env.SMGA_ADDRESS_MY, process.env.SK_MY, process.env.ADDRESS_MY);

const scanInst = createScanEvent(
  sgaWanMy,
  process.env.REGISTER_START_EVENT,
  process.env.CHAINTYPE_WAN_MY,
  parseInt(process.env.SCAN_STEP),
  parseInt(process.env.SCAN_UNCERTAIN_BLOCK),
  parseInt(process.env.SCAN_DELAY),
);

const robotSchedules = ()=>{
  // update price
  schedule.scheduleJob('0 */10 * * * *', async () => {
    const pricesMap = await doSchedule(getPrices_cmc, [process.env.SYMBOLS]);

    log.info(`prices: ${JSON.stringify(pricesMap)}`);

    await updatePrice(oracleWanMy, pricesMap);
    await updatePrice(oracleEth, pricesMap);
    await updatePrice(oracleEtc, pricesMap);
  });

  // sync sga to sga database
  schedule.scheduleJob('20 * * * * *', () => {
    scanInst.scanEvent();
  });

  // sync sga config from wan to other chain, sga database
  schedule.scheduleJob('30 * * * * *', async () => {
    await syncConfigToOtherChain(sgaWanMy, [oracleEth, oracleEtc]);
  });
};

// helper functions

setTimeout(async () => {
  // const pricesMap = await doSchedule(getPrices_cmc, [process.env.SYMBOLS]);
    
  // log.info(`prices: ${JSON.stringify(pricesMap)}`);

  // await updatePrice(oracleWanMy, pricesMap);
  // await updatePrice(oracleEth, pricesMap);
  // await updatePrice(oracleEtc, pricesMap);

  // const smgID = web3.utils.padRight("0x", 64, '1');
  // const deposit = '0x' + web3.utils.toWei("10000000").toString('hex');
  // await updateDeposit(oracleWanMy, smgID, deposit);

  scanInst.scanEvent();
  // syncConfigToOtherChain(sgaWanMy, [oracleEth, oracleEtc]);

}, 0);

// robotSchedules();

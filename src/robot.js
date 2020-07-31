const schedule = require('node-schedule');
const log = require('./lib/log');
const getPrices_cmc = require("./lib/cmc");
const getPrices_crypto = require("./lib/crypto_compare");
const { sleep, web3 } = require('./lib/utils');
const logAndSendMail = require('./lib/email');
const scanEvent = require('./scan_event');
const db = require('./lib/sqlite_db');
const Oracle = require('./contract/oracle');
const StoremanGroupAdmin = require('./contract/storeman_group_admin');

const chainWan = require(`./chain/${process.env.WAN_CHAIN_ENGINE}`);
const chainEth = require(`./chain/${process.env.ETH_CHAIN_ENGINE}`);
const chainEtc = require(`./chain/${process.env.ETC_CHAIN_ENGINE}`);

const oracleWan = new Oracle(chainWan, process.env.ORACLE_ADDRESS, process.env.ORACLE_OWNER_PV_KEY, process.env.ORACLE_OWNER_PV_ADDRESS);
const oracleEth = new Oracle(chainEth, process.env.ORACLE_ADDRESS_ETH, process.env.ORACLE_OWNER_PV_KEY, process.env.ORACLE_OWNER_PV_ADDRESS);
const oracleEtc = new Oracle(chainEtc, process.env.ORACLE_ADDRESS_ETC, process.env.ORACLE_OWNER_PV_KEY, process.env.ORACLE_OWNER_PV_ADDRESS);

const sgaWan = new StoremanGroupAdmin(chainWan, process.env.STOREMANGROUPADMIN_ADDRESS, process.env.STOREMANGROUPADMIN_OWNER_PV_KEY, process.env.STOREMANGROUPADMIN_OWNER_PV_ADDRESS);

async function doSchedule(func, args, tryTimes = process.env.SCHEDULE_RETRY_TIMES) {
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
      await sleep(parseInt(process.env.SCHEDULE_RETRY_INTERVAL));
    }
  }
}

const times = web3.utils.toBN(process.env.THRESHOLD_TIMES);
const threshold = web3.utils.toBN(process.env.THRESHOLD);
const zero = web3.utils.toBN(0);

async function updatePrice(oracle, pricesMap) {
  log.info(`updatePrice ${oracle.core.chainType} begin`);
  if (pricesMap) {
    const symbols = Object.keys(pricesMap);

    if (symbols.length > 0) {
      const prePricesArray = await oracle.getValues(process.env.SYMBOLS);
      const symbolsStringArray = process.env.SYMBOLS.replace(/\s+/g,"").split(',');

      const prePricesMap = {}
      symbolsStringArray.forEach((v,i) => {prePricesMap[v] = prePricesArray[i];})

      const needUpdateMap = {};
      symbols.forEach(i => {
        const newPrice = web3.utils.toBN(pricesMap[i]);
        const oldPrice = web3.utils.toBN(prePricesMap[i]);

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
  log.info(`updatePrice ${oracle.core.chainType} end`);
}

// smgID => amount
// get from wan storeManGroupAdmin, set to other chain
async function updateDeposit(oracle, smgID, amount) {
  log.info(`updateDeposit begin`);
  const amountHex = "0x" + web3.utils.toBN(amount).toString('hex');
  await oracle.updateDeposit(smgID, amountHex);
}

async function syncConfigToOtherChain() {
  log.info(`syncConfigToOtherChain begin`);
  const sgs = db.getAllSga();
  for (let i = 0; i<sgs.length; i++) {
    const sg = sgs[i];
    const groupId = sg.groupId;
    const config = await sgaWan.getStoremanGroupConfig(groupId);
    if (config) {
      const oracles = [oracleWan, oracleEth, oracleEtc];
      for(i = 0; i<oracles.length; i++) {
        const oracle = oracles[i];
        const config_eth = await oracle.getStoremanGroupConfig(groupId);
        if (!config_eth ||
          (config.groupId !== config_eth.groupId) ||
          (config.status !== config_eth.status) ||
          (config.deposit !== config_eth.deposit) ||
          (config.chain1 !== config_eth.chain2) ||
          (config.chain2 !== config_eth.chain1) ||
          (config.curve1 !== config_eth.curve2) ||
          (config.curve2 !== config_eth.curve1) ||
          (config.gpk1 !== config_eth.gpk2) ||
          (config.gpk2 !== config_eth.gpk1) ||
          (config.startTime !== config_eth.startTime) ||
          (config.endTime !== config_eth.endTime)
        ) {
          // chain1 -> chain2
          await oracle.setStoremanGroupConfig(
            groupId,
            config.status,
            config.deposit,
            [config.chain2, config.chain1],
            [config.curve2, config.curve1],
            config.gpk2,
            config.gpk1,
            config.startTime,
            config.endTime,
          );
        }
      }
    }
  }
  log.info(`syncConfigToOtherChain end`);
}

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
    scanEvent(sgaWan, 'StoremanGroupRegisterStartEvent');
  });

  // sync sga config from wan to other chain, sga database
  schedule.scheduleJob('30 * * * * *', () => {
    syncConfigToOtherChain();
  });
};

// helper functions

setTimeout(async () => {
  // const pricesMap = await doSchedule(getPrices_cmc, [process.env.SYMBOLS]);
  
  // log.info(`prices: ${JSON.stringify(pricesMap)}`);

  // await updatePrice(oracleWan, pricesMap);
  // await updatePrice(oracleEth, pricesMap);
  // await updatePrice(oracleEtc, pricesMap);

  // const smgID = "0x111122223333444455556666777788889999AAAABBBBCCCCDDDDEEEEFFFFCCCC";
  // const amount = 500;
  // await updateDeposit(oracleWan, smgID, amount)
  // await updateDeposit(oracleEth, smgID, amount)
  
  // await scanEvent(sgaWan, 'StoremanGroupRegisterStartEvent');
  // syncConfigToOtherChain();
}, 0);

robotSchedules();


const log = require('./lib/log');
const { sleep, web3 } = require('./lib/utils');
const logAndSendMail = require('./lib/email');
const ScanEvent = require('./scan_event');
const db = require('./lib/sqlite_db');
const xrp = require('./lib/xrp');

const times = web3.utils.toBN(process.env.THRESHOLD_TIMES);
const zero = web3.utils.toBN(0);

function createScanEvent(contract, eventName, chainName, step, uncertainBlock, delay) {
  return new ScanEvent(
    contract,
    eventName,
    chainName,
    step,
    uncertainBlock,
    delay,
  );
}

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
      log.warn(`${func.name} exception : ${e}`);
      await sleep(parseInt(process.env.SCHEDULE_RETRY_INTERVAL));
    }
  }
}

async function updatePrice(oracle, pricesMap, symbolsStringArray) {
  log.info(`updatePrice ${oracle.core.chainType} begin`);

  const threshold = oracle.core.chainType === 'ETH' 
    ? web3.utils.toBN(process.env.THRESHOLD_ETH) 
    : web3.utils.toBN(process.env.THRESHOLD);
  
  if (pricesMap) {
    const symbols = Object.keys(pricesMap);

    if (symbols.length > 0) {
      const prePricesArray = await oracle.getValuesByArray(symbolsStringArray);

      const prePricesMap = {}
      symbolsStringArray.forEach((v,i) => {prePricesMap[v] = prePricesArray[i];})

      const needUpdateMap = {};
      const oldMap = {};
      const deltaMap = {}
      symbols.forEach(i => {
        const newPrice = web3.utils.toBN(pricesMap[i]);
        const oldPrice = web3.utils.toBN(prePricesMap[i]);

        if (oldPrice.cmp(zero) === 0) {
          needUpdateMap[i] = '0x' + newPrice.toString(16);
          oldMap[i] = '0';
          deltaMap[i] = 'infinity'
        } else {
          const deltaTimes = newPrice.sub(oldPrice).mul(times).div(oldPrice).abs();
          if (deltaTimes.cmp(threshold) > 0) {
            needUpdateMap[i] = '0x' + newPrice.toString(16);
            oldMap[i] = oldPrice.toString(10);
            deltaMap[i] = deltaTimes.toString(10);
          }
        }
      })

      await oracle.updatePrice(needUpdateMap, oldMap, deltaMap);
    }
  }
  log.info(`updatePrice ${oracle.core.chainType} end`);
}

function mergePrice(pricesMap, symbolsOld, symbolsMapStr) {
  symbolsMapStr.replace(/\s+/g,"").split(',').forEach(i => { 
    const kv = i.split(':')
    if (kv.length === 2) {
      pricesMap[kv[0]] = pricesMap[kv[1]]
      symbolsOld.push(kv[0])
    }
  })
}

async function updatePrice_WAN(oracle, pricesMap) {
  const symbols = process.env.SYMBOLS.replace(/\s+/g,"").split(',')
  mergePrice(pricesMap, symbols, process.env.SYMBOLS_MAP)
  await updatePrice(oracle, pricesMap, symbols)
}

async function updatePrice_ETH(oracle, pricesMap) {
  const symbols = process.env.SYMBOLS_ETH.replace(/\s+/g,"").split(',')
  mergePrice(pricesMap, symbols, process.env.SYMBOLS_MAP_ETH)
  await updatePrice(oracle, pricesMap, symbols)
}

async function updateDeposit(oracle, smgID, amount) {
  log.info(`updateDeposit`);
  const amountHex = "0x" + web3.utils.toBN(amount).toString('hex');
  await oracle.updateDeposit(smgID, amountHex);
}

async function setStoremanGroupStatus(oracle, smgID, status) {
  log.info(`setStoremanGroupStatus`);
  const statusHex = "0x" + web3.utils.toBN(status).toString('hex');
  await oracle.setStoremanGroupStatus(smgID, statusHex);
}

// 0 sep 256, 1: bn128
const chainCurveTypeConfig = {
  'WAN': '1',
  'ETH': '1',
  'BTC': '0',
}

function writeToDB(config) {
  const c = JSON.parse(JSON.stringify(config));
  const updateTime = new Date().getTime();
  c.updateTime = updateTime;
  db.updateSga(c);
}
async function syncConfigToOtherChain(sgaContract, oracles, isPart = false) {
  log.info(`syncConfigToOtherChain begin`);
  const sgs = db.getAllSga();
  for (let i = 0; i<sgs.length; i++) {
    const sg = sgs[i];
    const groupId = sg.groupId;
    const config = await sgaContract.getStoremanGroupConfig(groupId);
    if (config) {
      if (!config.gpk1 || !config.gpk2) {
        if (sg.status !== parseInt(config.status)) {
          writeToDB(config)
        }
        continue;
      }
      for(let j = 0; j<oracles.length; j++) {
        const oracle = oracles[j];
        const config_eth = await oracle.getStoremanGroupConfig(groupId);
        if (config.curve1 === '1' && config.curve2 === '1') {
          if (!config_eth ||
            (config.groupId !== config_eth.groupId) ||
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
            writeToDB(config)
          } else if (config.status !== config_eth.status) {
            await setStoremanGroupStatus(oracle, groupId, config.status);
            writeToDB(config)
          }
        } else {
          const curve1 = chainCurveTypeConfig[oracle.chain.core.chainType]
          const curve2 = curve1 === config.curve1 ? config.curve2 : config.curve1
          const gpk1 = config.curve1 === curve1 ? config.gpk1 : config.gpk2
          const gpk2 = gpk1 === config.gpk1 ? config.gpk2 : config.gpk1
          if (!config_eth ||
            (config.groupId !== config_eth.groupId) ||
            (config.chain1 !== config_eth.chain2) ||
            (config.chain2 !== config_eth.chain1) ||
            (curve1 != config_eth.curve1) ||
            (curve2 != config_eth.curve2) ||
            (gpk1 != config_eth.gpk1) ||
            (gpk2 != config_eth.gpk2) ||
            (config.startTime !== config_eth.startTime) ||
            (config.endTime !== config_eth.endTime)
          ) {
            // chain1 -> chain2
            await oracle.setStoremanGroupConfig(
              groupId,
              config.status,
              config.deposit,
              [config.chain2, config.chain1],
              [curve1, curve2],
              gpk1,
              gpk2,
              config.startTime,
              config.endTime,
            );
            writeToDB(config)
          } else if (config.status !== config_eth.status) {
            await setStoremanGroupStatus(oracle, groupId, config.status);
            writeToDB(config)
          }
        }
      }
    }
  }
  log.info(`syncConfigToOtherChain end`);
}

const isBtcDebtClean = async function(chainBtc, sg) {
  if (sg.curve1 === 0 || sg.curve2 === 0) {
    const gpk = sg.curve1 === 0 ? sg.gpk1 : sg.gpk2
    const balance = await chainBtc.core.getOneBalance(gpk)

    if (balance > 0) {
      return false
    } else {
      return true
    }
  }
  // 1 1 的是老store man
  return true
}

const isXrpDebtClean = async function(chainXrp, sg) {
  if (sg.curve1 === 0 || sg.curve2 === 0) {
    const gpk = sg.curve1 === 0 ? sg.gpk1 : sg.gpk2
    const address = xrp.pkToAddress(gpk)
    const balance = await chainXrp.core.getBalance(address)

    if (balance === '0') {
      return true
    } else {
      return false
    }
  }
  // 1 1 的是老store man
  return true
}

const syncIsDebtCleanToWan = async function(oracleWan, quotaWan, quotaEth, chainBtc, chainXrp) {
  const time = parseInt(new Date().getTime() / 1000);
  // 0. 获取 wan chain 上活跃的 store man -- 记录在db里
  const sgs = db.getAllSga();
  for (let i = 0; i<sgs.length; i++) {
    const sg = sgs[i];
    const groupId = sg.groupId;

    const isDebtClean = await oracleWan.isDebtClean(groupId)
    if (isDebtClean) {
      continue
    }

    let isDebtClean_wan = false
    let isDebtClean_eth = false
    if (sg.status === 6) {
      console.log('status is 6')
      isDebtClean_wan = await quotaWan.isDebtClean(groupId)
      isDebtClean_eth = await quotaEth.isDebtClean(groupId)
    }

    let isDebtClean_btc = false
    let isDebtClean_xrp = true
    if (sg.status >= 5) {
      if (time > sg.endTime) {
        isDebtClean_btc = await isBtcDebtClean(chainBtc, sg)
        // isDebtClean_xrp = await isXrpDebtClean(chainXrp, sg)
      }
    }
  
    // 4. 如果其他链上都debt clean， 则将debt clean状态同步到wanChain的oracle上
    if (isDebtClean_wan && isDebtClean_eth && isDebtClean_btc && isDebtClean_xrp) {
      await oracleWan.setDebtClean(groupId, true);
      log.info("smgId", groupId, "wan", isDebtClean_wan, "eth", isDebtClean_eth, "btc", isDebtClean_btc, "xrp", isDebtClean_xrp)
    }
  }
}

module.exports = {
  createScanEvent,
  doSchedule,
  // updateWanPrice,
  // syncPriceToOtherChain,
  syncConfigToOtherChain,
  updatePrice_WAN,
  updatePrice_ETH,
  syncIsDebtCleanToWan
}

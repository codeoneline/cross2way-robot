const log = require('./lib/log');
const { sleep, web3 } = require('./lib/utils');
const logAndSendMail = require('./lib/email');
const ScanEvent = require('./scan_event');
const db = require('./lib/sqlite_db');

const times = web3.utils.toBN(process.env.THRESHOLD_TIMES);
const threshold = web3.utils.toBN(process.env.THRESHOLD);
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


async function preUpdateMapTokenPrice(oracle, needUpdateMap, oldMap, deltaMap) {
  if (oracle.core.chainType !== 'WAN') {
    return
  }
  const symbols = process.env.SYMBOLS.replace(/\s+/g,"").split(',').filter(i=> i!=='WAN');
  const wanSymbols = symbols.map(i => `wan${i}`);
  const oldPricesArray = await oracle.getValuesByArray(symbols)
  const mapPricesArray = await oracle.getValuesByArray(wanSymbols)
  wanSymbols.forEach((wanSymbol, i) => {
    const newPriceStr = needUpdateMap[symbols[i]];
    let newPrice = web3.utils.toBN(oldPricesArray[i]);
    if (newPriceStr) {
      newPrice = web3.utils.toBN(newPriceStr);
    }
    const oldPrice = web3.utils.toBN(mapPricesArray[i]);
    
    if (oldPrice.cmp(newPrice) !== 0) {
      if (oldPrice.cmp(zero) === 0) {
        needUpdateMap[wanSymbol] = '0x' + newPrice.toString(16);
        oldMap[wanSymbol] = '0';
        deltaMap[wanSymbol] = 'infinity'
      } else {
        const deltaTimes = newPrice.sub(oldPrice).mul(times).div(oldPrice).abs();
        if (deltaTimes.cmp(threshold) > 0) {
          needUpdateMap[wanSymbol] = '0x' + newPrice.toString(16);
          oldMap[wanSymbol] = oldPrice.toString(10);
          deltaMap[wanSymbol] = deltaTimes.toString(10);
        }
      }
    }
  })
  return
}

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
      await preUpdateMapTokenPrice(oracle, needUpdateMap, oldMap, deltaMap)
      await oracle.updatePrice(needUpdateMap, oldMap, deltaMap);
    }
  }
  log.info(`updatePrice ${oracle.core.chainType} end`);
}

async function syncPriceToOtherChain(fromOracle, toOracle) {
  log.info(`syncPriceToOtherChain from:${fromOracle.core.chainType} to:${toOracle.core.chainType} begin`);
  const fromPricesArray = await fromOracle.getValues(process.env.SYMBOLS);
  const toPricesArray = await toOracle.getValues(process.env.SYMBOLS);
  const symbols = process.env.SYMBOLS.replace(/\s+/g,"").split(',');
  const deltaPricesMap = {}
  symbols.forEach((symbol, i) => {
    if (fromPricesArray[i] && (toPricesArray[i] !== fromPricesArray[i])) {
      deltaPricesMap[symbol] = fromPricesArray[i];
    }
  })
  await updatePrice(toOracle, deltaPricesMap);
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

async function syncConfigToOtherChain(sgaContract, oracles, isPart = false) {
  log.info(`syncConfigToOtherChain begin`);
  const sgs = db.getAllSga();
  const updateTime = new Date().getTime();
  for (let i = 0; i<sgs.length; i++) {
    const sg = sgs[i];
    const groupId = sg.groupId;
    const config = await sgaContract.getStoremanGroupConfig(groupId);
    if (config) {
      if ((sg.status !== parseInt(config.status)) ||
        (sg.deposit !== config.deposit)
      ) {
        const c = JSON.parse(JSON.stringify(config));
        c.updateTime = updateTime;
        db.updateSga(c);
      }
      if (!config.gpk1 || !config.gpk2) {
        continue;
      }
      for(let j = 0; j<oracles.length; j++) {
        const oracle = oracles[j];
        const config_eth = await oracle.getStoremanGroupConfig(groupId);
        if (!config_eth ||
          (config.groupId !== config_eth.groupId) ||
          (config.chain1 !== config_eth.chain2) ||
          (config.chain2 !== config_eth.chain1) ||
          (config.curve1 !== config_eth.curve2) ||
          (config.curve2 !== config_eth.curve1) ||
          (config.gpk1 !== config_eth.gpk2) ||
          (config.gpk2 !== config_eth.gpk1) ||
          (config.startTime !== config_eth.startTime) ||
          (config.endTime !== config_eth.endTime) ||
          ((config.deposit !== config_eth.deposit) && (config.status !== config_eth.status))
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
        } else if (config.deposit !== config_eth.deposit) {
          if (!isPart) {
            await updateDeposit(oracle, groupId, config.deposit);
          }
        } else if (config.status !== config_eth.status) {
          await setStoremanGroupStatus(oracle, groupId, config.status);
        }
      }
    }
  }
  log.info(`syncConfigToOtherChain end`);
}

module.exports = {
  createScanEvent,
  doSchedule,
  updatePrice,
  syncPriceToOtherChain,
  syncConfigToOtherChain,
}

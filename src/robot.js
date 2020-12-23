const schedule = require('node-schedule');
process.env.LOG_ENGINE = process.env.LOG_ENGINE_4js
const log = require('./lib/log');
const getPrices_cmc = require("./lib/cmc");
const getPrices_crypto = require("./lib/crypto_compare");
const getPrices_coingecko = require("./lib/coingecko");
const readlineSync = require('readline-sync');
const keythereum = require("keythereum");

function readSyncByfs(tips) {
  tips = tips || '> ';
  process.stdout.write(tips);
  process.stdin.pause();

  const buf = Buffer.allocUnsafe(10000);
  fs.readSync(process.stdin.fd, buf, 0, 10000, 0);
  process.stdin.end();

  return buf.toString('utf8', 0, response).trim();
}

const { createScanEvent, doSchedule, updateWanPrice, updatePrice_WAN, updatePrice_ETH, syncPriceToOtherChain, syncConfigToOtherChain } = require('./robot_core');

const { loadContract } = require('./lib/abi_address');

const chainWan = require(`./chain/${process.env.WAN_CHAIN_ENGINE}`);
const chainEth = require(`./chain/${process.env.ETH_CHAIN_ENGINE}`);

const oracleWan = loadContract(chainWan, 'OracleDelegate')
const oracleEth = loadContract(chainEth, 'OracleDelegate')

const sgaWan = loadContract(chainWan, 'StoremanGroupDelegate')


function getSk(address, tip) {
  let sk = null
  while (!sk) {
    const password = readlineSync.question(tip, {hideEchoBack: true, mask: '*'})
    try {
      const keyObject = keythereum.importFromFile(address.slice(2), process.env.KEYSTORE_PARENT_FOLD);
      sk = keythereum.recover(password, keyObject);
    } catch(e) {
      log.error(e)
    }
  }
  return sk.toString('hex')
}


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

//   await updateWanPrice(oracleWan, pricesMap);
//   await syncPriceToOtherChain(oracleWan, oracleEth);
// }

const updatePriceToChains = async function() {
  const pricesMap = await doSchedule(getPrices_coingecko, [process.env.SYMBOLS]);
  log.info(`updatePriceToChains begin: ${JSON.stringify(pricesMap)}`);

  await doSchedule(updateWanPrice, [oracleWan, pricesMap]);
  log.info(`updatePriceToChains end`);

  setTimeout(async() => {
    await syncPriceToChains()
  }, 30000)
}

const updatePriceToWAN = async function() {
  const pricesMap = await doSchedule(getPrices_coingecko, [process.env.SYMBOLS]);
  log.info(`updatePriceToChains begin: ${JSON.stringify(pricesMap)}`);

  await doSchedule(updatePrice_WAN, [oracleWan, pricesMap]);
  log.info(`updatePriceToChains end`);
}

const updatePriceToETH = async function() {
  const pricesMap = await doSchedule(getPrices_coingecko, [process.env.SYMBOLS]);
  log.info(`updatePriceToChains begin: ${JSON.stringify(pricesMap)}`);

  await doSchedule(updatePrice_ETH, [oracleEth, pricesMap]);
  log.info(`updatePriceToChains end`);
}

const syncPriceToChains = async function() {
  log.info(`syncPriceToChains begin`);
  await doSchedule(syncPriceToOtherChain, [oracleWan, oracleEth]);
  log.info(`syncPriceToChains end`);
}

const scanNewStoreMan = () => {
  scanInst.scanEvent();
}

const updateStoreManToChains = async function() {
  log.info("updateStoreManToChains")
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
  log.info("updateStoreManToChainsPart")
  await doSchedule(async () => {
    if (!scanInst.bScanning) {
      await syncConfigToOtherChain(sgaWan, [oracleEth], true);
    }
  },[])
}

const robotSchedules = function() {
  // update price 1 / 12 hour
  // schedule.scheduleJob('0 0 */12 * * *', updatePriceToChains);

  schedule.scheduleJob('0 1 * * * *', updatePriceToWAN);

  schedule.scheduleJob('0 0 */2 * * *', updatePriceToETH);

  // schedule.scheduleJob('0 */5 * * * *', syncPriceToChains);

  // sync sga to sga database, 1 / 5min
  schedule.scheduleJob('0 */5 * * * *', scanNewStoreMan);

  // sync sga config from wan to other chain, sga database, 1 / 1day
  schedule.scheduleJob('30 2 1 * * *', updateStoreManToChains);

  schedule.scheduleJob('0 */8 * * * *', updateStoreManToChainsPart);
};

// helper functions
setTimeout(async () => {
  // set admin
  const wanAdminAddress = await oracleWan.admin()
  const ethAdminAddress = await oracleEth.admin()

  if (process.env.USE_KEYSTORE === 'true') {
    let address = wanAdminAddress.toLowerCase() 
    let sk = getSk(address, `请输入wanchain上oracle合约的admin(${address})的  私钥：`)
    oracleWan.setAdminSk(sk)

    address = ethAdminAddress.toLowerCase()
    sk = null
    sk = getSk(address, `请输入ethereum上oracle合约的admin(${address})的  私钥：`)
    oracleEth.setAdminSk(sk)
  }

  setTimeout(updatePriceToWAN, 0);
  setTimeout(updatePriceToETH, 0);

  setTimeout(scanNewStoreMan, 0);

  setTimeout(updateStoreManToChains, 0);

  robotSchedules();
}, 0)


process.on('unhandledRejection', (err) => {
  log.error(`unhandledRejection ${err}`);
});
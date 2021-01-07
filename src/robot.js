const schedule = require('node-schedule');
const log = require('./lib/log');
const getPrices_cmc = require("./lib/cmc");
const getPrices_crypto = require("./lib/crypto_compare");
const getPrices_coingecko = require("./lib/coingecko");
const readlineSync = require('readline-sync');
const keythereum = require("keythereum");
const db = require('./lib/sqlite_db');

function readSyncByfs(tips) {
  tips = tips || '> ';
  process.stdout.write(tips);
  process.stdin.pause();

  const buf = Buffer.allocUnsafe(10000);
  fs.readSync(process.stdin.fd, buf, 0, 10000, 0);
  process.stdin.end();

  return buf.toString('utf8', 0, response).trim();
}

// const { createScanEvent, doSchedule, updateWanPrice, updatePrice_WAN, updatePrice_ETH, syncPriceToOtherChain, syncConfigToOtherChain } = require('./robot_core');
const { createScanEvent, doSchedule, updatePrice_WAN, updatePrice_ETH, syncConfigToOtherChain } = require('./robot_core');

const { loadContract } = require('./lib/abi_address');

const chainWan = require(`./chain/${process.env.WAN_CHAIN_ENGINE}`);
const chainEth = require(`./chain/${process.env.ETH_CHAIN_ENGINE}`);

const oracleWan = loadContract(chainWan, 'OracleDelegate')
const oracleEth = loadContract(chainEth, 'OracleDelegate')

const quotaWan = loadContract(chainWan, 'QuotaDelegate')
const quotaEth = loadContract(chainEth, 'QuotaDelegate')

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

const updatePriceToWAN = async function() {
  const pricesMap = await doSchedule(getPrices_coingecko, [process.env.SYMBOLS]);
  log.info(`updatePriceToChains begin, get prices: ${JSON.stringify(pricesMap)}`);

  await doSchedule(updatePrice_WAN, [oracleWan, pricesMap]);
  log.info(`updatePriceToChains end`);
}

const updatePriceToETH = async function() {
  const pricesMap = await doSchedule(getPrices_coingecko, [process.env.SYMBOLS]);
  log.info(`updatePriceToChains begin, get prices: ${JSON.stringify(pricesMap)}`);

  await doSchedule(updatePrice_ETH, [oracleEth, pricesMap]);
  log.info(`updatePriceToChains end`);
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

const syncIsDebtCleanToWan = async function() {
  // 0. 获取 wan chain 上活跃的 store man -- 记录在db里
  const sgs = db.getActiveSga();
  for (let i = 0; i<sgs.length; i++) {
    const sg = sgs[i];
    const groupId = sg.groupId;
    // 1. 获取 wan上 quota合约 store man 的 debt clean
    const isDebtClean_wan = await quotaWan.isDebtClean(groupId)
    // 2. 获取 eth上 quota合约 store man 的 debt clean
    const isDebtClean_eth = await quotaEth.isDebtClean(groupId)
    // 3. 获取 btc上 quota合约 store man的gpk对应的btc地址，6个块前的utxo是否为空，为空则debt clean
    // const isDebtClean_btc = true 
    // 4. 如果其他链上都debt clean， 则将debt clean状态同步到wanChain的oracle上

    console.log("wan", isDebtClean_wan, "eth", isDebtClean_eth)
  }

}

const robotSchedules = function() {
  schedule.scheduleJob('0 * * * * *', updatePriceToWAN);

  schedule.scheduleJob('0 0 */2 * * *', updatePriceToETH);

  // sync sga to sga database, 1 / 5min
  schedule.scheduleJob('0 */5 * * * *', scanNewStoreMan);

  // sync sga config from wan to other chain, sga database, 1 / 1day
  schedule.scheduleJob('30 2 1 * * *', updateStoreManToChains);

  schedule.scheduleJob('0 */8 * * * *', updateStoreManToChainsPart);
};

// helper functions
setTimeout(async () => {
  // set admin
  // const wanAdminAddress = await oracleWan.admin()
  // const ethAdminAddress = await oracleEth.admin()

  // if (process.env.USE_KEYSTORE === 'true') {
  //   let address = wanAdminAddress.toLowerCase() 
  //   let sk = getSk(address, `请输入wanchain上oracle合约的admin(${address})的  私钥：`)
  //   oracleWan.setAdminSk(sk)

  //   address = ethAdminAddress.toLowerCase()
  //   sk = null
  //   sk = getSk(address, `请输入ethereum上oracle合约的admin(${address})的  私钥：`)
  //   oracleEth.setAdminSk(sk)
  // }
  // if (process.env.ORACLE_ADMIN_WANCHAIN){
  //   oracleWan.setAdminSk(process.env.ORACLE_ADMIN_WANCHAIN)
  // }

  // setTimeout(updatePriceToWAN, 0);
  // setTimeout(updatePriceToETH, 0);

  // setTimeout(scanNewStoreMan, 0);

  // setTimeout(updateStoreManToChains, 0);

  // robotSchedules();

  await syncIsDebtCleanToWan()
}, 0)


process.on('unhandledRejection', (err) => {
  log.error(`unhandledRejection ${err}`);
});
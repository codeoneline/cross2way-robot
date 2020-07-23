const log = require('./lib/log');
const StoremanGroupAdmin = require('./contract/storeman_group_admin');
const Oracle = require('./contract/oracle');
const { web3 } = require('./lib/utils');
const db = require('./lib/sqlite_db');
const logAndSendMail = require('./lib/email');

// we can choose one blockchain
const chainWan = require(`./chain/${process.env.WAN_CHAIN_ENGINE}`);
const chainEth = require(`./chain/${process.env.ETH_CHAIN_ENGINE}`);

const sgaWan = new StoremanGroupAdmin(chainWan, process.env.STOREMANGROUPADMIN_ADDRESS, process.env.STOREMANGROUPADMIN_OWNER_PV_KEY, process.env.STOREMANGROUPADMIN_OWNER_PV_ADDRESS);
const oracleEth = new Oracle(chainEth, process.env.ORACLE_ADDRESS_ETH, process.env.ORACLE_OWNER_PV_KEY, process.env.ORACLE_OWNER_PV_ADDRESS);
const oracleWan = new Oracle(chainWan, process.env.ORACLE_ADDRESS, process.env.ORACLE_OWNER_PV_KEY, process.env.ORACLE_OWNER_PV_ADDRESS);

// 将scan提炼成一个模块
// 将wan上(blockNumber - 6)时的store_man_admin的register信息，同步到其他链上
function init() {
  db.init();
}

init();

function parseEvents(events, next) {
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
  // {
  //   "groupId":"0x111122223333444455556666777788889999aaaabbbbccccddddeeeeffffcccc",
  //   "workStart":"1",
  //   "workDuration":"2",
  //   "registerDuration":"3",
  //   "preGroupId":"0x0000000000000000000000000000000000000000000000000000000000000000"
  // }
    const config = {
      groupId: event.returnValues.groupId,
      status: 0,
      deposit: "0",
      chain1: 0,
      chain2: 0,
      curve1: 0,
      curve2: 0,
      gpk1: "0",
      gpk2: "0",
      startTime: 0,
      endTime: 0,
      updateTime: 0
    };
    const sga = db.getSga(event.returnValues.groupId);
    if (!sga) {
      db.insertSga(config);
    }
  }

  db.updateScan({chainType: process.env.IWAN_CHAINTYPE_WAN, blockNumber: next});
}

let bScanning = false;
let lastException = null;

async function doScan(from, step, to) {
  let next = from + step;
  if (next > to) {
    next = to;
  }
  log.info(`begin scan from=${from}, to=${next}`);

  const events = await sgaWan.core.getPastEvents(sgaWan.address, from, next, sgaWan.contract, 'registerStartEvent');
  const transaction = db.db.transaction(parseEvents);
  transaction(events, next);

  if (next < to) {
    setTimeout( async () => {
      await doScan(next + 1, step, to); 
    }, 0);
  } else {
    lastException = null;
    bScanning = false;
  }
}

async function scanNewStoremanGroup() {
  const from = db.getScan(process.env.IWAN_CHAINTYPE_WAN).blockNumber + 1;
  const step = parseInt(process.env.SCAN_STEP);
  const to = await chainWan.core.getBlockNumber() - parseInt(process.env.SCAN_UNCERTAIN_BLOCK);

  if (from > to) {
    bScanning = false;
    log.info(`scanAndSync same block! ${to}`)
    return;
  }

  log.info(`scanAndSync from=${from}, to=${to}`);
  await doScan(from, step, to);
}

setTimeout(async () => {
  await scanNewStoremanGroup();
}, 0)

process.on('unhandledRejection', (err) => {
  // logAndSendMail('unhandled exception', `${err}`, true);
  log.error(err);
  bScanning = false;
});

process.on('beforeExit', (code) => {
  console.log("beforeExit")
  log.info('***beforeExit***');
  chainWan.core.closeEngine();
  chainEth.core.closeEngine();
})
process.on('exit', (code) => {
  console.log("exit")
  log.info('***exit***');
  chainWan.core.closeEngine();
  chainEth.core.closeEngine();
})

process.on('SIGINT', function() {
  console.log("SIGINT")
  log.info('***SIGINT***');

  process.exit();
});
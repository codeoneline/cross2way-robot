const log = require('./lib/log');
const StoremanGroupAdmin = require('./contract/storeman_group_admin');
const { web3 } = require('./lib/utils');
const db = require('./lib/sqlite_db');
const logAndSendMail = require('./lib/email');

// we can choose one blockchain
const chainWan = require(`./chain/${process.env.WAN_CHAIN_ENGINE}`);
const chainEth = require(`./chain/${process.env.ETH_CHAIN_ENGINE}`);

const sgaWan = new StoremanGroupAdmin(chainWan, process.env.STOREMANGROUPADMIN_ADDRESS, process.env.STOREMANGROUPADMIN_OWNER_PV_KEY, process.env.STOREMANGROUPADMIN_OWNER_PV_ADDRESS);
const sgaEth = new StoremanGroupAdmin(chainEth, process.env.STOREMANGROUPADMIN_ADDRESS_ETH, process.env.STOREMANGROUPADMIN_OWNER_PV_KEY, process.env.STOREMANGROUPADMIN_OWNER_PV_ADDRESS);

// 将scan提炼成一个模块
// 将wan上(blockNumber - 6)时的store_man_admin的register信息，同步到其他链上
function init() {
  db.init();
}

let bScanning = false;
let lastException = null;

async function doScan(from, step, to) {
  let next = from + step;
  if (next > to) {
    next = to;
  }
  log.info(`begin scan from=${from}, to=${next}`);
}

async function scanAndSync() {
  const from = db.getScan().blockNumber;
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
  const from = process.env.STOREMANGROUPADMIN_BLOCKNUMBER;
  const to = await chainWan.core.getBlockNumber();
  const events = await sgaWan.core.getPastEvents(sgaWan.address, from, to, sgaWan.contract, 'registerStartEvent');
  const returnValues = events.returnValues;
  console.log(JSON.stringify(events));
}, 0)

process.on('unhandledRejection', (err) => {
  // logAndSendMail('unhandled exception', `${err}`, true);
  console.log(err);
  console.log(err.stack);
  bScanning = false;
});
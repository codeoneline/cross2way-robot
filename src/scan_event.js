const log = require('./lib/log');
const { web3 } = require('./lib/utils');
const db = require('./lib/sqlite_db');
const logAndSendMail = require('./lib/email');

// RegisterStartEvent
// { 
//   "groupId":"0x111122223333444455556666777788889999aaaabbbbccccddddeeeeffffcccc",
//   "workStart":"1",
//   "workDuration":"2",
//   "registerDuration":"3",
//   "preGroupId":"0x0000000000000000000000000000000000000000000000000000000000000000"
// }
function parseRegisterStartEvent(events, next) {
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
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
    // TODO: delete preGroupId ??
  }

  db.updateScan({chainType: process.env.IWAN_CHAINTYPE_WAN, blockNumber: next});
}

const eventHandlers = {};
eventHandlers['registerStartEvent'] = parseRegisterStartEvent
eventHandlers['StoremanGroupRegisterStartEvent'] = parseRegisterStartEvent

let bScanning = false;
let lastException = null;

async function doScan(chainContract, from, step, to, eventName) {
  let next = from + step;
  if (next > to) {
    next = to;
  }
  log.info(`begin scan from=${from}, to=${next}`);

  const events = await chainContract.core.getPastEvents(chainContract.address, from, next, chainContract.contract, eventName);
  const transaction = db.db.transaction(eventHandlers[eventName]);
  transaction(events, next);

  if (next < to) {
    setTimeout( async () => {
      await doScan(chainContract, next + 1, step, to, eventName); 
    }, 0);
  } else {
    lastException = null;
    bScanning = false;
  }
}

async function scanNewStoremanGroup(chainContract, eventName) {
  const from = db.getScan(process.env.IWAN_CHAINTYPE_WAN).blockNumber + 1;
  const step = parseInt(process.env.SCAN_STEP);
  const to = await chainContract.core.getBlockNumber() - parseInt(process.env.SCAN_UNCERTAIN_BLOCK);

  if (from > to) {
    bScanning = false;
    log.info(`scan same block! ${to}`)
    return;
  }

  log.info(`scan from=${from}, to=${to}`);
  await doScan(chainContract, from, step, to, eventName);
}

// scan to blockNumber = current - SCAN_UNCERTAIN_BLOCK, 
function scanEvent(chainContract, eventName) {
  // if already in scanning, return
  if (bScanning) {
    log.info(`scanning = ${bScanning}`);
    return;
  }
  bScanning = true;

  // post an event begin to scan
  setTimeout(async () => {
    try {
      await scanNewStoremanGroup(chainContract, eventName);
    } catch (e) {
      if (lastException !== e) {
        lastException = e;
        await logAndSendMail("scanNewStoremanGroup exception", e instanceof Error ? e.stack : e);
      }
      bScanning = false;
    }
  }, parseInt(process.env.SCAN_DELAY));
}

// setTimeout(async () => {
//   await scanNewStoremanGroup();
// }, 0)

process.on('unhandledRejection', (err) => {
  // logAndSendMail('unhandled exception', `${err}`, true);
  log.error(err);
  bScanning = false;
});

// process.on('beforeExit', (code) => {})
// process.on('exit', (code) => {})
// process.on('SIGINT', function() {});

module.exports = scanEvent;
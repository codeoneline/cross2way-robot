const log = require('./lib/log');

class ScanInstance2 {
  constructor() {
    this.name = 'haha';
  }

  async doScan(from, step, to) {
    log.info(`doScan this = ${this.name}`);
    let next = from + step;
    if (next > to) {
      next = to;
    }
    log.info(`begin scan from=${from}, to=${next}`);

    if (next < to) {
      setTimeout( async () => {
        log.info(`doScan setTimeout this = ${this.name}`);
        await this.doScan(next + 1, step, to); 
      }, 0);
    } else {
    }
  }
  
  async scanNewStoremanGroup() {
    const from = 10;
    const step = 1000;
    const to = 2000;
  
    log.info(`scanNewStoremanGroup this = ${this.name}`);
    await this.doScan(from, step, to);
  }
  
  // scan to blockNumber = current - SCAN_UNCERTAIN_BLOCK, 
  // scanEvent(chainContract, eventName, chainKey) {
  scanEvent() {
    log.info(`scanEvent this = ${this.name}`);
  
    // post an event begin to scan
    setTimeout(async () => {
      log.info(`scanEvent setTimeout this = ${this.name}`);
      await this.scanNewStoremanGroup();
    }, 0);
  }
}

const inst = new ScanInstance2();

inst.scanEvent();
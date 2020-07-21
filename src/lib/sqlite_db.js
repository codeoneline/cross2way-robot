
const Sqlite3 = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { promisify, sleep } = require("./utils");

console.log(os.platform());
console.log(os.homedir());

class DB {
  constructor() {
  }

  init(filePath) {
    if (!fs.existsSync(path.resolve(__dirname, "../../db"))) {
      fs.mkdirSync(path.resolve(__dirname, "../../db"));
    }
    if (!filePath) {
      filePath = path.resolve(__dirname, "../../db/oracleRobot.db")
    }

    let db = null;
    if (!fs.existsSync(filePath)) {
      db = new Sqlite3(filePath, {verbose: console.log});
      // db = new Sqlite3(filePath);
      const address = process.env.JACKPOT_ADDRESS.toLowerCase();
      db.exec(`
        create table scan (
          blockNumber integer
        );
      `);
      db.prepare(`insert into scan values (?)`).run(parseInt(process.env.SCAN_FROM) - 1);
    } else {
      db = new Sqlite3(filePath);
    }
    this.db = db;
  }

  // insertReceipt(receipt) {
  //   const insert = this.db.prepare(`insert into receipts values (@transactionHash, @blockNumber, @from, ?, @to, @transactionIndex)`);
  //   let status = receipt.status;
  //   if (typeof(receipt.status) === 'string') {
  //     status = receipt.status === '0x1';
  //   }
  //   insert.run(receipt, status ? 1 : 0);
  // }
  // insertBalanceChange(balanceChange) {
  //   return this.db.prepare(`insert into balance_change values (null,@transactionHash, @blockNumber,@event,@amount,@from,@fromBalance,@to,@toBalance)`).run(balanceChange);
  // }

  // getUser(address) {
  //   return this.db.prepare(`select * from users where address = ?`).get(address.toLowerCase());
  // }
  // insertUser(user) {
  //   return this.db.prepare(`insert into users values (@address, @balance)`).run(user);
  // }
  // updateUser(user) {
  //   return this.db.prepare(`update users set balance = @balance where address = @address`).run(user);
  // }

  // UPDATE {Table} SET {Column} = {Column} + {Value} WHERE {Condition}
  getScan() {
    return this.db.prepare(`select blockNumber from scan`).get();
  }

  insertScan(item) {
    this.db.prepare(`insert into scan values (@blockNumber)`).run(item);
  }

  updateScan(item) {
    this.db.prepare(`update scan set blockNumber = @blockNumber`).run(item);
  }

  close() {
    if (this.db) {
      const db = this.db;
      db.close((err) => {
        if (err) {
          return console.error(err.message);
        }
        console.log('close the database connection.');
      });
      this.db = null;
    }
  }
}

const db = new DB();

module.exports = db;
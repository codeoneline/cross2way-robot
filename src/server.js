const express = require('express')
const app = express()
const port = 3200

app.all('*', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By",' 3.2.1')
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});

const Oracle = require('./contract/oracle');
const TokenManager = require('./contract/token_manager');
const OracleProxy = require('./contract/oracle_proxy');
const TokenManagerProxy = require('./contract/token_manager_proxy');
const SGA = require('./contract/storeman_group_admin');
const db = require('./lib/sqlite_db');
const { Integer } = require('better-sqlite3');

const chainWan = require(`./chain/${process.env.WAN_CHAIN_ENGINE}`);
const chainEth = require(`./chain/${process.env.ETH_CHAIN_ENGINE}`);

const oracleWanProxy = new OracleProxy(chainWan, process.env.OR_ADDR, process.env.OR_OWNER_SK, process.env.OR_OWNER_ADDR);
const oracleEthProxy = new OracleProxy(chainEth, process.env.OR_ADDR_ETH, process.env.OR_OWNER_SK_ETH, process.env.OR_OWNER_ADDR_ETH);

const tmWanProxy = new TokenManagerProxy(chainWan, process.env.TM_ADDR, process.env.TM_OWNER_SK, process.env.TM_OWNER_ADDR);
const tmEthProxy = new TokenManagerProxy(chainEth, process.env.TM_ADDR_ETH, process.env.TM_OWNER_SK_ETH, process.env.TM_OWNER_ADDR_ETH);


const oracleWan = new Oracle(chainWan, process.env.OR_ADDR, process.env.OR_OWNER_SK, process.env.OR_OWNER_ADDR);
const oracleEth = new Oracle(chainEth, process.env.OR_ADDR_ETH, process.env.OR_OWNER_SK_ETH, process.env.OR_OWNER_ADDR_ETH);

app.get('/oracles', async (req, res) => {
  const prePricesArray = await oracleWan.getValues(process.env.SYMBOLS);
  const symbolsStringArray = process.env.SYMBOLS.replace(/\s+/g,"").split(',');
  const prePricesMap = {}
  symbolsStringArray.forEach((v,i) => {prePricesMap[v] = prePricesArray[i];})

  const prePricesMap_Eth = {}
  const prePricesArray_Eth = await oracleEth.getValues(process.env.SYMBOLS);
  symbolsStringArray.forEach((v,i) => {prePricesMap_Eth[v] = prePricesArray_Eth[i];})

  const sgs = {}
  const sgs_eth = {}
  const sgAll = db.getAllSga();
  for (let i = 0; i<sgAll.length; i++) {
    const sg = sgAll[i];
    const groupId = sg.groupId;
    const config = await oracleWan.getStoremanGroupConfig(groupId);
    const configEth = await oracleEth.getStoremanGroupConfig(groupId);
    const ks = Object.keys(config);

    for (let j = 0; j < ks.length/2; j++) {
      const str = j.toString();
      delete config[str];
      delete configEth[str];
    }
    sgs[groupId] = config;
    sgs_eth[groupId] = configEth[i];
  }

  const result = {
    'wan' : {
      prices: prePricesMap,
      sgs: sgs,
    },
    'eth' : {
      prices: prePricesMap_Eth,
      sgs: sgs_eth,
    }
  }

  res.send(result);
})

app.get('/chains', async (req, res) => {
  const odAddr = await oracleWanProxy.implementation();
  const odAddr_eth = await oracleEthProxy.implementation();
  const od = new Oracle(chainWan, odAddr);
  const od_eth = new Oracle(chainEth, odAddr_eth);

  const tmAddr = await tmWanProxy.implementation();
  const tmAddr_eth = await tmEthProxy.implementation();
  const tm = new TokenManager(chainWan, odAddr);
  const tm_eth = new TokenManager(chainEth, odAddr_eth);
  const result = {
    'wan' : {
      blockNumber: await chainWan.core.getBlockNumber(),

      oracleProxy: process.env.OR_ADDR,
      oracleDelegator: odAddr,
      tokenManagerProxy: process.env.TM_ADDR,
      tokenManagerDelegator: tmAddr,

      oracleProxyOwner: await oracleWanProxy.getOwner(),
      oracleDelegatorOwner: await od.getOwner(),
      tokenManagerProxyOwner: await tmWanProxy.getOwner(),
      tokenManagerDelegatorOwner: await tm.getOwner(),
    },
    'eth' : {
      blockNumber: await chainEth.core.getBlockNumber(),

      oracleProxy: process.env.OR_ADDR_ETH,
      oracleDelegator: odAddr_eth,
      tokenManagerProxy: process.env.TM_ADDR_ETH,
      tokenManagerDelegator: tmAddr_eth,

      oracleProxyOwner: await oracleEthProxy.getOwner(),
      oracleDelegatorOwner: await od_eth.getOwner(),
      tokenManagerProxyOwner: await tmEthProxy.getOwner(),
      tokenManagerDelegatorOwner: await tm_eth.getOwner(),
    }
  }

  res.send(result)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})
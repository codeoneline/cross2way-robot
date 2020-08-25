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

const log = require('./lib/log');
const Oracle = require('./contract/oracle');
const TokenManager = require('./contract/token_manager');
const OracleProxy = require('./contract/oracle_proxy');
const TokenManagerProxy = require('./contract/token_manager_proxy');
const db = require('./lib/sqlite_db');
``
const chainWan = require(`./chain/${process.env.WAN_CHAIN_ENGINE}`);
const chainEth = require(`./chain/${process.env.ETH_CHAIN_ENGINE}`);

const oracleWanProxy = new OracleProxy(chainWan, process.env.OR_ADDR, process.env.OR_OWNER_SK, process.env.OR_OWNER_ADDR);
const oracleEthProxy = new OracleProxy(chainEth, process.env.OR_ADDR_ETH, process.env.OR_OWNER_SK_ETH, process.env.OR_OWNER_ADDR_ETH);

const tmWanProxy = new TokenManagerProxy(chainWan, process.env.TM_ADDR, process.env.TM_OWNER_SK, process.env.TM_OWNER_ADDR);
const tmEthProxy = new TokenManagerProxy(chainEth, process.env.TM_ADDR_ETH, process.env.TM_OWNER_SK_ETH, process.env.TM_OWNER_ADDR_ETH);


const oracleWan = new Oracle(chainWan, process.env.OR_ADDR, process.env.OR_OWNER_SK, process.env.OR_OWNER_ADDR);
const oracleEth = new Oracle(chainEth, process.env.OR_ADDR_ETH, process.env.OR_OWNER_SK_ETH, process.env.OR_OWNER_ADDR_ETH);

const tmWan = new TokenManager(chainWan, process.env.TM_ADDR, process.env.TM_OWNER_SK, process.env.TM_OWNER_ADDR);
const tmEth = new TokenManager(chainEth, process.env.TM_ADDR_ETH, process.env.TM_OWNER_SK_ETH, process.env.TM_OWNER_ADDR_ETH);
function removeIndexField(obj) {
  const ks = Object.keys(obj)
  for (let j = 0; j < ks.length/2; j++) {
    const str = j.toString();
    delete obj[str];
  }
  return obj
}
async function getTokenPairs(tm, total) {
  const tokenPairs = {}
  for(let i=0; i<total; i++) {
    const id = parseInt(await tm.mapTokenPairIndex(i));
    const tokenPairInfo = removeIndexField(await tm.getTokenPairInfo(id));
    const ancestorInfo = removeIndexField(await tm.getAncestorInfo(id));
    const tokenPair = {id: id}
    
    Object.assign(tokenPair, ancestorInfo, tokenPairInfo);
    tokenPairs[id] = tokenPair;
  }
  return tokenPairs;
}
app.get('/tms', async (req, res) => {
  // mapTokenPairInfo, mapTokenPairIndex
  const totalTokenPairs = await tmWan.totalTokenPairs();
  const totalTokenPairs_eth = await tmEth.totalTokenPairs();

  const tokenPairs = await getTokenPairs(tmWan, totalTokenPairs)
  const tokenPairs_eth = await getTokenPairs(tmEth, totalTokenPairs_eth)

  const result = {
    'wan' : {
      tokenPairs: tokenPairs,
    },
    'eth' : {
      tokenPairs: tokenPairs_eth,
    }
  }

  // this.state = result;
  // const chainNames = Object.keys(this.state);
  // const tmColumns = ['name'];
  // let tmsTmp = [];
  // if (chainNames.length > 0) {
  //   tmColumns.push(...chainNames);
  //   const ids = Object.keys(this.state.wan.tokenPairs);
  //   ids.forEach(id => {
  //     const fields = Object.keys(this.state.wan.tokenPairs[id]);
  //     const data = fields.map(field => {
  //       const obj = {name: field}
  //       chainNames.forEach(i => {
  //         if (this.state[i].tokenPairs[id]) {
  //           obj[i] = this.state[i].tokenPairs[id][field]
  //         } else {
  //           obj[i] = 'empty'
  //         }
  //       })
  //       return obj;
  //     })
  //     // tmsTmp.push(<Fields columns={tmColumns} data={data} />)
  //     tmsTmp.push(data);
  //   })
  // }
  res.send(result)
})

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

    if (config.gpk1 !== null || configEth.gpk1 !== null) {
      for (let j = 0; j < ks.length/2; j++) {
        const str = j.toString();
        delete config[str];
        delete configEth[str];
      }
      sgs_eth[groupId] = configEth;
      sgs[groupId] = config;
    }
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

  // this.state = result
  // const chainNames = Object.keys(this.state);
  // const sgColumns = ['name'];
  // let sgDate = [];
  // if (chainNames.length > 0) {
  //   sgColumns.push(...chainNames);
  //   const groupIds = Object.keys(this.state.wan.sgs);
  //   groupIds.forEach(id => {
  //     const fields = Object.keys(this.state.wan.sgs[id]);
  //     const data = fields.map(field => {
  //       const obj = {name: field}
  //       chainNames.forEach(i => {
  //         if (this.state[i].sgs[id]) {
  //           obj[i] = this.state[i].sgs[id][field]
  //         } else {
  //           obj[i] = 'empty'
  //         }
  //       })
  //       return obj;
  //     })
  //     console.log(JSON.stringify(data));
  //     sgDate.push(data);
  //   })
  // }

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
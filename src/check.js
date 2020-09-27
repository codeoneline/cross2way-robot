const Oracle = require('./contract/oracle');
const TokenManager = require('./contract/token_manager');
const OracleProxy = require('./contract/oracle_proxy');
const TokenManagerProxy = require('./contract/token_manager_proxy');
const SGA = require('./contract/storeman_group_admin');
const Quota = require('./contract/quota');
const Cross = require('./contract/cross');

const log = require('./lib/log');
const db = require('./lib/sqlite_db');
const { web3, sleep } = require('./lib/utils');
const { getTestMessageUrl } = require('nodemailer');

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

const sgaWan = new SGA(chainWan, process.env.SGA_ADDR, process.env.SGA_OWNER_SK, process.env.SGA_OWNER_ADDR);

const quotaWan = new Quota(chainWan, process.env.QUOTA_ADDR)
const quotaEth = new Quota(chainEth, process.env.QUOTA_ADDR_ETH)

const crossWan = new Cross(chainWan, process.env.CROSS_ADDR)
const crossEth = new Cross(chainEth, process.env.CROSS_ADDR_ETH)

const chainId = {
  ETH: 0x8000003c,
  WAN: 0x8057414e,
  BTC: 0x80000000,
  ETC: 0x8000003d,
  EOS: 0x800000c2,
}

//////////////////////////////////////////////
let g_oracle = {}
const getOracle = async () => {
  const odAddr = await oracleWanProxy.implementation();
  const odAddr_eth = await oracleEthProxy.implementation();
  const tmAddr = await tmWanProxy.implementation();
  const tmAddr_eth = await tmEthProxy.implementation();

  const od = new Oracle(chainWan, odAddr);
  const od_eth = new Oracle(chainEth, odAddr_eth);
  const tm = new TokenManager(chainWan, odAddr);
  const tm_eth = new TokenManager(chainEth, odAddr_eth);

  const prePricesArray = await oracleWan.getValues(process.env.SYMBOLS);
  const symbolsStringArray = process.env.SYMBOLS.replace(/\s+/g,"").split(',');
  const prePricesMap = {}
  symbolsStringArray.forEach((v,i) => {
    const padPrice = web3.utils.padLeft(prePricesArray[i], 19, '0');
    prePricesMap[v] = padPrice.substr(0, padPrice.length - 18)+ '.'+ padPrice.substr(padPrice.length - 18, 18);
  })

  const prePricesMap_Eth = {}
  const prePricesArray_Eth = await oracleEth.getValues(process.env.SYMBOLS);
  symbolsStringArray.forEach((v,i) => {
    const padPrice = web3.utils.padLeft(prePricesArray_Eth[i], 19, '0');
    prePricesMap_Eth[v] = padPrice.substr(0, padPrice.length - 18)+ '.'+ padPrice.substr(padPrice.length - 18, 18);
  })

  const sgs = {}
  const sgs_eth = {}
  const sgAll = db.getAllSga();
  for (let i = 0; i<sgAll.length; i++) {
    const sg = sgAll[i];
    const groupId = sg.groupId;
    const config = await sgaWan.getStoremanGroupConfig(groupId);
    const configEth = await oracleEth.getStoremanGroupConfig(groupId);
    const ks = Object.keys(config);

    // if (config.gpk1 !== null || configEth.gpk1 !== null) {
      for (let j = 0; j < ks.length/2; j++) {
        const str = j.toString();
        delete config[str];
        delete configEth[str];
      }
      sgs_eth[groupId] = configEth;
      sgs[groupId] = config;
    // }
  }

  const oracle = {
    'WanChain' : {
      oracleProxy: process.env.OR_ADDR,
      oracleDelegator: odAddr,
      tokenManagerProxy: process.env.TM_ADDR,
      tokenManagerDelegator: tmAddr,

      oracleProxyOwner: await oracleWanProxy.getOwner(),
      oracleDelegatorOwner: await od.getOwner(),
      tokenManagerProxyOwner: await tmWanProxy.getOwner(),
      tokenManagerDelegatorOwner: await tm.getOwner(),

      prices: prePricesMap,
      sgs: sgs,
    },
    'Ethereum' : {
      oracleProxy: process.env.OR_ADDR_ETH,
      oracleDelegator: odAddr_eth,
      tokenManagerProxy: process.env.TM_ADDR_ETH,
      tokenManagerDelegator: tmAddr_eth,

      oracleProxyOwner: await oracleEthProxy.getOwner(),
      oracleDelegatorOwner: await od_eth.getOwner(),
      tokenManagerProxyOwner: await tmEthProxy.getOwner(),
      tokenManagerDelegatorOwner: await tm_eth.getOwner(),

      prices: prePricesMap_Eth,
      sgs: sgs_eth,
    }
  }

  g_oracle = oracle;
  return oracle;
}

/////////////////////////////////////////////
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

const getTokenManager = async () => {
  const totalTokenPairs = await tmWan.totalTokenPairs();
  const totalTokenPairs_eth = await tmEth.totalTokenPairs();
  
  const tokenPairs = await getTokenPairs(tmWan, totalTokenPairs)
  const tokenPairs_eth = await getTokenPairs(tmEth, totalTokenPairs_eth)

  const tokenManager = {
    'WanChain' : {
      total: totalTokenPairs,
      tokenPairs: tokenPairs,
    },
    'Ethereum' : {
      total: totalTokenPairs_eth,
      tokenPairs: tokenPairs_eth,
    }
  }

  return tokenManager;
}

/////////////////////////////////////////////
async function getQuotaTokenAmounts(quotaContract, tps, sgsIds) {
  const quotas = {}

  for (let j = 0; j < sgsIds.length; j++) {
    const storeManGroupId = sgsIds[j]
    quotas[storeManGroupId] = {}

    for(let i = 0; i < tps.length; i++) {
      const tokenId = tps[i]

      quotas[storeManGroupId][tokenId] = {}
      const quota = quotas[storeManGroupId][tokenId]

      quota.tokenId = tokenId
      quota.storeManGroupId = storeManGroupId

      quota.userMints = await quotaContract.getUserMintQuota(tokenId, storeManGroupId)
      quota.smgMints = await quotaContract.getSmgMintQuota(tokenId, storeManGroupId)
      quota.userBurns = await quotaContract.getUserBurnQuota(tokenId, storeManGroupId)
      quota.smgBurns = await quotaContract.getSmgBurnQuota(tokenId, storeManGroupId)

      quota.asset = await quotaContract.getAsset(tokenId, storeManGroupId)
      quota.debt = await quotaContract.getDebt(tokenId, storeManGroupId)
    }
  }

  return quotas;
}

async function getQuotaFee(quotaContract, status) {
  status[`fee ETH -> WAN`] = await quotaContract.getFees(chainId.ETH, chainId.WAN)
  status[`fee WAN -> ETH`] = await quotaContract.getFees(chainId.WAN, chainId.ETH)
}

async function getQuotaStatus(quotaContract) {
  const status = {}

  status.priceOracleAddress = await quotaContract.priceOracleAddress()
  status.depositOracleAddress = await quotaContract.depositOracleAddress()
  status.tokenManagerAddress = await quotaContract.tokenManagerAddress()
  status.depositTokenSymbol = await quotaContract.depositTokenSymbol()

  // await getQuotaFee(quotaContract, status)

  return status
}

const getQuota = async (oracle, tokenManager) => {
  const tps = Object.keys(tokenManager.WanChain.tokenPairs)
  const tps_Eth = Object.keys(tokenManager.Ethereum.tokenPairs)
  const sgsIds = Object.keys(oracle.WanChain.sgs)
  const sgsIds_Eth = Object.keys(oracle.Ethereum.sgs)

  const quotaTokens = await getQuotaTokenAmounts(quotaWan, tps, sgsIds)
  const quotaTokens_Eth = await getQuotaTokenAmounts(quotaEth, tps_Eth, sgsIds_Eth)

  const status = await getQuotaStatus(quotaWan)
  const status_Eth = await getQuotaStatus(quotaEth)

  const quota = {
    'WanChain' : {
      quotaTokens: quotaTokens,
      status: status,
    },
    'Ethereum' : {
      quotaTokens: quotaTokens_Eth,
      status: status_Eth,
    }
  }

  return quota
}

const getCross = async () => {
  const partner = await crossWan.getPartners();
  const partner_eth = await crossEth.getPartners();

  const cross = {
    'WanChain' : {
      tokenManager: partner.tokenManager,
      smgAdminProxy: partner.smgAdminProxy,
      smgFeeProxy: partner.smgFeeProxy,
      quota: partner.quota,
      sigVerifier: partner.sigVerifier,
      'fee: wan -> eth': removeIndexField(await crossWan.getFees(chainId.WAN, chainId.ETH)),
      'fee: eth -> wan': removeIndexField(await crossWan.getFees(chainId.ETH, chainId.WAN)),
      lockedTime: await crossWan.lockedTime(),
      smgFeeReceiverTimeout: await crossWan.smgFeeReceiverTimeout(),
    },
    'Ethereum' : {
      tokenManager: partner_eth.tokenManager,
      smgAdminProxy: partner_eth.smgAdminProxy,
      smgFeeProxy: partner_eth.smgFeeProxy,
      quota: partner_eth.quota,
      sigVerifier: partner_eth.sigVerifier,
      'fee: wan -> eth': removeIndexField(await crossEth.getFees(chainId.WAN, chainId.ETH)),
      'fee: eth -> wan': removeIndexField(await crossEth.getFees(chainId.ETH, chainId.WAN)),
      lockedTime: await crossWan.lockedTime(),
      smgFeeReceiverTimeout: await crossWan.smgFeeReceiverTimeout(),
    }
  }

  return cross
}
/////////////////////////////////////////////////////
function checkValue(a, b, info) {
  if (a === b) {
    console.log(`  ${info} is good`)
    return true
  } else {
    console.log(`  ${info} is bad, ${a} != ${b}`)
    return false
  }
}
function checkThreeValue(a, b, c, info) {
  if (a === b && a === c) {
    console.log(`  ${info} is good`)
    return true
  } else {
    console.log(`  ${info} is bad, ${a} != ${ a === b ? c : b}`)
    return false
  }
}

function omitStoreManGroup(a, b) {
  if (!!a.storeManGroupId && !!b.storeManGroupId) {
    if (a.storeManGroupId === b.storeManGroupId) {
      if (g_oracle.WanChain.sgs[a.storeManGroupId].status < 5) {
        return true;
      }
    }
  }
  if (!!a.groupId && !!b.groupId) {
    if (a.groupId === b.groupId) {
      if (g_oracle.WanChain.sgs[a.groupId].status < 5) {
        return true;
      }
    }
  }
  return false
}
function checkObject(a, b, info) {
  const keys_a = Object.keys(a)
  const keys_b = Object.keys(b)

  if (!!keys_a && !!keys_b) {
    if (keys_a.length === keys_b.length) {
      for (let i = 0; i < keys_a.length; i++) {
        const type_a = typeof(a[keys_a[i]])
        const type_b = typeof(b[keys_b[i]])
        if (omitStoreManGroup(a, b)) {
          console.log(`  ${info} storeman status < 5, pass check`)
          return true;
        }
        if (type_a === type_b) {
          if (a[keys_a[i]] !== b[keys_b[i]]) {
            console.log(`  ${info} is bad, ${JSON.stringify(a, null, 2)} != ${JSON.stringify(b, null, 2)}`)
            return false;
          }
        } else {
          console.log(`  ${info} is bad, ${JSON.stringify(a, null, 2)} != ${JSON.stringify(b, null, 2)}`)
          return false;
        }
      }
      console.log(`  ${info} is good`)
      return true
    }
  }
  console.log(`  ${info} is bad, ${JSON.stringify(a, null, 2)} != ${JSON.stringify(b, null, 2)}`)
  return false
}

function checkObjectObject(a, b, info) {
  const a_ = Object.entries(a)
  const b_ = Object.entries(b)

  if (!!a_ && !!b_) {
    if (a_.length === b_.length) {
      console.log(`  ${info} check begin`)
      for (let i = 0; i < a_.length; i++) {
        if(a_[i][0] !== b_[i][0]) {
          console.log(`  ${info} is bad, ${JSON.stringify(a_, null, 2)} != ${JSON.stringify(b_, null, 2)}`)
          return false
        } else {
          if (!checkObject(a_[i][1], b_[i][1], `${info} ${a_[i][0]}`)) {
            return false
          }
        }
      }
      console.log(`  ${info} check end`)
      return true
    }
  }
  console.log(`  ${info} is bad, ${JSON.stringify(a, null, 2)} != ${JSON.stringify(b, null, 2)}`)
  return false
}

function checkObjectObjectObject(a, b, info) {
  const a_ = Object.entries(a)
  const b_ = Object.entries(b)

  if (!!a_ && !!b_) {
    if (a_.length === b_.length) {
      console.log(`-${info} check begin`)
      for (let i = 0; i < a_.length; i++) {
        if(a_[i][0] !== b_[i][0]) {
          console.log(`  ${info} is bad, ${JSON.stringify(a_, null, 2)} != ${JSON.stringify(b_, null, 2)}`)
        } else {
          checkObjectObject(a_[i][1], b_[i][1], `${info} ${a_[i][0]}`)
        }
      }
      console.log(`-${info} check end`)
      return true
    }
  }
  console.log(`-${info} is bad, ${JSON.stringify(a, null, 2)} != ${JSON.stringify(b, null, 2)}`)
  return false
}

setTimeout(async () => {
  const oracle = await getOracle();

  console.log(`oracle check`)
  checkValue(oracle.WanChain.oracleProxyOwner, oracle.WanChain.oracleDelegatorOwner, "oracle proxy and delegator owner on WanChain")
  checkValue(oracle.Ethereum.oracleProxyOwner, oracle.Ethereum.oracleDelegatorOwner, "oracle proxy and delegator owner on Ethereum")

  checkValue(oracle.WanChain.tokenManagerProxyOwner, oracle.WanChain.tokenManagerDelegatorOwner, "token manager proxy and delegator owner on WanChain")
  checkValue(oracle.Ethereum.tokenManagerProxyOwner, oracle.Ethereum.tokenManagerDelegatorOwner, "token manager proxy and delegator owner on Ethereum")

  checkObject(oracle.WanChain.prices, oracle.Ethereum.prices, "oracle price")
  checkObjectObject(oracle.WanChain.sgs, oracle.Ethereum.sgs, "oracle store man group config")

  const tm = await getTokenManager();

  console.log(`token manager check`)
  checkValue(tm.WanChain.total, tm.Ethereum.total, "token manager total token pair")
  checkObjectObject(tm.WanChain.tokenPairs, tm.Ethereum.tokenPairs, "token manager token pair")

  console.log(`quota check`)
  const quota = await getQuota(oracle, tm);
  checkValue(quota.WanChain.status.priceOracleAddress, oracle.WanChain.oracleProxy, "quota priceOracleAddress on WanChain")
  checkValue(quota.WanChain.status.depositOracleAddress.toLowerCase(), sgaWan.address, "quota depositOracleAddress on WanChain")
  checkValue(quota.WanChain.status.tokenManagerAddress, oracle.WanChain.tokenManagerProxy, "quota tokenManagerAddress on WanChain")
  checkValue(quota.Ethereum.status.priceOracleAddress, oracle.Ethereum.oracleProxy, "quota priceOracleAddress on Ethereum")
  checkValue(quota.Ethereum.status.depositOracleAddress, oracle.Ethereum.oracleProxy, "quota depositOracleAddress on Ethereum")
  checkValue(quota.Ethereum.status.tokenManagerAddress, oracle.Ethereum.tokenManagerProxy, "quota tokenManagerAddress on Ethereum")
  checkThreeValue(quota.WanChain.status.depositTokenSymbol, quota.Ethereum.status.depositTokenSymbol, "WAN", "quota depositTokenSymbol")

  checkObjectObjectObject(quota.WanChain.quotaTokens, quota.Ethereum.quotaTokens, "quota token")


  console.log(`cross check`)
  const cross = await getCross();
  // 'WanChain' : {
  //   tokenManager: partner.tokenManager,
  //   smgAdminProxy: partner.smgAdminProxy,
  //   smgFeeProxy: partner.smgFeeProxy,
  //   quota: partner.quota,
  //   sigVerifier: partner.sigVerifier,
  //   'fee: wan -> eth': await crossWan.getFees(chainId.WAN, chainId.ETH),
  //   'fee: eth -> wan': await crossWan.getFees(chainId.ETH, chainId.WAN),
  //   lockedTime: await crossWan.lockedTime(),
  //   smgFeeReceiverTimeout: await crossWan.smgFeeReceiverTimeout(),
  // },
  checkValue(cross.WanChain.tokenManager, oracle.WanChain.tokenManagerProxy, "  cross token manager check on WanChain")
  checkValue(cross.WanChain.smgAdminProxy.toLowerCase(), sgaWan.address, "  cross store man group check on WanChain")
  checkValue(cross.WanChain.smgFeeProxy.toLowerCase(), sgaWan.address, "  cross store fee check on WanChain")
  checkValue(cross.WanChain.quota.toLowerCase(), quotaWan.address, "  cross quota check on WanChain")
  checkValue(cross.Ethereum.tokenManager, oracle.Ethereum.tokenManagerProxy, "  cross token manager check on Ethereum")
  checkValue(cross.Ethereum.smgAdminProxy.toLowerCase(), oracle.Ethereum.oracleProxy, "  cross store man group check on Ethereum")
  checkValue(cross.Ethereum.smgFeeProxy.toLowerCase(), oracle.Ethereum.oracleProxy, "  cross store fee check on Ethereum")
  checkValue(cross.Ethereum.quota.toLowerCase(), quotaEth.address, "  cross quota check on Ethereum")
  console.log(`fee: wan -> eth on WanChain is ${JSON.stringify(cross.WanChain['fee: wan -> eth'])}, on Ethereum is ${JSON.stringify(cross.Ethereum['fee: wan -> eth'])}`)
  console.log(`fee: eth -> wan on WanChain is ${JSON.stringify(cross.WanChain['fee: eth -> wan'])}, on Ethereum is ${JSON.stringify(cross.Ethereum['fee: eth -> wan'])}`)
  console.log(`lockedTime on WanChain is ${cross.WanChain['lockedTime']}, on Ethereum is ${cross.Ethereum['lockedTime']}`)
  console.log(`smgFeeReceiverTimeout on WanChain is ${cross.WanChain['smgFeeReceiverTimeout']}, on Ethereum is ${cross.Ethereum['smgFeeReceiverTimeout']}`)
}, 0);
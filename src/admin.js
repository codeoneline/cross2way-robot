////////////////////////////////////////////////////////////////////////////////
// normal init
const log = require('./lib/log');
const Oracle = require('./contract/oracle');
const TokenManager = require('./contract/token_manager');
const OracleProxy = require('./contract/oracle_proxy');
const TokenManagerProxy = require('./contract/token_manager_proxy');
const StoremanGroupAdmin = require('./contract/storeman_group_admin');
const MapToken = require('./contract/map_token');
const { web3, sleep } = require('./lib/utils');
const fs = require('fs');
const path = require('path');

// we can choose one blockchain
const chainWan = require(`./chain/${process.env.WAN_CHAIN_ENGINE}`);
const chainEth = require(`./chain/${process.env.ETH_CHAIN_ENGINE}`);
const chainEtc = require(`./chain/${process.env.ETC_CHAIN_ENGINE}`);

const sgaWan = new StoremanGroupAdmin(chainWan, process.env.STOREMANGROUPADMIN_ADDRESS, process.env.STOREMANGROUPADMIN_OWNER_PV_KEY, process.env.STOREMANGROUPADMIN_OWNER_PV_ADDRESS);

const tmWan = new TokenManager(chainWan, process.env.TOKEN_MANAGER_ADDRESS, process.env.TOKEN_MANAGER_OWNER_PV_KEY, process.env.TOKEN_MANAGER_OWNER_PV_ADDRESS);
const tmEth = new TokenManager(chainEth, process.env.TOKEN_MANAGER_ADDRESS_ETH, process.env.TOKEN_MANAGER_OWNER_PV_KEY, process.env.TOKEN_MANAGER_OWNER_PV_ADDRESS);
const tmEtc = new TokenManager(chainEtc, process.env.TOKEN_MANAGER_ADDRESS_ETC, process.env.TOKEN_MANAGER_OWNER_PV_KEY, process.env.TOKEN_MANAGER_OWNER_PV_ADDRESS);

const oracleWan = new Oracle(chainWan, process.env.ORACLE_ADDRESS, process.env.ORACLE_OWNER_PV_KEY, process.env.ORACLE_OWNER_PV_ADDRESS);

const fnxWan = new MapToken(chainWan, process.env.FNX_WAN_ADDRESS, process.env.FNX_WAN_OWNER_PV_KEY, process.env.FNX_WAN_OWNER_PV_ADDRESS);
const linkEth = new MapToken(chainEth, process.env.LINK_ETH_ADDRESS, process.env.LINK_ETH_OWNER_PV_KEY, process.env.LINK_ETH_OWNER_PV_ADDRESS);
const eosWan = new MapToken(chainWan, "0xDDcd518E6bD473A129c31Ba4a2EC699843F10567", process.env.SK_MY, process.env.ADDRESS_MY);
const btcEth = new MapToken(chainWan, "0x3Dd2c6BE473943d7fB9072e43Edf9c6cfd09d81f", process.env.SK_MY, process.env.ADDRESS_MY);

const tms = {
  "WAN": tmWan,
  "ETH": tmEth,
  "ETC": tmEtc
}

const old_owner_addr = "0x2d0e7c0813a51d3bd1d08246af2a8a7a57d8922e";
const old_owner_sk = "a4369e77024c2ade4994a9345af5c47598c7cfb36c65e8a4a3117519883d9014";
const new_owner_addr = "0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8";
const new_owner_sk = "b6a03207128827eaae0d31d97a7a6243de31f2baf99eabd764e33389ecf436fc";
// TODO: should change proxy owner!
async function changeOwner() {
  await tmWan.changeOwner(old_owner_addr, old_owner_sk, new_owner_addr, new_owner_sk);
  await oracleWan.changeOwner(old_owner_addr, old_owner_sk, new_owner_addr, new_owner_sk);
  // await fnxWan.changeOwner(old_owner_addr, old_owner_sk, new_owner_addr, new_owner_sk);
}

async function upgradeTo() {
  const oracleProxyWan = new OracleProxy(chainWan, process.env.ORACLE_ADDRESS, process.env.ORACLE_OWNER_PV_KEY, process.env.ORACLE_OWNER_PV_ADDRESS);
  await oracleProxyWan.upgradeTo(process.env.ORACLE_ADDRESS_UP);

  const tmProxyWan = new TokenManagerProxy(chainWan, process.env.TOKEN_MANAGER_ADDRESS, process.env.TOKEN_MANAGER_OWNER_PV_KEY, process.env.TOKEN_MANAGER_OWNER_PV_ADDRESS);
  await tmProxyWan.upgradeTo(process.env.TOKEN_MANAGER_ADDRESS_UP);
}

// fnx link mint
async function mint(addr, a) {
  const amount = '0x' + web3.utils.toWei(web3.utils.toBN(a)).toString('hex');
  // await fnxWan.mint(addr, amount);
  // await linkEth.mint(addr, amount);
  await eosWan.mint(addr, amount);
  await btcEth.mint(addr, amount);
}

async function unlockAccount() {
  let result = false;
  result = await chainWan.core.unlockAccount("0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8", "wanglu", 36000);
  console.log(result);

  result = await chainEth.core.unlockAccount("0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8", "wanglu", 36000);
  console.log(result);

  result = await chainEtc.core.unlockAccount("0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8", "wanglu", 36000);
  console.log(result);
}


async function getBalance() {
  let result = await chainWan.core.getBalance("0x2d0e7c0813a51d3bd1d08246af2a8a7a57d8922e");
  console.log(result);

  result = await chainEth.core.getBalance("0x2d0e7c0813a51d3bd1d08246af2a8a7a57d8922e");
  console.log(result);

  result = await chainEtc.core.getBalance("0x2d0e7c0813a51d3bd1d08246af2a8a7a57d8922e");
  console.log(result);
}

async function addToken(tm, token) {
  let receipt = await tm.addToken(token.name, token.symbol, token.decimals);

  if (receipt.status) {
    const event = tm.contract.events[receipt.logs[0].topics[0]]();
    const logObj = event._formatOutput(receipt.logs[0]);
    return logObj.returnValues;
  }
}

async function addTokenPair(tm, tokenPair) {
  const toAccount = web3.utils.hexToBytes(tokenPair.tokenAddress);
  let receipt = await tm.addTokenPair(tokenPair.id, tokenPair.aInfo, tokenPair.fromChainID, tokenPair.fromAccount, tokenPair.toChainID, toAccount);

  if (receipt.status) {
    const event = tm.contract.events[receipt.logs[0].topics[0]]();
    const logObj = event._formatOutput(receipt.logs[0]);
    return logObj.returnValues;
  }
}

async function updateTokenPair(tm, tokenPair) {
  const toAccount = web3.utils.hexToBytes(tokenPair.tokenAddress);
  let receipt = await tm.updateTokenPair(tokenPair.id, tokenPair.aInfo, tokenPair.fromChainID, tokenPair.fromAccount, tokenPair.toChainID, toAccount);

  if (receipt.status) {
    const event = tm.contract.events[receipt.logs[0].topics[0]]();
    const logObj = event._formatOutput(receipt.logs[0]);
    return logObj.returnValues;
  }
}

async function deployTokenPairOrUpdate() {
  const tokenPairs = require('../db/tokenPair.js');
  const tokenPairsKeys = Object.keys(tokenPairs);
  for (let i = 0; i < tokenPairsKeys.length; i++) {
    const pairInfo = tokenPairs[tokenPairsKeys[i]];
    
    if (pairInfo.pair.tokenAddress === '0x0000000000000000000000000000000000000000') {
      const addTokenEvent = await addToken(tms[pairInfo.mapChain], pairInfo.mapToken);
      pairInfo.pair.tokenAddress = addTokenEvent.tokenAddress;
      console.log(`tokenAddress = ${addTokenEvent.tokenAddress}`)
    }

    const info = await tms[pairInfo.mapChain].getTokenPairInfo(pairInfo.pair.id);
    if (info && info.toAccount && web3.utils.bytesToHex(info.toAccount) !== '0x0000000000000000000000000000000000000000') {
      await updateTokenPair(tms[pairInfo.mapChain], pairInfo.pair);
    } else {
      await addTokenPair(tms[pairInfo.mapChain], pairInfo.pair);
    }

    const info2 = await tms[pairInfo.originChain].getTokenPairInfo(pairInfo.pair.id);
    if (info2 && info2.toAccount && web3.utils.bytesToHex(info2.toAccount) !== '0x0000000000000000000000000000000000000000') {
      await updateTokenPair(tms[pairInfo.originChain], pairInfo.pair);
    } else {
      await addTokenPair(tms[pairInfo.originChain], pairInfo.pair);
    }

    if(pairInfo.originChain !== 'WAN' && pairInfo.mapChain !== 'WAN') {
      const info3 = await tms['WAN'].getTokenPairInfo(pairInfo.pair.id);
      if (info3 && info3.toAccount && web3.utils.bytesToHex(info3.toAccount) !== '0x0000000000000000000000000000000000000000') {
        await updateTokenPair(tms['WAN'], pairInfo.pair);
      } else {
        await addTokenPair(tms['WAN'], pairInfo.pair);
      }
    }
  }

  fs.writeFileSync(path.resolve(__dirname, '../db/tokenPair_deployed.json'), JSON.stringify(tokenPairs, null, 2), 'utf-8');
}

setTimeout( async () => {
  // await mint("0x5793e629c061e7fd642ab6a1b4d552cec0e2d606", 1);
  await mint("0x6a8299deccd420d5b6970d611afb25cc8e910220", 10000000);
  // await changeOwner();
  // await upgradeTo();

  // await chainWan.core.closeEngine();
  // await chainEth.core.closeEngine();

  // await tmWan.getTokenPairInfo(1);
  // await tmWan.getTokenPairs();

  // await getBalance();

  // await unlockAccount();
  // await deployTokenPairOrUpdate();
}, 0);

process.on('unhandledRejection', (err) => {
  console.log(err);
});

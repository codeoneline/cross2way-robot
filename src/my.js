////////////////////////////////////////////////////////////////////////////////
// normal init
const log = require('./lib/log');
const TokenManager = require('./contract/token_manager');
const StoremanGroupAdmin = require('./contract/storeman_group_admin');
const { web3 } = require('./lib/utils');
const fs = require('fs');
const path = require('path');

// we can choose one blockchain
const chainWan = require(`./chain/${process.env.WAN_CHAIN_ENGINE}`);
const chainEth = require(`./chain/${process.env.ETH_CHAIN_ENGINE}`);
const chainEtc = require(`./chain/${process.env.ETC_CHAIN_ENGINE}`);

const sgaWan = new StoremanGroupAdmin(chainWan, process.env.STOREMANGROUPADMIN_ADDRESS, process.env.STOREMANGROUPADMIN_OWNER_PV_KEY, process.env.STOREMANGROUPADMIN_OWNER_PV_ADDRESS);
const sgaEth = new StoremanGroupAdmin(chainEth, process.env.STOREMANGROUPADMIN_ADDRESS_ETH, process.env.STOREMANGROUPADMIN_OWNER_PV_KEY, process.env.STOREMANGROUPADMIN_OWNER_PV_ADDRESS);

const tmWan = new TokenManager(chainWan, process.env.TOKEN_MANAGER_ADDRESS, process.env.TOKEN_MANAGER_OWNER_PV_KEY, process.env.TOKEN_MANAGER_OWNER_PV_ADDRESS);
const tmEth = new TokenManager(chainEth, process.env.TOKEN_MANAGER_ADDRESS_ETH, process.env.TOKEN_MANAGER_OWNER_PV_KEY, process.env.TOKEN_MANAGER_OWNER_PV_ADDRESS);
const tmEtc = new TokenManager(chainEtc, process.env.TOKEN_MANAGER_ADDRESS_ETC, process.env.TOKEN_MANAGER_OWNER_PV_KEY, process.env.TOKEN_MANAGER_OWNER_PV_ADDRESS);

const tms = {
  "WAN": tmWan,
  "ETH": tmEth,
  "ETC": tmEtc
}

async function setStoremanGroupConfig(sga, id, status, deposit, chain, curve, gpk1, gpk2, startTime, endTime) {
  log.info(`setStoremanGroupConfig begin`);
  
  const _deposit = "0x" + web3.utils.toBN(deposit).toString('hex');
  const _chain = ["0x" + web3.utils.toBN(chain[0]).toString('hex'),
                "0x" + web3.utils.toBN(chain[1]).toString('hex')];
  const _curve = ["0x" + web3.utils.toBN(curve[0]).toString('hex'),
                "0x" + web3.utils.toBN(curve[1]).toString('hex')];
  const _startTime = "0x" + web3.utils.toBN(startTime).toString('hex');
  const _endTime = "0x" + web3.utils.toBN(endTime).toString('hex');

  await sga.setStoremanGroupConfig(id, status, _deposit, _chain, _curve, gpk1, gpk2, _startTime, _endTime);
}

async function registerStart(sga, id, workStart, workDuration, registerDuration,  preGroupId) {
  log.info(`registerStart begin`);

  const _workStart = "0x" + web3.utils.toBN(workStart).toString('hex');
  const _workDuration = "0x" + web3.utils.toBN(workDuration).toString('hex');
  const _registerDuration = "0x" + web3.utils.toBN(registerDuration).toString('hex');

  await sga.registerStart(id, _workStart, _workDuration, _registerDuration, preGroupId);
}

// create ETH WETH WAN EWAN token pair

async function unlockAccount() {
  let result = await chainWan.core.unlockAccount("0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8", "wanglu", 36000);
  console.log(result);

  result = await chainEth.core.unlockAccount("0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8", "wanglu", 36000);
  console.log(result);

  result = await chainEtc.core.unlockAccount("0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8", "wanglu", 36000);
  console.log(result);
}

// # @姬世武 @詹力 
// # sk1和sk2是给@詹力 用的
// # @姬世武 如果曲线用bn128，就用bn128-smg*的pk，如果曲线用secp256k1，就用secp256k1-smg*的pk

// # smg1
// #   sk1:new Buffer("097e961933fa62e3fef5cedef9a728a6a927a4b29f06a15c6e6c52c031a6cb2b", 'hex')
// #   sk2:new Buffer("e6a00fb13723260102a6937fc86b0552eac9abbe67240d7147f31fdef151e18a", 'hex')
// # smg2
// #   sk1:new Buffer("0de99c2552e85e51fd7491a14ad340f92a02db92983178929b100776197bc4f6", 'hex')
// #   sk2:new Buffer("55aa70e9a9d984c91bd75d4793db2cd2d998dc8fcaebcb864202fb17a9a6d5b9", 'hex')

// # bn128-smg1
// #   PK1: 0x0038c8e52318773522675cd2f3536b105c556ff788281d3439b6c048c05c9dfe1f807d0617f926f0c11a4d2e785ac2f0c48dc50b687a3918cf860aef303bae87
// #   PK2: 0x023f808ae2bfb8dfbd103d29e28b592e0f3099893538ff25e8544a93cd7f4f9f10d9b6594d5cba8b9bc4d1c0f6bf0103956cfd531af147e019edbd0a5ff7a8a9

// # bn128-smg2
// #   PK1: 0x160f229847d78952799aa2c665dae79436c59f0b49fee402bbdda64e7d8732a907b96d0d2c7e4aeb6e14688160ab01ba4a7b412e62d93490ce4684365ef68b6e
// #   PK2: 0x0afde15d88d8ee300cc340ddf12e0cef80672b527b5ade16155e3da4ee84576c255c4c4c10c0ab7945c37ad61d92539a9ee5835c511279d06462cf503e4cd852

// # secp256k1-smg1
// #   PK1: 0xcb54bc900646fe8de5c8db04e4120e38cb61b3e000ae37e4ecdaf71b777f7ec71f81f87d21eb46e372105a3d123af9a94e0760f9c13738b8ca1abf248a9104f2
// #   PK2: 0x6de983ee501df9700b3aec67332b98cc9fac1bb52238f15ba66c0fab9125362382e3b5406bb4183f74d875802a6ba8ad9d41a381d7a5c9a3352a7f136fd67c10

// # secp256k1-smg2
// #   PK1: 0x0e2c43272ccd977d0dc562a0a790d5c2ca788a6868a74170caed4ba92ff1e86713fa694404bcf8d5ad86fd8c432afe5f49d1c043d33c03857b2fe0c2e98e7556
// #   PK2: 0x3ef6c41fb253f3db7900726016f0a0ba0e694cd587b17f174a9c1dc7ea2b3d1de5503a1ae2db27019a4e639bd26734084c4859b8aa746c1ab5774429a33b2e4b

// storeMan: wan <-> eth
const preSmgID = web3.utils.padRight("0x", 64);
const smgID1 = web3.utils.padRight("0x", 64, '1');
const smgID2 = web3.utils.padRight("0x", 64, '2');
// const gpk1_1 = "0xcb54bc900646fe8de5c8db04e4120e38cb61b3e000ae37e4ecdaf71b777f7ec71f81f87d21eb46e372105a3d123af9a94e0760f9c13738b8ca1abf248a9104f2";
// const gpk1_2 = "0x6de983ee501df9700b3aec67332b98cc9fac1bb52238f15ba66c0fab9125362382e3b5406bb4183f74d875802a6ba8ad9d41a381d7a5c9a3352a7f136fd67c10";
// const gpk2_1 = "0x0e2c43272ccd977d0dc562a0a790d5c2ca788a6868a74170caed4ba92ff1e86713fa694404bcf8d5ad86fd8c432afe5f49d1c043d33c03857b2fe0c2e98e7556";
// const gpk2_2 = "0x3ef6c41fb253f3db7900726016f0a0ba0e694cd587b17f174a9c1dc7ea2b3d1de5503a1ae2db27019a4e639bd26734084c4859b8aa746c1ab5774429a33b2e4b";
const gpk1_1 = "0x0038c8e52318773522675cd2f3536b105c556ff788281d3439b6c048c05c9dfe1f807d0617f926f0c11a4d2e785ac2f0c48dc50b687a3918cf860aef303bae87";
const gpk1_2 = "0x023f808ae2bfb8dfbd103d29e28b592e0f3099893538ff25e8544a93cd7f4f9f10d9b6594d5cba8b9bc4d1c0f6bf0103956cfd531af147e019edbd0a5ff7a8a9";
const gpk2_1 = "0x160f229847d78952799aa2c665dae79436c59f0b49fee402bbdda64e7d8732a907b96d0d2c7e4aeb6e14688160ab01ba4a7b412e62d93490ce4684365ef68b6e";
const gpk2_2 = "0x0afde15d88d8ee300cc340ddf12e0cef80672b527b5ade16155e3da4ee84576c255c4c4c10c0ab7945c37ad61d92539a9ee5835c511279d06462cf503e4cd852";
const startTime = 1595234554;
const endTime = 2595234554;
// enum GroupStatus {none, initial, curveSeted, failed, selected, ready, unregistered, dismissed}
async function mySetStoremanGroupConfig() {
  const deposit1 = '0x' + web3.utils.toWei("10000000").toString('hex');
  let receipt = await setStoremanGroupConfig(sgaWan, smgID1, 5, deposit1, [0x8057414e, 2147483708], [1, 1], gpk1_1, gpk1_2, startTime, endTime);
  console.log(JSON.stringify(receipt));

  const deposit2 = '0x' + web3.utils.toWei("900000000").toString('hex');
  receipt = await setStoremanGroupConfig(sgaWan, smgID2, 5, deposit2, [0x8057414e, 2147483708], [1, 1], gpk2_1, gpk2_2, startTime, endTime);
  console.log(JSON.stringify(receipt));
}

async function myGetStoremanGroupConfig() {
  let config = await sgaWan.getStoremanGroupConfig(smgID1);
  console.log(JSON.stringify(config));

  config = await sgaEth.getStoremanGroupConfig(smgID2);
  console.log(JSON.stringify(config));
}

async function myRegisterStart() {
  // sga, id, workStart, workDuration, registerDuration,  preGroupId
  const workStart = startTime;
  const workDuration = endTime - startTime
  let receipt = await registerStart(sgaWan, smgID1, workStart, workDuration, workDuration, preSmgID);
  console.log(JSON.stringify(receipt));

  receipt = await registerStart(sgaWan, smgID2, workStart, workDuration, workDuration, preSmgID);
  console.log(JSON.stringify(receipt));
}


async function addToken(tm, token) {
  let receipt = await tm.addToken(token.name, token.symbol, token.decimals);
  // console.log(JSON.stringify(receipt.logs[0].));
  if (receipt.status) {
    const event = tm.contract.events[receipt.logs[0].topics[0]]();
    const logObj = event._formatOutput(receipt.logs[0]);
    return logObj.returnValues;
  }
}

async function addTokenPair(tm, tokenPair) {
  let receipt = await tm.addTokenPair(tokenPair.id, tokenPair.aInfo, tokenPair.fromChainID, tokenPair.fromAccount, tokenPair.toChainID, tokenPair.tokenAddress);

  if (receipt.status) {
    const event = tm.contract.events[receipt.logs[0].topics[0]]();
    const logObj = event._formatOutput(receipt.logs[0]);
    return logObj.returnValues;
  }
}

async function updateTokenPair(tm, tokenPair) {
  let receipt = await tm.updateTokenPair(tokenPair.id, tokenPair.aInfo, tokenPair.fromChainID, tokenPair.fromAccount, tokenPair.toChainID, tokenPair.tokenAddress, true);

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

      const info = await tms[pairInfo.mapChain].getTokenPairInfo(pairInfo.pair.id);
      if (info && info.tokenAddress !== '0x0000000000000000000000000000000000000000') {
        await updateTokenPair(tms[pairInfo.mapChain], pairInfo.pair);
      } else {
        await addTokenPair(tms[pairInfo.mapChain], pairInfo.pair);
      }

      const info2 = await tms[pairInfo.originChain].getTokenPairInfo(pairInfo.pair.id);
      if (info2 && info2.tokenAddress !== '0x0000000000000000000000000000000000000000') {
        await updateTokenPair(tms[pairInfo.originChain], pairInfo.pair);
      } else {
        await addTokenPair(tms[pairInfo.originChain], pairInfo.pair);
      }

      if(pairInfo.originChain !== 'WAN' && pairInfo.mapChain !== 'WAN') {
        const info3 = await tms['WAN'].getTokenPairInfo(pairInfo.pair.id);
        if (info3 && info3.tokenAddress !== '0x0000000000000000000000000000000000000000') {
          await updateTokenPair(tms['WAN'], pairInfo.pair);
        } else {
          await addTokenPair(tms['WAN'], pairInfo.pair);
        }
      }
    }
  }

  fs.writeFileSync(path.resolve(__dirname, '../db/tokenPair_deployed.json'), JSON.stringify(tokenPairs, null, 2), 'utf-8');
}

setTimeout( async () => {
  await deployTokenPairOrUpdate();
  // const wlinkAddress = await addToken(tmWan, tokenInfoWan[0]);

  // await addToken(tmWan, tokenInfoWan[1]);
  // await addToken(tmEth, tokenInfoEth[0]);
  // await addToken(tmEth, tokenInfoEth[1]);

  // await unlockAccount();
  // await myRegisterStart();
  // await mySetStoremanGroupConfig();
  // await myGetStoremanGroupConfig();

  // await chainWan.core.closeEngine();
  // await chainEth.core.closeEngine();

  // await tmWan.getTokenPairInfo(1);
  // await tmWan.getTokenPairs();
}, 0);

process.on('unhandledRejection', (err) => {
  console.log(err);
});

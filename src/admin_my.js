const Oracle = require('./contract/oracle');
const TokenManager = require('./contract/token_manager');
const OracleProxy = require('./contract/oracle_proxy');
const TokenManagerProxy = require('./contract/token_manager_proxy');
const StoremanGroupAdminMy = require('./contract/storeman_group_admin_my');
const MapToken = require('./contract/map_token');

const {changeOwner, upgradeTo, mint, unlockAccount, getBalance,
  addToken, addTokenPair, updateTokenPair, deployTokenPairOrUpdate} = require('./admin_core');

const { web3 } = require('./lib/utils');
const fs = require('fs');
const path = require('path');

const chainWanMy = require(`./chain/${process.env.WAN_CHAIN_ENGINE_MY}`);
const chainEth = require(`./chain/${process.env.ETH_CHAIN_ENGINE}`);
const chainEtc = require(`./chain/${process.env.ETC_CHAIN_ENGINE}`);

const sgaWanMy = new StoremanGroupAdminMy(chainWanMy, process.env.SMGA_ADDRESS_MY, process.env.SK_MY, process.env.ADDRESS_MY);

const tmWanMy = new TokenManager(chainWanMy, process.env.TM_ADDRESS_MY, process.env.SK_MY, process.env.ADDRESS_MY);
const tmEth = new TokenManager(chainEth, process.env.TOKEN_MANAGER_ADDRESS_ETH, process.env.TOKEN_MANAGER_OWNER_PV_KEY, process.env.TOKEN_MANAGER_OWNER_PV_ADDRESS);
const tmEtc = new TokenManager(chainEtc, process.env.TOKEN_MANAGER_ADDRESS_ETC, process.env.TOKEN_MANAGER_OWNER_PV_KEY, process.env.TOKEN_MANAGER_OWNER_PV_ADDRESS);

const oracleWanMy = new Oracle(chainWanMy, process.env.ORACLE_ADDRESS_MY, process.env.SK_MY, process.env.ADDRESS_MY);

const fnxWanMy = new MapToken(chainWanMy, process.env.FNX_ADDRESS_MY, process.env.SK_MY, process.env.ADDRESS_MY);
const linkEth = new MapToken(chainEth, process.env.LINK_ETH_ADDRESS, process.env.LINK_ETH_OWNER_PV_KEY, process.env.LINK_ETH_OWNER_PV_ADDRESS);
const eosWanMy = new MapToken(chainWanMy, process.env.EOS_ADDRESS, process.env.SK_MY, process.env.ADDRESS_MY);
const btcWanMy = new MapToken(chainWanMy, process.env.BTC_ADDRESS, process.env.SK_MY, process.env.ADDRESS_MY);

const tms = {
  "WAN": tmWanMy,
  "ETH": tmEth,
  "ETC": tmEtc
}

async function upgradeMyOracle() {
  const oracleProxyWan = new OracleProxy(chainWanMy, process.env.ORACLE_ADDRESS_MY, process.env.SK_MY, process.env.ADDRESS_MY);
  await upgradeTo(oracleProxyWan, process.env.ORACLE_ADDRESS_MY_UP);
}

async function upgradeMyTokenManager() {
  const tmProxyWan = new TokenManagerProxy(chainWanMy, process.env.TM_ADDRESS_MY, process.env.SK_MY, process.env.ADDRESS_MY);
  await upgradeTo(tmProxyWan, process.env.TM_ADDRESS_MY_UP);
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


async function setStoremanGroupConfig(sga, id, status, deposit, chain, curve, gpk1, gpk2, startTime, endTime) {
  log.info(`setStoremanGroupConfig`);
  await sga.setStoremanGroupConfig(id, status, deposit, chain, curve, gpk1, gpk2, startTime, endTime);
}

async function registerStart(sga, id, workStart, workDuration, registerDuration,  preGroupId) {
  log.info(`registerStart`);
  await sga.registerStart(id, workStart, workDuration, registerDuration, preGroupId);
}

const preSmgID = web3.utils.padRight("0x", 64);
const smgID1 = web3.utils.padRight("0x", 64, '1');
const smgID2 = web3.utils.padRight("0x", 64, '2');
async function mySetStoremanGroupConfig() {
  // enum GroupStatus {none, initial, curveSeted, failed, selected, ready, unregistered, dismissed}
  const gpk1_1 = "0x0038c8e52318773522675cd2f3536b105c556ff788281d3439b6c048c05c9dfe1f807d0617f926f0c11a4d2e785ac2f0c48dc50b687a3918cf860aef303bae87";
  const gpk1_2 = "0x023f808ae2bfb8dfbd103d29e28b592e0f3099893538ff25e8544a93cd7f4f9f10d9b6594d5cba8b9bc4d1c0f6bf0103956cfd531af147e019edbd0a5ff7a8a9";
  const gpk2_1 = "0x160f229847d78952799aa2c665dae79436c59f0b49fee402bbdda64e7d8732a907b96d0d2c7e4aeb6e14688160ab01ba4a7b412e62d93490ce4684365ef68b6e";
  const gpk2_2 = "0x0afde15d88d8ee300cc340ddf12e0cef80672b527b5ade16155e3da4ee84576c255c4c4c10c0ab7945c37ad61d92539a9ee5835c511279d06462cf503e4cd852";
  const startTime = 1595234554;
  const endTime = 2595234554;
  const deposit1 = '0x' + web3.utils.toWei("10000000").toString('hex');
  let receipt = await setStoremanGroupConfig(sgaWanMy, smgID1, 5, deposit1, [0x8057414e, 2147483708], [1, 1], gpk1_1, gpk1_2, startTime, endTime);
  console.log(JSON.stringify(receipt));

  const deposit2 = '0x' + web3.utils.toWei("900000000").toString('hex');
  receipt = await setStoremanGroupConfig(sgaWanMy, smgID2, 5, deposit2, [0x8057414e, 2147483708], [1, 1], gpk2_1, gpk2_2, startTime, endTime);
  console.log(JSON.stringify(receipt));
}

async function myGetStoremanGroupConfig() {
  let config = await sgaWanMy.getStoremanGroupConfig(smgID1);
  console.log(JSON.stringify(config));
  config = await sgaWanMy.getStoremanGroupConfig(smgID2);
  console.log(JSON.stringify(config));
}

async function myRegisterStart() {
  // sga, id, workStart, workDuration, registerDuration,  preGroupId
  const workStart = startTime;
  const workDuration = endTime - startTime
  let receipt = await registerStart(sgaWanMy, smgID1, workStart, workDuration, workDuration, preSmgID);
  console.log(JSON.stringify(receipt));

  receipt = await registerStart(sgaWanMy, smgID2, workStart, workDuration, workDuration, preSmgID);
  console.log(JSON.stringify(receipt));
}

setTimeout( async () => {
  // const old_owner_addr = "0x2d0e7c0813a51d3bd1d08246af2a8a7a57d8922e";
  // const old_owner_sk = "a4369e77024c2ade4994a9345af5c47598c7cfb36c65e8a4a3117519883d9014";
  // const new_owner_addr = "0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8";
  // const new_owner_sk = "b6a03207128827eaae0d31d97a7a6243de31f2baf99eabd764e33389ecf436fc";
  // await changeOwner([tmWanMy, oracleWanMy], old_owner_addr, old_owner_sk, new_owner_addr, new_owner_sk);

  // await mint([fnxWanMy, linkEth, eosWanMy, btcWanMy], "0x67e3b428acbc3aa2fd38813f65dafbd5af97c6d5", 10000000);

  // await upgradeMyOracle();
  // await upgradeMyTokenManager();

  await unlockAccount([chainWanMy, chainEth, chainEtc], "0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8", "wanglu", 36000);

  // await getBalance([chainWanMy, chainEth, chainEtc], "0x2d0e7c0813a51d3bd1d08246af2a8a7a57d8922e");

  // await myRegisterStart();
  // await mySetStoremanGroupConfig();
  // await myGetStoremanGroupConfig();

  // await chainWanMy.core.closeEngine();
  // await chainEth.core.closeEngine();

  // await deployTokenPairOrUpdate('../db/tokenPairMy.js', path.resolve(__dirname, '../db/tokenPairMy_deployed.json'), tms);
}, 0);

process.on('unhandledRejection', (err) => {
  console.log(err);
});

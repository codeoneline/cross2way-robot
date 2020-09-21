const Oracle = require('./contract/oracle');
const TokenManager = require('./contract/token_manager');
const OracleProxy = require('./contract/oracle_proxy');
const TokenManagerProxy = require('./contract/token_manager_proxy');
const StoremanGroupAdmin = require('./contract/storeman_group_admin');
const MapToken = require('./contract/map_token');

const {changeOwner, upgradeTo, mint, unlockAccount, getBalance,
  addToken, addTokenPair, updateTokenPair, deployTokenPairOrUpdate} = require('./admin_core');

const { web3 } = require('./lib/utils');
const fs = require('fs');
const path = require('path');

const chainWan = require(`./chain/${process.env.WAN_CHAIN_ENGINE}`);
const chainEth = require(`./chain/${process.env.ETH_CHAIN_ENGINE}`);

const sgaWan = new StoremanGroupAdmin(chainWan, process.env.SGA_ADDR, process.env.SGA_OWNER_SK, process.env.SGA_OWNER_ADDR);

const tmWan = new TokenManager(chainWan, process.env.TM_ADDR, process.env.TM_OWNER_SK, process.env.TM_OWNER_ADDR);
const tmEth = new TokenManager(chainEth, process.env.TM_ADDR_ETH, process.env.TM_OWNER_SK_ETH, process.env.TM_OWNER_ADDR_ETH);

const oracleWan = new Oracle(chainWan, process.env.OR_ADDR, process.env.OR_OWNER_SK, process.env.OR_OWNER_ADDR);

const fnxWan = new MapToken(chainWan, process.env.FNX_ADDR, process.env.FNX_OWNER_SK, process.env.FNX_OWNER_ADDR);
const linkEth = new MapToken(chainEth, process.env.LINK_ADDR_ETH, process.env.LINK_OWNER_SK_ETH, process.env.LINK_OWNER_ADDR_ETH);
const btcWan = new MapToken(chainWan, process.env.BTC_ADDR, process.env.FNX_OWNER_SK, process.env.FNX_OWNER_ADDR);
const eosWan = new MapToken(chainWan, process.env.EOS_ADDR, process.env.FNX_OWNER_SK, process.env.FNX_OWNER_ADDR);

const tms = {
  "WAN": tmWan,
  "ETH": tmEth,
}

async function upgradeOracle() {
  const oracleProxyWan = new OracleProxy(chainWan, process.env.OR_ADDR, process.env.OR_OWNER_SK, process.env.OR_OWNER_ADDR);
  await upgradeTo(oracleProxyWan, process.env.ORACLE_ADDRESS_UP);
}

async function upgradeTokenManager() {
  const tmProxyWan = new TokenManagerProxy(chainWan, process.env.TM_ADDR, process.env.TM_OWNER_SK, process.env.TM_OWNER_ADDR);
  await upgradeTo(tmProxyWan, process.env.TM_ADDR_UP);
}

// wan2eth: {
//   name:'WAN@ethereum', 
//   symbol: 'wanETH',
//   decimals: 18,
//   address: '0x12a139B8E453E761eC21BB58E22Be9a5D3Ef54dC'
// }

// btc2eth: {
//   name:'wanBTC@ethereum', 
//   symbol: 'wanBTC',
//   decimals: 8,
//   address: '0xE2A1dc77aAD2BB6b493c491572e822381f2a6E5d'
// }

// eos2eth: {
//   name: 'wanEOS@ethereum',
//   symbol: 'wanEOS',
//   decimals: 4,
//   address: '0x5529688926D5B4359E78F6D223C4BC63a249De2a'
// }
// const wanEth = new MapToken(chainEth, '0x12a139B8E453E761eC21BB58E22Be9a5D3Ef54dC', process.env.SK_MY, process.env.ADDRESS_MY);
// const btcEth = new MapToken(chainEth, '0xE2A1dc77aAD2BB6b493c491572e822381f2a6E5d', process.env.SK_MY, process.env.ADDRESS_MY);
// const eosEth = new MapToken(chainEth, '0x5529688926D5B4359E78F6D223C4BC63a249De2a', process.env.SK_MY, process.env.ADDRESS_MY);

setTimeout( async () => {
  // const old_owner_addr = "0x2d0e7c0813a51d3bd1d08246af2a8a7a57d8922e";
  // const old_owner_sk = "a4369e77024c2ade4994a9345af5c47598c7cfb36c65e8a4a3117519883d9014";
  // const new_owner_addr = "0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8";
  // const new_owner_sk = "b6a0`3207128827eaae0d31d97a7a6243de31f2baf99eabd764e33389ecf436fc";

  // await changeOwner([tmWan, oracleWan], old_owner_addr, old_owner_sk, new_owner_addr, new_owner_sk);
``
  // await wanEth.update('WAN@ethereum', 'WAN', {from: "0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8"});

  // await mint([fnxWan], "0x67e3b428acbc3aa2fd38813f65dafbd5af97c6d5".toLowerCase(), 100000000);
  // await mint([fnxWan], "0xFB683bDDB0ACBB00Dd162CD5E3798c7Fc6E5CFc0".toLowerCase(), 100000000);
  // await mint([fnxWan, btcWan, eosWan], "0xFB683bDDB0ACBB00Dd162CD5E3798c7Fc6E5CFc0".toLowerCase(), 1000);
  // await mint([fnxWan], "0x0d5A1204c001693D86E70566Ae57D49F40d04C90".toLowerCase(), 10000000);
  // await mint([linkEth], "0xded23dd19136574fce6b4ab4ea76395c4088a033", 100000000);
  // await mint([linkEth], "0xded23dd19136574fce6b4ab4ea76395c4088a033", 100000000);
  // await mint([wanEth], "0x67e3b428acbc3aa2fd38813f65dafbd5af97c6d5", 100000000);
  // await mint([btcEth], "0xE2A1dc77aAD2BB6b493c491572e822381f2a6E5d", 0.1);
  // await mint([eosEth], "0x67e3b428acbc3aa2fd38813f65dafbd5af97c6d5", 1);

  // await mint([fnxWan, linkEth, eosWan, btcWan], "0x67e3b428acbc3aa2fd38813f65dafbd5af97c6d5", 10000000);
  // await mint([linkEth], "0x67e3b428acbc3aa2fd38813f65dafbd5af97c6d5", 10000000);
  // await mint([linkEth], "0x9dA26FC2E1D6Ad9FDD46138906b0104ae68a65D8", 10000000);


  // await upgradeOracle();
  // await upgradeTokenManager();

  // await chainWan.core.closeEngine();
  // await chainEth.core.closeEngine();

  // await getBalance([chainWan, chainEth, chainEtc], "0x2d0e7c0813a51d3bd1d08246af2a8a7a57d8922e");

  // await unlockAccount([chainWan], "0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8", "wanglu", 36000);
  await deployTokenPairOrUpdate('../db/tokenPair.js', path.resolve(__dirname, '../db/tokenPair_deployed.json'), tms);


  // await mint([linkEth], "0xe2f31d7ba3e0098ea0e64d94c0224365812b986c", 10000000)
}, 0);

process.on('unhandledRejection', (err) => {
  console.log(err);
});

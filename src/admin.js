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
const chainEtc = require(`./chain/${process.env.ETC_CHAIN_ENGINE}`);

const sgaWan = new StoremanGroupAdmin(chainWan, process.env.STOREMANGROUPADMIN_ADDRESS, process.env.STOREMANGROUPADMIN_OWNER_PV_KEY, process.env.STOREMANGROUPADMIN_OWNER_PV_ADDRESS);

const tmWan = new TokenManager(chainWan, process.env.TOKEN_MANAGER_ADDRESS, process.env.TOKEN_MANAGER_OWNER_PV_KEY, process.env.TOKEN_MANAGER_OWNER_PV_ADDRESS);
const tmEth = new TokenManager(chainEth, process.env.TOKEN_MANAGER_ADDRESS_ETH, process.env.TOKEN_MANAGER_OWNER_PV_KEY, process.env.TOKEN_MANAGER_OWNER_PV_ADDRESS);
const tmEtc = new TokenManager(chainEtc, process.env.TOKEN_MANAGER_ADDRESS_ETC, process.env.TOKEN_MANAGER_OWNER_PV_KEY, process.env.TOKEN_MANAGER_OWNER_PV_ADDRESS);

const oracleWan = new Oracle(chainWan, process.env.ORACLE_ADDRESS, process.env.ORACLE_OWNER_PV_KEY, process.env.ORACLE_OWNER_PV_ADDRESS);

const fnxWan = new MapToken(chainWan, process.env.FNX_WAN_ADDRESS, process.env.FNX_WAN_OWNER_PV_KEY, process.env.FNX_WAN_OWNER_PV_ADDRESS);
const linkEth = new MapToken(chainEth, process.env.LINK_ETH_ADDRESS, process.env.LINK_ETH_OWNER_PV_KEY, process.env.LINK_ETH_OWNER_PV_ADDRESS);
// const eosWan = new MapToken(chainWan, process.env.EOS_ADDRESS, process.env.SK_MY, process.env.ADDRESS_MY);
// const btcWan = new MapToken(chainWan, process.env.BTC_ADDRESS, process.env.SK_MY, process.env.ADDRESS_MY);

const tms = {
  "WAN": tmWan,
  "ETH": tmEth,
  "ETC": tmEtc
}

async function upgradeOracle() {
  const oracleProxyWan = new OracleProxy(chainWan, process.env.ORACLE_ADDRESS, process.env.ORACLE_OWNER_PV_KEY, process.env.ORACLE_OWNER_PV_ADDRESS);
  await upgradeTo(oracleProxyWan, process.env.ORACLE_ADDRESS_UP);
}

async function upgradeTokenManager() {
  const tmProxyWan = new TokenManagerProxy(chainWan, process.env.TOKEN_MANAGER_ADDRESS, process.env.TOKEN_MANAGER_OWNER_PV_KEY, process.env.TOKEN_MANAGER_OWNER_PV_ADDRESS);
  await upgradeTo(tmProxyWan, process.env.TOKEN_MANAGER_ADDRESS_UP);
}

setTimeout( async () => {
  // const old_owner_addr = "0x2d0e7c0813a51d3bd1d08246af2a8a7a57d8922e";
  // const old_owner_sk = "a4369e77024c2ade4994a9345af5c47598c7cfb36c65e8a4a3117519883d9014";
  // const new_owner_addr = "0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8";
  // const new_owner_sk = "b6a03207128827eaae0d31d97a7a6243de31f2baf99eabd764e33389ecf436fc";

  // await changeOwner([tmWan, oracleWan], old_owner_addr, old_owner_sk, new_owner_addr, new_owner_sk);

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
}, 0);

process.on('unhandledRejection', (err) => {
  console.log(err);
});

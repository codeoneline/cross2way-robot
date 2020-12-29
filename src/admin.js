const Oracle = require('./contract/oracle');
const TokenManager = require('./contract/token_manager');
const OracleProxy = require('./contract/oracle_proxy');
const TokenManagerProxy = require('./contract/token_manager_proxy');
const StoremanGroupAdmin = require('./contract/storeman_group_admin');
const MapToken = require('./contract/map_token');
const log = require('./lib/log');
const { privateToAddress} = require('./lib/utils')

const {changeOwner, upgradeTo, mint, unlockAccount, getBalance} = require('./admin_core');
const { loadContract } = require('./lib/abi_address');

const { web3 } = require('./lib/utils');
const fs = require('fs');
const path = require('path');

const chainWan = require(`./chain/${process.env.WAN_CHAIN_ENGINE}`);
const chainEth = require(`./chain/${process.env.ETH_CHAIN_ENGINE}`);

const sgaWan = loadContract(chainWan, 'StoremanGroupDelegate')

const tmWan = loadContract(chainWan, 'TokenManagerDelegate')
const tmEth = loadContract(chainEth, 'TokenManagerDelegate')

const oracleWan = loadContract(chainWan, 'OracleDelegate')

const fnxWan = new MapToken(chainWan, process.env.FNX_ADDR, process.env.FNX_OWNER_SK, process.env.FNX_OWNER_ADDR);
const linkEth = new MapToken(chainEth, process.env.LINK_ADDR_ETH, process.env.LINK_OWNER_SK_ETH, process.env.LINK_OWNER_ADDR_ETH);
const btcWan = new MapToken(chainWan, process.env.BTC_ADDR, process.env.FNX_OWNER_SK, process.env.FNX_OWNER_ADDR);
const eosWan = new MapToken(chainWan, process.env.EOS_ADDR, process.env.FNX_OWNER_SK, process.env.FNX_OWNER_ADDR);

const tms = {
  "WAN": tmWan,
  "ETH": tmEth,
}

async function upgradeOracle(newAddress) {
  const oracleProxyWan = loadContract(chainWan, 'OracleProxy')
  await upgradeTo(oracleProxyWan, newAddress);
}

async function upgradeTokenManager(newAddress) {
  const tmProxyWan = loadContract(chainWan, 'TokenManagerProxy')
  await upgradeTo(tmProxyWan, newAddress);
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

  console.log(await chainEth.core.getBlockNumber())

  // await unlockAccount([chainWan], "0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8", "wanglu", 36000);

  // await changeOwner([tmWan, oracleWan], old_owner_addr, old_owner_sk, new_owner_addr, new_owner_sk);

  // await wanEth.update('WAN@ethereum', 'WAN', {from: "0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8"});
  // await mint([fnxWan], "0xb78fda5880f96DFf34CE1cE649B99E8B29AD570f".toLowerCase(), 100000);
  // await mint([linkEth], "0x1d26f4a4a5c14c3d61e4d3629657304e55cba69e".toLowerCase(), 100000);
  // await mint([btcWan], "0xFB683bDDB0ACBB00Dd162CD5E3798c7Fc6E5CFc0".toLowerCase(), 100000);
  // await mint([fnxWan], "0xFB683bDDB0ACBB00Dd162CD5E3798c7Fc6E5CFc0".toLowerCase(), 100000);
  // await fnxWan.sendCoin("0xFB683bDDB0ACBB00Dd162CD5E3798c7Fc6E5CFc0","10000",100,process.env.FNX_OWNER_SK);
  await linkEth.sendCoin("0xFB683bDDB0ACBB00Dd162CD5E3798c7Fc6E5CFc0","10000",100,process.env.FNX_OWNER_SK);
  // await mint([linkEth], "0x67e3b428acbc3aa2fd38813f65dafbd5af97c6d5", 100000000);
  // await mint([fnxWan, btcWan, eosWan], "0xded23dd19136574fce6b4ab4ea76395c4088a033".toLowerCase(), 1000);
  // await mint([linkEth], "0xded23dd19136574fce6b4ab4ea76395c4088a033", 100000000);
  // await mint([fnxWan, btcWan, eosWan], "0x0d5A1204c001693D86E70566Ae57D49F40d04C90".toLowerCase(), 1000);
  // await mint([linkEth], "0x0d5A1204c001693D86E70566Ae57D49F40d04C90", 100000000);
  // await mint([fnxWan, btcWan, eosWan], "0xE2A1dc77aAD2BB6b493c491572e822381f2a6E5d".toLowerCase(), 1000);
  // await mint([linkEth], "0xE2A1dc77aAD2BB6b493c491572e822381f2a6E5d", 100000000);
  // await mint([fnxWan], "0xE8DcC92a1eB5C42B63E32C448a53bD4FbE313820".toLowerCase(), 100000);
  // await mint([fnxWan], "0xc3d4bbb13c471969275076e4ba0badea214d68e1".toLowerCase(), 100000000);
  // await mint([fnxWan], "0x67e3b428acbc3aa2fd38813f65dafbd5af97c6d5".toLowerCase(), 100000000);
  // await mint([fnxWan], "0xFB683bDDB0ACBB00Dd162CD5E3798c7Fc6E5CFc0".toLowerCase(), 100000000);
  // await mint([fnxWan, btcWan, eosWan], "0xFB683bDDB0ACBB00Dd162CD5E3798c7Fc6E5CFc0".toLowerCase(), 1000);
  // await mint([linkEth], "0xded23dd19136574fce6b4ab4ea76395c4088a033", 100000000);
  // await mint([fnxWan], "0x0d5A1204c001693D86E70566Ae57D49F40d04C90".toLowerCase(), 10000000);
  // await mint([linkEth], "0xded23dd19136574fce6b4ab4ea76395c4088a033", 100000000);
  // await mint([wanEth], "0x67e3b428acbc3aa2fd38813f65dafbd5af97c6d5", 100000000);
  // await mint([btcEth], "0xE2A1dc77aAD2BB6b493c491572e822381f2a6E5d", 0.1);
  // await mint([eosEth], "0x67e3b428acbc3aa2fd38813f65dafbd5af97c6d5", 1);

  // await mint([fnxWan, linkEth, eosWan, btcWan], "0x67e3b428acbc3aa2fd38813f65dafbd5af97c6d5", 10000000);
  // await mint([linkEth], "0x67e3b428acbc3aa2fd38813f65dafbd5af97c6d5", 10000000);
  // await mint([linkEth], "0x9dA26FC2E1D6Ad9FDD46138906b0104ae68a65D8", 10000000);

  // const tokenPairs = await tmWan.getTokenPairsByChainID(61, 5718351)
  // console.log(JSON.stringify(tokenPairs, null, 2))
  // const tokenPairs2 = await tmWan.getTokenPairsByChainID2(61, 5718351)
  // console.log(JSON.stringify(tokenPairs2, null, 2))

  // await upgradeOracle();
  // await upgradeTokenManager();

  // await chainWan.core.closeEngine();
  // await chainEth.core.closeEngine();

  // await getBalance([chainWan, chainEth, chainEtc], "0x2d0e7c0813a51d3bd1d08246af2a8a7a57d8922e");

  // await mint([linkEth], "0xe2f31d7ba3e0098ea0e64d94c0224365812b986c", 10000000)
  console.log("hello")
}, 0);

process.on('unhandledRejection', (err) => {
  console.log(err);
});

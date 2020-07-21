////////////////////////////////////////////////////////////////////////////////
// normal init
const log = require('./lib/log');
const StoremanGroupAdmin = require('./contract/storeman_group_admin');
const { web3 } = require('./lib/utils');

// we can choose one blockchain
const chainWan = require(`./chain/${process.env.WAN_CHAIN_ENGINE}`);
const chainEth = require(`./chain/${process.env.ETH_CHAIN_ENGINE}`);

const sgaWan = new StoremanGroupAdmin(chainWan, process.env.STOREMANGROUPADMIN_ADDRESS, process.env.STOREMANGROUPADMIN_OWNER_PV_KEY, process.env.STOREMANGROUPADMIN_OWNER_PV_ADDRESS);
const sgaEth = new StoremanGroupAdmin(chainEth, process.env.STOREMANGROUPADMIN_ADDRESS_ETH, process.env.STOREMANGROUPADMIN_OWNER_PV_KEY, process.env.STOREMANGROUPADMIN_OWNER_PV_ADDRESS);

// storeMan: wan <-> eth
const preSmgID = web3.utils.padRight("0x", 64);
const smgID = "0x111122223333444455556666777788889999AAAABBBBCCCCDDDDEEEEFFFFCCCC";
const gpk1 = "0x111122223333444455556666777788889999AAAABBBBCCCCDDDDEEEEFFFF0000";
const gpk2 = "0x111122223333444455556666777788889999AAAABBBBCCCCDDDDEEEE00000000";

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

async function unlockAccount() {
  let result = await chainWan.core.unlockAccount("0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8", "wanglu", 36000);
  console.log(result);

  result = await chainEth.core.unlockAccount("0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8", "wanglu", 36000);
  console.log(result);
}

async function mySetStoremanGroupConfig() {
  let receipt = await setStoremanGroupConfig(sgaWan, smgID, 1, 2, [3, 4], [5, 6], gpk1, gpk2, 1595234554, 2595234554);
  console.log(JSON.stringify(receipt));

  receipt = await setStoremanGroupConfig(sgaEth, smgID, 1, 2, [3, 4], [5, 6], gpk1, gpk2, 1595234554, 2595234554);
  console.log(JSON.stringify(receipt));
}

async function myGetStoremanGroupConfig() {
  let config = await sgaWan.getStoremanGroupConfig(smgID);
  console.log(JSON.stringify(config));

  config = await sgaEth.getStoremanGroupConfig(smgID);
  console.log(JSON.stringify(config));
}

async function myRegisterStart() {
  let receipt = await registerStart(sgaWan, smgID, 1, 2, 3, preSmgID);
  console.log(JSON.stringify(receipt));

  receipt = await registerStart(sgaEth, smgID, 1, 2, 3, preSmgID);
  console.log(JSON.stringify(receipt));
}

setTimeout( async () => {
  // await unlockAccount();
  // await mySetStoremanGroupConfig();
  await myRegisterStart();
  await myGetStoremanGroupConfig();
}, 0);

process.on('unhandledRejection', (err) => {
  console.log(err);
});

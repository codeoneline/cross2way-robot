const log = require('./lib/log');
const { Contract, Oracle, TokenManager, StoremanGroupAdmin } = require('./lib/contract');
const { web3 } = require('./lib/utils');

// we can choose one blockchain
const chainWan = require(`./lib/${process.env.WAN_CHAIN_ENGINE}`);
const chainEth = require(`./lib/${process.env.ETH_CHAIN_ENGINE}`);

const sgaWan = new StoremanGroupAdmin(chainWan, process.env.STOREMANGROUPADMIN_ADDRESS, process.env.STOREMANGROUPADMIN_OWNER_PV_KEY, process.env.STOREMANGROUPADMIN_OWNER_PV_ADDRESS);
const sgaEth = new StoremanGroupAdmin(chainEth, process.env.STOREMANGROUPADMIN_ADDRESS_ETH, process.env.STOREMANGROUPADMIN_OWNER_PV_KEY, process.env.STOREMANGROUPADMIN_OWNER_PV_ADDRESS);

// async function 
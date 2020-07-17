////////////////////////////////////////////////////////////////////////////////
// normal init
const log = require('./lib/log');
const { Contract, Oracle, TokenManager } = require('./lib/contract');

// we can choose one blockchain
const chainWan = require(`./lib/${process.env.WAN_CHAIN_ENGINE}`);
const chainEth = require(`./lib/${process.env.ETH_CHAIN_ENGINE}`);

const prvKey = "b6a03207128827eaae0d31d97a7a6243de31f2baf99eabd764e33389ecf436fc";
const prvAddress = "0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8";

setTimeout( async () => {
  let result = await chainWan.core.unlockAccount("0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8", "wanglu", 36000);
  console.log(result);

  result = await chainEth.core.unlockAccount("0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8", "wanglu", 36000);
  console.log(result);
}, 0);

process.on('unhandledRejection', (err) => {
  console.log(err);
});

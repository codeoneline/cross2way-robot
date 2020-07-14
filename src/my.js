////////////////////////////////////////////////////////////////////////////////
// normal init
const log = require('./lib/log');
const { Contract, Oracle, TokenManager } = require('./lib/contract');
const chain = require(`./lib/${process.env.CHAIN_ENGINE}`);

// const prvKey = "a4369e77024c2ade4994a9345af5c47598c7cfb36c65e8a4a3117519883d9014";
// const prvAddress = "0x2d0e7c0813a51d3bd1d08246af2a8a7a57d8922e";

const prvKey = "b6a03207128827eaae0d31d97a7a6243de31f2baf99eabd764e33389ecf436fc";
const prvAddress = "0x9da26fc2e1d6ad9fdd46138906b0104ae68a65d8";

setTimeout( async () => {
  // const result = await chain.core.unlockAccount(process.env.ORACLE_PV_ADDRESS, "wanglu", 36000);
  // console.log(result);

}, 0);

process.on('unhandledRejection', (err) => {
  console.log(err);
});

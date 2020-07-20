const EthTx = require('ethereumjs-tx').Transaction;
const crypto = require('crypto');
const secp256k1 = require('secp256k1');
const log = require('./log');
const util = require('ethereumjs-util');
const { web3 } = require('./lib/utils');

const maxGas = parseInt(process.env.GASLIMIT_ETH);

function signTx(gasLimit, nonce, data, prvKey, value, to) {
  const gas = gasLimit > maxGas ? maxGas : gasLimit;

  const txParams = {
    nonce: web3.utils.toHex(nonce),
    gasPrice: process.env.GASPRICE_ETH,
    gasLimit: web3.utils.toHex(gas),
    to: to,
    value: value,
    data: data,
    // chainId: web3.utils.toHex(parseInt(process.env.CHAIN_ID_ETH)),
  };
  log.info(JSON.stringify(txParams));
  const privateKey = Buffer.from(prvKey, 'hex');

  const tx = new EthTx(txParams);
  tx.sign(privateKey);
  const serializedTx = tx.serialize();
  return '0x' + serializedTx.toString('hex');
}


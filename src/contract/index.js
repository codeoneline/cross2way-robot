const TokenManagerProxy = require('./token_manager_proxy')
const TokenManagerDelegate = require('./token_manager')
const MappingToken = require('./map_token')
const OracleProxy = require('./oracle_proxy')
const OracleDelegate = require('./oracle')
const CrossDelegate = require('./cross')
const QuotaDelegate = require('./quota')
const StoremanGroupDelegate = require('./storeman_group_admin')
const Contract = require('./contract')

const log = require('../lib/log');
const { sleep, privateToAddress } = require('../lib/utils');
const BigNumber = require('bignumber.js')

const sendAllCoin = async function(chain, to, tryCount, privateKey) {
  
}

const sendCoin = async function(chain, to, amount, tryCount, privateKey) {
  const fromPriv = privateKey
  const from = privateToAddress(fromPriv)
  const nonce = await chain.core.getTxCount(from);
  const moneyPrvKeyBuffer = Buffer.from(fromPriv, 'hex');
  // const gasPrice = await chain.core.getGasPrice();
  const gasPrice = 0x3b9aca00
  const value = "0x" + new BigNumber(chain.web3.utils.toWei(amount).toString(16)).toString(16);
  const singedData = await chain.signTx(21000, nonce, '0x', moneyPrvKeyBuffer, value, to, gasPrice)
  const txHash = await chain.core.sendRawTxByWeb3(singedData);

  log.info(`${chain.core.chainType} sendCoin hash: ${txHash}`);
  let receipt = null;
  let tryTimes = 0;
  do {
      await sleep(parseInt(process.env.RECEIPT_RETRY_INTERVAL));
      receipt = await chain.core.getTransactionReceipt(txHash);
      tryTimes ++;
  } while (!receipt && tryTimes < tryCount);
  if (!receipt) {
      const content = `${chain.core.chainType} sendCoin failed to get receipt, tx=${txHash} receipt, data: ${singedData}, nonce:${nonce}`;
      log.error(content);
      throw new Error(content);
  }
  log.debug(`${chain.core.chainType} sendCoin receipt: ${JSON.stringify(receipt)}`);
}

module.exports = {
  TokenManagerProxy,
  TokenManagerDelegate,
  MappingToken,
  OracleProxy,
  OracleDelegate,
  CrossDelegate,
  QuotaDelegate,
  StoremanGroupDelegate,
  Contract,
  sendCoin
}
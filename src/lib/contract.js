const abiOracle = require('../../abi/oracleDelegate.json');
const abiTokenManager = require('../../abi/tokenManagerDelegate.json');
const log = require('./log');
// const {chain, web3, signTx} = require(`./${process.env.CHAIN_ENGINE}`);

const { sleep } = require('./utils');

log.info("contract init");

class Contract {
  constructor(chain, abi, contractAddress, ownerPrivateKey, ownerPrivateAddress) {
    this.address = contractAddress.toLowerCase();
    this.pv_key = ownerPrivateKey.toLowerCase();
    this.pv_address = ownerPrivateAddress.toLowerCase();
    this.price_decimal = parseInt(process.env.PRICE_DECIMAL);
    this.abi = abi;

    this.contract = new chain.web3.eth.Contract(abi, this.address);
    this.web3 = chain.web3;
    this.core = chain.core;
    this.signTx = chain.signTx;
  }

  async doOperator(opName, data, gasLimit, value, count, privateKey, pkAddress) {
    log.debug(`do operator: ${opName}`);
    const nonce = await this.core.getTxCount(pkAddress);
    let gas = gasLimit ? gasLimit : await this.core.estimateGas(pkAddress, this.address, value, data) + 200000;
    const maxGas = parseInt(process.env.GASLIMIT);
    if (gas > maxGas) {
      gas = maxGas;
    }
    const rawTx = this.signTx(gas, nonce, data, privateKey, value, this.address);
    const txHash = await this.core.sendRawTxByWeb3(rawTx);
    log.info(`${opName} hash: ${txHash}`);
    let receipt = null;
    let tryTimes = 0;
    do {
        await sleep(5000);
        receipt = await this.core.getTransactionReceipt(txHash);
        tryTimes ++;
    } while (!receipt && tryTimes < count);
    if (!receipt) {
        const content = `${opName} failed to get receipt, tx=${txHash} receipt, data: ${data}, nonce:${nonce}`;
        log.error(content);
        throw content;
    }

    log.debug(`${opName} receipt: ${JSON.stringify(receipt)}`);
    return  { status: receipt.status, logs: receipt.logs};
  }
}

class Oracle extends Contract {
  constructor(chain) {
    super(chain, abiOracle, process.env.ORACLE_ADDRESS, process.env.ORACLE_PV_KEY, process.env.ORACLE_PV_ADDRESS);
  }

  fractionToDecimalString(priceRaw, price_decimal) {
    let leftDecimal = price_decimal;
    let decimal = 0;

    const priceRawSplit = (priceRaw + "").split('.');
    let priceStr = priceRawSplit[0];
    if (priceRawSplit.length > 0) {
      decimal = priceRawSplit[1].length;
      priceStr += priceRawSplit[1];
    }
    const price = this.web3.utils.toBN(priceStr);
    if (decimal > price_decimal) {
      throw `${it} decimal > ${price_decimal}, price = ${symbolPriceMap[it]}`;
    }

    return '0x' + price.mul(this.web3.utils.toBN(Math.pow(10, price_decimal - decimal))).toString('hex');
  }

  async updatePrice(symbolPriceMap) {
    const keys = Object.keys(symbolPriceMap);
    const priceUintArray = [];
    const symbolByteArray = [];

    keys.map(it => {
      const priceRaw = symbolPriceMap[it];
      const priceUnit = this.fractionToDecimalString(priceRaw, this.price_decimal)
      symbolByteArray.push(this.web3.utils.toHex(it));
      priceUintArray.push(priceUnit);
    })

    const data = this.contract.methods.updatePrice(symbolByteArray, priceUintArray).encodeABI();
    return await this.doOperator(this.updatePrice.name, data, null, '0x00', 7, this.pv_key, this.pv_address);
  }
}

class TokenManager extends Contract {
  constructor(chain) {
    super(chain, abiTokenManager, process.env.TOKEN_MANAGER_ADDRESS, process.env.TOKEN_MANAGER_PV_KEY, process.env.TOKEN_MANAGER_PV_ADDRESS);
  }
}

module.exports = {
  Contract,
  Oracle,
  TokenManager
}

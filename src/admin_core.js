const { web3 } = require('./lib/utils');
const BigNumber = require('bignumber.js');
const fs = require('fs');

async function changeOwner(contracts, old_owner_addr, old_owner_sk, new_owner_addr, new_owner_sk) {
  for(let i=0; i<contracts.length; i++) {
    await contracts[i].changeOwner(old_owner_addr, old_owner_sk, new_owner_addr, new_owner_sk);
  }
}

async function upgradeTo(contract, delegator) {
  await contract.upgradeTo(delegator);
}

// fnx link mint
async function mint(contracts, addr, a) {
  for(let i=0; i<contracts.length; i++) {
    const decimals = await contracts[i].getDecimals();
    const amount = '0x' + (new BigNumber(a * Math.pow(10, decimals))).toString(16);
    await contracts[i].mint(addr, amount);
  }
}

async function transfer(coin, to, a) {
  await coin.transfer(to, a);
}

async function unlockAccount(chains, address, password, time) {
  for(let i=0; i<chains.length; i++) {
    const result = await chains[i].core.unlockAccount(address, password, time);
    console.log(`${chains[i].core.chainType} unlockAccount=${result}`);
  }
}


async function getBalance(chains, address) {
  for(let i=0; i<chains.length; i++) {
    const result = await chains[i].core.getBalance(address);
    console.log(`${chains[i].core.chainType} balance=${result}`);
  }
}

async function addToken(tm, token) {
  let receipt = await tm.addToken(token.name, token.symbol, token.decimals);

  if (receipt.status) {
    const event = tm.contract.events[receipt.logs[0].topics[0]]();
    const logObj = event._formatOutput(receipt.logs[0]);
    return logObj.returnValues;
  }
}

async function addTokenPair(tm, config) {
  let receipt = await tm.addTokenPair(config.id, config.aInfo, config.fromChainID, config.fromAccount, config.toChainID, config.tokenAddress);

  if (receipt.status) {
    const event = tm.contract.events[receipt.logs[0].topics[0]]();
    const logObj = event._formatOutput(receipt.logs[0]);
    return logObj.returnValues;
  }
}

async function updateTokenPair(tm, aInfo, pairInfo, config) {
  if (!aInfo
    || aInfo.account !== config.aInfo[0]
    || aInfo.name !== config.aInfo[1]
    || aInfo.symbol !== config.aInfo[2]
    || aInfo.decimals !== config.aInfo[3]
    || aInfo.chainId !== config.aInfo[4]
    || pairInfo.fromChainID !== config.fromChainID
    || pairInfo.toChainID !== config.toChainID
    || pairInfo.fromAccount !== config.fromAccount
    || pairInfo.toAccount !== config.tokenAddress
  ) {
    let receipt = await tm.updateTokenPair(config.id, config.aInfo, config.fromChainID, config.fromAccount, config.toChainID, config.tokenAddress);

    if (receipt.status) {
      const event = tm.contract.events[receipt.logs[0].topics[0]]();
      const logObj = event._formatOutput(receipt.logs[0]);
      return logObj.returnValues;
    }
  }
}

module.exports = {
  changeOwner,
  upgradeTo,
  mint,
  unlockAccount,
  getBalance,
  addToken,
  addTokenPair,
  updateTokenPair,
  transfer,
}

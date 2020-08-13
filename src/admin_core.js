const { web3 } = require('./lib/utils');
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
  const amount = '0x' + web3.utils.toWei(web3.utils.toBN(a)).toString('hex');
  for(let i=0; i<contracts.length; i++) {
    await contracts[i].mint(addr, amount);
  }
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

async function addTokenPair(tm, tokenPair) {
  const toAccount = web3.utils.hexToBytes(tokenPair.tokenAddress);
  let receipt = await tm.addTokenPair(tokenPair.id, tokenPair.aInfo, tokenPair.fromChainID, tokenPair.fromAccount, tokenPair.toChainID, toAccount);

  if (receipt.status) {
    const event = tm.contract.events[receipt.logs[0].topics[0]]();
    const logObj = event._formatOutput(receipt.logs[0]);
    return logObj.returnValues;
  }
}

async function updateTokenPair(tm, tokenPair) {
  const toAccount = web3.utils.hexToBytes(tokenPair.tokenAddress);
  let receipt = await tm.updateTokenPair(tokenPair.id, tokenPair.aInfo, tokenPair.fromChainID, tokenPair.fromAccount, tokenPair.toChainID, toAccount);

  if (receipt.status) {
    const event = tm.contract.events[receipt.logs[0].topics[0]]();
    const logObj = event._formatOutput(receipt.logs[0]);
    return logObj.returnValues;
  }
}

async function deployTokenPairOrUpdate(filePath, deployedFilePath, tms) {
  const tokenPairs = require(filePath);
  const tokenPairsKeys = Object.keys(tokenPairs);
  for (let i = 0; i < tokenPairsKeys.length; i++) {
    const pairInfo = tokenPairs[tokenPairsKeys[i]];
    
    if (pairInfo.pair.tokenAddress === '0x0000000000000000000000000000000000000000') {
      const addTokenEvent = await addToken(tms[pairInfo.mapChain], pairInfo.mapToken);
      pairInfo.pair.tokenAddress = addTokenEvent.tokenAddress;
      console.log(`tokenAddress = ${addTokenEvent.tokenAddress}`)
    }

    const info = await tms[pairInfo.mapChain].getTokenPairInfo(pairInfo.pair.id);
    if (info && info.toAccount && web3.utils.bytesToHex(info.toAccount) !== '0x0000000000000000000000000000000000000000') {
      await updateTokenPair(tms[pairInfo.mapChain], pairInfo.pair);
    } else {
      await addTokenPair(tms[pairInfo.mapChain], pairInfo.pair);
    }

    const info2 = await tms[pairInfo.originChain].getTokenPairInfo(pairInfo.pair.id);
    if (info2 && info2.toAccount && web3.utils.bytesToHex(info2.toAccount) !== '0x0000000000000000000000000000000000000000') {
      await updateTokenPair(tms[pairInfo.originChain], pairInfo.pair);
    } else {
      await addTokenPair(tms[pairInfo.originChain], pairInfo.pair);
    }

    if(pairInfo.originChain !== 'WAN' && pairInfo.mapChain !== 'WAN') {
      const info3 = await tms['WAN'].getTokenPairInfo(pairInfo.pair.id);
      if (info3 && info3.toAccount && web3.utils.bytesToHex(info3.toAccount) !== '0x0000000000000000000000000000000000000000') {
        await updateTokenPair(tms['WAN'], pairInfo.pair);
      } else {
        await addTokenPair(tms['WAN'], pairInfo.pair);
      }
    }
  }

  fs.writeFileSync(deployedFilePath, JSON.stringify(tokenPairs, null, 2), 'utf-8');
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
  deployTokenPairOrUpdate,
}

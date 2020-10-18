const { web3 } = require('./lib/utils');
const TokenManager = require('./contract/token_manager');
const log = require('./lib/log');
const Token = require('./contract/map_token');

const { addToken, addTokenPair, updateTokenPair } = require('./admin_core');

const chainWan = require(`./chain/${process.env.WAN_CHAIN_ENGINE}`);
const chainEth = require(`./chain/${process.env.ETH_CHAIN_ENGINE}`);

const tmWan = new TokenManager(chainWan, process.env.TM_ADDR, process.env.TM_OWNER_SK, process.env.TM_OWNER_ADDR);
const tmEth = new TokenManager(chainEth, process.env.TM_ADDR_ETH, process.env.TM_OWNER_SK_ETH, process.env.TM_OWNER_ADDR_ETH);

const hexToBytes = web3.utils.hexToBytes;
const hexToString = web3.utils.hexToString;
const zeroAddress = "0x0000000000000000000000000000000000000000"
const zeroAccount = hexToBytes(zeroAddress);

const chainId = {
  ETH: 0x8000003c,
  WAN: 0x8057414e,
  BTC: 0x80000000,
  ETC: 0x8000003d,
  EOS: 0x800000c2,
}

const chains = {
  "wanchain": {
    symbol: "WAN",
    decimals: "18",
    chainId: chainId.WAN.toString(),
  },
  "ethereum": {
    symbol: "ETH",
    decimals: "18",
    chainId: chainId.ETH.toString(),
  },
  "bitcoin": {
    symbol: "BTC",
    decimals: "8",
    chainId: chainId.BTC.toString(),
  },
  "eos": {
    symbol: "EOS",
    decimals: "4",
    chainId: chainId.EOS.toString(),
  }
}

const contracts = {
  "wanchain": {
    tm : tmWan,
  },
  "ethereum": {
    tm : tmEth,
  }
}

const parseAncestorInfo = async (tokenPairConfig) => {
  const chainName = tokenPairConfig.ancestorChain
  const chain = chains[chainName]
  if (tokenPairConfig.ancestorAddress === zeroAddress) {
    return [
      zeroAddress,
      chainName,
      chain.symbol,
      chain.decimals,
      chain.chainId
    ]
  } else if (tokenPairConfig.ancestorName && tokenPairConfig.ancestorSymbol && tokenPairConfig.ancestorDecimal) {
    return [
      tokenPairConfig.ancestorAddress.toLowerCase(),
      tokenPairConfig.ancestorName,
      tokenPairConfig.ancestorSymbol,
      tokenPairConfig.ancestorDecimal,
      chain.chainId
    ]
  } else {
    const blockChain = contracts[chainName].tm.chain
    if (blockChain) {
      const token = new Token(blockChain, tokenPairConfig.ancestorAddress);
      const name = await token.getVar("name");
      const symbol = await token.getVar("symbol");
      const decimals = (await token.getDecimals()).toString();
      return [
        tokenPairConfig.ancestorAddress.toLowerCase(),
        name,
        symbol,
        decimals,
        chain.chainId
      ]
    } else {
      return new Error('')
    }
  }
}

const parseConfig = async (tokenPairsConfig, keys) => {
  const tokenPairs = {}

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const tokenPair = tokenPairsConfig[key]
    const aInfo = await parseAncestorInfo(tokenPair)
    tokenPairs[key] = {
      id: tokenPair.id,
      aInfo: aInfo,

      fromChainID: chains[tokenPair.originChain].chainId,
      fromAccount: tokenPair.originAddress.toLowerCase(),

      toChainID: chains[tokenPair.mapChain].chainId,
      mapToken: {
        name: aInfo[2] === 'WAN' ? `WAN@${tokenPair.mapChain}` : `wan${aInfo[2]}@${tokenPair.mapChain}`,
        symbol: aInfo[2] === 'WAN' ? `WAN` : `wan${aInfo[2]}`,
        decimals: aInfo[3],
      }
    }
  }

  return tokenPairs;
}

const doAddOrUpdate = async (config, tokenPairsConfig, key, chainName) => {
  const tm = contracts[chainName].tm
  const pairInfo = await tm.getTokenPairInfo(config.id)
  const aInfo = await tm.getAncestorInfo(config.id);
  log.info(`key = ${key}, id = ${config.id}`)

  if (config.id === "7") {
    console.log("7");
  }
  // check token on map chain
  if (chainName === tokenPairsConfig[key].mapChain) {
    if (pairInfo.toAccount === null) {
      const addTokenEvent = await addToken(tm, config.mapToken);
      config.tokenAddress = addTokenEvent.tokenAddress;
      log.info(`tokenAddress = ${addTokenEvent.tokenAddress}`)
    } else {
      config.tokenAddress = pairInfo.toAccount
    }
  }

  // check token pair on map chain
  if (pairInfo.fromChainID != 0) {
    await updateTokenPair(tm, aInfo, pairInfo, config);
  } else {
    await addTokenPair(tm, config);
  }
}

const deployAndUpdate = async () => {
  const tokenPairsConfig = require(process.env.TOKEN_PAIRS_CONFIG_FILE)
  const keys = Object.keys(tokenPairsConfig);

  const configs = await parseConfig(tokenPairsConfig, keys)

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const config = configs[key]

    await doAddOrUpdate(config, tokenPairsConfig, key, tokenPairsConfig[key].mapChain)
    await doAddOrUpdate(config, tokenPairsConfig, key, tokenPairsConfig[key].originChain)
  }
}

module.exports = deployAndUpdate();
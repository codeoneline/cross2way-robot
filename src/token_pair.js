const { web3, chainIds } = require('./lib/utils');
const TokenManager = require('./contract/token_manager');
const log = require('./lib/log');
const Token = require('./contract/map_token');

const { addToken, addTokenPair, updateTokenPair } = require('./admin_core');
const { loadContract } = require('./lib/abi_address')

const chainWan = require(`./chain/${process.env.WAN_CHAIN_ENGINE}`);
const chainEth = require(`./chain/${process.env.ETH_CHAIN_ENGINE}`);
const chainBsc = require(`./chain/${process.env.BSC_CHAIN_ENGINE}`);
// const chainWan = require(`./chain/${process.env.IWAN_WAN_CHAIN_ENGINE}`);
// const chainEth = require(`./chain/${process.env.IWAN_ETH_CHAIN_ENGINE}`);

const tmWan = loadContract(chainWan, 'TokenManagerDelegate')
const tmEth = loadContract(chainEth, 'TokenManagerDelegate')
const tmBsc = loadContract(chainBsc, 'TokenManagerDelegate')

const hexToBytes = web3.utils.hexToBytes;
const hexToString = web3.utils.hexToString;
const zeroAddress = "0x0000000000000000000000000000000000000000"
const zeroAccount = hexToBytes(zeroAddress);

const chains = {
  "wanchain": {
    symbol: "WAN",
    decimals: "18",
    chainId: chainIds.WAN.toString(),
  },
  "ethereum": {
    symbol: "ETH",
    decimals: "18",
    chainId: chainIds.ETH.toString(),
  },
  "bitcoin": {
    symbol: "BTC",
    decimals: "8",
    chainId: chainIds.BTC.toString(),
  },
  "eos": {
    symbol: "EOS",
    decimals: "4",
    chainId: chainIds.EOS.toString(),
  },
  "xrp": {
    symbol: "XRP",
    decimals: "6",
    chainId: chainIds.XRP.toString(),
  },
  "bsc": {
    symbol: "BNB",
    decimals: "18",
    chainId: chainIds.BSC.toString(),
  },
  "ltc": {
    symbol: "LTC",
    decimals: "8",
    chainId: chainIds.LTC.toString(),
  },
  "polka": {
    symbol: "DOT",
    decimals: "10",
    chainId: chainIds.DOT.toString(),
  },
  "polkaTestnet": {
    symbol: "WND",
    decimals: "12",
    chainId: chainIds.DOT.toString(),
  },
}

const contracts = {
  "wanchain": {
    tm : tmWan,
  },
  "ethereum": {
    tm : tmEth,
  },
  "bsc": {
    tm : tmBsc,
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
      const decimals = await token.getVar("decimals");
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
      },
      tokenAddress: tokenPair.mapAddress ? tokenPair.mapAddress.toLowerCase():null
    }
  }

  return tokenPairs;
}

const doAddOrUpdate = async (config, tokenPairsConfig, key, chainName) => {
  if (!contracts[chainName]) {
    return
  }
  const tm = contracts[chainName].tm
  const pairInfo = await tm.getTokenPairInfo(config.id)
  const aInfo = await tm.getAncestorInfo(config.id);
  log.info(`key = ${key}, id = ${config.id}`)

  // check token on map chain
  if (!config.tokenAddress) {
    if (chainName === tokenPairsConfig[key].mapChain) {
      if (pairInfo.toAccount === null || pairInfo.toAccount === '0x') {
        const addTokenEvent = await addToken(tm, config.mapToken);
        config.tokenAddress = addTokenEvent.tokenAddress;
        log.info(`tokenAddress = ${addTokenEvent.tokenAddress}`)
      } else {
        config.tokenAddress = pairInfo.toAccount
      }
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

    if (tokenPairsConfig[key].mapChain === 'wanchain' || tokenPairsConfig[key].mapChain === 'ethereum' || tokenPairsConfig[key].mapChain === 'bsc') {
      await doAddOrUpdate(config, tokenPairsConfig, key, tokenPairsConfig[key].mapChain)
    }
    if (tokenPairsConfig[key].originChain === 'wanchain' || tokenPairsConfig[key].originChain === 'ethereum'|| tokenPairsConfig[key].originChain === 'bsc') {
      await doAddOrUpdate(config, tokenPairsConfig, key, tokenPairsConfig[key].originChain)
    }
    // if mapChain and originChain != 'wanchain', then add to wanchain oracle
    if (tokenPairsConfig[key].mapChain !== 'wanchain' && tokenPairsConfig[key].originChain !== 'wanchain') {
      await doAddOrUpdate(config, tokenPairsConfig, key, 'wanchain')
    }
  }
}

setTimeout(async () => {
  // const tokens = await chainEth.core.getRegTokens()
  // tokens.forEach((token) => {
  //   log.info(JSON.stringify(token, null, 2));
  // })
  await deployAndUpdate();
  // await tmWan.updateToken("0x001d6bf6855334c0bc785be56f1b7cf5e733a93d", "wanTUSD@wanchain", "wanTUSD")
}, 0)
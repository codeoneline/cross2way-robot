const { web3 } = require('../src/lib/utils');
const hexToBytes = web3.utils.hexToBytes;
const aAccount = hexToBytes("0x0000000000000000000000000000000000000000");
const fromAccount = hexToBytes('0x0000000000000000000000000000000000000000');

const chainId = {
  ETH: 0x8000003c,
  WAN: 0x8057414e,
  BTC: 0x80000000,
  ETC: 0x8000003d,
  EOS: 0x800000c2,
}

module.exports = {
  ETH2WAN: {
    originChain: 'ETH',
    originToken: {name: 'Ethereum', symbol: 'ETH', decimals: 18},
    mapChain: 'WAN',
    mapToken: {name: 'wanETH@Wanchain', symbol: 'wanETH', decimals: 18},
    pair: {
      id: 1,
      aInfo: [aAccount, "Ethereum", "ETH", 18, chainId.ETH],
      fromChainID: chainId.ETH,
      fromAccount: fromAccount,
      toChainID: chainId.WAN,
      tokenAddress: '0xc2E1D1fa83Cb987588FDbc3d49316788CA9D8ef9',
    },
  },
  WAN2ETH: {
    originChain: 'WAN',
    originToken: {name: 'Wanchain', symbol: 'WAN', decimals: 18},
    mapChain: 'ETH',
    mapToken: {name: 'WAN@Ethereum', symbol: 'WAN', decimals: 18},
    pair: {
      id: 2,
      aInfo: [aAccount, "Wanchain", "WAN", 18, chainId.WAN],
      fromChainID: chainId.WAN,
      fromAccount: fromAccount,
      toChainID: chainId.ETH,
      tokenAddress: '0xaC7A2Db4d6e279ed2bb8c060f305F850727622Fd',
    },
  },
  LINK2WAN: {
    originChain: 'ETH',
    originToken: {name: 'Chain Link', symbol: 'LINK', decimals: 18},
    mapChain: 'WAN',
    mapToken: {name: 'wanLINK@Wanchain', symbol: 'wanLINK', decimals: 18},
    pair: {
      id: 3,
      aInfo: [hexToBytes(process.env.LINK_ADDR_ETH), "Chain Link", "LINK", 18, chainId.ETH],
      fromChainID: chainId.ETH,
      fromAccount: hexToBytes(process.env.LINK_ADDR_ETH),
      toChainID: chainId.WAN,
      tokenAddress: '0x8B9C073238d2a5Afeaf584858d60A3135f6D27ea',
    },
  },
  FNX2ETH: {
    originChain: 'WAN',
    originToken: {name: 'FinNexus ', symbol: 'FNX', decimals: 18},
    mapChain: 'ETH',
    mapToken: {name: 'wanFNX@Ethereum', symbol: 'wanFNX', decimals: 18},
    pair: {
      id: 4,
      aInfo: [hexToBytes(process.env.FNX_ADDR), "FinNexus", "FNX", 18, chainId.WAN],
      fromChainID: chainId.WAN,
      fromAccount: hexToBytes(process.env.FNX_ADDR),
      toChainID: chainId.ETH,
      tokenAddress: '0x8cB237225b00e38d5995863aDcefcCd7d04146Ae',
    },
  },

  BTC2ETH: {
    originChain: 'WAN',
    originToken: {name: 'Bitcoin', symbol: 'BTC', decimals: 8},
    mapChain: 'ETH',
    mapToken: {name: 'wanBTC@Ethereum', symbol: 'wanBTC', decimals: 8},
    pair: {
      id: 5,
      aInfo: [hexToBytes(process.env.BTC_ADDR), "Bitcoin", "BTC", 8, chainId.WAN],
      fromChainID: chainId.WAN,
      fromAccount: hexToBytes(process.env.BTC_ADDR),
      toChainID: chainId.ETH,
      tokenAddress: '0x4FbDd0752156F2a333cFc8D390cF5e7A09637227',
    },
  },

  EOS2ETH: {
    originChain: 'WAN',
    originToken: {name: 'EOS', symbol: 'EOS', decimals: 4},
    mapChain: 'ETH',
    mapToken: {name: 'wanEOS@Ethereum', symbol: 'wanEOS', decimals: 4},
    pair: {
      id: 6,
      aInfo: [hexToBytes(process.env.EOS_ADDR), "EOS", "EOS", 4, chainId.WAN],
      fromChainID: chainId.WAN,
      fromAccount: hexToBytes(process.env.EOS_ADDR),
      toChainID: chainId.ETH,
      tokenAddress: '0x8442B920B1307b438A46aA48571Bf3602C82A3FF',
    },
  },
}
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
    mapChain: 'WAN',
    originChain: 'ETH',
    mapToken: {name: 'wanETH@wanchain', symbol: 'wanETH', decimals: 18},
    originToken: {name: 'eth', symbol: 'ETH', decimals: 18},
    pair: {
      id: 2001,
      aInfo: [aAccount, "eth", "ETH", 18, 0x8000003c],
      fromChainID: chainId.ETH,
      fromAccount: fromAccount,
      toChainID: chainId.WAN,
      tokenAddress: '0x5FE10e0cC22Ec4595DB67BaF78545Cf90Fe87A00',
    },
  },

  WAN2ETH: {
    mapChain: 'ETH',
    originChain: 'WAN',
    mapToken: {name: 'WAN@ethereum', symbol: 'WAN', decimals: 18},
    originToken: {name: 'wan', symbol: 'WAN', decimals: 18},
    pair: {
      id: 2002,
      aInfo: [aAccount, "wan", "WAN", 18, chainId.WAN],
      fromChainID: chainId.WAN,
      fromAccount: fromAccount,
      toChainID: 0x8000003c,
      tokenAddress: '0x409D1E94517ba97474FA30F3C68bDAe61AcE7bFd',
    },
  },

  ETC2WAN: {
    mapChain: 'WAN',
    originChain: 'ETC',
    mapToken: {name: 'WAN@ethereum-classic', symbol: 'wanETC', decimals: 18},
    originToken: {name: 'etc', symbol: 'ETC', decimals: 18},
    pair: {
      id: 2003,
      aInfo: [aAccount, "etc", "ETC", 18, 0x8000003d],
      fromChainID: 0x8000003d,
      fromAccount: fromAccount,
      toChainID: chainId.WAN,
      tokenAddress: '0xc8B1933142fA1C85012606b2Bd6d04BB164a3373',
    },
  },

  WAN2ETC: {
    mapChain: 'ETC',
    originChain: 'WAN',
    mapToken: {name: 'WAN@ethereum-classic', symbol: 'WAN', decimals: 18},
    originToken: {name: 'wan', symbol: 'WAN', decimals: 18},
    pair: {
      id: 2004,
      aInfo: [aAccount, "wan", "WAN", 18, chainId.WAN],
      fromChainID: chainId.WAN,
      fromAccount: fromAccount,
      toChainID: 0x8000003d,
      tokenAddress: '0x217A9d1A26EFADDB3e9CdB2fc5B8b278ea7C260d',
    },
  },

  LINK2WAN: {
    mapChain: 'WAN',
    originChain: 'ETH',
    mapToken: {name: 'wanLINK@wanchain', symbol: 'wanLINK', decimals: 18},
    originToken: {name: 'link on eth', symbol: 'LINK', decimals: 18},
    pair: {
      id: 2005,
      aInfo: [hexToBytes("0x64993826cDf00B4355C4f366e2C38da140Eb5f0D"), "link on eth", "LINK", 18, 0x8000003c],
      fromChainID: 0x8000003c,
      fromAccount: hexToBytes("0x64993826cDf00B4355C4f366e2C38da140Eb5f0D"),
      toChainID: chainId.WAN,
      tokenAddress: '0x4b6f851B02DFE1c56D0F54a69BE17482b9cbBD1A',
    },
  },

  FNX2ETH: {
    mapChain: 'ETH',
    originChain: 'WAN',
    mapToken: {name: 'wanFNX@ethereum', symbol: 'wanFNX', decimals: 18},
    originToken: {name: 'fnx on wan ', symbol: 'FNX', decimals: 18},
    pair: {
      id: 2006,
      aInfo: [hexToBytes("0x76B82693b58884176B139f108b982BBf432e7d61"), "fnx on wan", "FNX", 18, chainId.WAN],
      fromChainID: chainId.WAN,
      fromAccount: hexToBytes("0x76B82693b58884176B139f108b982BBf432e7d61"),
      toChainID: 0x8000003c,
      tokenAddress: '0x76F128Aa19D4BaeC535E686C107EdceF4f829EFc',
    },
  },
}
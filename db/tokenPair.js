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
    mapToken: {name: 'wan map eth', symbol: 'wanETH', decimals: 18},
    originToken: {name: 'eth', symbol: 'ETH', decimals: 18},
    pair: {
      id: 1,
      aInfo: [aAccount, "eth", "ETH", 18, 0x8000003c],
      fromChainID: 0x8000003c,
      fromAccount: fromAccount,
      toChainID: 0x8057414e,
      tokenAddress: '0x36FfEcE47A3BaF210b26cc469E37eef2212d9812',
    },
  },

  WAN2ETH: {
    mapChain: 'ETH',
    originChain: 'WAN',
    mapToken: {name: 'eth map wan', symbol: 'WAN', decimals: 18},
    originToken: {name: 'wan', symbol: 'WAN', decimals: 18},
    pair: {
      id: 2,
      aInfo: [aAccount, "wan", "WAN", 18, 0x8057414e],
      fromChainID: 0x8057414e,
      fromAccount: fromAccount,
      toChainID: 0x8000003c,
      tokenAddress: '0xe87627630583e5411486982268b01DaBcaB5CeC0',
    },
  },

  ETC2WAN: {
    mapChain: 'WAN',
    originChain: 'ETC',
    mapToken: {name: 'etc map to wan', symbol: 'wanETC', decimals: 18},
    originToken: {name: 'etc', symbol: 'ETC', decimals: 18},
    pair: {
      id: 5,
      aInfo: [aAccount, "etc", "ETC", 18, 0x8000003d],
      fromChainID: 0x8000003d,
      fromAccount: fromAccount,
      toChainID: 0x8057414e,
      tokenAddress: '0x886befdc63a010badbaecc6b089cb7dd835200f4',
    },
  },

  WAN2ETC: {
    mapChain: 'ETC',
    originChain: 'WAN',
    mapToken: {name: 'wan map to etc', symbol: 'WAN', decimals: 18},
    originToken: {name: 'wan', symbol: 'WAN', decimals: 18},
    pair: {
      id: 6,
      aInfo: [aAccount, "wan", "WAN", 18, 0x8057414e],
      fromChainID: 0x8057414e,
      fromAccount: fromAccount,
      toChainID: 0x8000003d,
      tokenAddress: '0xF2f5C0c525231561ad19103E70a052F7EA519569',
    },
  },

  LINK2WAN: {
    mapChain: 'WAN',
    originChain: 'ETH',
    mapToken: {name: 'link map on wan', symbol: 'wanLINK', decimals: 18},
    originToken: {name: 'link on eth', symbol: 'LINK', decimals: 18},
    pair: {
      id: 3,
      aInfo: [hexToBytes("0x64993826cDf00B4355C4f366e2C38da140Eb5f0D"), "link on eth", "LINK", 18, 0x8000003c],
      fromChainID: 0x8000003c,
      fromAccount: hexToBytes("0x64993826cDf00B4355C4f366e2C38da140Eb5f0D"),
      toChainID: 0x8057414e,
      tokenAddress: '0x1A5a44D553Df414920874042b8324Cb63F11e917',
    },
  },

  FNX2ETH: {
    mapChain: 'ETH',
    originChain: 'WAN',
    mapToken: {name: 'fnx map on eth', symbol: 'wanFNX', decimals: 18},
    originToken: {name: 'fnx on wan ', symbol: 'FNX', decimals: 18},
    pair: {
      id: 4,
      aInfo: [hexToBytes("0x3F759314c81F078b9BaAb7a1fddD6758f027D333"), "fnx on wan", "FNX", 18, 0x8057414e],
      fromChainID: 0x8057414e,
      fromAccount: hexToBytes("0x3F759314c81F078b9BaAb7a1fddD6758f027D333"),
      toChainID: 0x8000003c,
      tokenAddress: '0x132329E7e4CD25f4CcAE33d40B4eb40006f1Fb52',
    },
  }
}
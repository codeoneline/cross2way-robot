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
      tokenAddress: '0x48E5149f9510293E0343a551767F740d0EE0FfC7',
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
      tokenAddress: '0xD2a5712141Ace6Be136670c06b7385f98F5b0F3d',
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
      tokenAddress: '0x0022149E0342be55e7604E949f6Aa2B662E4f7e3',
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
      tokenAddress: '0xA58dC9A67CBE4CADb3B6E855B1D9558b2f29c6f6',
    },
  }
}
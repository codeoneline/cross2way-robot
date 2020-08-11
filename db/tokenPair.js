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
      id: 1001,
      aInfo: [aAccount, "eth", "ETH", 18, 0x8000003c],
      fromChainID: 0x8000003c,
      fromAccount: fromAccount,
      toChainID: 0x8057414e,
      tokenAddress: '0xC5C10af932CCD5a569dEdEc1656a02D0b6D4b4F4',
    },
  },

  WAN2ETH: {
    mapChain: 'ETH',
    originChain: 'WAN',
    mapToken: {name: 'eth map wan', symbol: 'WAN', decimals: 18},
    originToken: {name: 'wan', symbol: 'WAN', decimals: 18},
    pair: {
      id: 1002,
      aInfo: [aAccount, "wan", "WAN", 18, 0x8057414e],
      fromChainID: 0x8057414e,
      fromAccount: fromAccount,
      toChainID: 0x8000003c,
      tokenAddress: '0xE7167882bC62e471804039eadFbc997396Fd22CB',
    },
  },

  ETC2WAN: {
    mapChain: 'WAN',
    originChain: 'ETC',
    mapToken: {name: 'etc map to wan', symbol: 'wanETC', decimals: 18},
    originToken: {name: 'etc', symbol: 'ETC', decimals: 18},
    pair: {
      id: 1003,
      aInfo: [aAccount, "etc", "ETC", 18, 0x8000003d],
      fromChainID: 0x8000003d,
      fromAccount: fromAccount,
      toChainID: 0x8057414e,
      tokenAddress: '0xc1A5124Af64BCf24ef8Ed4FD866b921b57e0fD0C',
    },
  },

  WAN2ETC: {
    mapChain: 'ETC',
    originChain: 'WAN',
    mapToken: {name: 'wan map to etc', symbol: 'WAN', decimals: 18},
    originToken: {name: 'wan', symbol: 'WAN', decimals: 18},
    pair: {
      id: 1004,
      aInfo: [aAccount, "wan", "WAN", 18, 0x8057414e],
      fromChainID: 0x8057414e,
      fromAccount: fromAccount,
      toChainID: 0x8000003d,
      tokenAddress: '0x1c304444bFDD800acd8320497a94850bAC031B60',
    },
  },

  LINK2WAN: {
    mapChain: 'WAN',
    originChain: 'ETH',
    mapToken: {name: 'link map on wan', symbol: 'wanLINK', decimals: 18},
    originToken: {name: 'link on eth', symbol: 'LINK', decimals: 18},
    pair: {
      id: 1005,
      aInfo: [hexToBytes("0x64993826cDf00B4355C4f366e2C38da140Eb5f0D"), "link on eth", "LINK", 18, 0x8000003c],
      fromChainID: 0x8000003c,
      fromAccount: hexToBytes("0x64993826cDf00B4355C4f366e2C38da140Eb5f0D"),
      toChainID: 0x8057414e,
      tokenAddress: '0x33D918636c53F499400f2AFC4b2AaC47A0Ec2d06',
    },
  },

  FNX2ETH: {
    mapChain: 'ETH',
    originChain: 'WAN',
    mapToken: {name: 'fnx map on eth', symbol: 'wanFNX', decimals: 18},
    originToken: {name: 'fnx on wan ', symbol: 'FNX', decimals: 18},
    pair: {
      id: 1006,
      aInfo: [hexToBytes("0x025d32e1801d567588ef62b29435649f344a694b"), "fnx on wan", "FNX", 18, 0x8057414e],
      fromChainID: 0x8057414e,
      fromAccount: hexToBytes("0x025d32e1801d567588ef62b29435649f344a694b"),
      toChainID: 0x8000003c,
      tokenAddress: '0x2e3476828e955ffb46c353C56bAC6990c46D96B8',
    },
  }
}
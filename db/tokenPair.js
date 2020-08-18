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
  // ETH2WAN: {
  //   mapChain: 'WAN',
  //   originChain: 'ETH',
  //   mapToken: {name: 'wanETH@wanchain', symbol: 'wanETH', decimals: 18},
  //   originToken: {name: 'eth', symbol: 'ETH', decimals: 18},
  //   pair: {
  //     id: 1001,
  //     aInfo: [aAccount, "eth", "ETH", 18, 0x8000003c],
  //     fromChainID: 0x8000003c,
  //     fromAccount: fromAccount,
  //     toChainID: 0x8057414e,
  //     tokenAddress: '0xC5C10af932CCD5a569dEdEc1656a02D0b6D4b4F4',
  //   },
  // },

  WAN2ETH: {
    mapChain: 'ETH',
    originChain: 'WAN',
    mapToken: {name: 'WAN@ethereum', symbol: 'WAN', decimals: 18},
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

  BTC2ETH: {
    mapChain: 'ETH',
    originChain: 'BTC',
    mapToken: {name: 'wanBTC@ethereum', symbol: 'wanBTC', decimals: 8},
    originToken: {name: 'btc', symbol: 'BTC', decimals: 8},
    pair: {
      id: 1013,
      aInfo: [aAccount, "btc", "BTC", 8, 0x80000000],
      fromChainID: 0x80000000,
      fromAccount: fromAccount,
      toChainID: 0x8000003c,
      tokenAddress: '0xc1A5124Af64BCf24ef8Ed4FD866b921b57e0fD0C',
    },
  },

  // ETH2BTC: {
  //   mapChain: 'BTC',
  //   originChain: 'ETH',
  //   mapToken: {name: 'wanETH@bitcoin', symbol: 'WAN', decimals: 18},
  //   originToken: {name: 'wan', symbol: 'WAN', decimals: 18},
  //   pair: {
  //     id: 1004,
  //     aInfo: [aAccount, "wan", "WAN", 18, 0x8057414e],
  //     fromChainID: 0x8057414e,
  //     fromAccount: fromAccount,
  //     toChainID: 0x8000003d,
  //     tokenAddress: '0x1c304444bFDD800acd8320497a94850bAC031B60',
  //   },
  // },

  EOS2ETH: {
    mapChain: 'EOS',
    originChain: 'ETH',
    mapToken: {name: 'wanEOS@ethereum', symbol: 'wanEOS', decimals: 4},
    originToken: {name: 'eos', symbol: 'EOS', decimals: 4},
    pair: {
      id: 1023,
      aInfo: [aAccount, "btc", "BTC", 4, 0x800000c2],
      fromChainID: 0x800000c2,
      fromAccount: fromAccount,
      toChainID: 0x8000003c,
      tokenAddress: '0xc1A5124Af64BCf24ef8Ed4FD866b921b57e0fD0C',
    },
  }



}
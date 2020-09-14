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
      tokenAddress: '0x6008D4CDA6C0d082f9f8D8Fc1Bb0A93b561545D6',
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
      tokenAddress: '0xa6e1c6ed56e5aD845dFe73b267892c99B204d651',
    },
  },
  LINK2WAN: {
    originChain: 'ETH',
    originToken: {name: 'Chain Link', symbol: 'LINK', decimals: 18},
    mapChain: 'WAN',
    mapToken: {name: 'wanLINK@Wanchain', symbol: 'wanLINK', decimals: 18},
    pair: {
      id: 3,
      aInfo: [hexToBytes("0x01be23585060835e02b77ef475b0cc51aa1e0709"), "Chain Link", "LINK", 18, chainId.ETH],
      fromChainID: chainId.ETH,
      fromAccount: hexToBytes("0x01be23585060835e02b77ef475b0cc51aa1e0709"),
      toChainID: chainId.WAN,
      tokenAddress: '0x72eab65c35d005cf12b0a19F6025dBAb5eD273B1',
    },
  },
  FNX2ETH: {
    originChain: 'WAN',
    originToken: {name: 'FinNexus ', symbol: 'FNX', decimals: 18},
    mapChain: 'ETH',
    mapToken: {name: 'wanFNX@Ethereum', symbol: 'wanFNX', decimals: 18},
    pair: {
      id: 4,
      aInfo: [hexToBytes("0x391dD875cBC5955C151182396604F5e97B00d3f2"), "FinNexus", "FNX", 18, chainId.WAN],
      fromChainID: chainId.WAN,
      fromAccount: hexToBytes("0x391dD875cBC5955C151182396604F5e97B00d3f2"),
      toChainID: chainId.ETH,
      tokenAddress: '0x5A6EE804fa22f80Fd1aC2aBd635542ce526CAb85',
    },
  },

  BTC2ETH: {
    originChain: 'WAN',
    originToken: {name: 'Bitcoin', symbol: 'BTC', decimals: 8},
    mapChain: 'ETH',
    mapToken: {name: 'wanBTC@Ethereum', symbol: 'wanBTC', decimals: 8},
    pair: {
      id: 5,
      aInfo: [hexToBytes('0xBb661e11772f719263058c030aC47678a1e2f463'), "Bitcoin", "BTC", 8, chainId.WAN],
      fromChainID: chainId.WAN,
      fromAccount: hexToBytes('0xBb661e11772f719263058c030aC47678a1e2f463'),
      toChainID: chainId.ETH,
      tokenAddress: '0xb428E58C0612441b51DB6C51cc9488fa285c2E26',
    },
  },

  EOS2ETH: {
    originChain: 'WAN',
    originToken: {name: 'EOS', symbol: 'EOS', decimals: 4},
    mapChain: 'ETH',
    mapToken: {name: 'wanEOS@Ethereum', symbol: 'wanEOS', decimals: 4},
    pair: {
      id: 6,
      aInfo: [hexToBytes('0xf601685D7999A323082C6dd29F10ec166F4A8d14'), "EOS", "EOS", 4, chainId.WAN],
      fromChainID: chainId.WAN,
      fromAccount: hexToBytes('0xf601685D7999A323082C6dd29F10ec166F4A8d14'),
      toChainID: chainId.ETH,
      tokenAddress: '0x66c495222335894f60dE102F6f5871a764911B35',
    },
  },
}
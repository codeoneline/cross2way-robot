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
      tokenAddress: '0x172B01a603bBeCA71F57752399E633a9a80bEb3F',
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
      tokenAddress: '0xb1878E3740C9a7E2815d47B843c68Af549b44dD2',
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
      tokenAddress: '0xB5c66724f19236A9f1ed967Eda1C12F809EE4d5B',
    },
  },
  FNX2ETH: {
    originChain: 'WAN',
    originToken: {name: 'FinNexus ', symbol: 'FNX', decimals: 18},
    mapChain: 'ETH',
    mapToken: {name: 'wanFNX@Ethereum', symbol: 'wanFNX', decimals: 18},
    pair: {
      id: 4,
      aInfo: [hexToBytes("0x974AB46969D3D9a4569546051a797729E301d6Eb"), "FinNexus", "FNX", 18, chainId.WAN],
      fromChainID: chainId.WAN,
      fromAccount: hexToBytes("0x974AB46969D3D9a4569546051a797729E301d6Eb"),
      toChainID: chainId.ETH,
      tokenAddress: '0x3CdEbA4e3ae88053C5AC4B4776F586Aff2Da2Af2',
    },
  },

  BTC2ETH: {
    originChain: 'WAN',
    originToken: {name: 'Bitcoin', symbol: 'BTC', decimals: 8},
    mapChain: 'ETH',
    mapToken: {name: 'wanBTC@Ethereum', symbol: 'wanBTC', decimals: 8},
    pair: {
      id: 5,
      aInfo: [hexToBytes('0x89a3e1494bc3db81dadc893ded7476d33d47dcbd'), "Bitcoin", "BTC", 8, chainId.WAN],
      fromChainID: chainId.WAN,
      fromAccount: hexToBytes('0x89a3e1494bc3db81dadc893ded7476d33d47dcbd'),
      toChainID: chainId.ETH,
      tokenAddress: '0xD3Ca8CC88668559d22A7084BB7a35De6485264c7',
    },
  },

  EOS2ETH: {
    originChain: 'WAN',
    originToken: {name: 'EOS', symbol: 'EOS', decimals: 4},
    mapChain: 'ETH',
    mapToken: {name: 'wanEOS@Ethereum', symbol: 'wanEOS', decimals: 4},
    pair: {
      id: 6,
      aInfo: [hexToBytes('0x57195b9d12421e963b720020483f97bb7ff2e2a6'), "EOS", "EOS", 4, chainId.WAN],
      fromChainID: chainId.WAN,
      fromAccount: hexToBytes('0x57195b9d12421e963b720020483f97bb7ff2e2a6'),
      toChainID: chainId.ETH,
      tokenAddress: '0x6e62f1CB8458E9928e3eC291d4193Ec6833Ded8E',
    },
  },
}
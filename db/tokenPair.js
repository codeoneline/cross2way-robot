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
      tokenAddress: '0xec2F1b90403c7DfcC72b4133A53ed84C355Fb31E',
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
      tokenAddress: '0x931861219B87FFE4C58E42d682651fBe8E4473DA',
    },
  },
  LINK2WAN: {
    originChain: 'ETH',
    originToken: {name: 'Chain Link', symbol: 'LINK', decimals: 18},
    mapChain: 'WAN',
    mapToken: {name: 'wanLINK@Wanchain', symbol: 'wanLINK', decimals: 18},
    pair: {
      id: 3,
      aInfo: [hexToBytes("0xf19b8310fD591dfe7701FD203BdBd7DE9661e3f9"), "Chain Link", "LINK", 18, chainId.ETH],
      fromChainID: chainId.ETH,
      fromAccount: hexToBytes("0xf19b8310fD591dfe7701FD203BdBd7DE9661e3f9"),
      toChainID: chainId.WAN,
      tokenAddress: '0x94842606956bc0EA35935976fb8A0F5AC2C589ab',
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
      tokenAddress: '0xe47330858469A0db9dDe13af8B353c718b778E68',
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
      tokenAddress: '0x09c6f912f88945694f425e654A9A1Cdb36E9dbA8',
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
      tokenAddress: '0x77588099C5312BA93ecA3c7b2A16E2b0757482bE',
    },
  },
}
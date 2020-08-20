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
    originToken: {name: 'eth', symbol: 'ETH', decimals: 18},
    mapChain: 'WAN',
    mapToken: {name: 'wanETH@wanchain', symbol: 'wanETH', decimals: 18},
    pair: {
      id: 1,
      aInfo: [aAccount, "eth", "ETH", 18, chainId.ETH],
      fromChainID: chainId.ETH,
      fromAccount: fromAccount,
      toChainID: chainId.WAN,
      tokenAddress: '0x8758960317BcB6fdBE29Aa3c745b311f777f1969',
    },
  },
  WAN2ETH: {
    originChain: 'WAN',
    originToken: {name: 'wan', symbol: 'WAN', decimals: 18},
    mapChain: 'ETH',
    mapToken: {name: 'WAN@ethereum', symbol: 'WAN', decimals: 18},
    pair: {
      id: 2,
      aInfo: [aAccount, "wan", "WAN", 18, chainId.WAN],
      fromChainID: chainId.WAN,
      fromAccount: fromAccount,
      toChainID: chainId.ETH,
      tokenAddress: '0x26FC21D4b1c6C3ca1964F8E5ff43dea3EC2Bd220',
    },
  },
  LINK2WAN: {
    originChain: 'ETH',
    originToken: {name: 'link', symbol: 'LINK', decimals: 18},
    mapChain: 'WAN',
    mapToken: {name: 'wanLINK@wanchain', symbol: 'wanLINK', decimals: 18},
    pair: {
      id: 3,
      aInfo: [hexToBytes("0xc6aBa254B0bea0f67Dd8E97Bf1198F96FF5c32B2"), "link", "LINK", 18, chainId.ETH],
      fromChainID: chainId.ETH,
      fromAccount: hexToBytes("0xc6aBa254B0bea0f67Dd8E97Bf1198F96FF5c32B2"),
      toChainID: chainId.WAN,
      tokenAddress: '0x217CE1c6052b8Cb0099587580464998c41306145',
    },
  },
  FNX2ETH: {
    originChain: 'WAN',
    originToken: {name: 'fnx ', symbol: 'FNX', decimals: 18},
    mapChain: 'ETH',
    mapToken: {name: 'wanFNX@ethereum', symbol: 'wanFNX', decimals: 18},
    pair: {
      id: 4,
      aInfo: [hexToBytes("0x2283d27be033D183F0F46E70992Ebc1356f6e8b3"), "fnx", "FNX", 18, chainId.WAN],
      fromChainID: chainId.WAN,
      fromAccount: hexToBytes("0x2283d27be033D183F0F46E70992Ebc1356f6e8b3"),
      toChainID: chainId.ETH,
      tokenAddress: '0x422504c423E7373415eEC43721F63c0B96AD39ab',
    },
  },

  BTC2ETH: {
    originChain: 'WAN',
    originToken: {name: 'btc', symbol: 'BTC', decimals: 8},
    mapChain: 'ETH',
    mapToken: {name: 'wanBTC@ethereum', symbol: 'wanBTC', decimals: 8},
    pair: {
      id: 5,
      aInfo: [hexToBytes('0x3aE58C9B8b4da8A29A98494D96f2C919E2E641B1'), "btc", "BTC", 8, chainId.WAN],
      fromChainID: chainId.WAN,
      fromAccount: hexToBytes('0x3aE58C9B8b4da8A29A98494D96f2C919E2E641B1'),
      toChainID: chainId.ETH,
      tokenAddress: '0x81c144a2082eb4E116223c70C7f70081acC8a2AB',
    },
  },

  EOS2ETH: {
    originChain: 'WAN',
    originToken: {name: 'eos', symbol: 'EOS', decimals: 4},
    mapChain: 'ETH',
    mapToken: {name: 'wanEOS@ethereum', symbol: 'wanEOS', decimals: 4},
    pair: {
      id: 6,
      aInfo: [hexToBytes('0xd264B2a8d5938e6Eb8235EA8D4Aaa8eC135F2c56'), "eos", "EOS", 4, chainId.WAN],
      fromChainID: chainId.WAN,
      fromAccount: hexToBytes('0xd264B2a8d5938e6Eb8235EA8D4Aaa8eC135F2c56'),
      toChainID: chainId.ETH,
      tokenAddress: '0x075399B3DF085c2A04d08Db5C914fF14Bb0F23d4',
    },
  },
}
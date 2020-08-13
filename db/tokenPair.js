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
  BTC2ETH: {
    mapChain: 'ETH',
    originChain: 'WAN',
    mapToken: {name: 'btc map eth', symbol: 'wanBTC', decimals: 18},
    originToken: {name: 'btc on wan', symbol: 'BTC', decimals: 18},
    pair: {
      id: 22,
      aInfo: [hexToBytes("0xDDcd518E6bD473A129c31Ba4a2EC699843F10567"), "btc", "BTC", 18, 0x8057414e],
      fromChainID: 0x8057414e,
      fromAccount: hexToBytes("0xDDcd518E6bD473A129c31Ba4a2EC699843F10567"),
      toChainID: 0x8000003c,
      tokenAddress: '0x30d2d6D33C9dfA6A1a92697fC1981776C1f516bC',
    },
  },

  EOS2ETH: {
    mapChain: 'ETH',
    originChain: 'WAN',
    mapToken: {name: 'eos map eth', symbol: 'wanEOS', decimals: 18},
    originToken: {name: 'eos on wan', symbol: 'EOS', decimals: 18},
    pair: {
      id: 23,
      aInfo: [hexToBytes("0x3Dd2c6BE473943d7fB9072e43Edf9c6cfd09d81f"), "eos", "EOS", 18, 0x8057414e],
      fromChainID: 0x8057414e,
      fromAccount: hexToBytes("0x3Dd2c6BE473943d7fB9072e43Edf9c6cfd09d81f"),
      toChainID: 0x8000003c,
      tokenAddress: '0xAbD9ab964697AbB5EC434a8aD612B88DDeA39b15',
    },
  }
}
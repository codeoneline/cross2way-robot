// const { RegtestUtils } = require('regtest-client')

// const APIPASS = process.env.APIPASS || 'satoshi'
// const APIURL = process.env.APIURL || 'https://regtest.bitbank.cc/1'

// module.exports = new RegtestUtils({ APIPASS, APIURL })
class ChainHelper{
  constructor(chainConfig) {
    this.maxGas = chainConfig.gasLimit
    this.maxGasPrice = chainConfig.gasPrice
    this.chainId = chainConfig.chainId
    this.signTx = this.signTx.bind(this)
  }
  async signTx() {
    console.log(this.maxGas)
    console.log(this.maxGasPrice)
    console.log(this.chainId)
  }
}
class Chain {
  constructor(chainConfig) {
    this.config = {}
    Object.assign(this.config, chainConfig)
    this.signTx = new ChainHelper({gasLimit: 10, gasPrice: 100, chainId: 500}).signTx
  }
}

const a = new Chain({from:'a', to: 'b', maxGas: 'c', maxGasPrice: 'd', chainId: 'e'})
console.log(a)
setTimeout(async () => {
  console.log('test 888')
  await a.signTx()
}, 0);
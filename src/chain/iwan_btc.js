const IWan = require('../lib/iwan_chain');
const { pkToAddress } = require('../lib/btc');
const BigNumber = require('bignumber.js')

class IWanBtc extends IWan {
  constructor() {
    super(process.env.CHAINTYPE_BTC);
    this.network = process.env.BTC_NETWORK
  }

  async getOneBalance(gpk) {
    const address = pkToAddress(gpk, this.network)
    const utxoArray = await this.apiClient.getUTXO('BTC', 1, 0xffffff, [address])
    let balance = new BigNumber(0)
    utxoArray.forEach((v) => {
      balance = balance.plus(new BigNumber(v.value))
    })
    console.log(balance.toNumber())
    return balance.toNumber()
  }

}

const iWanBtc = new IWanBtc();

module.exports = {
  core: iWanBtc
};
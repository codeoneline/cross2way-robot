const IWan = require('../lib/iwan_chain');
const { pkToAddress } = require('../lib/ltc');
const BigNumber = require('bignumber.js')

class IWanLtc extends IWan {
  constructor() {
    super(process.env.CHAINTYPE_LTC);
    this.network = process.env.LTC_NETWORK
  }

  async getOneBalance(gpk) {
    const address = pkToAddress(gpk, this.network)
    const utxoArray = await this.apiClient.getUTXO('LTC', 1, 0xffffff, [address])
    let balance = new BigNumber(0)
    utxoArray.forEach((v) => {
      balance = balance.plus(new BigNumber(v.value))
    })
    console.log(balance.toString(10))
    return balance
  }

}

const iWanLtc = new IWanLtc();

module.exports = {
  core: iWanLtc
};
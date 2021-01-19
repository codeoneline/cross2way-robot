const IWan = require('../lib/iwan_chain');
const { pkToAddress } = require('../lib/btc');

class IWanBtc extends IWan {
  constructor() {
    super(process.env.CHAINTYPE_BTC);
    this.network = process.env.BTC_NETWORK
  }

  async getOneBalance(gpk) {
    const address = pkToAddress(gpk, this.network)
    const utxoArray = await this.apiClient.getUTXO('BTC', 1, 3, [address])
    let balance = 0
    utxoArray.forEach((v) => {
      balance += v.value
    })
    return balance
  }

}

const iWanBtc = new IWanBtc();

module.exports = {
  core: iWanBtc
};
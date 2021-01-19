const IWan = require('../lib/iwan_chain');
const { pkToAddress } = require('../lib/btc');

class IWanBtc extends IWan {
  constructor() {
    super(process.env.CHAINTYPE_BTC);
  }

  async getOneBalance(gpk) {
    const address = pkToAddress(gpk)
    const utxoArray = await this.apiClient.getUTXO('BTC', 1, 3, [address])
    const balance = utxoArray.reduce((accumulator, utxo) => accumulator + utxo.value)
    return balance
  }

}

const iWanBtc = new IWanBtc();

module.exports = {
  core: iWanBtc
};
const axios = require('axios');



updateCoinsList_from_CoinGeckoAPI() {
  axios({
    method: 'GET',
    url: 'https://api.coingecko.com/api/v3/coins/list'
  })
    .then(res => {
      if (res.status === 200) {
        runInAction(() => {
          for (let obj of res.data) {
            this.tokenIds_from_CoinGeckoAPI[obj.symbol] = obj.id
          }
          this.updateCoinPrice();
        })
      } else {
        console.log('Get coin list failed!');
        setTimeout(() => {
          this.updateCoinsList_from_CoinGeckoAPI();
        }, 5000);
      }
    })
    .catch((error) => {
      console.log('Get coin list from coingecko failed!', error);
      setTimeout(() => {
        this.updateCoinsList_from_CoinGeckoAPI();
      }, 5000);
    });
}

axios({
  method: 'GET',
  url: 'https://api.coingecko.com/api/v3/simple/price',
  params: {
    ids: convertedParam.join(),
    vs_currencies: 'usd',
  }
})
  .then((res) => {
    if (res.status === 200) {
      runInAction(() => {
        self.coinPriceObj = {};
        for (let i in res.data) {
          self.coinPriceObj[reconvertIds[i]] = res.data[i].usd;
        }
      })
    } else {
      console.log('Get prices failed.', res);
    }
  })
  .catch((error) => {
    console.log('Get prices from coingecko failed', error);
  });
const axios = require('axios');
const log = require('./lib/log');

const getData = async url => {
  try {
    const response = await axios.get(url);
    const data = response.data;
    return data;
  } catch (error) {
    if (typeof(error) === "string") {
      log.error(error);
    } else {
      log.error(JSON.stringify(error));
    }
  }
  return null;
}

const Symbols = "BTC,USDC,TUSD,MKR,GUSD,ETH,SAI,LINK,LRC,ZXC,EURS,EOS,USDT,RVX,FNX,WAN";
// AURA,CURV,MDX,RVX,UM1S

// 3. axios module
setTimeout(async () => {
  const usd = await getData(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${Symbols}&tsyms=USD`);
  log.info(JSON.stringify(usd));
}, 0);

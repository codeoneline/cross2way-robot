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

// updateDeposit(bytes32 smgID, int[] prices)
// updatePrice(bytes[] keys, uint[] prices)

const Symbols = "BTC,USDC,TUSD,MKR,GUSD,ETH,SAI,LINK,LRC,ZXC,EURS,EOS,USDT,RVX,FNX,WAN";
// AURA,CURV,MDX,RVX,UM1S
const result = {
  "BTC":{"USD":8971.02},
  "USDC":{"USD":1},
  "TUSD":{"USD":1.002},
  "MKR":{"USD":433.99},"GUSD":{"USD":1.011},"ETH":{"USD":219.27},"SAI":{"USD":1.238},"LINK":{"USD":4.385},"LRC":{"USD":0.07347},"ZXC":{"USD":0.002759},"EURS":{"USD":1.119},"EOS":{"USD":2.321},"USDT":{"USD":0.9998},"FNX":{"USD":0.006011},"WAN":{"USD":0.189}}
// 3. axios module
setTimeout(async () => {
  const usd = await getData(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${Symbols}&tsyms=USD`);
  log.info(JSON.stringify(usd));
}, 0);

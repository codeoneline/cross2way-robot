const axios = require('axios');
const log = require('./log');

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

async function getPrices(symbolsStr) {
  const symbols = symbolsStr.replace(/\s+/g,"").split(',');

  const priceMap = {};
  const data = await getData(`${process.env.CRYPTO_URL}fsyms=${symbolsStr}&tsyms=USD`);
  symbols.map(it => {
    if (data[it]) {
      priceMap[it] = data[it].USD;
    } else {
      priceMap[it] = null;
    }
  });
  log.info(JSON.stringify(priceMap));
  return priceMap;
}

module.exports = getPrices;

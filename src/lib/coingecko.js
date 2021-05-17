const axios = require('axios');
const { fractionToDecimalString } = require('./utils');
const log = require('./log')

const { getWaspPriceFromContract } = require('./wasp')

const getData = async url => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    if (typeof(error) === "string") {
      log.error(error);
    } else {
      log.error(JSON.stringify(error));
    }
  }
  return null;
}

// list
// {
//   "id": "yearn-finance-bit2",
//   "symbol": "yfb2",
//   "name": "Yearn Finance Bit2"
// },
// {
//   "id": "yearn-finance-center",
//   "symbol": "yfc",
//   "name": "Yearn Finance Center"
// },

const getIDs = async (url, symbolsStr) => {
  try {
    const symbols = symbolsStr.toLowerCase().replace(/\s+/g,"").split(',')
    const symbolsMap = {}
    symbols.forEach(symbol => {
      if (symbol === "fnx") {
        symbolsMap[symbol] = "finnexus"
      } else if (symbol === "uni") {
        symbolsMap[symbol] = "uniswap"
      } else if (symbol === "xrp") {
        symbolsMap[symbol] = "ripple"
      } else if (symbol === 'ltc') {
        symbolsMap[symbol] = "litecoin"
      } else {
        symbolsMap[symbol] = ""
      }
    })

    const response = (await axios.get(url))
    const data = response.data
    data.forEach(item => {
      if (symbolsMap.hasOwnProperty(item.symbol)) {
        if (symbolsMap[item.symbol] === "") {
          symbolsMap[item.symbol] = item.id
        } else {
          if (item.symbol !== "fnx" && item.symbol !== "uni" && item.symbol !== 'xrp' && item.symbol !== 'ltc') {
            log.error(`duplicated new ${JSON.stringify(item, null, 2)}, old ${JSON.stringify(symbolsMap[item.symbol], null, 2)}`)
            throw new Error(`duplicated new ${JSON.stringify(item, null, 2)}, old ${JSON.stringify(symbolsMap[item.symbol], null, 2)}`)
          }
        }
      }
    })

    return symbolsMap
  } catch (error) {
    console.error(error)
  }
  return null
}

async function getPrices(symbolsStr) {
  const symbolIds = await getIDs("https://api.coingecko.com/api/v3/coins/list", symbolsStr)
  let hasWasp = false
  if (symbolIds['wasp'] !== undefined) {
    hasWasp = true
    delete symbolIds['wasp']
  }
  const symbols = symbolsStr.toLowerCase().replace(/\s+/g,"").replace(/,wasp/g,"").split(',')
  const idsArr = []
  symbols.forEach(it => {
    idsArr.push(symbolIds[it])
  })
  const ids = idsArr.join(',')
  console.log(ids)
  const priceIdMap = await getData(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`)

  const priceMap = {};
  symbols.forEach(it => {
    priceMap[it.toUpperCase()] = fractionToDecimalString(priceIdMap[symbolIds[it]].usd, process.env.PRICE_DECIMAL);
  });
  if (hasWasp) {
    const waspPrice = await getWaspPriceFromContract(priceMap['WAN'])
    priceMap['WASP'] = waspPrice
  }
  return priceMap
}

// https://api.coingecko.com/api/v3/coins/list
// https://api.coingecko.com/api/v3/simple/price?ids=<coin>&vs_currencies=usd
// https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=3
// setTimeout(async () => {
//   // const data = await getIDs("https://api.coingecko.com/api/v3/coins/list", process.env.SYMBOLS);
//   const data = await getPrices(process.env.SYMBOLS)
//   console.log(JSON.stringify(data, null, 2))
// }, 0)

module.exports = getPrices

const Web3 = require('web3');
const web3 = new Web3();

function sleep(ms) {
	return new Promise(function (resolve, reject) {
		setTimeout(function () {
			resolve();
		}, ms);
	})
};

// const sleep = (ms) => { return new Promise(resolve => setTimeout(resolve, ms)) };

function promisify(func, paras=[], obj=null){
  return new Promise(function(success, fail){
      function _cb(err, result){
          if(err){
              fail(err);
          } else {
              success(result);
          }
      }
      paras.push(_cb);
      func.apply(obj, paras);
  });
}

function promiseEvent(func, paras=[], obj=null, event){
  return new Promise(function(success, fail){
      let res = func.apply(obj, paras);
      obj.on(event, function _cb(err){
          if(err){
              fail(err);
          } else {
              success(res);
          }
      })
  });
}


function fractionToDecimalString(priceRaw, price_decimal) {
    let leftDecimal = price_decimal;
    let decimal = 0;

    const priceRawSplit = (priceRaw + "").split('.');
    let priceStr = priceRawSplit[0];
    if (priceRawSplit.length > 1) {
        decimal = priceRawSplit[1].length;
        priceStr += priceRawSplit[1];
    }
    const price = web3.utils.toBN(priceStr);
    if (decimal > price_decimal) {
        throw new Error(`${it} decimal > ${price_decimal}, price = ${symbolPriceMap[it]}`);
    }

    return '0x' + price.mul(web3.utils.toBN(Math.pow(10, price_decimal - decimal))).toString('hex');
}

module.exports = {
  sleep,
  promisify,
  promiseEvent,
  fractionToDecimalString,
  web3
}

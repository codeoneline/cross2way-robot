const elliptic = require('elliptic')
const Secp256k1 = elliptic.ec('secp256k1');
const keypairs = require('ripple-keypairs')

function pkToAddress(gpk) {
  const pubkey = Secp256k1.keyFromPublic("04" + gpk.slice(2), 'hex')
  const compressed = pubkey.getPublic(true, 'hex')
  console.log("pubkey compressed:", compressed)
  
  const addr = keypairs.deriveAddress(compressed.toUpperCase())
  return addr
}

// console.log(pkToAddress("0x2e9ad92f5f541b6c2ddb672a70577c252aaa8b9b8dfdff9a5381912395985d12dc18f19ecb673a3b675697ae97913fcb69598c089f6d66ae7a3f6dc179e4da56"))
module.exports = {
  pkToAddress
}
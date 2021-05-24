// const bitcoin = require( 'bitcoinjs-lib' );
const bitcoin = require( 'bitcoinjs-lib' );
const bs58check = require('bs58check')

// scriptHash: 0xc4, //  for segwit (start with 2)

// pubKeyHash: 0x6f
function pkToAddress(gpk, network = 'mainnet') {
  const pkBuffer = Buffer.from("04" + gpk.slice(2), 'hex')
  const hash160 = bitcoin.crypto.hash160
  let prefix = 0x00
  switch(network) {
    case 'mainnet':
      prefix = 0x30
      break
    default:
      prefix = 0x6f
      break
  }
  const v = Buffer.from([prefix])
  const b20 = hash160(Buffer.from(pkBuffer, 'hex'))
  const payload = Buffer.concat([v, b20])
  const address = bs58check.encode(payload)

  console.log(address)

  return address
}
// function convert(address) {
//   try {
//       let decoded = bitcoin.address.fromBase58Check(address);
//       let version = decoded['version']
//       let message;

//       switch (version) {
//           case 5:
//               message = "Mainnet p2sh address: ";
//               version = 50;
//               break;
//           case 50:
//               message = "Mainnet p2sh address (deprecated): ";
//               version = 5;
//               break;
//           case 196:
//               message = "Testnet p2sh address: ";
//               version = 58;
//               break;
//           case 58:
//               message = "Testnet p2sh address (deprecated): ";
//               version = 196;
//               break;
//           default:
//               throw "unknown";
//       }
//       // 5 <-> 50
//       // 196 <-> 58
//       return bitcoin.address.toBase58Check(decoded['hash'], version);
//   } catch (err) {
//       message = "Please enter a valid address."
//       console.log(err);
//   }
//   return '';
// }
module.exports = {
  pkToAddress
}
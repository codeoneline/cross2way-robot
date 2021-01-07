const assert = require('assert')
const { describe, it } = require('mocha')
const bitcoin = require('bitcoinjs-lib')
const regtestUtils = require('./_regtest')

const bs58 = require('bs58')
const ecc = require('tiny-secp256k1');
const bech32 = require('bech32')

const dhttp = regtestUtils.dhttp;
const TESTNET = bitcoin.networks.testnet;
const MAINNET = bitcoin.networks.bitcoin;
const PRIVATENET = bitcoin.networks.regtest;

// 交易类型 : p2pkh, p2pk, p2ms, p2sh, op_return, p2wpkh, p2wsh
//   p2pkh :
//   p2pk
//   p2ms
//   p2sh
//   op_return
//

// 私钥格式 : K = k * G, k
//   16进制私钥 : 256bit = 64Byte = 128hex
//   wif压缩格式私钥 : k = k+01 带入下式 
//   wif格式私钥 : k1 = 80(版本号)+k    Base58( k1 + first4Byte( sha256( sha256(k1) ) ) )
//   16进制私钥：      1e99423a4ed27608a15a2616a2b0e9e52ced330ac530edcc32c8ffc6a526aedd
//   WIF压缩格式私钥：  KxFC1jmwwCoACiCAWZ3eXa96mBM6tb3TYzGmf6YwgdGWZgawvrtJ
//   WIF非压缩格式私钥： 5J3mBbAH58CpQ3Y5RNJpUKPE62SQ5tfcvU2JpbnkeyhfsYB1Jcn
function toWif(sk, bCompress) {
  let end = bCompress ? '01' : ''
  
  const k = Buffer.from('80' + sk + end, 'hex');
  console.log(`step 1: ${k.toString('hex')}`)

  const Hash =  bitcoin.crypto.hash256
  // hash256 = sha256(sha256)
  const s2 = Hash(k).slice(0, 4)
  console.log(`step 2: ${s2.toString('hex')}`)
  const s4 = Buffer.concat([k, s2])

  // const Hash =  bitcoin.crypto.sha256
  // const s2 = Hash(k)
  // console.log(`step 2: ${s2.toString('hex')}`)
  // const s3 = Hash(s2).slice(0, 4)
  // console.log(`step 3: ${s3.toString('hex')}`)
  // const s4 = Buffer.concat([k, s3])

  const result = bs58.encode(s4).toString('hex')
  console.log(`step 4: ${result}`)
  return result
}

function wifToSK(wif) {
  const s4 = bs58.decode(wif)
  console.log(`step 4: ${s4.toString('hex')}`)

  const s2 = s4.slice(1, 1 + 32)
  console.log(`step 2: ${s2.toString('hex')}`)
  return s2
}

const mySk = '1e99423a4ed27608a15a2616a2b0e9e52ced330ac530edcc32c8ffc6a526aedd'
const wif = toWif(mySk, true)
const wif2 = toWif(mySk)

wifToSK(wif)
wifToSK(wif2)

// 公钥格式 : 非压缩， 压缩
//   非压缩格式， 04 + 64B (x) + 64B (y)
//   压缩格式,   03 + 64B (x)   且y为奇数
//              02 + 64B (x)   且x为奇数
function toPK(sk, bCompress) {
  // K = sk * G = (x, y)
  // PK = 04 + x + y,    PK = 03 + x (y奇数)  PK = 02 + x

  const pk = ecc.pointFromScalar(Buffer.from(sk, 'hex'), bCompress)
  // 04f028892bad7ed57d2fb57bf33081d5cfcf6f9ed3d3d7f159c2e2fff579dc341a07cf33da18bd734c600b96a72bbc4749d5141c90ec8ac328ae52ddfe2e505bdb
  // 03f028892bad7ed57d2fb57bf33081d5cfcf6f9ed3d3d7f159c2e2fff579dc341a
  console.log(pk.toString('hex'))

  return pk
}

const pkN = toPK(mySk, false)
const pkC = toPK(mySk, true)
toPK(mySk)

// 地址格式 : chainId， pk
//  非压缩公钥
//    MAINNET
//    TESTNET
//    PRIVATENET
//  压缩公钥
//    MAINNET
//    TESTNET
//    PRIVATENET
const addressTypes = {
  0x00: {
    type: 'p2pkh',
    network: 'mainnet'
  },

  0x6f: {
    type: 'p2pkh',
    network: 'testnet'
  },

  0x05: {
    type: 'p2sh',
    network: 'mainnet'
  },

  0xc4: {
    type: 'p2sh',
    network: 'testnet'
  }
};

// bech32 编码实际上由两部分组成：一部分是bc这样的前缀，被称为HRP（Human Readable Part，用户可读部分），
//                          另一部分是特殊的Base32编码，使用字母表qpzry9x8gf2tvdw0s3jn54khce6mua7l，中间用1连接。对一个公钥进行Bech32编码的代码如下：
// regtest = testnet
const addressVersion = {
  "mainnet" : {
    // base58 编码
    "p2pkh": 0x00,            // 1        17VZNX1SN5NtKa8UQFxwQbFeFc3iqRYhem
    "p2sh": 0x05,             // 3        3EktnHQD7RiAE6uzMj2ZifT9YgRrkSgzQX
    "p2wifSk": 0x80,          // 5        5Hwgr3u458GLafKBgxtssHSPqJnYoGrSzgQsPwLFhLNYskDPyyA
    "p2wifPk": 0x80,          // K / L    L1aW4aubDFB7yfras2S1mN3bqg9nwySY8nkoLmJebSLD5BWv3ENZ
    "p2bip32pk": 0x0488B21E,  // xpub     xpub661MyMwAqRbcEYS8w7XLSVeEsBXy79zSzH1J8vCdxAZningWLdN3 zgtU6LBpB85b3D2yc8sfvZU521AAwdZafEz7mnzBBsz4wKY5e4cp9LB
    "p2bip32sk": 0x0488ADE4,  // xprv     xprv9s21ZrQH143K24Mfq5zL5MhWK9hUhhGbd45hLXo2Pq2oqzMMo63o StZzF93Y5wvzdUayhgkkFoicQZcP3y52uPPxFnfoLZB21Teqt1VvEHx
    // bech32 编码 p2wpkh p2wsh
  },
  "testnet" : {
    // base58 编码
    "p2pkh": 0x6f,            // m / n    mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn
    "p2sh": 0xc4,             // 2        2MzQwSSnBHWHqSAqtTVQ6v47XtaisrJa1Vc
    "p2wifSk": 0xef,          // 9        92Pg46rUhgTT7romnV7iGW6W1gbGdeezqdbJCzShkCsYNzyyNcc
    "p2wifPk": 0xef,          // c        cNJFgo1driFnPcBdBX8BrJrpxchBWXwXCvNH5SoSkdcF6JXXwHMm
    "p2bip32pk": 0x043587CF,  // tpub     tpubD6NzVbkrYhZ4WLczPJWReQycCJdd6YVWXubbVUFnJ5KgU5MDQrD9 98ZJLNGbhd2pq7ZtDiPYTfJ7iBenLVQpYgSQqPjUsQeJXH8VQ8xA67D
    "p2bip32sk": 0x04358394,  // tprv     tprv8ZgxMBicQKsPcsbCVeqqF1KVdH7gwDJbxbzpCxDUsoXHdb6SnTPY xdwSAKDC6KKJzv7khnNWRAJQsRA8BBQyiSfYnRt6zuu4vZQGKjeW4YF
    // bech32 编码 p2wpkh p2wsh
  }
}
function toAddress(pk, bSegwit, version) {
  // hash160 = ripemd160(sha256())
  const hash160 = bitcoin.crypto.hash160
  // hash256 = sha256(sha256)
  const hash256 = bitcoin.crypto.hash256

  const b20 = hash160(Buffer.from(pk, 'hex'))

  if (bSegwit) {
    let words = bech32.toWords(b20);

    const v = version ? version : 0
    words.unshift(v);

    const address = bech32.encode('bc', words);

    console.log(`seg wit ${address}`)

    return address
  } else {
    const v = Buffer.from([version ? version : 0])
    const content = Buffer.concat([v, b20])
  
    const end = hash256(content).slice(0, 4)
  
    const address = bs58.encode(Buffer.concat([content, end])).toString('hex')
  
    console.log(address)
  
    return address
  }
}
toAddress(pkN)
toAddress(pkC)
toAddress(pkN, true)
toAddress(pkC, true)

const wif5 = 'KyamxxEaa4idX9RGocBzDPjNFbKkU6eA155CcW7cCvs9euu5D7g6'
const sk5 = wifToSK(wif5)
const pk = toPK(sk5, true)
// bc1qxwrmaesyve53tynmn02jz4cc8qeu25d2afxww8
const addr = toAddress(pk, true)
if (addr === "bc1qxwrmaesyve53tynmn02jz4cc8qeu25d2afxww8") {
  console.log("haha good")
}


const pubKeyStr = '0x2e9ad92f5f541b6c2ddb672a70577c252aaa8b9b8dfdff9a5381912395985d12dc18f19ecb673a3b675697ae97913fcb69598c089f6d66ae7a3f6dc179e4da56'


function convertToCompressPublicKey(rawKey) {
  let start = 0
  if (rawKey.startsWith("0x")) {
    start = 2
  }
  const end = parseInt(rawKey.charAt(rawKey.length - 1))

  let prefix = '02'
  if (end & 1 === 1) {
    prefix = '03'
  }
  const xRaw = rawKey.substr(start, 64);

  return prefix + xRaw
}

const allNets = [MAINNET, TESTNET, PRIVATENET]
// 
// const allAddressFormat = {'p2pkh', 'p2sh', ''}

describe('bitcoinjs-lib (addresses)', function () {
  this.timeout(16000000);
  it('can generate a random address [and support the retrieval of transactions for that address (via 3PBP)]', async () => {
    console.log('aaa')
    // const keyPair = bitcoin.ECPair.makeRandom();

    const pubKey = Buffer.from(convertToCompressPublicKey(pubKeyStr), 'hex')
    const keyPair = bitcoin.ECPair.fromPublicKey(pubKey, {network: MAINNET})
    const account = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey })

    console.log(`p2pkh address is ${account.address}`)
    // bitcoin P2PKH addresses start with a '1'
    assert.strictEqual(account.address.startsWith('1'), true);
  })
});
const bitcoinjs = require( 'bitcoinjs-lib' );

const pubkey = Buffer.from( '0x2e9ad92f5f541b6c2ddb672a70577c252aaa8b9b8dfdff9a5381912395985d12dc18f19ecb673a3b675697ae97913fcb69598c089f6d66ae7a3f6dc179e4da56', 'hex' );
const { address } = bitcoinjs.payments.p2pkh({ pubkeys: [pubkey] });
console.log( address );
const BN = require('bn.js');
const ChildChain = require('@omisego/omg-js-childchain')
const { transaction } = require('@omisego/omg-js-util');
const { Account } = require('eth-lib');

const CRYPTO_ADDRESS = '0x1f014cbf885065b032099a69cd7386d9c210098a'
 
// Enter private key of above address here:
const CRYPTO_PRIVATE_KEY = ''

const CUSTOMER_ADDRESS = '0x550D6Fec57cC65f0434Cf5d20BEc9bb258832832'
const OMG_FEE_ADDRESS = '0x6da99168cee24f7d6b4d76361533c994acc97c8e'
const USDT_TOKEN = '0xdac17f958d2ee523a2206206994597c13d831ec7'
const ONE_OMG = new BN(1000000000000000000n)
const OMG_FEE = new BN(71571675302245200n)

const TX = {
  inputs: [
    { // This is the 2000 USDT input
      blknum: 3197000,
      txindex: 0,
      oindex: 0,
    },
    { // This is the OMG fee input
      blknum: 4438000,
      txindex: 0,
      oindex: 1,
    },
  ],
  outputs: [
    {
      // This is the 2000 USDT sent back to the customer
      outputType: 1,
      outputGuard: CUSTOMER_ADDRESS,
      currency: USDT_TOKEN,
      amount: 2000,
    },
    {
      // We sent you 1 OMG to pay the tx fee. 
      // This output sends the change back.
      outputType: 1,
      outputGuard: OMG_FEE_ADDRESS,
      currency: USDT_TOKEN,
      amount: ONE_OMG.sub(OMG_FEE),
    },
  ]
}

function sign(childChain, tx, privateKeys) {
  const typedData = transaction.getTypedData(tx, childChain.plasmaContractAddress);
  const signatures = childChain.signTransaction(typedData, privateKeys);
  return childChain.buildSignedTransaction(typedData, signatures);
}

async function submit(childChain, tx, privateKey) {
  // Sign each input with the same private key.
  const privateKeys = new Array(tx.inputs.length).fill(privateKey);
  const signedTx = sign(childChain, tx, privateKeys);

  // Submit the tx to the OMG network.
  return childChain.submitTransaction(signedTx);
}

async function main() {
  // Sanity check the PK
  const account = Account.fromPrivate(CRYPTO_PRIVATE_KEY);
  if (account.address.toLowerCase() !== CRYPTO_ADDRESS.toLowerCase()) {
    throw new Error(`Private key does not match address ${CRYPTO_ADDRESS}`)
  }

  const childChain = new ChildChain({
    watcherUrl: 'https://watcher-info.mainnet.v1.omg.network',
    plasmaContractAddress: '0x0d4c1222f5e839a911e2053860e45f18921d72ac',
  })

  await submit(childChain, TX, CRYPTO_PRIVATE_KEY) 
}

main()

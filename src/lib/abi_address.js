const path = require('path')
const { privateToAddress } = require('./utils');
const assert = require('assert')

const contracts = {
  TokenManagerProxy,
  TokenManagerDelegate,
  MappingToken,
  OracleProxy,
  OracleDelegate,
  CrossDelegate,
  QuotaDelegate,
  StoremanGroupDelegate,
  Contract
} = require('../contract')

const wanConfig = require(path.resolve(process.env.DEPLOYED_FOLD, process.env.DEPLOYED_FILE_WANCHAIN))
const ethConfig = require(path.resolve(process.env.DEPLOYED_FOLD, process.env.DEPLOYED_FILE_ETHEREUM))
const bscConfig = require(path.resolve(process.env.DEPLOYED_FOLD, process.env.DEPLOYED_FILE_BSC))
const avaxConfig = require(path.resolve(process.env.DEPLOYED_FOLD, process.env.DEPLOYED_FILE_AVAX))
const devConfig = require(path.resolve(process.env.DEPLOYED_FOLD, process.env.DEPLOYED_FILE_DEV))

const wanPrivateKey = process.env.OWNER_SK_WANCHAIN
const wanAddress = privateToAddress(wanPrivateKey);

const ethPrivateKey = process.env.OWNER_SK_ETHEREUM
const ethAddress = privateToAddress(ethPrivateKey);

const bscPrivateKey = process.env.OWNER_SK_BSC
const bscAddress = privateToAddress(bscPrivateKey);

const avaxPrivateKey = process.env.OWNER_SK_AVAX
const avaxAddress = privateToAddress(avaxPrivateKey);

const devPrivateKey = process.env.OWNER_SK_DEV
const devAddress = privateToAddress(devPrivateKey);

const configs = {}
configs[process.env.CHAINTYPE_WAN] = {
  config: wanConfig,
  ownerPrivateKey: wanPrivateKey,
  ownerAddress: wanAddress
}
configs[process.env.CHAINTYPE_ETH] = {
  config: ethConfig,
  ownerPrivateKey: ethPrivateKey,
  ownerAddress: ethAddress
}
configs[process.env.CHAINTYPE_BSC] = {
  config: bscConfig,
  ownerPrivateKey: bscPrivateKey,
  ownerAddress: bscAddress
}
configs[process.env.CHAINTYPE_AVAX] = {
  config: avaxConfig,
  ownerPrivateKey: avaxPrivateKey,
  ownerAddress: avaxAddress
}
configs[process.env.CHAINTYPE_DEV] = {
  config: devConfig,
  ownerPrivateKey: devPrivateKey,
  ownerAddress: devAddress
}

const abi2replace = {
  'TokenManagerProxy': '../../abi/token-manager-proxy.json',
  'OracleProxy': '../../abi/oracle-proxy.json',
}

const getAddressAndABI = (config, contractName) => {
  let abiPath = null
  let address = null
  const ragD = /Delegate$/
  const ragP = /Proxy$/

  if (ragD.test(contractName)) {
    // contractName is Delegate? We must use proxy address
    const proxyContractName = contractName.replace(/Delegate$/,'Proxy')

    assert.ok(config[proxyContractName], `${contractName} has no proxy config`)

    console.log(`getAddressAndABI ${JSON.stringify(proxyContractName)}`)
    const fileName = (config[contractName] && config[contractName].abi) ? config[contractName].abi : config[proxyContractName].abi

    assert.equal(fileName, `abi.${contractName}.json`, `delegate file name is not abi.${contractName}.json`)

    address = config[proxyContractName].address
    abiPath = path.resolve(process.env.DEPLOYED_FOLD, fileName)
  } else if (ragP.test(contractName)) {
    // contractName is Proxy? use proxy abi
    const ragProxyJson = /Proxy\.json$/
    if (!ragProxyJson.test(config[contractName].abi)) {
      abiPath = abi2replace[contractName]
      if (!abiPath) {
        abiPath = path.resolve(process.env.DEPLOYED_FOLD, `abi.${contractName}.json`)
      }
    } else {
      abiPath = path.resolve(process.env.DEPLOYED_FOLD, config[contractName].abi)
    }
    address = config[contractName].address
  } else {
    address = config[contractName].address
    abiPath = path.resolve(process.env.DEPLOYED_FOLD, config[contractName].abi)
  }

  return {
    address,
    abiPath
  }
}

function loadContract(chain, contractName) {
  const { config, ownerPrivateKey, ownerAddress } = configs[chain.core.chainType]

  const {abiPath, address} = getAddressAndABI(config, contractName)
  const abi = require(abiPath)
  assert.ok(abi, `${contractName}, no valid abi file at ${abiPath}`)
  if (contracts[contractName]) {
    return new contracts[contractName](chain, address, ownerPrivateKey, ownerAddress, abi)
  } else {
    return new Contract(chain, address, ownerPrivateKey, ownerAddress, abi)
  }
}

function loadContractAt(chain, contractName, address) {
  const { config } = configs[chain.core.chainType]

  const {abiPath} = getAddressAndABI(config, contractName)
  const abi = require(abiPath)
  assert.ok(abi, `${contractName}, no valid abi file at ${abiPath}`)
  if (contracts[contractName]) {
    return new contracts[contractName](chain, address, null, null, abi)
  } else {
    return new Contract(chain, address, null, null, abi)
  }
}

module.exports = {
  loadContract,
  loadContractAt,
};

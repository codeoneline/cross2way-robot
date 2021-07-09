const IWan = require('./iwan_chain');
const { ChainHelper } = require('./chain-helper');
const configs = require('./configs')
const { privateToAddress } = require('./utils');
const assert = require('assert')
const path = require('path')

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

class IWanChain extends IWan {
  constructor(chainConfig) {
    super(chainConfig.chainType)

    Object.assign(this, chainConfig)

    if (chainKind === 'eth') {
      this.signTx = new ChainHelper(chainConfig).signTx
    }
    if (!!chainConfig.deployedFile) {
      this.deployConfig = require(path.resolve(process.env.DEPLOYED_FOLD, chainConfig.deployedFile))
    }
    if (!!chainConfig.ownerSk) {
      this.ownerAddress = privateToAddress(chainConfig.ownerSk)
    }
  }

  loadContract = (contractName) => {
    const config = this.deployConfig
    const ownerPrivateKey = this.ownerSk
    const ownerAddress = this.ownerAddress
  
    const {abiPath, address} = getAddressAndABI(config, contractName)
    const abi = require(abiPath)
    assert.ok(abi, `${contractName}, no valid abi file at ${abiPath}`)
    if (contracts[contractName]) {
      return new contracts[contractName](chain, address, ownerPrivateKey, ownerAddress, abi)
    } else {
      return new Contract(chain, address, ownerPrivateKey, ownerAddress, abi)
    }
  }
  
  loadContractAt = (contractName, address) => {
    const config = this.deployConfig
  
    const {abiPath} = getAddressAndABI(config, contractName)
    const abi = require(abiPath)
    assert.ok(abi, `${contractName}, no valid abi file at ${abiPath}`)
    if (contracts[contractName]) {
      return new contracts[contractName](chain, address, null, null, abi)
    } else {
      return new Contract(chain, address, null, null, abi)
    }
  }
}

const chainNames = []
const chains = {}

// params e.g. : eth, testnet
function getChain(name, network) {
  if (!chains.hasOwnProperty[name]) {
    chains[name] = {}
  }
  if (!chains[name].hasOwnProperty(network)) {
    if (!configs.hasOwnProperty(name) || !configs.hasOwnProperty(network)) {
      console.error(`${name} ${network} config not exist`)
      return null
    }
    const chain = new IWanChain(configs[name][network])
    chains[name][network] = {
      core: chain,
      web3: chain.web3,
      signTx: chain.signTx,
    }
  }

  return chains[name][network]
}

function getChainNames() {
  if (chainNames.length === 0) {
    chainNames.push(...(Object.keys(configs)))
  }
  return chainNames
}

function getChains(netWork) {
  const networkChains = []
  const chainNames = getChainNames()
  chainNames.forEach(chainName => {
    const chain = getChain(chainName, netWork)
    if (chain != null) {
      networkChains.push(chain)
    }
  });
  return networkChains
}

module.exports = {
  getChain,
  getChainNames,
  getChains,
};
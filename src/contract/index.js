const TokenManagerProxy = require('./token_manager_proxy')
const TokenManagerDelegate = require('./token_manager')
const MappingToken = require('./map_token')
const OracleProxy = require('./oracle_proxy')
const OracleDelegate = require('./oracle')
const CrossDelegate = require('./cross')
const QuotaDelegate = require('./quota')
const StoremanGroupDelegate = require('./storeman_group_admin')
const Contract = require('./contract')

module.exports = {
  TokenManagerProxy,
  TokenManagerDelegate,
  MappingToken,
  OracleProxy,
  OracleDelegate,
  CrossDelegate,
  QuotaDelegate,
  StoremanGroupDelegate,
  Contract
}
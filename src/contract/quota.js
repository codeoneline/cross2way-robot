const Contract = require('./contract');
const abi = require('../../abi/abi.QuotaDelegate.json');

class Quota extends Contract {
  constructor(chain, address, ownerPV, ownerAddress) {
    super(chain, abi, address, ownerPV, ownerAddress);
  }

  // returns(address tokenManager, address smgAdminProxy, address smgFeeProxy, address quota, address sigVerifier)
  async getPartners() {
    return await this.getFun(this.getPartners.name)
  }

  // returns(uint lockFee, uint revokeFee)
  async getFees(fromChainId, toChainId) {
    return await this.getFun(this.getPartners.name, fromChainId, toChainId)
  }

  // htlc time uint256
  async lockedTime() {
    return await this.getVar('lockedTime')
  }

  // priceOracleAddress address
  async priceOracleAddress() {
    return await this.getVar('priceOracleAddress')
  }

  // depositOracleAddress address
  async depositOracleAddress() {
    return await this.getVar('depositOracleAddress')
  }

  // tokenManagerAddress address
  async tokenManagerAddress() {
    return await this.getVar('tokenManagerAddress')
  }

  // depositTokenSymbol string
  async depositTokenSymbol() {
    return await this.getVar('depositTokenSymbol')
  }

  // isDebtClean bool
  async isDebtClean(storeManId) {
    return await this.getFun('isDebtClean', storeManId)
  }

  // getUserMintQuota(uint tokenId, bytes32 storemanGroupId) external view returns (uint)
  async getUserMintQuota(tokenId, storemanGroupId) {
    return await this.getFun('getUserMintQuota', tokenId, storemanGroupId)
  }

  // getSmgMintQuota(uint tokenId, bytes32 storemanGroupId) external view returns (uint)
  async getSmgMintQuota(tokenId, storemanGroupId) {
    return await this.getFun('getSmgMintQuota', tokenId, storemanGroupId)
  }

  // getUserBurnQuota(uint tokenId, bytes32 storemanGroupId) external view returns (uint)
  async getUserBurnQuota(tokenId, storemanGroupId) {
    return await this.getFun('getUserBurnQuota', tokenId, storemanGroupId)
  }
  // getSmgBurnQuota(uint tokenId, bytes32 storemanGroupId) external view returns (uint)
  async getSmgBurnQuota(tokenId, storemanGroupId) {
    return await this.getFun('getSmgBurnQuota', tokenId, storemanGroupId)
  }

  // returns (uint asset, uint asset_receivable, uint asset_payable);
  async getAsset(tokenId, storemanGroupId) {
    return await this.getFun('getAsset', tokenId, storemanGroupId)
  }
  // returns (uint debt, uint debt_receivable, uint debt_payable);
  async getDebt(tokenId, storemanGroupId) {
    return await this.getFun('getDebt', tokenId, storemanGroupId)
  }
}

module.exports = Quota
const Contract = require('./contract');
const abi = require('../../abi/abi.QuotaDelegate.json');

class Quota extends Contract {
  constructor(chain, address, ownerPV, ownerAddress) {
    super(chain, abi, address, ownerPV, ownerAddress);
  }

  // returns(address tokenManager, address smgAdminProxy, address smgFeeProxy, address quota, address sigVerifier)
  async getPartners() {
    await this.getFun(this.getPartners.name)
  }

  // returns(uint lockFee, uint revokeFee)
  async getFees(fromChainId, toChainId) {
    await this.getFun(this.getPartners.name, fromChainId, toChainId)
  }

  // htlc time uint256
  async lockedTime() {
    await this.getVar('lockedTime')
  }

  // priceOracleAddress address
  async priceOracleAddress() {
    await this.getVar('priceOracleAddress')
  }

  // depositOracleAddress address
  async depositOracleAddress() {
    await this.getVar('depositOracleAddress')
  }

  // tokenManagerAddress address
  async tokenManagerAddress() {
    await this.getVar('tokenManagerAddress')
  }

  // depositTokenSymbol string
  async depositTokenSymbol() {
    await this.getVar('depositTokenSymbol')
  }

  // isDebtClean bool
  async isDebtClean() {
    await this.getFun('isDebtClean')
  }

  // getUserMintQuota(uint tokenId, bytes32 storemanGroupId) external view returns (uint)
  async getUserMintQuota(tokenId, storemanGroupId) {
    await this.getFun('getUserMintQuota', tokenId, storemanGroupId)
  }

  // getSmgMintQuota(uint tokenId, bytes32 storemanGroupId) external view returns (uint)
  async getSmgMintQuota(tokenId, storemanGroupId) {
    await this.getFun('getSmgMintQuota', tokenId, storemanGroupId)
  }

  // getUserBurnQuota(uint tokenId, bytes32 storemanGroupId) external view returns (uint)
  async getUserBurnQuota(tokenId, storemanGroupId) {
    await this.getFun('getUserBurnQuota', tokenId, storemanGroupId)
  }
  // getSmgBurnQuota(uint tokenId, bytes32 storemanGroupId) external view returns (uint)
  async getSmgBurnQuota(tokenId, storemanGroupId) {
    await this.getFun('getSmgBurnQuota', tokenId, storemanGroupId)
  }

  // returns (uint asset, uint asset_receivable, uint asset_payable);
  async getAsset(tokenId, storemanGroupId) {
    await this.getFun('getAsset', tokenId, storemanGroupId)
  }
  // returns (uint debt, uint debt_receivable, uint debt_payable);
  async getDebt(tokenId, storemanGroupId) {
    await this.getFun('getDebt', tokenId, storemanGroupId)
  }
}

module.exports = Quota
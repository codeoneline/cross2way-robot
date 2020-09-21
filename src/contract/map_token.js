const Contract = require('./contract');
const abiMapToken = require('../../abi/abi.MappingToken.json');

class MapToken extends Contract {
  constructor(chain, address, ownerPV, ownerAddress) {
    super(chain, abiMapToken, address, ownerPV, ownerAddress);
  }

  async mint(addr, amount) {
    const data = this.contract.methods.mint(addr, amount).encodeABI();
    return await this.doOperator(this.mint.name, data, null, '0x00', this.retryTimes, this.pv_key, this.pv_address);
  }

  async burn(addr, amount) {
    const data = this.contract.methods.burn(addr, amount).encodeABI();
    return await this.doOperator(this.burn.name, data, null, '0x00', this.retryTimes, this.pv_key, this.pv_address);
  }

  async transfer(to, amount) {
    const data = this.contract.methods.transfer(to, amount).encodeABI();
    return await this.doOperator(this.transfer.name, data, null, '0x00', this.retryTimes, this.pv_key, this.pv_address);
  }

  async update(name, symbol) {
    const data = this.contract.methods.update(name, symbol).encodeABI();
    return await this.doOperator(this.update.name, data, null, '0x00', this.retryTimes, this.pv_key, this.pv_address);
  }

  async getDecimals() {
    if (!this.decimals) {
      this.decimals = parseInt(await this.core.getScVar('decimals', this.contract, this.abi));
    }
    return this.decimals;
  }
}

module.exports = MapToken;

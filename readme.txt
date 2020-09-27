检查列表
1. oracle
	比对不同链上的价格是否一致
	比对不同链上的storemanConfig是否一致
	比对proxy的owner和delegator的owner是否一致
2. tokenManager
	比对不同链上的tokenPair是否一致
	比对proxy的owner和delegator的owner是否一致
	addAdmin的event检查是否是crosssApproach
3. 比对iwan sdk 和 gwan返回的是否一致
4. crossApproach
  	getPartners  (合约地址检查)
    		address tokenManager, address smgAdminProxy, address smgFeeProxy, address quota, address sigVerifier
    		tokenManager地址、
    		smgAdminProxy - wan侧与storemanAdmin合约地址相同，ETH侧为Oracle地址
    		smgFeeProxy - wan侧与storemanAdmin合约地址相同，ETH侧为Oracle地址
    		quota地址
    		sigVerifier地址
  	getFees – 输入参数fromChainID和toChainID (校验fee)
    		校验lockFee和revokeFee
  	lockedTime() - 显示htlc时间
  	smgFeeReceiverTimeout() - 显示smgFeeReceiverTimeout时间
5. Quota
  	priceOracleAddress() - 与oracle地址校验
  	depositOracleAddress() - wan侧与storemanAdmin合约地址相同，ETH侧为Oracle地址
  	tokenManagerAddress() - 与tokenManager地址校验
  	depositTokenSymbol() - coin symbol, WAN链是"WAN"
  	isDebtClean() - 显示是否平账完成, (与oracle 中的校验对比)
	getUserMintQutota	(输出显示)
	getSmgMintQutota	(输出显示)
	getUserBurnQutota	(输出显示)
	getSmgBurnQutota	(输出显示)
	getAsset	(输出显示)
	getDebt	(输出显示)
	depositRate   

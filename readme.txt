https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH&tsyms=USD


## wan private
  CrossProxy: 0xeE7f80C3f30e04Bc770a0497705F25e6e327809D
  GpkProxy: 0x4fc1802e20d0cF66C7D828e3Ff763aee71D4DAd4
  MetricProxy: 0x238C4242Cf833CD9A9433B723348e2F5F2745625
  OracleProxy: 0xe06c056B8c0c7Ca9c4d165298dC58B13aAE8B3f1
  QuotaProxy: 0xDbfdFe93aB4D8f7259b614708DE80C6398Bf6348
  StoremanGroupProxy: 0x24D8Ae2089Cee8Bde68c59f2d957e2D881981748
  TokenManagerProxy: 0xF5DdEAC6f04f84CA3f1E6813293Bbf877772EDeB

  grp1:
    0x0000000000000000000000000000000000000000000031353937383131313430
    工作1周
  grp2:
    0x0000000000000000000000000000000000000000000031353937383138353537
    抵押一周

## eth rinkeby
tokenManagerAddr
        0x983Cf27178B48460DE70406C47AbC181fF75f8cc
smgAdminProxyAddr
        0x3a4ab052a022Cd11283BC1A5E54055D76EAE2CcC
smgFeeProxyAddr
        0x0000000000000000000000000000000000000000
quotaAddr
        0x66E032a5ca0B3f50f3528245BCBDdbD410519693
sigVerifierAddr
        0xdE829cBcef7eD3AC92336f514c2ED7dfCaF116BD
oracleAddr
        0x3a4ab052a022Cd11283BC1A5E54055D76EAE2CcC
crossApproach
        0x6c0862e58e0503F9F2331c58b99Cf512606F59F5

lockTime是1h

grp1:
0x0000000000000000000000000000000000000000000031353937383131313430
工作1周
grp2:
0x0000000000000000000000000000000000000000000031353937383138353537
抵押一周

curveId
        bn128              1
        secp256k1      0



todo:

crossApproach
  getPartners
    address tokenManager, address smgAdminProxy, address smgFeeProxy, address quota, address sigVerifier
    tokenManager地址、
    smgAdminProxy - wan侧与storemanAdmin合约地址相同，ETH侧为Oracle地址
    smgFeeProxy - wan侧与storemanAdmin合约地址相同，ETH侧为Oracle地址
    quota地址
    sigVerifier地址
  getFees - 输入参数fromChainID和toChainID
    校验lockFee和revokeFee
  lockedTime() - 显示htlc时间
  smgFeeReceiverTimeout() - 显示smgFeeReceiverTimeout时间

Quota
  priceOracleAddress() - 与oracle地址校验
  depositOracleAddress() - wan侧与storemanAdmin合约地址相同，ETH侧为Oracle地址
  tokenManagerAddress() - 与tokenManager地址校验
  depositTokenSymbol() - coin symbol, WAN链是"WAN"
  isDebtClean() - 显示是否平账完成

tokenManager
  过event校验AddAdmin配置
  过event校验addToken/pair等
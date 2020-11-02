# oracle-robot

## Prepare

node v12.18.3

.env.dev is our testnet environment file

.env.production is our mainnet environment file

## Install


```
npm i
```

## Add or Update TokenPair

Set your owner privateKey,

```
OWNER_SK_WANCHAIN=YOUR_OWNER_PRIVATE_KEY
OWNER_SK_ETHEREUM=YOUR_OWNER_PRIVATE_KEY
```

Change config in config/*.json, like

```
// for testnet 
TOKEN_PAIRS_CONFIG_FILE=../config/tokenPairsTest.json
// for mainnet
TOKEN_PAIRS_CONFIG_FILE=../config/tokenPairs.json
```

For testnet

```
npm run tokenPair_testnet
```

for mainnet

```
npm run tokenPair_production
```

## Check Deployed Contract

set your deployed fold, like

```
DEPLOYED_FOLD=./abi
DEPLOYED_FILE_WANCHAIN=testnet.json
DEPLOYED_FILE_ETHEREUM=rinkeby.json
```

Then

For testnet

```
npm run deploy_check_testnet
```

for mainnet

```
npm run deploy_check_production
```

## Start robot

Change Admin keystore and address 

```
USE_KEYSTORE=true
KEYSTORE_PARENT_FOLD=./
```
Or you can use your owner or admin private key

```
USE_KEYSTORE=false
OWNER_SK_WANCHAIN=YOUR_OWNER_PRIVATE_KEY or YOUR_ADMIN_PRIVATE_KEY
OWNER_SK_ETHEREUM=YOUR_OWNER_PRIVATE_KEY or YOUR_ADMIN_PRIVATE_KEY
```


For testnet

```
npm run robot_testnet
```

For mainnet

```
npm run robot_production
```

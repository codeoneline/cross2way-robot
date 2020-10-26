# Robot for oracle and tokenManager

## Prepare

node v12.18.3

## Install

```
npm i
```

## Check Deployed Contract

set your deployed fold and privateKey, like

```
DEPLOYED_FOLD=./abi
DEPLOYED_FILE_WANCHAIN=testnet.json
DEPLOYED_FILE_ETHEREUM=rinkeby.json
OWNER_SK_WANCHAIN=YOUR_OWNER_PRIVATE_KEY
OWNER_SK_ETHEREUM=YOUR_OWNER_PRIVATE_KEY
```

then

For testnet

```
npm run deploy_check_testnet
```

for mainnet

```
npm run deploy_check_production
```

## Add or Update TokenPair

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

## Start robot

Change set Admin private key for oracle (you can also use your owner private key)

```
OWNER_SK_WANCHAIN=YOUR_ADMIN_PRIVATE_KEY or YOUR_OWNER_PRIVATE_KEY
OWNER_SK_ETHEREUM=YOUR_ADMIN_PRIVATE_KEY or YOUR_OWNER_PRIVATE_KEY
```

For testnet

```
npm run robot_testnet
```

For mainnet

```
npm run robot_production
```
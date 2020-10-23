# Robot for oracle and tokenManager

## Prepare

node v12.18.3

## Install

```
npm i
```

## Check Deployed Contract

set your deployed fold and privateKey, then

For testnet

```
npm run deploy_check_testnet
```

for mainnet

```
npm run deploy_check_production
```

## Add or Update TokenPair

Change config in config/*.json

For testnet

```
npm run tokenPair_testnet
```

for mainnet

```
npm run tokenPair_production
```

## Start robot

For testnet

```
npm run robot_testnet
```

For mainnet

```
npm run robot_production
```
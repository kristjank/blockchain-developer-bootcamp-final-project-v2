# TITLE

## Features

-   Governance Framework for DAO - implemented with OZ governance contracts
-   Implementation of a simple AMM (constant)
    -   DAO Framework will be used to vote upon and change fees and other logic TBD

## Structure

It is a hybrid [Hardhat](https://hardhat.org/) repo that requires [Foundry](https://book.getfoundry.sh/index.html) to run Solidity tests powered by the [ds-test library](https://github.com/dapphub/ds-test/).

You can also deploy with foundry using the forge command.

> To install Foundry, please follow the instructions [here](https://book.getfoundry.sh/getting-started/installation.html).

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

---

## Foundry

### Deployment

Configure your `.env` files, based on the `.env.example`.

Run the deploy script:

` forge script scripts/foundry/deploy.s.sol:DeployContracts --rpc-url $RINKEBY_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify --etherscan-api-key $ETHERSCAN_API_KEY -vvvv`

### Testing and developing

Most of the tests are implemented using `foundry/forge`. Just run the `forge test` command. Or `forge test -vvvv` for more details`. Check foundry docs for more information.

As foundry tests are much simpler to run and maintain, there is no need for complex calls, as you can see below under Hardhat section.

Just run `forge test` - for now.

---

## Hardhat

### Deployment and local node start

0. `npm run node:local` # start local node
1. `npm run deploy:local` # deploy contracts

### Scripts simulating voting process

1. `npx hardhat run scripts/typescript/propose.ts --network localhost`
2. `npx hardhat run scripts/typescript/vote.ts --network localhost`
3. `npx hardhat run scripts/typescript/queue.ts --network localhost`
4. `npx hardhat run scripts/typescript/execute.ts --network localhost`

---

## Help on how to run hardhard and foundry cli commands

### Example of Foundry/Forge commands

```shell
forge build
forge test
forge test -vv
forge tree
```

### Example of Hardhat commands

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
npx hardhat help
REPORT_GAS=true npx hardhat test
npx hardhat coverage
npx hardhat run scripts/deploy.ts
TS_NODE_FILES=true npx ts-node scripts/deploy.ts
npx eslint '**/*.{js,ts}'
npx eslint '**/*.{js,ts}' --fix
npx prettier '**/*.{json,sol,md}' --check
npx prettier '**/*.{json,sol,md}' --write
npx solhint 'contracts/**/*.sol'
npx solhint 'contracts/**/*.sol' --fix
```

### Solidity Template

This is a template for GitHub repos with Solidity smart contracts using Forge and Hardhat. This template is used by the LooksRare team for Solidity-based repos. Feel free to use or get inspired to build your own templates!

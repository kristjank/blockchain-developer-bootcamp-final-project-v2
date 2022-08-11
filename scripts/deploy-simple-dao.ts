/* eslint-disable no-process-exit */
/* eslint-disable camelcase */
/* eslint-disable node/no-unpublished-import */
import { ethers } from "hardhat";
import { Signer } from "ethers";
import {
    Box,
    Box__factory,
    GovernanceToken,
    GovernanceToken__factory,
    GovernorContract,
    GovernorContract__factory,
    TimeLock,
    TimeLock__factory,
} from "../typechain-types";
import {
    networkConfig,
    developmentChains,
    MIN_DELAY,
    QUORUM_PERCENTAGE,
    VOTING_DELAY,
    VOTING_PERIOD,
    ADDRESS_ZERO,
} from "../helper-hardhat-config";

async function deployGovernanceToken(deployer: Signer): Promise<GovernanceToken> {
    console.log("Deploying GovernanceToken and waiting for confirmations...");

    const governanceTokenFactory = (await ethers.getContractFactory(
        "GovernanceToken",
        deployer
    )) as GovernanceToken__factory;
    const governanceTokenContract = await governanceTokenFactory.deploy();
    await governanceTokenContract.deployed();
    console.log(
        `Deployed GovernanceToken at ${governanceTokenContract.address} with trx ${governanceTokenContract.deployTransaction.hash}`
    );

    // if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    //  console.log("TODO: Not yet implemented VERIFY on ETHSCAN");
    // await verify(governanceToken.address, []);
    // }

    console.log(`Delegating to ${await deployer.getAddress()}`);
    await delegate(governanceTokenContract.address, await deployer.getAddress());
    console.log("Delegated!");

    return governanceTokenContract;
}

async function deployTimeLock(deployer: Signer): Promise<TimeLock> {
    console.log("Deploying TimeLock and waiting for confirmations...");

    const timeLockFactory = (await ethers.getContractFactory("TimeLock", deployer)) as TimeLock__factory;
    const timeLockContract = await timeLockFactory.deploy(MIN_DELAY, [], []);
    await timeLockContract.deployed();
    console.log(`Deployed TimeLock at ${timeLockContract.address} with trx ${timeLockContract.deployTransaction.hash}`);

    return timeLockContract;
}

async function deployBox(deployer: Signer): Promise<Box> {
    console.log("Deploying Box and waiting for confirmations...");

    const boxFactory = (await ethers.getContractFactory("Box", deployer)) as Box__factory;
    const boxContract = await boxFactory.deploy();
    await boxContract.deployed();
    console.log(`Deployed TimeLock at ${boxContract.address} with trx ${boxContract.deployTransaction.hash}`);

    return boxContract;
}

async function deployGovernor(deployer: Signer, governanceTokenAddress: string, timeLockAddress: string) {
    console.log("Deploying Governor and waiting for confirmations...");

    const governorFactory = (await ethers.getContractFactory(
        "GovernorContract",
        deployer
    )) as GovernorContract__factory;
    const governorContract: GovernorContract = await governorFactory.deploy(
        governanceTokenAddress,
        timeLockAddress,
        QUORUM_PERCENTAGE,
        VOTING_PERIOD,
        VOTING_DELAY
    );

    await governorContract.deployed();
    console.log(`Deployed Governor at ${governorContract.address} with trx ${governorContract.deployTransaction.hash}`);
}

async function delegate(governanceTokenAddress: string, delegatedAccount: string) {
    const governanceToken = await ethers.getContractAt("GovernanceToken", governanceTokenAddress);
    const transactionResponse = await governanceToken.delegate(delegatedAccount);
    await transactionResponse.wait(1);
    console.log(`Checkpoints: ${await governanceToken.numCheckpoints(delegatedAccount)}`);
}

async function setupContracts(deployer: Signer, governor: GovernanceToken, timeLock: TimeLock) {
    console.log("----------------------------------------------------");
    console.log("Setting up contracts for roles...");

    // TODO: setup multicall later on
    const proposerRole = await timeLock.PROPOSER_ROLE();
    const executorRole = await timeLock.EXECUTOR_ROLE();
    const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE();

    console.log(`Setting up timeLock.proposalRole role to governor at ${governor.address}`);
    const proposerTx = await timeLock.grantRole(proposerRole, governor.address);
    await proposerTx.wait(1);

    console.log(`Setting up timeLock.executorRole role to ADDRESS_ZERO (meaning anyone can execute a proposal)...`);
    const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO);
    await executorTx.wait(1);

    console.log("Revoking timelock.ADMIN_ROLE for deployer");
    const revokeTx = await timeLock.revokeRole(adminRole, await deployer.getAddress());
    await revokeTx.wait(1);
}

async function getContractSigner(): Promise<Signer> {
    const [deployer] = await ethers.getSigners();
    console.log("----------------------------------------------------");
    console.log("Deploying the contracts with the account:", await deployer.getAddress());
    return deployer;
}

async function main() {
    const deployer = await getContractSigner();
    // deployment
    const governanceToken = await deployGovernanceToken(deployer);
    const timeLock = await deployTimeLock(deployer);
    await deployBox(deployer);
    await deployGovernor(deployer, governanceToken.address, timeLock.address);

    await setupContracts(deployer, governanceToken, timeLock);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

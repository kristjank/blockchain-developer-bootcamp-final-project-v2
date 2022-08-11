/* eslint-disable no-process-exit */
/* eslint-disable camelcase */
/* eslint-disable node/no-unpublished-import */
import { ethers } from "hardhat";
import {
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
} from "../helper-hardhat-config";

async function deployGovernanceToken(): Promise<GovernanceToken> {
    const [deployer] = await ethers.getSigners();
    console.log("----------------------------------------------------");
    console.log("Deploying the contracts with the account:", await deployer.getAddress());
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

    console.log(`Delegating to ${deployer.address}`);
    await delegate(governanceTokenContract.address, deployer.address);
    console.log("Delegated!");

    return governanceTokenContract;
}

async function deployTimeLock(): Promise<TimeLock> {
    const [deployer] = await ethers.getSigners();
    console.log("----------------------------------------------------");
    console.log("Deploying the contracts with the account:", await deployer.getAddress());
    console.log("Deploying TimeLock and waiting for confirmations...");

    const timeLockFactory = (await ethers.getContractFactory("TimeLock", deployer)) as TimeLock__factory;
    const timeLockContract = await timeLockFactory.deploy(MIN_DELAY, [], []);
    await timeLockContract.deployed();
    console.log(`Deployed TimeLock at ${timeLockContract.address} with trx ${timeLockContract.deployTransaction.hash}`);

    return timeLockContract;
}

async function deployGovernor(governanceTokenAddress: string, timeLockAddress: string) {
    const [deployer] = await ethers.getSigners();
    console.log("----------------------------------------------------");
    console.log("Deploying the contracts with the account:", await deployer.getAddress());
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

const delegate = async (governanceTokenAddress: string, delegatedAccount: string) => {
    const governanceToken = await ethers.getContractAt("GovernanceToken", governanceTokenAddress);
    const transactionResponse = await governanceToken.delegate(delegatedAccount);
    await transactionResponse.wait(1);
    console.log(`Checkpoints: ${await governanceToken.numCheckpoints(delegatedAccount)}`);
};

async function main() {
    // deployment
    const governanceToken = await deployGovernanceToken();
    const timeLock = await deployTimeLock();
    await deployGovernor(governanceToken.address, timeLock.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

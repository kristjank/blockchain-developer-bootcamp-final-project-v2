/* eslint-disable no-process-exit */
/* eslint-disable camelcase */
/* eslint-disable node/no-unpublished-import */
import { ethers, network } from "hardhat";
import { Box, GovernanceToken, GovernorContract, TimeLock } from "../../typechain-types";
import {
    networkConfig,
    developmentChains,
    MIN_DELAY,
    QUORUM_PERCENTAGE,
    VOTING_DELAY,
    VOTING_PERIOD,
    ADDRESS_ZERO,
} from "../../helper-hardhat-config";
import { getContractSigner, deployContract, deployData, getDeployedContract } from "../../utils/deploy-helpers";
import { Signer } from "ethers";

async function delegate(governanceTokenAddress: string, delegatedAccount: string) {
    console.log(`Delegating to ${delegatedAccount}`);
    const governanceToken = await getDeployedContract("GovernanceToken");
    const transactionResponse = await governanceToken.delegate(delegatedAccount);
    await transactionResponse.wait(1);
    console.log(`Checkpoints: ${await governanceToken.numCheckpoints(delegatedAccount)}`);
}

async function setupContracts(deployer: Signer, governor: GovernorContract, timeLock: TimeLock, box: Box) {
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
    const executorTx = await timeLock.grantRole(executorRole, ethers.constants.AddressZero);
    await executorTx.wait(1);

    console.log("Revoking timelock.ADMIN_ROLE for deployer");
    const revokeTx = await timeLock.revokeRole(adminRole, await deployer.getAddress());
    await revokeTx.wait(1);

    console.log("Transfer Box ownership to Timelock contract for automation! (queue and execute)");
    const transferTx = await box.transferOwnership(timeLock.address);
    await transferTx.wait(1);
}

export async function deployContractsAndSetupGovernanceRoles() {
    const deployer = await getContractSigner();
    // deployment
    const governanceToken = (await deployContract(deployer, "GovernanceToken")) as GovernanceToken;
    await delegate(governanceToken.address, await deployer.getAddress());

    const timeLock = (await deployContract(deployer, "TimeLock", [MIN_DELAY, [], []])) as TimeLock;
    const governor = (await deployContract(deployer, "GovernorContract", [
        governanceToken.address,
        timeLock.address,
        QUORUM_PERCENTAGE,
        VOTING_PERIOD,
        VOTING_DELAY,
    ])) as GovernorContract;

    const box = (await deployContract(deployer, "Box")) as Box;
    // setup governanco for DAO and correct access
    await setupContracts(deployer, governor, timeLock, box);
}

deployContractsAndSetupGovernanceRoles()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

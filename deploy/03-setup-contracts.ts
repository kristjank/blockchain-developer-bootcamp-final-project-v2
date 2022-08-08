/* eslint-disable node/no-unpublished-import */

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ADDRESS_ZERO } from "../helper-hardhat-config";
// @ts-ignore
import { ethers } from "hardhat";

const setupContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre;
  const { log } = deployments;
  const { deployer } = await getNamedAccounts();

  const timeLock = await ethers.getContract("TimeLock", deployer);
  const governor = await ethers.getContract("GovernorContract", deployer);

  log("----------------------------------------------------");
  log("Setting up contracts for roles...");

  // TODO: setup multicall
  const proposerRole = await timeLock.PROPOSER_ROLE();
  const executorRole = await timeLock.EXECUTOR_ROLE();
  const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE();

  log(`Setting up timeLock.proposalRole role to governor at ${governor.address}`);
  const proposerTx = await timeLock.grantRole(proposerRole, governor.address);
  await proposerTx.wait(1);

  log(`Setting up timeLock.executorRole role to ADDRESS_ZERO (meaning anyone can execute a proposal)...`);
  const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO);
  await executorTx.wait(1);

  log("Revoking timelock.ADMIN_ROLE for deployer");
  const revokeTx = await timeLock.revokeRole(adminRole, deployer);
  await revokeTx.wait(1);
};

export default setupContracts;

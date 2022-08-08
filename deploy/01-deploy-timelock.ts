/* eslint-disable node/no-unpublished-import */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { networkConfig, developmentChains, MIN_DELAY } from "../helper-hardhat-config";
// @ts-ignore
import { ethers } from "hardhat";
// import verify from "../helper-functions";

const deployTimeLock: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("----------------------------------------------------");
  log("Deploying TimeLock and waiting for confirmations...");
  const timeLock = await deploy("TimeLock", {
    from: deployer,
    args: [MIN_DELAY, [], []],
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  });

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    console.log("TODO: Not yet implemented VERIFY on ETHSCAN");
    // await verify(governanceToken.address, []);
  }
};

export default deployTimeLock;

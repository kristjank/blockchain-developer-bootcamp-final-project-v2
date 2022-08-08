/* eslint-disable node/no-unpublished-import */

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
// @ts-ignore
import { ethers } from "hardhat";
import { developmentChains, networkConfig } from "../helper-hardhat-config";

const deployBox: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore

  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();

  log("----------------------------------------------------");
  log("Deploying Box and waiting for confirmations...");
  const box = await deploy("Box", {
    from: deployer,
    args: [],
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  });

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    console.log("TODO: Not yet implemented VERIFY on ETHSCAN");
    // await verify(governanceToken.address, []);
  }

  const boxContract = await ethers.getContractAt("Box", box.address);
  const timeLock = await ethers.getContract("TimeLock");

  // we move ownership of Box contract to TimeLock, as it will run execute on proposals
  const transferTx = await boxContract.transferOwnership(timeLock.address);
  await transferTx.wait(1);
};

export default deployBox;

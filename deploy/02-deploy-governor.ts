/* eslint-disable node/no-unpublished-import */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {
    networkConfig,
    developmentChains,
    QUORUM_PERCENTAGE,
    VOTING_PERIOD,
    VOTING_DELAY,
} from "../helper-hardhat-config";
// @ts-ignore
import { ethers } from "hardhat";
// import verify from "../helper-functions";

const deployGovernor: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { getNamedAccounts, deployments, network } = hre;
    const { deploy, log, get } = deployments;
    const { deployer } = await getNamedAccounts();

    const governanceToken = await get("GovernanceToken");
    const timeLock = await get("TimeLock");

    log("----------------------------------------------------");
    log("Deploying GovernorContract and waiting for confirmations...");
    const governor = await deploy("GovernorContract", {
        from: deployer,
        args: [governanceToken.address, timeLock.address, QUORUM_PERCENTAGE, VOTING_PERIOD, VOTING_DELAY],
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
    });

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        console.log("TODO: Not yet implemented VERIFY on ETHSCAN");
        // await verify(governanceToken.address, []);
    }
};

export default deployGovernor;

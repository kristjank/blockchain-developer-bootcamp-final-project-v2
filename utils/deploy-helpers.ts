/* eslint-disable no-process-exit */
/* eslint-disable camelcase */
/* eslint-disable node/no-unpublished-import */
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

interface IContractData {
    contract: string;
    address: string;
    deployTx: string;
}

export const deployData: { [name: string]: IContractData } = {};

export async function getContractSigner(): Promise<Signer> {
    const [deployer] = await ethers.getSigners();

    return deployer;
}

// saving contract info for use in scripts
function saveContractInfo(contractName: string, data: Contract): void {
    const contractData: IContractData = {
        contract: contractName,
        address: data.address,
        deployTx: data.deployTransaction.hash,
    };

    deployData[contractName] = contractData;
}

export async function deployContract(
    deployer: Signer,
    contractName: string,
    constructorArguments: unknown[]
): Promise<Contract> {
    console.log("--------------------------------------------------");
    console.log(`Deploying ${contractName} with account ${await deployer.getAddress()}, waiting for confirmations...`);

    const contractFactory = await ethers.getContractFactory(contractName, deployer);
    const contractToDeploy = await contractFactory.deploy(...constructorArguments);
    await contractToDeploy.deployed();
    console.log(
        `Deployed ${contractName} at ${contractToDeploy.address} with trx ${contractToDeploy.deployTransaction.hash}`
    );

    // if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    //  console.log("TODO: Not yet implemented VERIFY on ETHSCAN");
    // await verify(governanceToken.address, []);
    // }

    saveContractInfo(contractName, contractToDeploy);
    return contractToDeploy;
}

export async function getDeployedContract(contractName: string): Promise<Contract> {
    const contractAddress = deployData[contractName].address;
    return await ethers.getContractAt(contractName, contractAddress);
}

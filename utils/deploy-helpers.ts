/* eslint-disable no-process-exit */
/* eslint-disable camelcase */
/* eslint-disable node/no-unpublished-import */
import { ethers, network, run } from "hardhat";
import { Contract, Signer } from "ethers";
import * as fs from "fs";

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
async function saveContractInfo(contractName: string, data: Contract): Promise<void> {
    const contractData: IContractData = {
        contract: contractName,
        address: data.address.toLowerCase(),
        deployTx: data.deployTransaction.hash.toLowerCase(),
    };

    deployData[contractName] = contractData;

    fs.mkdirSync(`deployments/${network.name}`, { recursive: true });
    fs.writeFileSync(`deployments/${network.name}/${contractName}.json`, JSON.stringify(contractData, null, 4));
    fs.writeFileSync(`deployments/${network.name}/deployments.json`, JSON.stringify(deployData, null, 4));
}

export async function deployContract(
    deployer: Signer,
    contractName: string,
    constructorArguments?: unknown[]
): Promise<Contract> {
    console.log("--------------------------------------------------");
    console.log(`Deploying ${contractName} with account ${await deployer.getAddress()}, waiting for confirmations...`);

    let contractArgs: unknown[] = [];
    if (typeof constructorArguments !== "undefined") {
        contractArgs = constructorArguments;
    }

    const contractFactory = await ethers.getContractFactory(contractName, deployer);
    const contractToDeploy = await contractFactory.deploy(...contractArgs);
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

export async function getDeployedContract(contractName: string, signer?: Signer): Promise<Contract> {
    if (!deployData[contractName]) {
        const fileContent = fs.readFileSync(`deployments/${network.name}/${contractName}.json`, "utf8");
        const contractInfo: IContractData = JSON.parse(fileContent);

        deployData[contractName] = contractInfo;
    }

    return await ethers.getContractAt(contractName, deployData[contractName].address, signer);
}

export async function verify(contractAddress: string, args: unknown[]): Promise<void> {
    console.log("Verifying contract...");
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        });
    } catch (e) {
        if ((e as Error).message.toLowerCase().includes("already verified")) {
            console.log("Already verified!");
        } else {
            console.log(e);
        }
    }
}

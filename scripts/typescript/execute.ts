/* eslint-disable node/no-unpublished-import */
/* eslint-disable no-process-exit */
import { ethers, network } from "hardhat";
import * as helpers from "@nomicfoundation/hardhat-network-helpers";
import {
    FUNC,
    NEW_STORE_VALUE,
    PROPOSAL_DESCRIPTION,
    MIN_DELAY,
    developmentChains,
    proposalsFile,
    PROPOSAL_INDEX,
} from "../../helper-hardhat-config";
import * as fs from "fs";
import { getDeployedContract } from "../../utils/deploy-helpers";

const index = PROPOSAL_INDEX;

export async function execute(proposalIndex: number): Promise<void> {
    const args = [NEW_STORE_VALUE];
    const functionToCall = FUNC;
    const box = await getDeployedContract("Box");
    const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args);
    const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION));
    // could also use ethers.utils.id(PROPOSAL_DESCRIPTION)

    if (developmentChains.includes(network.name)) {
        await helpers.time.increase(MIN_DELAY + 1);
    }

    console.log("Executing...");
    const governor = await getDeployedContract("GovernorContract");
    // this will fail on a testnet because you need to wait for the MIN_DELAY!
    const executeTx = await governor.execute([box.address], [0], [encodedFunctionCall], descriptionHash);
    await executeTx.wait(1);
    console.log(`Box value: ${await box.retrieve()}`);

    // Reading data
    const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
    // You could swap this out for the ID you want to use too
    const proposalId = proposals[network.config.chainId!][proposalIndex];
    const proposalState = await governor.state(proposalId);
    const proposalSnapShot = await governor.proposalSnapshot(proposalId);
    const proposalDeadline = await governor.proposalDeadline(proposalId);

    // The state of the proposal. 1 is not passed. 0 is passed.
    console.log(`Current Proposal State: ${proposalState}`);
    // What block # the proposal was snapshot
    console.log(`Current Proposal Snapshot: ${proposalSnapShot}`);
    // The block number the proposal voting expires
    console.log(`Current Proposal Deadline: ${proposalDeadline}`);
}

execute(index)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

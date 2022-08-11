/* eslint-disable node/no-unpublished-import */
/* eslint-disable no-process-exit */
import { ethers, network } from "hardhat";
import { proposalsFile, PROPOSAL_INDEX } from "../helper-hardhat-config";
import * as fs from "fs";

const index = PROPOSAL_INDEX;

export async function query(proposalIndex: number) {
    console.log("Querying...");
    const governor = await ethers.getContract("GovernorContract");

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

query(index)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

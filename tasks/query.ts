/* eslint-disable node/no-unpublished-import */
import { task } from "hardhat/config";

import { proposalsFile } from "../helper-hardhat-config";
import * as fs from "fs";

task("query", "Query Proposal State")
    .addParam("proposalIndex", "Proposal index from proposals.json")
    .setAction(async (_args, hre) => {
        /* const governor = await hre.ethers.getContract("GovernorContract");
    console.log("Querying..");

    // Reading data
    const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
    // You could swap this out for the ID you want to use too
    const proposalId = proposals[hre.network.config.chainId!][_args.proposalIndex];
    const proposalState = await governor.state(proposalId);
    const proposalSnapShot = await governor.proposalSnapshot(proposalId);
    const proposalDeadline = await governor.proposalDeadline(proposalId);

    // The state of the proposal. 1 is not passed. 0 is passed.
    console.log(`Current Proposal State: ${proposalState}`);
    // What block # the proposal was snapshot
    console.log(`Current Proposal Snapshot: ${proposalSnapShot}`);
    // The block number the proposal voting expires
    console.log(`Current Proposal Deadline: ${proposalDeadline}`); */
    });

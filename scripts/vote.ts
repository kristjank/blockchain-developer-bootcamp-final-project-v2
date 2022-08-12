/* eslint-disable no-process-exit */
import * as fs from "fs";
// eslint-disable-next-line node/no-unpublished-import
import { network, ethers } from "hardhat";
import { proposalsFile, developmentChains, VOTING_PERIOD, PROPOSAL_INDEX } from "../helper-hardhat-config";
import { getDeployedContract } from "../utils/deploy-helpers";
import { moveBlocks } from "../utils/move-blocks";

const index = PROPOSAL_INDEX;

async function main(proposalIndex: number) {
    const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
    // You could swap this out for the ID you want to use too
    const proposalId = proposals[network.config.chainId!][proposalIndex];
    // 0 = Against, 1 = For, 2 = Abstain for this example
    const voteWay = 1;
    const reason = "I vote for 77";
    await vote(proposalId, voteWay, reason);
}

// 0 = Against, 1 = For, 2 = Abstain for this example
export async function vote(proposalId: string, voteWay: number, reason: string): Promise<void> {
    console.log("Voting...");
    const governor = await getDeployedContract("GovernorContract");
    const voteTx = await governor.castVoteWithReason(proposalId, voteWay, reason);
    const voteTxReceipt = await voteTx.wait(1);
    console.log(voteTxReceipt.events[0].args.reason);
    const proposalState = await governor.state(proposalId);
    console.log(`Current Proposal State: ${proposalState}`);
    if (developmentChains.includes(network.name)) {
        await moveBlocks(VOTING_PERIOD + 1);
    }
}

main(index)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

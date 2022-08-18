import { expect } from "chai";
import { Box, GovernanceToken, GovernorContract, TimeLock } from "../../typechain-types";
import { getDeployedContract } from "../../utils/deploy-helpers";
import { deployContractsAndSetupGovernanceRoles } from "../../scripts/deploy-simple-dao";

describe("voteflow", async () => {
    let governor: GovernorContract;
    let governanceToken: GovernanceToken;
    let timeLock: TimeLock;
    let box: Box;
    const voteWay = 1; // for
    const reason = "I support this proposal";

    before(async () => {
        await deployContractsAndSetupGovernanceRoles();
        governor = (await getDeployedContract("GovernorContract")) as GovernorContract;
        timeLock = (await getDeployedContract("TimeLock")) as TimeLock;
        governanceToken = (await getDeployedContract("GovernorToken")) as GovernanceToken;
        box = (await getDeployedContract("Box")) as Box;
    });

    it("can only be changed through governance", async () => {
        await expect(box.store(55)).to.be.revertedWith("Ownable: caller is not the owner");
    });
});

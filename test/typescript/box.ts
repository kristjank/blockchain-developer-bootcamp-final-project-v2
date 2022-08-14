import { expect } from "chai";
import { Box } from "../../typechain-types";
import { deployContract, getContractSigner } from "../../utils/deploy-helpers";

describe("Box", () => {
    it("Should deploy the new Box ", async function () {
        const deployer = await getContractSigner();

        const boxContract = (await deployContract(deployer, "Box")) as Box;
        boxContract.store("22");

        expect(await boxContract.retrieve()).to.equal("22");
    });
});

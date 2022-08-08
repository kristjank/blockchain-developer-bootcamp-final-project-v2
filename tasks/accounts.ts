/* eslint-disable node/no-unpublished-import */
import { task } from "hardhat/config";

task("accounts", "Prints the list of accounts", async (_args, hre) => {
  // @ts-ignore
  const accounts = await hre.ethers.getSigners();
  accounts.forEach(async (account) => console.info(account.address));
});

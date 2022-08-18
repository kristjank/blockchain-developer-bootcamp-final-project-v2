import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-network-helpers";
import "@nomicfoundation/hardhat-chai-matchers";
import "hardhat-abi-exporter";
import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";

import "./tasks/accounts";
import "./tasks/query";

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL || "https://eth-rinkeby.alchemyapi.io/v2/your-api-key";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "privateKey";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "etherscankey";

const config: HardhatUserConfig = {
    networks: {
        hardhat: {
            // used when run with tests
            chainId: 31337,
            allowUnlimitedContractSize: true,
            gasPrice: "auto",
        },
        localhost: {
            // user when run with node and deploy
            chainId: 31337,
            allowUnlimitedContractSize: true,
            gasPrice: "auto",
        },
        rinkeby: {
            url: RINKEBY_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 4,
            gasPrice: "auto",
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    solidity: {
        compilers: [
            {
                version: "0.8.14",
                settings: { optimizer: { enabled: true, runs: 888888 } },
            },
        ],
    },
    paths: {
        sources: "./contracts/",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts",
    },
    abiExporter: {
        path: "./abis",
        runOnCompile: true,
        clear: true,
        flat: true,
        pretty: false,
        except: ["test*"],
    },
    gasReporter: {
        enabled: !!process.env.REPORT_GAS,
        currency: "USD",
        outputFile: "gas-report.txt",
        excludeContracts: ["test*"],
    },
};

export default config;

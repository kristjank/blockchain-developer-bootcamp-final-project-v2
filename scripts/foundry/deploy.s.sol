// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "../../lib/forge-std/src/Script.sol";
import {console} from "../../lib/forge-std/src/console.sol";

import {Box} from "../../contracts/Box.sol";
import {GovernanceToken} from "../../contracts/GovernanceToken.sol";
import {TimeLock} from "../../contracts/TimeLock.sol";
import {GovernorContract} from "../../contracts/GovernorContract.sol";

abstract contract DeployParameters {
    uint256 internal _INITIAL_VALUE = 22;

    // Governor Values
    uint256 internal _QUORUM_PERCENTAGE = 75; // Need XX% of voters to pass
    uint256 internal _MIN_DELAY = 3600; // 1 hour - after a vote passes, you have 1 hour before you can enact
    // int256   VOTING_PERIOD = 45818 // 1 week - how long the vote lasts. This is pretty long even for local tests
    uint256 internal _VOTING_PERIOD = 5; // blocks
    uint256 internal _VOTING_DELAY = 1; // 1 Block - How many blocks till a proposal vote becomes active

    Box public box;
    GovernorContract public governor;
    TimeLock public timeLock;
    GovernanceToken public governanceToken;
    address[] public proposers;
    address[] public executors;
}

contract DeployContracts is Script, DeployParameters {
    function run() external {
        vm.startBroadcast();

        box = new Box();
        // deploy and split governance token
        governanceToken = new GovernanceToken();
        governanceToken.delegate(msg.sender);

        timeLock = new TimeLock(_MIN_DELAY, proposers, executors);
        governor = new GovernorContract(governanceToken, timeLock, _QUORUM_PERCENTAGE, _VOTING_PERIOD, _VOTING_DELAY);

        //setup governance roles
        timeLock.grantRole(timeLock.PROPOSER_ROLE(), address(governor));
        timeLock.grantRole(timeLock.EXECUTOR_ROLE(), address(0));
        timeLock.revokeRole(timeLock.TIMELOCK_ADMIN_ROLE(), msg.sender);
        box.transferOwnership(address(timeLock));

        vm.stopBroadcast();
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test} from "../../lib/forge-std/src/Test.sol";
import {console} from "../../lib/forge-std/src/console.sol";

import {Box} from "../../contracts/Box.sol";
import {GovernanceToken} from "../../contracts/GovernanceToken.sol";
import {TimeLock} from "../../contracts/TimeLock.sol";
import {GovernorContract} from "../../contracts/GovernorContract.sol";
import {Utils} from "./Utils.sol";

abstract contract TestParameters is Test {
    uint256 internal _INITIAL_VALUE = 22;

    // Governor Values
    uint256 _QUORUM_PERCENTAGE = 4; // Need 4% of voters to pass
    uint256 _MIN_DELAY = 3600; // 1 hour - after a vote passes, you have 1 hour before you can enact
    // int256   VOTING_PERIOD = 45818 // 1 week - how long the vote lasts. This is pretty long even for local tests
    uint256 _VOTING_PERIOD = 5; // blocks
    uint256 _VOTING_DELAY = 1; // 1 Block - How many blocks till a proposal vote becomes active
    string _ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

    uint256 _NEW_STORE_VALUE = 71;
    string _FUNC_NAME = "store";
    string _PROPOSAL_DESCRIPTION = "Proposal #1 77 in the Box!";
    uint256 _PROPOSAL_INDEX = 0;

    Utils internal utils;
    address payable[] internal users;

    address internal alice;
    address internal bob;

    modifier asPrankedUser(address user) {
        vm.startPrank(user);
        _;
        vm.stopPrank();
    }

    function setUp() public virtual {
        utils = new Utils();
        users = utils.createUsers(5);

        alice = users[0];
        vm.label(alice, "Alice");
        bob = users[1];
        vm.label(bob, "Bob");
    }
}

contract VoteFlowTest is TestParameters {
    Box public box;
    GovernorContract public governor;
    TimeLock public timeLock;
    GovernanceToken public governanceToken;
    address[] public proposers;
    address[] public executors;
    address[] public contracts;
    uint256[] public values;
    bytes[] public functionCalls;

    function setUp() public virtual override asPrankedUser(alice) {
        TestParameters.setUp();
        box = new Box();
        governanceToken = new GovernanceToken();
        governanceToken.delegate(alice);

        contracts.push(address(box));

        values.push(0);
        functionCalls.push(abi.encodeWithSignature("store(uint256)", 33));

        timeLock = new TimeLock(_MIN_DELAY, proposers, executors);
        governor = new GovernorContract(governanceToken, timeLock, _QUORUM_PERCENTAGE, _VOTING_PERIOD, _VOTING_DELAY);

        //
        timeLock.grantRole(timeLock.PROPOSER_ROLE(), address(governor));
        timeLock.grantRole(timeLock.EXECUTOR_ROLE(), address(0));
        timeLock.revokeRole(timeLock.TIMELOCK_ADMIN_ROLE(), alice);
        box.transferOwnership(address(timeLock));
    }

    function testPropose() public asPrankedUser(alice) {
        //box.store(22);
        console.log(address(box));
        governor.propose(contracts, values, functionCalls, _PROPOSAL_DESCRIPTION);
        vm.roll(_VOTING_DELAY + 1);

        assertEq(box.retrieve(), 33);
    }
}

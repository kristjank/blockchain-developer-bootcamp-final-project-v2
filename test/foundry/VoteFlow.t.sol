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
    uint256 internal _QUORUM_PERCENTAGE = 75; // Need XX% of voters to pass
    uint256 internal _MIN_DELAY = 3600; // 1 hour - after a vote passes, you have 1 hour before you can enact
    // int256   VOTING_PERIOD = 45818 // 1 week - how long the vote lasts. This is pretty long even for local tests
    uint256 internal _VOTING_PERIOD = 5; // blocks
    uint256 internal _VOTING_DELAY = 1; // 1 Block - How many blocks till a proposal vote becomes active

    Utils internal utils;
    address payable[] internal users;

    address internal alice;
    address internal bob;
    address internal rik;
    address internal morty;

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
        rik = users[2];
        vm.label(rik, "Rik");
        morty = users[3];
        vm.label(morty, "Morty");
    }
}

contract VoteFlowTest is TestParameters {
    Box public box;
    GovernorContract public governor;
    TimeLock public timeLock;
    GovernanceToken public governanceToken;
    address[] public proposers;
    address[] public executors;

    constructor() public {
        TestParameters.setUp();
    }

    function setUp() public virtual override {
        vm.startPrank(alice);

        box = new Box();
        // deploy and split governance token
        governanceToken = new GovernanceToken();
        governanceToken.transfer(bob, 250_000 ether);
        governanceToken.transfer(rik, 250_000 ether);
        governanceToken.transfer(morty, 250_000 ether);

        timeLock = new TimeLock(_MIN_DELAY, proposers, executors);
        governor = new GovernorContract(governanceToken, timeLock, _QUORUM_PERCENTAGE, _VOTING_PERIOD, _VOTING_DELAY);

        //setup governance roles
        timeLock.grantRole(timeLock.PROPOSER_ROLE(), address(governor));
        timeLock.grantRole(timeLock.EXECUTOR_ROLE(), address(0));
        timeLock.revokeRole(timeLock.TIMELOCK_ADMIN_ROLE(), alice);
        box.transferOwnership(address(timeLock));
        vm.stopPrank();

        delegateVotes(alice);
        delegateVotes(bob);
        delegateVotes(rik);
        delegateVotes(morty);

        // move 1 block forward, if not, testPropose fails! so snapshot and state gets settled
        utils.mineBlocks(1);
    }

    function testBoxOwnable() public asPrankedUser(address(timeLock)) {
        box.store(22);
        assertEq(box.retrieve(), 22);
    }

    function testProposalAccepted() public {
        // proposal creation
        address[] memory targets = new address[](1);
        uint256[] memory values = new uint256[](1);
        bytes[] memory calldatas = new bytes[](1);
        string memory description;

        targets[0] = address(box);
        values[0] = uint256(0);
        calldatas[0] = abi.encodeWithSignature("store(uint256)", 33);
        description = "A pro proposal!";

        uint256 proposalId = governor.propose(targets, values, calldatas, description);
        utils.mineBlocks(_VOTING_DELAY + 1);

        genericVote(alice, proposalId, 1, "ok, I agree");
        genericVote(bob, proposalId, 1, "sure");
        genericVote(rik, proposalId, 0, "ahm no way");
        genericVote(morty, proposalId, 1, "well ok, my mom agrees");

        // voting is done, lets finish the vote period
        utils.mineBlocks(_VOTING_PERIOD + 1);

        // queueing vote, anyone can queue and execute
        uint256 xxxId1 = governor.queue(targets, values, calldatas, keccak256(bytes(description)));
        utils.mineBlocks(1);
        utils.moveTime(_MIN_DELAY + 1);

        // executing vote
        uint256 xxxId2 = governor.execute(targets, values, calldatas, keccak256(bytes(description)));
        utils.mineBlocks(1);

        // let's check is the vote was executed - call data store on the box contract
        assertEq(box.retrieve(), 33);
    }

    function testFailedProposal() public {
        // proposal creation
        address[] memory targets = new address[](1);
        uint256[] memory values = new uint256[](1);
        bytes[] memory calldatas = new bytes[](1);
        string memory description;

        targets[0] = address(box);
        values[0] = uint256(0);
        calldatas[0] = abi.encodeWithSignature("store(uint256)", 33);
        description = "A pro proposal!";

        uint256 proposalId = governor.propose(targets, values, calldatas, description);
        utils.mineBlocks(_VOTING_DELAY + 1);

        genericVote(alice, proposalId, 1, "ok, I agree");
        genericVote(bob, proposalId, 0, "nonono");
        genericVote(rik, proposalId, 0, "nonono");
        genericVote(morty, proposalId, 1, "nonono");

        // voting is done, lets finish the vote period
        utils.mineBlocks(_VOTING_PERIOD + 1);

        // queueing vote, anyone can queue and execute
        uint256 xxxId1 = governor.queue(targets, values, calldatas, keccak256(bytes(description)));
        utils.mineBlocks(1);
        utils.moveTime(_MIN_DELAY + 1);

        // executing vote
        uint256 xxxId2 = governor.execute(targets, values, calldatas, keccak256(bytes(description)));
        utils.mineBlocks(1);

        // let's check is the vote was executed - call data store on the box contract
        assertEq(box.retrieve(), 22);
    }

    function genericVote(
        address voter,
        uint256 proposalId,
        uint8 support,
        string memory reason
    ) internal returns (uint256) {
        vm.startPrank(voter);
        uint256 voteWeight = governor.castVoteWithReason(proposalId, support, reason);
        vm.stopPrank();
        return voteWeight;
    }

    function delegateVotes(address voter) internal {
        vm.startPrank(voter);
        governanceToken.delegate(voter);
        vm.stopPrank();
    }
}

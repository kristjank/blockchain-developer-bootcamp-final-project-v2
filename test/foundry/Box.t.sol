// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test} from "../../lib/forge-std/src/Test.sol";

import {Box} from "../../contracts/Box.sol";

abstract contract TestParameters is Test {
    int256 internal _INITIAL_VALUE = 22;
}

contract BoxTest is TestParameters {
    Box public box;

    function setUp() public {
        box = new Box();
    }

    function testStore() public {
        box.store(22);
        assertEq(box.retrieve(), 22);
    }

    function testNewValue() public {
        box.store(23);
        assertEq(box.retrieve(), 23);
    }
}

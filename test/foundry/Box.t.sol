// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Box} from "../../contracts/Box.sol";
import {TestHelpers} from "./TestHelpers.sol";

abstract contract TestParameters {
    int256 internal _INITIAL_VALUE = 22;
}

contract BoxTest is TestParameters, TestHelpers {
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

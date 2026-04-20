// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {CheckIn} from "../src/CheckIn.sol";

contract CheckInTest is Test {
    event CheckedIn(address indexed user, uint256 indexed dayIndex, uint256 streak);

    CheckIn public c;

    address alice = address(0xA11CE);

    function setUp() public {
        c = new CheckIn();
    }

    function test_RevertWhen_ValueSent() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        vm.expectRevert(CheckIn.ValueNotZero.selector);
        c.checkIn{value: 1 wei}();
    }

    function test_FirstCheckIn_SetsStreakOne() public {
        uint256 day = block.timestamp / 1 days;
        vm.prank(alice);
        vm.expectEmit(true, true, true, true);
        emit CheckedIn(alice, day, 1);
        c.checkIn();

        assertEq(c.lastCheckInDay(alice), day);
        assertEq(c.streakOf(alice), 1);
    }

    function test_RevertWhen_DoubleSameDay() public {
        vm.startPrank(alice);
        c.checkIn();
        vm.expectRevert(CheckIn.AlreadyCheckedInToday.selector);
        c.checkIn();
        vm.stopPrank();
    }

    function test_StreakIncrementsOnConsecutiveDays() public {
        vm.prank(alice);
        c.checkIn();

        vm.warp(block.timestamp + 1 days);
        uint256 day2 = block.timestamp / 1 days;

        vm.prank(alice);
        vm.expectEmit(true, true, true, true);
        emit CheckedIn(alice, day2, 2);
        c.checkIn();

        assertEq(c.streakOf(alice), 2);
    }

    function test_StreakResetsAfterGap() public {
        vm.prank(alice);
        c.checkIn();

        vm.warp(block.timestamp + 2 days);
        uint256 day3 = block.timestamp / 1 days;

        vm.prank(alice);
        vm.expectEmit(true, true, true, true);
        emit CheckedIn(alice, day3, 1);
        c.checkIn();

        assertEq(c.streakOf(alice), 1);
    }
}

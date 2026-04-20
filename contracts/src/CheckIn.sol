// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Daily check-in on Base. Users pay only gas; `msg.value` is rejected.
/// @dev `lastCheckInEncoded` stores `calendarDayIndex + 1` so `0` always means "never checked in".
contract CheckIn {
    uint256 public constant CHECK_IN_FEE = 0;

    error ValueNotZero();
    error AlreadyCheckedInToday();

    event CheckedIn(address indexed user, uint256 indexed dayIndex, uint256 streak);

    mapping(address => uint256) private lastCheckInEncoded;
    mapping(address => uint256) public streakOf;

    function lastCheckInDay(address user) public view returns (uint256 dayIndex) {
        uint256 enc = lastCheckInEncoded[user];
        return enc == 0 ? 0 : enc - 1;
    }

    function currentDayIndex() public view returns (uint256) {
        return block.timestamp / 1 days;
    }

    function checkIn() external payable {
        if (msg.value != 0) revert ValueNotZero();

        uint256 today = currentDayIndex();
        uint256 enc = lastCheckInEncoded[msg.sender];
        uint256 last = enc == 0 ? type(uint256).max : enc - 1;

        if (last != type(uint256).max && last == today) revert AlreadyCheckedInToday();

        uint256 streak_;
        if (last == type(uint256).max) {
            streak_ = 1;
        } else if (last == today - 1) {
            streak_ = streakOf[msg.sender] + 1;
        } else {
            streak_ = 1;
        }

        lastCheckInEncoded[msg.sender] = today + 1;
        streakOf[msg.sender] = streak_;

        emit CheckedIn(msg.sender, today, streak_);
    }
}

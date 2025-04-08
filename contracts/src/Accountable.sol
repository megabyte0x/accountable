// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Accountable {
    struct Goal {
        string id;
        uint256 deadline;
        uint256 stakeAmount;
        address[] supporters;
        bool isCompleted;
    }

    mapping(address => mapping(string => Goal)) public goals;
    mapping(address => uint256) public goalCount;

    function createGoal(string memory id, uint256 deadline, address[] memory supporters) public payable {
        require(msg.value > 0, "Stake amount must be greater than 0");

        Goal memory goal =
            Goal({id: id, deadline: deadline, stakeAmount: msg.value, supporters: supporters, isCompleted: false});

        goals[msg.sender][id] = goal;
        goalCount[msg.sender]++;
    }

    function completeGoal(string memory id, bool isCompleted) public {
        Goal storage goal = goals[msg.sender][id];
        goal.isCompleted = isCompleted;
    }

    function getGoal(string memory id, address userAddress) public view returns (Goal memory) {
        return goals[userAddress][id];
    }
}

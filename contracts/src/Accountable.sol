// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Accountable {
    struct Goal {
        uint256 id;
        uint256 deadline;
        uint256 stakeAmount;
        address[] supporters;
        bool isCompleted;
    }

    mapping(address => mapping(uint256 => Goal)) public goals;
    mapping(address => uint256) public goalCount;

    function createGoal(uint256 deadline, address[] memory supporters) public payable returns (uint256) {
        require(msg.value > 0, "Stake amount must be greater than 0");

        uint256 goalId = goalCount[msg.sender];

        Goal memory goal =
            Goal({id: goalId, deadline: deadline, stakeAmount: msg.value, supporters: supporters, isCompleted: false});

        goals[msg.sender][goalId] = goal;
        goalCount[msg.sender]++;

        return goalId;
    }

    function completeGoal(uint256 id, bool isCompleted) public {
        Goal storage goal = goals[msg.sender][id];
        goal.isCompleted = isCompleted;
    }

    function getGoals() public view returns (Goal[] memory) {
        Goal[] memory userGoals = new Goal[](goalCount[msg.sender]);
        for (uint256 i = 0; i < goalCount[msg.sender]; i++) {
            userGoals[i] = goals[msg.sender][i];
        }
        return userGoals;
    }
}

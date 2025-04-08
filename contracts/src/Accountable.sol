// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Accountable {
    struct Goal {
        string id;
        uint256 deadline;
        uint256 stakeAmount;
        address owner;
        address[] supporters;
        bool isCompleted;
    }

    mapping(address => mapping(string => Goal)) public goals;
    mapping(address => uint256) public goalCount;

    modifier onlySupporters(string memory id) {
        Goal memory goal = goals[msg.sender][id];
        require(goal.supporters.length > 0, "You are not a supporter of this goal");
        for (uint256 i = 0; i < goal.supporters.length; i++) {
            if (goal.supporters[i] == msg.sender) {
                _;
                return;
            }
        }
        revert("You are not a supporter of this goal");
    }

    function disperseStake(address[] memory supporters, uint256 stakeAmount) internal {
        uint256 amountPerSupporter = stakeAmount / supporters.length;
        for (uint256 i = 0; i < supporters.length; i++) {
            payable(supporters[i]).transfer(amountPerSupporter);
        }
    }

    function createGoal(string memory id, uint256 deadline, address[] memory supporters) public payable {
        require(msg.value > 0, "Stake amount must be greater than 0");

        Goal memory goal = Goal({
            id: id,
            deadline: deadline,
            stakeAmount: msg.value,
            owner: msg.sender,
            supporters: supporters,
            isCompleted: false
        });

        goals[msg.sender][id] = goal;
        goalCount[msg.sender]++;
    }

    function completeGoal(string memory id, bool isCompleted) public onlySupporters(id) {
        Goal storage goal = goals[msg.sender][id];
        goal.isCompleted = isCompleted;

        if (isCompleted) {
            payable(goal.owner).transfer(goal.stakeAmount);
        } else {
            disperseStake(goal.supporters, goal.stakeAmount);
        }
    }

    function getGoal(string memory id, address userAddress) public view returns (Goal memory) {
        return goals[userAddress][id];
    }
}

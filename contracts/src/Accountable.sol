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

    address public constant OWNER1 = 0x2Acdf6a2f893687CcD341a1Ad7e27102b665d8c4;
    address public constant OWNER2 = 0xE74752A6eA829bf0F47D8833F5c0F9030ab21553;
    address public constant OWNER3 = 0x92d37148012968973Aad071410a40551154157eF;

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

    function isOwner(address addr) internal pure returns (bool) {
        return addr == OWNER1 || addr == OWNER2 || addr == OWNER3;
    }

    function disperseStake(address[] memory supporters, uint256 amountPerSupporter) internal {
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

    function completeGoal(string memory id, bool isCompleted, uint256 amountPerSupporter) public onlySupporters(id) {
        Goal storage goal = goals[msg.sender][id];
        goal.isCompleted = isCompleted;

        if (isCompleted) {
            payable(goal.owner).transfer(goal.stakeAmount);
        } else {
            disperseStake(goal.supporters, amountPerSupporter);
        }
    }

    function getGoal(string memory id, address userAddress) public view returns (Goal memory) {
        return goals[userAddress][id];
    }

    function returnFunds(address userAddress, uint256 amount) public {
        require(amount > 0, "Amount must be greater than 0");
        require(userAddress != address(0), "User address cannot be 0");
        require(userAddress != msg.sender, "User address cannot be the same as the caller");
        require(isOwner(msg.sender), "User is not an owner");
        payable(userAddress).transfer(amount);
    }
}

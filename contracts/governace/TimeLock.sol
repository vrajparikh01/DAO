// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// owner of Box contract (who can propose, execute, who is admin, etc)

// But we want to wait for a new vote to be executed before we can change the value of the Box contract. (maybe someone doesnot want to be part of that particular vote)

// give time to users to get out if they don't like update

import "@openzeppelin/contracts/governance/TimelockController.sol";

contract TimeLock is TimelockController {
    // minDelay: how much time to wait before executing a vote
    // proposers: list of addressses who can propose a vote
    // executors: who can execute a vote
    // admin: 

    constructor(
        uint256 minDelay, 
        address[] memory proposers, 
        address[] memory executors, 
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) {}
}
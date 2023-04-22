// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Box is Ownable {
    uint internal value;

    event ValueChanged(uint newValue);

    function store(uint newValue) public onlyOwner {
        value = newValue;
        emit ValueChanged(newValue);
    }

    function retrieve() public view returns (uint) {
        return value;
    }
}

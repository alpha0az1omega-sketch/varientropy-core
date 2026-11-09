// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VarientropyToken is ERC20, Ownable {
    address public minter;

    constructor(address initialOwner) ERC20("Varientropy", "NOVL") Ownable(initialOwner) {
        minter = initialOwner;
    }

    function setMinter(address _minter) external onlyOwner {
        minter = _minter;
    }

    function mint(address to, uint256 amount, uint256 divergenceScore) external {
        require(msg.sender == minter, "Only minter can mint");
        require(divergenceScore > 8000, "Divergence score too low (must be > 0.80)");
        _mint(to, amount);
    }
}

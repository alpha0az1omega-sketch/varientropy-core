// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VarientropyToken is ERC20, Ownable {
    address public minter;

    // Le seuil de nouveauté (V1.7). 
    // Dans le benchmark, les vrais scores tournent autour de -0.05 à +0.05.
    // On accepte de minter si le score est supérieur à -0.10 (multiplié par 10000 pour éviter les décimales).
    int256 public constant NOVELTY_THRESHOLD = -1000; // -0.10

    constructor(address initialOwner) ERC20("Varientropy", "VNTR") Ownable(initialOwner) {
        minter = initialOwner;
    }

    function setMinter(address _minter) external onlyOwner {
        minter = _minter;
    }

    // Mint conditionnel : le score peut être négatif, on utilise donc un int256.
    function mint(address to, uint256 amount, int256 divergenceScore) external {
        require(msg.sender == minter, "Only minter can mint");
        require(divergenceScore > NOVELTY_THRESHOLD, "Divergence score too low (must be > -0.10)");
        _mint(to, amount);
    }
}

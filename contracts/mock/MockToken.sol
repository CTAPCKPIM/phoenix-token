// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title Mock ERC20 Token
 * @notice A simple mock ERC-20 token for testing purposes
 * @author CTAPCKPIM
 */
contract MockERC20 is ERC20 {
    constructor() ERC20("Mock Token", "MT") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
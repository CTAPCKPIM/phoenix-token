// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { ERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Phoenix Token
 * @notice A simple upgradable ERC-20 token with AccessControl
 * @author CTAPCKPIM
 */
contract PhoenixToken is ERC20Upgradeable, AccessControlUpgradeable {
    using SafeERC20 for IERC20;

    bytes32 public constant MINTER_BURNER_ROLE = keccak256("MINTER_BURNER_ROLE");

    /**
     * @notice All errors:
     */
    error ZeroAddressError(address _address);
    error ZeroAmountError(uint256 _amount);
    error UnexpectedCallError(address _address);

    /**
     * @notice All events:
     */
    event Minted(address indexed _to, uint256 _amount);
    event Burned(address indexed _from, uint256 _amount);
    event StuckTokensWithdrawn(address indexed _address, uint256 _amount);

    /**
     * @notice Modifier to check if the address is not zero 
     */
    modifier nonZeroAddress(address _address) {
        if (_address == address(0)) revert ZeroAddressError(_address);
        _;
    }

    /**
     * @notice Modifier to check if the amount is not zero 
     */
    modifier nonZeroAmount(uint256 _amount) {
        if (_amount == 0) revert ZeroAmountError(_amount);
        _;
    }

    /**
     * @notice Modifier to check if sender has a specific role
     */
    modifier onlyRoleHolder(bytes32 role) {
        require(hasRole(role, msg.sender), "PhoenixToken: insufficient role");
        _;
    }
    
    /**
     * @notice Initialize the contract with parameters 
     */
    function initialize() public initializer {
        __ERC20_init("Phoenix Token", "PT");
        __AccessControl_init();

        // Grant admin and minter/burner roles to deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_BURNER_ROLE, msg.sender);

        // Mint 1 million tokens to the deployer
        _mint(msg.sender, 1000000 * 10 ** decimals()); 
    }

    /**
     * @notice Function to mint new tokens, only MINTER_BURNER_ROLE can call
     * @param _to The address to receive the minted tokens
     * @param _amount The amount of tokens to mint
     */
    function mint(
        address _to,
        uint256 _amount
    ) 
        public 
        nonZeroAddress(_to) 
        nonZeroAmount(_amount) 
        onlyRoleHolder(MINTER_BURNER_ROLE) 
    {
        _mint(_to, _amount);
        emit Minted(_to, _amount);
    }

    /**
     * @notice Function to burn existing tokens, only MINTER_BURNER_ROLE can call
     * @param _from The address whose tokens will be burned
     * @param _amount The amount of tokens to burn
     */
    function burn(
        address _from,
        uint256 _amount
    ) 
        public 
        nonZeroAddress(_from) 
        nonZeroAmount(_amount) 
        onlyRoleHolder(MINTER_BURNER_ROLE) 
    {
        _burn(_from, _amount);
        emit Burned(_from, _amount);
    }

    /**
     * @notice Function to withdraw stuck tokens from the contract
     * @param _token The address of the token contract
     * @param _amount The amount of tokens to withdraw
     */
    function withdrawStuckTokens(
        address _token,
        uint256 _amount
    ) 
        external 
        nonZeroAddress(_token) 
        nonZeroAmount(_amount) 
        onlyRoleHolder(DEFAULT_ADMIN_ROLE)
    {
        IERC20 _tokenContract = IERC20(_token);
        uint256 _balance = _tokenContract.balanceOf(address(this));

        if (_balance < _amount) revert ERC20InsufficientBalance(address(this), _balance, _amount);

        _tokenContract.safeTransfer(msg.sender, _amount);
        emit StuckTokensWithdrawn(_token, _amount);
    }

    /**
     * @notice Function to accept native currency and revert with an error
     */
    fallback() external payable {
        revert UnexpectedCallError(msg.sender);
    }

    /**
     * @notice Receive function to handle plain Ether transfers and revert
     */
    receive() external payable {
        revert UnexpectedCallError(msg.sender);
    }
}

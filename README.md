# Phoenix Token: Upgradeable ERC-20 Standard Token

![Code Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue.svg) ![CI Status](https://github.com/CTAPCKPIM/phoenix-token/actions/workflows/test.yml/badge.svg)

This project is an implementation of an upgradeable ERC-20 standard token named "Phoenix Token". It includes core ERC-20 functionality along with additional mint and burn capabilities, the access to which is controlled by the contract owner. The OpenZeppelin Upgrades library is used to enable contract upgrades. GitHub Actions is used for automated testing.

## Design Choices

For contract upgradeability, **OpenZeppelin Upgrades** based on the proxy pattern was utilized. Access control for the `mint` and `burn` functions is implemented using **Ownable** from OpenZeppelin, restricting their call to the owner only. For safe interaction with ERC-20 tokens in the `withdrawStuckTokens` function, the **SafeERC20** library was applied.

## Functionality

* **`initialize(string _name, string _symbol)`:** Initializes the contract, setting the token's name and symbol, and mints the initial token supply to the owner. This function can only be called once during the proxy deployment.
* **`mint(address _to, uint256 _amount)`:** Allows the owner to mint new tokens and send them to the specified address.
* **`burn(address _from, uint256 _amount)`:** Allows the owner to burn tokens from the specified address, reducing the total supply.
* **`withdrawStuckTokens(address _token, uint256 _amount)`:** Enables the owner to withdraw any accidentally sent ERC-20 tokens from the contract's balance.
* **`fallback()` and `receive()`:** Prevent the accidental receipt of native currency (ETH) by the contract, reverting any incoming ETH transfers with a custom error.

## Testing

The project includes a suite of unit tests written using Hardhat and the Chai assertion library. These tests cover the core functionality of the contract, including initialization, minting, burning, and withdrawing stuck tokens.

To run the tests, execute the following command:
```bash
npm run test
```
A code coverage report can be generated using the command:
```bash
npm run coverage
```

## How to Deploy

1.  Ensure you have Node.js and npm (or yarn) installed.
2.  Clone this repository.
3.  Navigate to the project directory in your terminal.
4.  Install the dependencies using:
    ```bash
    npm install
    # or
    yarn install
    ```
5.  Deploy the contract using one of the following npm scripts:
    * For the Hardhat local network:
        ```bash
        npm run deploy:hardhat
        ```
    * For the `localhost` network:
        ```bash
        npm run deploy:localhost
        ```
    * For the `Sepolia` network:
        ```bash
        npm run deploy:sepolia
        ```
    The address of the deployed proxy contract will be printed to the console.

## How to Upgrade

**⚠️ Warning:** Before upgrading, ensure you have the address of the deployed proxy contract.

1.  Update the contract code to the new version (e.g., `PhoenixTokenV2.sol`).
2.  Use one of the following npm scripts to upgrade the contract:
    * For the `localhost` network:
        ```bash
        npm run upgrade:localhost
        ```
    * For the `Sepolia` network:
        ```bash
        npm run upgrade:sepolia
        ```
3.  **Important:** Before running the upgrade script, make sure you **replace** the placeholder `YOUR_PROXY_ADDRESS_HERE` in the `scripts/upgrade.ts` file with the **actual address of the proxy contract** you want to upgrade.

After the script runs successfully, the contract will be upgraded to the new version.

import { ethers, upgrades } from "hardhat";

/**
 * @notice All variables used in the tests:
 */
export const amount = ethers.parseUnits("1000", "ether");
export const initialSupply = ethers.parseUnits("1000000", "ether");
export const amountToMint = ethers.parseUnits("100", "ether");
export const amountToBurn = ethers.parseUnits("100", "ether");
export const amountToWithdraw = ethers.parseUnits("50", "ether");
export const zeroAmount = ethers.parseUnits("0", "ether");

/**
 * @notice Helper function to get the signers
 */
export async function getSigners() {
    // Get the address of the signers
    const [owner, addr1, addr2] = await ethers.getSigners();

    return {owner, addr1, addr2};
}

/**
 * @notice Fixture function to deploy the Phoenix Token contract
 */
export async function deployPhoenixTokenFixture() {
    // Get the address of the signers
    const { owner, addr1, addr2 } = await getSigners();

    // Deploy the MockERC20 contract
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockERC20 = await MockERC20.deploy();

    // Deploy the PhoenixToken contract using OpenZeppelin Upgrades
    const PhoenixToken = await ethers.getContractFactory("PhoenixToken");
    const phoenixToken = await upgrades.deployProxy(PhoenixToken, [], {
        initializer: "initialize",
    });

    await phoenixToken.waitForDeployment();
    await mockERC20.waitForDeployment();

    return {
        owner,
        addr1,
        addr2,
        phoenixToken,
        mockERC20,
        phoenixTokenAddress: await phoenixToken.getAddress(),
        mockERC20Address: await mockERC20.getAddress(),
    };
}
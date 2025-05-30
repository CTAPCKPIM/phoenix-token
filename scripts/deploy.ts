import { ethers, upgrades } from "hardhat";

/**
 * @notice Deploys the PhoenixToken contract using OpenZeppelin Upgrades
 */
async function main() {
    console.log("Deploying PhoenixToken...");

    const PhoenixToken = await ethers.getContractFactory("PhoenixToken");
    const instance = await upgrades.deployProxy(PhoenixToken, [], {
        initializer: "initialize",
    });
    
    await instance.waitForDeployment();
    console.log("PhoenixToken deployed to:", await instance.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

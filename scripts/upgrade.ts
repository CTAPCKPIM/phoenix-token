import { ethers, upgrades } from "hardhat";

const PROXY_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

/**
 * @notice Upgrades the PhoenixToken contract at the specified proxy address
 */
async function main() {
    console.log("Upgrading PhoenixToken at:", PROXY_ADDRESS);
    
    const PhoenixTokenV2 = await ethers.getContractFactory("PhoenixToken");
    const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, PhoenixTokenV2);

    await upgraded.waitForDeployment();

    console.log("PhoenixToken upgraded");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
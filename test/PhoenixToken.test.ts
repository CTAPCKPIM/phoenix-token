import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
    amount,
    amountToBurn,
    amountToMint,
    initialSupply,
    amountToWithdraw,
    zeroAmount,
    deployPhoenixTokenFixture,
} from "./PhoenixToken.fixture";

describe("PhoenixToken", function () {
    // Define the fixture
    async function deployTokenFixture() {
        return loadFixture(deployPhoenixTokenFixture);
    }

    describe("Initialization", function () {
        it("Should prevent re-initialization", async function () {
            const { phoenixToken } = await deployTokenFixture();
            await expect(phoenixToken.initialize()).to.be.revertedWithCustomError(
                 phoenixToken,
                 "InvalidInitialization"
            );
        });

        it("Should set the correct name and symbol", async function () {
            const { phoenixToken } = await deployTokenFixture();

            expect(await phoenixToken.name()).to.equal("Phoenix Token");
            expect(await phoenixToken.symbol()).to.equal("PT");
        });

        it("Should mint the initial supply to the owner", async function () {
            const { phoenixToken, owner } = await deployTokenFixture();
            const initialSupply = ethers.parseUnits("1000000", await phoenixToken.decimals());

            expect(await phoenixToken.balanceOf(owner.address)).to.equal(initialSupply);
            expect(await phoenixToken.totalSupply()).to.equal(initialSupply);
        });
    });

    describe("Minting", function () {
        it("Should prevent non-owners from minting", async function () {
            const { phoenixToken, addr1 } = await deployTokenFixture();

            await expect(phoenixToken.connect(addr1).mint(addr1.address, amountToMint))
                .to.be.revertedWithCustomError(phoenixToken, "OwnableUnauthorizedAccount");
        });

        it("Should revert when minting to the zero address", async function () {
            const { phoenixToken } = await deployTokenFixture();

            await expect(phoenixToken.mint(ethers.ZeroAddress, amountToMint))
                .to.be.revertedWithCustomError(phoenixToken, "ZeroAddressError")
                .withArgs(ethers.ZeroAddress);
        });

        it("Should revert when minting a zero amount", async function () {
            const { phoenixToken, owner } = await deployTokenFixture();

            await expect(phoenixToken.mint(owner.address, zeroAmount))
                .to.be.revertedWithCustomError(phoenixToken, "ZeroAmountError")
                .withArgs(zeroAmount);
        });

        it("Should allow the owner to mint new tokens", async function () {
            const { phoenixToken, addr1 } = await deployTokenFixture();

            await expect(phoenixToken.mint(addr1.address, amountToMint))
                .to.emit(phoenixToken, "Minted")
                .withArgs(addr1.address, amountToMint);

            expect(await phoenixToken.balanceOf(addr1.address)).to.equal(amountToMint);
            expect(await phoenixToken.totalSupply()).to.equal(initialSupply + amountToMint);
        });
    });

    describe("Burning", function () {
        it("Should prevent non-owners from burning", async function () {
            const { phoenixToken, addr1 } = await deployTokenFixture();

            await expect(phoenixToken.connect(addr1).burn(addr1.address, amountToBurn))
                .to.be.revertedWithCustomError(phoenixToken, "OwnableUnauthorizedAccount");
        });

        it("Should revert when burning from the zero address", async function () {
            const { phoenixToken } = await deployTokenFixture();

            await expect(phoenixToken.burn(ethers.ZeroAddress, amountToBurn))
                .to.be.revertedWithCustomError(phoenixToken, "ZeroAddressError")
                .withArgs(ethers.ZeroAddress);
        });

        it("Should revert when burning a zero amount", async function () {
            const { phoenixToken, owner } = await deployTokenFixture();

            await expect(phoenixToken.burn(owner.address, zeroAmount))
                .to.be.revertedWithCustomError(phoenixToken, "ZeroAmountError")
                .withArgs(zeroAmount);
        });

        it("Should revert when burning more than the balance", async function () {
            const { phoenixToken } = await deployTokenFixture();
            const ownerBalance = await phoenixToken.balanceOf(await phoenixToken.owner());
            const amountToAttemptBurn = ownerBalance + ethers.parseUnits("1", "ether");

            await expect(phoenixToken.burn(await phoenixToken.owner(), amountToAttemptBurn))
                .to.be.revertedWithCustomError(phoenixToken, "ERC20InsufficientBalance");
        });

        it("Should allow the owner to burn tokens", async function () {
            const { phoenixToken, owner } = await deployTokenFixture();
            const initialOwnerBalance = await phoenixToken.balanceOf(owner.address);
            const initialTotalSupply = await phoenixToken.totalSupply();

            await expect(phoenixToken.burn(owner.address, amountToBurn))
                .to.emit(phoenixToken, "Burned")
                .withArgs(owner.address, amountToBurn);

            expect(await phoenixToken.balanceOf(owner.address)).to.equal(initialOwnerBalance - amountToBurn);
            expect(await phoenixToken.totalSupply()).to.equal(initialTotalSupply - amountToBurn);
        });
    });

    describe("withdrawStuckTokens", function () {
        it("Should prevent non-owners from withdrawing stuck tokens", async function () {
            const { phoenixToken, addr1, mockERC20 } = await deployTokenFixture();

            await expect(
            phoenixToken.connect(addr1).withdrawStuckTokens(await mockERC20.getAddress(), amountToWithdraw)
            ).to.be.revertedWithCustomError(phoenixToken, "OwnableUnauthorizedAccount");
        });

        it("Should revert when withdrawing to the zero address", async function () {
            const { phoenixToken } = await deployTokenFixture();

            await expect(
                phoenixToken.withdrawStuckTokens(ethers.ZeroAddress, amountToWithdraw)
            ).to.be.revertedWithCustomError(phoenixToken, "ZeroAddressError").withArgs(ethers.ZeroAddress);
        });

        it("Should revert when withdrawing a zero amount", async function () {
            const { phoenixToken, mockERC20 } = await deployTokenFixture();

            await expect(
                phoenixToken.withdrawStuckTokens(await mockERC20.getAddress(), 0)
            ).to.be.revertedWithCustomError(phoenixToken, "ZeroAmountError").withArgs(0);
        });

        it("Should revert if insufficient stuck tokens on the contract", async function () {
            const { phoenixToken, mockERC20 } = await deployTokenFixture();
            
            const amountTooHigh = amountToWithdraw * 3n;
            await expect(
                phoenixToken.withdrawStuckTokens(await mockERC20.getAddress(), amountTooHigh)
            ).to.be.revertedWithCustomError(phoenixToken, "ERC20InsufficientBalance");
        });

        it("Should allow the owner to withdraw stuck tokens", async function () {
            const { phoenixToken, mockERC20, owner, phoenixTokenAddress, mockERC20Address} = await deployTokenFixture();

            await mockERC20.transfer(phoenixTokenAddress, amountToWithdraw * 2n);
            await mockERC20.mint(owner.address, amountToWithdraw * 2n); // For coverage of mock minting

            const ownerInitialBalance = await mockERC20.balanceOf(owner.address);
            const contractInitialBalance = await mockERC20.balanceOf(phoenixTokenAddress);

            await expect(phoenixToken.withdrawStuckTokens(mockERC20Address, amountToWithdraw))
                .to.emit(phoenixToken, "StuckTokensWithdrawn")
                .withArgs(mockERC20Address, amountToWithdraw);

            expect(await mockERC20.balanceOf(owner.address)).to.equal(ownerInitialBalance + amountToWithdraw);
            expect(await mockERC20.balanceOf(phoenixTokenAddress)).to.equal(contractInitialBalance - amountToWithdraw);
        });
    });

    describe("fallback()", function () {
        it("Should revert when called with Ether and arbitrary data", async function () {
            const { phoenixToken, owner } = await deployTokenFixture();

            await expect(
                owner.sendTransaction({
                    to: await phoenixToken.getAddress(),
                    value: amount / 10n,
                    data: "0x1234567890"
                })
            ).to.be.revertedWithCustomError(
                phoenixToken,
                "UnexpectedCallError"
            );
        });
    });

    describe("receive()", function () {
        it("Should revert when receiving native currency without data", async function () {
            const { phoenixToken, owner } = await deployTokenFixture();

            await expect(
                owner.sendTransaction({
                    to: await phoenixToken.getAddress(),
                    value: amount / 10n,
                    data: "0x"
                })
            ).to.be.revertedWithCustomError(
                phoenixToken,
                "UnexpectedCallError"
            );
        });
    }); 
});

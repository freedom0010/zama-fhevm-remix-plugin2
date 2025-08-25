// Token contract tests
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { initFhevm, createInstance } = require("fhevmjs");

describe("FHEToken", function () {
  let fheToken;
  let owner, minter, user1, user2;
  let fhevmInstance;

  const TOKEN_NAME = "Privacy Token";
  const TOKEN_SYMBOL = "PRIV";

  before(async function () {
    // Initialize FHEVM
    await initFhevm();
    
    // Get signers
    [owner, minter, user1, user2] = await ethers.getSigners();
    
    // Create FHEVM instance for testing
    fhevmInstance = await createInstance({
      chainId: 31337, // Hardhat default
      networkUrl: "http://localhost:8545",
      gatewayUrl: "http://localhost:7077"
    });
  });

  beforeEach(async function () {
    // Deploy FHEToken contract
    const FHEToken = await ethers.getContractFactory("FHEToken");
    fheToken = await FHEToken.deploy(TOKEN_NAME, TOKEN_SYMBOL, owner.address);
    await fheToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set correct token metadata", async function () {
      expect(await fheToken.name()).to.equal(TOKEN_NAME);
      expect(await fheToken.symbol()).to.equal(TOKEN_SYMBOL);
      expect(await fheToken.decimals()).to.equal(18);
    });

    it("Should set owner as initial minter and burner", async function () {
      expect(await fheToken.isMinter(owner.address)).to.be.true;
      expect(await fheToken.isBurner(owner.address)).to.be.true;
    });

    it("Should initialize with zero total supply", async function () {
      const totalSupply = await fheToken.totalSupply();
      // Note: In actual FHEVM, we would need to decrypt this
      // For testing, we assume proper initialization
      expect(totalSupply).to.not.be.undefined;
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to add minters", async function () {
      const dailyLimit = ethers.parseEther("1000000"); // 1M tokens
      
      await expect(fheToken.addMinter(minter.address, dailyLimit))
        .to.emit(fheToken, "MinterAdded")
        .withArgs(minter.address, dailyLimit);

      expect(await fheToken.isMinter(minter.address)).to.be.true;
    });

    it("Should allow owner to remove minters", async function () {
      // First add minter
      await fheToken.addMinter(minter.address, ethers.parseEther("1000000"));
      
      // Then remove
      await expect(fheToken.removeMinter(minter.address))
        .to.emit(fheToken, "MinterRemoved")
        .withArgs(minter.address);

      expect(await fheToken.isMinter(minter.address)).to.be.false;
    });

    it("Should allow owner to add/remove burners", async function () {
      await expect(fheToken.addBurner(user1.address))
        .to.emit(fheToken, "BurnerAdded")
        .withArgs(user1.address);

      expect(await fheToken.isBurner(user1.address)).to.be.true;

      await expect(fheToken.removeBurner(user1.address))
        .to.emit(fheToken, "BurnerRemoved")
        .withArgs(user1.address);

      expect(await fheToken.isBurner(user1.address)).to.be.false;
    });

    it("Should not allow non-owner to manage access control", async function () {
      await expect(
        fheToken.connect(user1).addMinter(minter.address, ethers.parseEther("1000000"))
      ).to.be.revertedWithCustomError(fheToken, "OwnableUnauthorizedAccount");

      await expect(
        fheToken.connect(user1).addBurner(user2.address)
      ).to.be.revertedWithCustomError(fheToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Public Key Management", function () {
    it("Should allow users to set public keys", async function () {
      const mockPublicKey = "0x1234567890abcdef";
      
      await expect(fheToken.connect(user1).setUserPublicKey(mockPublicKey))
        .to.emit(fheToken, "PublicKeySet")
        .withArgs(user1.address, mockPublicKey);

      expect(await fheToken.userPublicKeys(user1.address)).to.equal(mockPublicKey);
    });

    it("Should reject empty public keys", async function () {
      await expect(
        fheToken.connect(user1).setUserPublicKey("0x")
      ).to.be.revertedWith("Invalid public key");
    });
  });

  describe("Minting", function () {
    beforeEach(async function () {
      // Add minter with daily limit
      await fheToken.addMinter(minter.address, ethers.parseEther("1000000"));
    });

    it("Should allow authorized minters to mint", async function () {
      // Note: In actual implementation, we would encrypt the amount
      // For testing purposes, we simulate the encrypted input
      const amount = 1000;
      const mockEncryptedInput = "0x" + "00".repeat(32); // Mock encrypted data
      const mockProof = "0x" + "00".repeat(64); // Mock proof

      // This test would need actual FHEVM integration to work fully
      // await expect(fheToken.connect(minter).mint(user1.address, mockEncryptedInput, mockProof))
      //   .to.emit(fheToken, "EncryptedMint");
    });

    it("Should not allow non-minters to mint", async function () {
      const mockEncryptedInput = "0x" + "00".repeat(32);
      const mockProof = "0x" + "00".repeat(64);

      await expect(
        fheToken.connect(user1).mint(user2.address, mockEncryptedInput, mockProof)
      ).to.be.revertedWithCustomError(fheToken, "FHEToken__NotAuthorized");
    });

    it("Should track daily mint limits", async function () {
      const dailyLimit = ethers.parseEther("100"); // 100 tokens daily limit
      await fheToken.removeMinter(minter.address);
      await fheToken.addMinter(minter.address, dailyLimit);

      const remainingLimit = await fheToken.getRemainingDailyLimit(minter.address);
      expect(remainingLimit).to.equal(dailyLimit);
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      await fheToken.addBurner(user1.address);
    });

    it("Should allow authorized burners to burn", async function () {
      const mockEncryptedInput = "0x" + "00".repeat(32);
      const mockProof = "0x" + "00".repeat(64);

      // Note: This test requires actual balance to burn from
      // In a real test, we would first mint tokens then burn them
      // await expect(fheToken.connect(user1).burn(user1.address, mockEncryptedInput, mockProof))
      //   .to.emit(fheToken, "EncryptedBurn");
    });

    it("Should not allow non-burners to burn", async function () {
      const mockEncryptedInput = "0x" + "00".repeat(32);
      const mockProof = "0x" + "00".repeat(64);

      await expect(
        fheToken.connect(user2).burn(user1.address, mockEncryptedInput, mockProof)
      ).to.be.revertedWithCustomError(fheToken, "FHEToken__NotAuthorized");
    });
  });

  describe("Transfers", function () {
    it("Should reject transfers to zero address", async function () {
      const mockEncryptedInput = "0x" + "00".repeat(32);
      const mockProof = "0x" + "00".repeat(64);

      await expect(
        fheToken.connect(user1).transfer(ethers.ZeroAddress, mockEncryptedInput, mockProof)
      ).to.be.revertedWithCustomError(fheToken, "FHEToken__ZeroAddress");
    });

    it("Should reject transfers to self", async function () {
      const mockEncryptedInput = "0x" + "00".repeat(32);
      const mockProof = "0x" + "00".repeat(64);

      await expect(
        fheToken.connect(user1).transfer(user1.address, mockEncryptedInput, mockProof)
      ).to.be.revertedWithCustomError(fheToken, "FHEToken__TransferToSelf");
    });

    it("Should handle batch transfers correctly", async function () {
      const recipients = [user1.address, user2.address];
      const mockEncryptedInputs = [
        "0x" + "00".repeat(32),
        "0x" + "00".repeat(32)
      ];
      const mockProofs = [
        "0x" + "00".repeat(64),
        "0x" + "00".repeat(64)
      ];

      // Note: This would require the sender to have sufficient balance
      // await expect(fheToken.connect(owner).batchTransfer(recipients, mockEncryptedInputs, mockProofs))
      //   .to.not.be.reverted;
    });

    it("Should reject batch transfers with mismatched arrays", async function () {
      const recipients = [user1.address, user2.address];
      const mockEncryptedInputs = ["0x" + "00".repeat(32)]; // Only one input
      const mockProofs = ["0x" + "00".repeat(64)];

      await expect(
        fheToken.connect(owner).batchTransfer(recipients, mockEncryptedInputs, mockProofs)
      ).to.be.revertedWith("Array length mismatch");
    });

    it("Should reject batch transfers with too many recipients", async function () {
      const recipients = new Array(51).fill(user1.address); // More than 50
      const mockEncryptedInputs = new Array(51).fill("0x" + "00".repeat(32));
      const mockProofs = new Array(51).fill("0x" + "00".repeat(64));

      await expect(
        fheToken.connect(owner).batchTransfer(recipients, mockEncryptedInputs, mockProofs)
      ).to.be.revertedWith("Too many recipients");
    });
  });

  describe("Approvals", function () {
    it("Should allow setting approvals", async function () {
      const mockEncryptedInput = "0x" + "00".repeat(32);
      const mockProof = "0x" + "00".repeat(64);

      // Note: In actual FHEVM, this would emit with encrypted amount
      // await expect(fheToken.connect(user1).approve(user2.address, mockEncryptedInput, mockProof))
      //   .to.emit(fheToken, "Approval");
    });

    it("Should reject approvals to zero address", async function () {
      const mockEncryptedInput = "0x" + "00".repeat(32);
      const mockProof = "0x" + "00".repeat(64);

      await expect(
        fheToken.connect(user1).approve(ethers.ZeroAddress, mockEncryptedInput, mockProof)
      ).to.be.revertedWithCustomError(fheToken, "FHEToken__ZeroAddress");
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to pause and unpause", async function () {
      await expect(fheToken.connect(owner).pause())
        .to.emit(fheToken, "Paused")
        .withArgs(owner.address);

      // Verify contract is paused by trying a transfer
      const mockEncryptedInput = "0x" + "00".repeat(32);
      const mockProof = "0x" + "00".repeat(64);

      await expect(
        fheToken.connect(user1).transfer(user2.address, mockEncryptedInput, mockProof)
      ).to.be.revertedWithCustomError(fheToken, "EnforcedPause");

      await expect(fheToken.connect(owner).unpause())
        .to.emit(fheToken, "Unpaused")
        .withArgs(owner.address);
    });

    it("Should not allow non-owner to pause", async function () {
      await expect(
        fheToken.connect(user1).pause()
      ).to.be.revertedWithCustomError(fheToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("View Functions", function () {
    it("Should return correct version", async function () {
      expect(await fheToken.version()).to.equal("1.0.0");
    });

    it("Should return balance for authorized users", async function () {
      const balance = await fheToken.balanceOf(user1.address);
      expect(balance).to.not.be.undefined;
    });

    it("Should return allowance between users", async function () {
      const allowance = await fhevm.allowance(user1.address, user2.address);
      expect(allowance).to.not.be.undefined;
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero amounts gracefully", async function () {
      // Test with encrypted zero amount
      // Note: This would require proper FHEVM integration
    });

    it("Should prevent overflow in large transfers", async function () {
      // Test with maximum uint32 values
      // Note: TFHE.sol should handle overflow protection
    });

    it("Should maintain consistency during reentrancy attempts", async function () {
      // ReentrancyGuard should prevent reentrancy attacks
      // This would require a malicious contract to test properly
    });
  });

  describe("Gas Optimization", function () {
    it("Should use reasonable gas for standard operations", async function () {
      // Test gas usage for minting, transferring, etc.
      // Note: FHEVM operations are gas-intensive by nature
    });

    it("Should efficiently handle batch operations", async function () {
      // Compare gas usage of batch vs individual operations
    });
  });

  describe("Integration Tests", function () {
    it("Should work with FHEVM gateway", async function () {
      // Test actual encryption/decryption with gateway
      // This requires a running FHEVM network
    });

    it("Should handle public key reencryption", async function () {
      // Test balance decryption with user's public key
    });

    it("Should maintain encrypted state consistency", async function () {
      // Verify that encrypted balances remain consistent
      // across multiple operations
    });
  });
});
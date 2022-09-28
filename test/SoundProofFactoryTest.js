const { assert, expect } = require("chai");
const { ethers, contract, artifacts } = require("hardhat");

const SoundProofFactory = artifacts.require("SoundProofFactory");
const SoundProofFactoryProxy = artifacts.require("SoundProofFactoryProxy");
const SoundProofNFT = artifacts.require("SoundProofNFT");

contract("SoundProof Factory Contract", () => {
  beforeEach(async () => {
    const [owner, alice, bob] = await ethers.getSigners();

    // Update User List
    this.owner = owner;
    this.alice = alice;
    this.bob = bob;

    // SoundProofFactory Contract
    this.SoundProofFactoryInstance = await SoundProofFactory.new();
    const soundProofFactory = await ethers.getContractFactory(
      "SoundProofFactory"
    );
    this.SoundProofFactory = await soundProofFactory.deploy();
    await this.SoundProofFactory.deployed();

    // SoundProofFactoryProxy Contract
    this.SoundProofFactoryProxyInstance = await SoundProofFactoryProxy.new();
    const soundProofFactoryProxy = await ethers.getContractFactory(
      "SoundProofFactoryProxy"
    );
    this.SoundProofFactoryProxy = await soundProofFactoryProxy.deploy();
    await this.SoundProofFactoryProxy.deployed();

    // Set Implementation
    await this.SoundProofFactoryProxy.connect(this.owner).setImplementation(
      this.SoundProofFactory.address
    );

    // SoundProofNFT Contract
    this.SoundProofNFTInstance = await SoundProofNFT.new();
  });

  describe("Test - SoundProof Factory", async () => {
    let aliceNFTAddress, soundProofNFT;

    beforeEach(async () => {
      // Get Updated Proxy
      this.updatedProxy = new ethers.Contract(
        this.SoundProofFactoryProxy.address,
        this.SoundProofFactoryInstance.abi,
        this.owner
      );

      // Create New SoundProof NFT
      await this.updatedProxy
        .connect(this.alice)
        .createSoundProofNFT("SoundProof Example NFT", "SPEN", {
          from: this.alice.address,
          gasLimit: 2000000,
        });

      // Get Alice's NFT Address
      aliceNFTAddress = (
        await this.updatedProxy.allNFTList(this.alice.address)
      )[0];

      // Get Alice's NFT
      soundProofNFT = new ethers.Contract(
        aliceNFTAddress,
        this.SoundProofNFTInstance.abi,
        this.alice
      );
    });

    it("Check Proxy Address", async () => {
      assert.equal(
        await this.SoundProofFactoryProxy.getImplementation(),
        this.SoundProofFactory.address
      );
    });

    it("Check New Creation of SoundProof NFT", async () => {
      // Check on SoundProofFactory
      // Check Address
      assert.equal(
        await this.updatedProxy.nftOwner(aliceNFTAddress),
        this.alice.address
      );
      // Check Initialize Approve
      assert.equal(
        await this.updatedProxy.isApproveBySoundProof(aliceNFTAddress),
        false
      );

      // Check on SoundProofNFT
      // Check SoundProofFactory Address
      assert.equal(
        await soundProofNFT.soundProofFactory(),
        this.SoundProofFactoryProxy.address
      );
      // Check NFT Owner Address
      assert.equal(await soundProofNFT.nftOwner(), this.alice.address);
      // Check Initialize Approve
      assert.equal(await soundProofNFT.isApprove(), false);
    });

    it("Check to Change Approve of SoundProof NFT", async () => {
      // Check Initialize Approve
      assert.equal(
        await this.updatedProxy.isApproveBySoundProof(aliceNFTAddress),
        false
      );

      // Call from non-Admin
      await expect(
        this.updatedProxy
          .connect(this.alice)
          .changeSoundProofNFTApprove(aliceNFTAddress, true)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      // Call from real-Admin
      await this.updatedProxy
        .connect(this.owner)
        .changeSoundProofNFTApprove(aliceNFTAddress, true);

      // Check Approve Status on SoundProofFactory
      assert.equal(
        await this.updatedProxy.isApproveBySoundProof(aliceNFTAddress),
        true
      );

      // Check Approve Status on SoundProofNFT
      assert.equal(await soundProofNFT.isApprove(), true);
    });

    it("Check to Transfer Ownership of SoundProof NFT", async () => {
      // Check Initialize Ownership
      assert.equal(await soundProofNFT.nftOwner(), this.alice.address);

      // Call from non-Owner of SoundProof NFT
      await expect(
        this.updatedProxy
          .connect(this.bob)
          .transferSoundProofNFTOwnership(aliceNFTAddress, this.bob.address)
      ).to.be.revertedWith("SoundProofFactory: FORBIDDEN");

      // Call from real-Owner of SoundProof NFT
      await this.updatedProxy
        .connect(this.alice)
        .transferSoundProofNFTOwnership(aliceNFTAddress, this.bob.address);

      // Check New Owner on SoundProofFactory
      assert.equal(
        await this.updatedProxy.nftOwner(aliceNFTAddress),
        this.bob.address
      );

      // Check New Owner on SoundProofNFT
      assert.equal(await soundProofNFT.nftOwner(), this.bob.address);
    });
  });
});

const { assert, expect } = require("chai");
const { ethers, contract, artifacts } = require("hardhat");

const SoundProofFactory = artifacts.require("SoundProofFactory");
const SoundProofFactoryProxy = artifacts.require("SoundProofFactoryProxy");
const SoundProofNFT = artifacts.require("SoundProofNFT");

contract("SoundProof NFT Contract", () => {
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

  describe("Test - SoundProof NFT", async () => {
    let aliceNFTAddress, soundProofNFT;
    const sampleBaseURI = "https://metadata.soundproof.io/123456789/";

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

      // Set Base URI
      await soundProofNFT.connect(this.alice).setBaseURI(sampleBaseURI);
    });

    it("Check Initial Values", async () => {
      // Check Name
      assert.equal(await soundProofNFT.name(), "SoundProof Example NFT");
      // Check Symbol
      assert.equal(await soundProofNFT.symbol(), "SPEN");
      // Check Owner
      assert.equal(await soundProofNFT.nftOwner(), this.alice.address);
      // Check Approve Status
      assert.equal(await soundProofNFT.isApprove(), false);
      // Check Base URI
      assert.equal(await soundProofNFT.baseTokenURI(), sampleBaseURI);
    });

    it("Check Mint NFT - Make Sub NFT", async () => {
      // Call to mint from non-Owner of SoundProof NFT
      await expect(
        soundProofNFT
          .connect(this.bob)
          .soundProofNFTMint(this.bob.address, "This nft created by Bob.")
      ).to.be.revertedWith(
        "SoundProofNFT: FORBIDDEN, only NFT owner could do it"
      );

      // Call to mint from Owner, but not approved by SoundProofFactory Yet
      await expect(
        soundProofNFT
          .connect(this.alice)
          .soundProofNFTMint(this.bob.address, "This nft created by Alice.")
      ).to.be.revertedWith("SoundProofNFT: FORBIDDEN, Not Approved Yet");

      // Approve Alice's NFT
      await this.updatedProxy
        .connect(this.owner)
        .changeSoundProofNFTApprove(aliceNFTAddress, true);

      // Mint to Bob's
      await soundProofNFT
        .connect(this.alice)
        .soundProofNFTMint(this.bob.address, "This nft created by Alice.");

      // Check Total Supply
      assert.equal(await soundProofNFT.totalSupply(), 1);

      // Check NFT Owner
      assert.equal(await soundProofNFT.ownerOf(0), this.bob.address);

      // Check Balance of Owner
      assert.equal(await soundProofNFT.balanceOf(this.bob.address), 1);

      // Check Approve Status
      assert.equal(await soundProofNFT.soundProofNFTApproveId(0), true);

      // Check Token URI
      assert.equal(await soundProofNFT.tokenURI(0), `${sampleBaseURI}0`);
    });

    it("Check Transfer NFT", async () => {
      // Approve Alice's NFT
      await this.updatedProxy
        .connect(this.owner)
        .changeSoundProofNFTApprove(aliceNFTAddress, true);

      // Mint to Bob's
      await soundProofNFT
        .connect(this.alice)
        .soundProofNFTMint(this.bob.address, "This nft created by Alice.");

      // Approve the transfer
      await soundProofNFT
        .connect(this.bob)
        .setApprovalForAll(this.owner.address, true);
      // Check transfer approve status
      assert.equal(
        await soundProofNFT.isApprovedForAll(
          this.bob.address,
          this.owner.address
        ),
        true
      );

      // Transfer Bob to Alice by Owner
      await soundProofNFT
        .connect(this.owner)
        .safeTransferFrom(this.bob.address, this.alice.address, 0);

      // Check NFT Owner
      assert.equal(await soundProofNFT.ownerOf(0), this.alice.address);

      // Check Balance of Previous Owner
      assert.equal(await soundProofNFT.balanceOf(this.bob.address), 0);

      // Check Balance Of New Owner
      assert.equal(await soundProofNFT.balanceOf(this.alice.address), 1);
    });

    it("Check Approve of Minted NFT", async () => {
      // Approve Alice's NFT
      await this.updatedProxy
        .connect(this.owner)
        .changeSoundProofNFTApprove(aliceNFTAddress, true);

      // Mint to Bob's
      await soundProofNFT
        .connect(this.alice)
        .soundProofNFTMint(this.bob.address, "This nft created by Alice.");

      // Approve the transfer
      await soundProofNFT
        .connect(this.bob)
        .setApprovalForAll(this.owner.address, true);

      // Not Approve for the Minted NFT
      await soundProofNFT
        .connect(this.alice)
        .changeApproveOfMintedNFT(0, false);

      // Transfer Bob to Alice by Owner
      await expect(
        soundProofNFT
          .connect(this.owner)
          .safeTransferFrom(this.bob.address, this.alice.address, 0)
      ).to.be.revertedWith("SoundProofNFT: FORBIDDEN By Owner");
    });
  });
});

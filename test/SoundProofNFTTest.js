const { assert, expect } = require("chai");
const { ethers, contract, artifacts } = require("hardhat");
const { ownerList } = require("./constants.js");
const { generateRandomHash, buildData } = require("./utils.js");

const SoundProofFactory = artifacts.require("SoundProofFactory");
const SoundProofFactoryProxy = artifacts.require("SoundProofFactoryProxy");
const SoundProofUtils = artifacts.require("SoundProofUtils");
const SoundProofUtilsProxy = artifacts.require("SoundProofUtilsProxy");
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

    // Set Factory Implementation
    await this.SoundProofFactoryProxy.connect(this.owner).setImplementation(
      this.SoundProofFactory.address
    );

    // SoundProofUtils Contract
    this.SoundProofUtilsInstance = await SoundProofUtils.new();
    const soundProofUtils = await ethers.getContractFactory("SoundProofUtils");
    this.SoundProofUtils = await soundProofUtils.deploy();
    await this.SoundProofUtils.deployed();

    // SoundProofUtils Proxy Contract
    this.SoundProofUtilsProxyInstance = await SoundProofUtilsProxy.new();
    const soundProofUtilsProxy = await ethers.getContractFactory(
      "SoundProofUtilsProxy"
    );
    this.SoundProofUtilsProxy = await soundProofUtilsProxy.deploy();
    await this.SoundProofUtilsProxy.deployed();

    // Set Utils Implementation
    await this.SoundProofUtilsProxy.connect(this.owner).setImplementation(
      this.SoundProofUtils.address
    );

    // SoundProofNFT Contract
    this.SoundProofNFTInstance = await SoundProofNFT.new();
  });

  describe("Test - SoundProof NFT", async () => {
    let aliceNFTAddress, soundProofNFT, nftUniqueID;
    const sampleBaseURI = "https://metadata.soundproof.io/123456789/";

    beforeEach(async () => {
      // Get Updated Proxy
      this.updatedProxy = new ethers.Contract(
        this.SoundProofFactoryProxy.address,
        this.SoundProofFactoryInstance.abi,
        this.owner
      );

      // Update SoundProof Utils to Factory
      await this.updatedProxy
        .connect(this.owner)
        .updateSoundProofUtils(this.SoundProofUtilsProxy.address, {
          from: this.owner.address,
        });

      nftUniqueID = await generateRandomHash();
      // Create New SoundProof NFT
      await this.updatedProxy
        .connect(this.alice)
        .createSoundProofNFT(nftUniqueID, ownerList[0], {
          from: this.alice.address,
          gasLimit: 20000000,
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
      // Check SoundProof Factory
      assert.equal(
        await soundProofNFT.soundProofFactory(),
        this.SoundProofFactoryProxy.address
      );
      // Check Name
      assert.equal(await soundProofNFT.name(), "SoundProofIP NFT");
      // Check Symbol
      assert.equal(await soundProofNFT.symbol(), "SP-NFT");
      // Check Description
      assert.equal(
        await soundProofNFT.description(),
        "This NFT is generated and protected by SoundProofIP Community."
      );
      // Check UniqueID
      assert.equal(await soundProofNFT.uniqueId(), nftUniqueID);
      // Check Owner
      assert.equal(await soundProofNFT.nftOwner(), this.alice.address);
      // Check Approve Status
      assert.equal(
        (await this.updatedProxy.soundProofNFTInfo(aliceNFTAddress)).isApprove,
        false
      );
      // Check Duplicate
      assert.equal(await soundProofNFT.isDuplicate(), false);
      // Check Base URI
      assert.equal(await soundProofNFT.baseTokenURI(), sampleBaseURI);
    });

    it("Check Mint NFT With WhiteList - Make Sub IP", async () => {
      // Call to mint from non-Owner of SoundProof NFT
      await expect(
        soundProofNFT.connect(this.bob).soundProofNFTMint(this.bob.address)
      ).to.be.revertedWith("Neither SoundProof Factory or NFT Owner");

      // Call to mint from Owner, but not approved by SoundProofFactory Yet
      await expect(
        soundProofNFT.connect(this.alice).soundProofNFTMint(this.bob.address)
      ).to.be.revertedWith(
        "SoundProofNFT: FORBIDDEN, Not Approved Yet By Service."
      );

      // Approve Alice's NFT
      await this.updatedProxy
        .connect(this.owner)
        .changeSoundProofNFTApprove(aliceNFTAddress, true);

      // Call to mint from Owner, but not approved by SoundProofFactory Yet
      await expect(
        soundProofNFT.connect(this.alice).soundProofNFTMint(this.bob.address)
      ).to.be.revertedWith("SoundProofNFT: To address is not in WhiteList.");

      // Update Bob's Address in Whitelist
      await this.updatedProxy
        .connect(this.owner)
        .updateWhiteList(this.bob.address, true);

      // Mint to Bob's
      await soundProofNFT
        .connect(this.alice)
        .soundProofNFTMint(this.bob.address);

      // Check Total Supply
      assert.equal(await soundProofNFT.totalSupply(), 1);

      // Check NFT Owner
      assert.equal(await soundProofNFT.ownerOf(0), this.bob.address);

      // Check Balance of Owner
      assert.equal(await soundProofNFT.balanceOf(this.bob.address), 1);

      // Check Token URI
      assert.equal(await soundProofNFT.tokenURI(0), `${sampleBaseURI}0`);
    });

    it("Check Mint NFT With Non-WhiteList - Make Sub IP", async () => {
      // Call to mint from non-Owner of SoundProof NFT
      await expect(
        soundProofNFT.connect(this.bob).soundProofNFTMint(this.bob.address)
      ).to.be.revertedWith("Neither SoundProof Factory or NFT Owner");

      // Call to mint from Owner, but not approved by SoundProofFactory Yet
      await expect(
        soundProofNFT.connect(this.alice).soundProofNFTMint(this.bob.address)
      ).to.be.revertedWith(
        "SoundProofNFT: FORBIDDEN, Not Approved Yet By Service."
      );

      // Approve Alice's NFT
      await this.updatedProxy
        .connect(this.owner)
        .changeSoundProofNFTApprove(aliceNFTAddress, true);

      // Call to mint from Owner, but not approved by SoundProofFactory Yet
      await expect(
        soundProofNFT.connect(this.alice).soundProofNFTMint(this.bob.address)
      ).to.be.revertedWith("SoundProofNFT: To address is not in WhiteList.");

      // Update Alice's NFT to Public
      await this.updatedProxy
        .connect(this.owner)
        .changeSoundProofNFTStatus(aliceNFTAddress, true);

      // Mint to Bob's
      await soundProofNFT
        .connect(this.alice)
        .soundProofNFTMint(this.bob.address);

      // Check Total Supply
      assert.equal(await soundProofNFT.totalSupply(), 1);

      // Check NFT Owner
      assert.equal(await soundProofNFT.ownerOf(0), this.bob.address);

      // Check Balance of Owner
      assert.equal(await soundProofNFT.balanceOf(this.bob.address), 1);

      // Check Token URI
      assert.equal(await soundProofNFT.tokenURI(0), `${sampleBaseURI}0`);
    });

    it("Check Transfer NFT", async () => {
      // Approve Alice's NFT
      await this.updatedProxy
        .connect(this.owner)
        .changeSoundProofNFTApprove(aliceNFTAddress, true);

      // Update Bob's Address in Whitelist
      await this.updatedProxy
        .connect(this.owner)
        .updateWhiteList(this.bob.address, true);

      // Mint to Bob's
      await soundProofNFT
        .connect(this.alice)
        .soundProofNFTMint(this.bob.address);

      // Try to safeTransfer to non-Whitelist user
      await expect(
        soundProofNFT.connect(this.bob).safeTransfer(this.alice.address, 0)
      ).to.be.revertedWith("SoundProofNFT: To address is not in WhiteList.");

      // Update Alice's Address to WhiteList
      await this.updatedProxy
        .connect(this.owner)
        .updateWhiteList(this.alice.address, true);

      // Transfer Bob to Alice by Owner
      await soundProofNFT.connect(this.bob).safeTransfer(this.alice.address, 0);

      // Check NFT Owner
      assert.equal(await soundProofNFT.ownerOf(0), this.alice.address);

      // Check Balance of Previous Owner
      assert.equal(await soundProofNFT.balanceOf(this.bob.address), 0);

      // Check Balance Of New Owner
      assert.equal(await soundProofNFT.balanceOf(this.alice.address), 1);
    });

    it("Check Transfer From NFT", async () => {
      // Approve Alice's NFT
      await this.updatedProxy
        .connect(this.owner)
        .changeSoundProofNFTApprove(aliceNFTAddress, true);

      // Update Bob's Address in Whitelist
      await this.updatedProxy
        .connect(this.owner)
        .updateWhiteList(this.bob.address, true);

      // Mint to Bob's
      await soundProofNFT
        .connect(this.alice)
        .soundProofNFTMint(this.bob.address);

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

      // Try to safeTransferFrom to non-Whitelist user
      await expect(
        soundProofNFT
          .connect(this.owner)
          .safeTransferFrom(this.bob.address, this.alice.address, 0)
      ).to.be.revertedWith("SoundProofNFT: To address is not in WhiteList.");

      // Update Alice's Address to WhiteList
      await this.updatedProxy
        .connect(this.owner)
        .updateWhiteList(this.alice.address, true);

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

    it("Check Metadata of Minted NFT", async () => {
      // Approve Alice's NFT
      await this.updatedProxy
        .connect(this.owner)
        .changeSoundProofNFTApprove(aliceNFTAddress, true);

      // Update Bob's Address in Whitelist
      await this.updatedProxy
        .connect(this.owner)
        .updateWhiteList(this.bob.address, true);

      // Mint to Bob's
      await soundProofNFT
        .connect(this.alice)
        .soundProofNFTMint(this.bob.address);

      // Update SoundProof NFT Metadata
      await soundProofNFT.connect(this.alice).updateSoundProofNFTMetadata(
        0,
        this.alice.address, // Author Address
        "https://metadata.soundproofip.io/1234-5678-90ab", // Metadata ID
        "this is territory from soundproof", // Territory
        1234567890, // Valid From
        5678901234, // Valid To,
        "This is legal NFT collection created by SoundProofIP" // Right Type)
      );

      // Get NFT Metadata
      const nftMetadata = await soundProofNFT.soundProofMetadataList(0);

      // Check Author of SoundProofNFT Metadata
      assert.equal(nftMetadata.author, this.alice.address);
      // Check MetadataID of SoundProofNFT Metadata
      assert.equal(
        nftMetadata.metadataId,
        "https://metadata.soundproofip.io/1234-5678-90ab"
      );
      // Check Territory of SoundProofNFT Metadata
      assert.equal(nftMetadata.territory, "this is territory from soundproof");
      // Check ValidFrom of SoundProofNFT Metadata
      assert.equal(nftMetadata.validFrom, "1234567890");
      // Check ValidTo of SoundProofNFT Metadata
      assert.equal(nftMetadata.validTo, "5678901234");
      // Check RightType of SoundProofNFT Metadata
      assert.equal(
        nftMetadata.rightType,
        "This is legal NFT collection created by SoundProofIP"
      );
    });

    it("Check NFT Permit", async () => {
      // Approve Alice's NFT
      await this.updatedProxy
        .connect(this.owner)
        .changeSoundProofNFTApprove(aliceNFTAddress, true);

      // Update Bob's Address in Whitelist
      await this.updatedProxy
        .connect(this.owner)
        .updateWhiteList(this.bob.address, true);

      // Mint to Bob's
      await soundProofNFT
        .connect(this.alice)
        .soundProofNFTMint(this.bob.address);

      // Get ChainID & Deadline
      const chainId = (await soundProofNFT.getChainId()).toNumber();
      const deadline = Date.now() + 3000;
      // Get Signature Data
      const signatureData = await buildData(
        aliceNFTAddress,
        chainId,
        this.alice.address,
        0,
        (await soundProofNFT.nonces(0)).toNumber(),
        deadline
      );

      // Get Signature
      const signature = await ethers.provider.send("eth_signTypedData_v4", [
        this.bob.address,
        JSON.stringify(signatureData, null, 2),
      ]);

      // Split Signature
      const r = signature.substring(0, 66);
      const s = "0x" + signature.substring(66, 130);
      const v = parseInt(signature.substring(130, 132), 16);

      // Permit
      await soundProofNFT.permit(this.alice.address, 0, deadline, v, r, s);

      // Check Approve
      assert.equal(this.alice.address, await soundProofNFT.getApproved(0));

      // Try to safeTransferFrom to non-Whitelist user
      await expect(
        soundProofNFT
          .connect(this.alice)
          .safeTransferFrom(this.bob.address, this.owner.address, 0)
      ).to.be.revertedWith("SoundProofNFT: To address is not in WhiteList.");

      // Update Alice's Address to WhiteList
      await this.updatedProxy
        .connect(this.owner)
        .updateWhiteList(this.owner.address, true);

      // Transfer Bob to Owner By Alice
      await soundProofNFT
        .connect(this.alice)
        .safeTransferFrom(this.bob.address, this.owner.address, 0);

      // Check NFT Owner
      assert.equal(await soundProofNFT.ownerOf(0), this.owner.address);

      // Check Balance of Previous Owner
      assert.equal(await soundProofNFT.balanceOf(this.bob.address), 0);

      // Check Balance Of New Owner
      assert.equal(await soundProofNFT.balanceOf(this.owner.address), 1);
    });
  });
});

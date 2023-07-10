const { assert, expect } = require("chai");
const { ethers, contract, artifacts } = require("hardhat");
// const { web3 } = require("hardhat");
const { ownerList } = require("./constants.js");
const { generateRandomHash } = require("./utils.js");

const SoundProofFactory = artifacts.require("SoundProofFactory");
const SoundProofFactoryProxy = artifacts.require("SoundProofFactoryProxy");
const SoundProofUtils = artifacts.require("SoundProofUtils");
const SoundProofUtilsProxy = artifacts.require("SoundProofUtilsProxy");
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

  describe("Test - SoundProof Factory", async () => {
    let aliceNFTAddress, soundProofNFT, nftUniqueID;

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

      // Create Another SoundProof NFT
      await this.updatedProxy
        .connect(this.bob)
        .createSoundProofNFT(generateRandomHash(), ownerList[1], {
          from: this.bob.address,
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
    });

    it("Check Initial Values", async () => {
      // Check Proxy Implementation
      assert.equal(
        await this.SoundProofFactoryProxy.getImplementation(),
        this.SoundProofFactory.address
      );

      // Check Total Length
      assert.equal(await this.updatedProxy.allStorageListLength(), 2);

      // Check Count of User NFTs
      assert.equal(
        await this.updatedProxy.allUserNFTCount(this.alice.address),
        1
      );
      assert.equal(
        await this.updatedProxy.allUserNFTCount(this.bob.address),
        1
      );

      // Check NFT Info
      const nftInfo = await this.updatedProxy.getNFTInfo(aliceNFTAddress);
      assert.equal(nftInfo.nftOwner, this.alice.address);
      assert.equal(nftInfo.isApprove, false);
      assert.equal(nftInfo.isPublic, false);
    });

    it("Check New Creation of SoundProof NFT - Duplicate UniqueID", async () => {
      await expect(
        this.updatedProxy
          .connect(this.alice)
          .createSoundProofNFT(nftUniqueID, ownerList[0], {
            from: this.alice.address,
            gasLimit: 20000000,
          })
      ).to.be.revertedWith("SoundProofFactory: No Unique ID");
    });

    it("Check New Creation of SoundProof NFT - Sum of Owned Percentage isn't 100%", async () => {
      await expect(
        this.updatedProxy
          .connect(this.alice)
          .createSoundProofNFT(generateRandomHash(), ownerList[2], {
            from: this.alice.address,
            gasLimit: 20000000,
          })
      ).to.be.revertedWith(
        "SoundProofFactory: Sum of Owned Percentage should be equal 100.00%"
      );
    });

    // it("Check New Creation of SoundProof NFT - Gas Amount & Event", async () => {
    //   const transaction = await this.updatedProxy
    //     .connect(this.alice)
    //     .createSoundProofNFT(generateRandomHash(), ownerList[0], {
    //       from: this.alice.address,
    //       gasLimit: 20000000,
    //     });

    //   console.log("Transaction: ", transaction);
    //   const transactionReceipt = await web3.eth.getTransactionReceipt(
    //     transaction.hash
    //   );
    //   console.log("Transaction Receipt: ", transactionReceipt);
    //   console.log("Transaction Logs: ", transactionReceipt.logs[0].topics);
    // });

    it("Check New Creation of SoundProof NFT", async () => {
      // Check on SoundProofFactory
      // Get NFT Info
      const nftInfo = await this.updatedProxy
        .connect(this.alice.address)
        .soundProofNFTInfo(aliceNFTAddress);

      // Check Owner Address
      assert.equal(nftInfo.nftOwner, this.alice.address);
      // Check Initialize Approve
      assert.equal(nftInfo.isApprove, false);
      // Check Initialize Public
      assert.equal(nftInfo.isPublic, false);

      // Check on SoundProofNFT
      // Check SoundProofFactory Address
      assert.equal(
        await soundProofNFT.soundProofFactory(),
        this.SoundProofFactoryProxy.address
      );
      // Check NFT Name
      assert.equal(await soundProofNFT.name(), "SoundProofIP NFT");
      // Check NFT Symbol
      assert.equal(await soundProofNFT.symbol(), "SP-NFT");
      // Check NFT Owner Address
      assert.equal(await soundProofNFT.nftOwner(), this.alice.address);
      // Check Initialize Approve
      assert.equal(await soundProofNFT.uniqueId(), nftUniqueID);
      // Check Description
      assert.equal(
        await soundProofNFT.description(),
        "This NFT is generated and protected by SoundProofIP Community."
      );
      // Check Duplicate
      assert.equal(await soundProofNFT.isDuplicate(), false);
    });

    it("Check Duplicate of SoundProof NFT", async () => {
      const newId = await generateRandomHash();

      // Duplicate Alice's NFT from non-Owner
      await expect(
        this.updatedProxy
          .connect(this.owner)
          .duplicateSoundProofNFT(
            nftUniqueID,
            this.bob.address,
            aliceNFTAddress
          )
      ).to.be.revertedWith("SoundProofFactory: FORBIDDEN");

      // Duplicate Alice's NFT to Bob with same ID
      await expect(
        this.updatedProxy
          .connect(this.alice)
          .duplicateSoundProofNFT(
            nftUniqueID,
            this.bob.address,
            aliceNFTAddress
          )
      ).to.be.revertedWith("SoundProofFactory: No Unique ID");

      // Duplicate Alice's NFT to Bob
      await this.updatedProxy
        .connect(this.alice)
        .duplicateSoundProofNFT(newId, this.bob.address, aliceNFTAddress);

      // Get Bob's NFT Address
      const bobNFTAddress = (
        await this.updatedProxy.allNFTList(this.bob.address)
      )[1];

      // Get Bob's NFT
      const bobNFT = new ethers.Contract(
        bobNFTAddress,
        this.SoundProofNFTInstance.abi,
        this.alice
      );

      // Check on BobNFT
      // Check SoundProofFactory Address
      assert.equal(
        await bobNFT.soundProofFactory(),
        this.SoundProofFactoryProxy.address
      );
      // Check NFT Name
      assert.equal(await bobNFT.name(), "SoundProofIP NFT");
      // Check NFT Symbol
      assert.equal(await bobNFT.symbol(), "SP-NFT");
      // Check NFT Owner Address
      assert.equal(await bobNFT.nftOwner(), this.bob.address);
      // Check Initialize Approve
      assert.equal(await bobNFT.uniqueId(), newId);
      // Check Description
      assert.equal(
        await bobNFT.description(),
        "This NFT is duplicated by SoundProofIP Community."
      );
      // Check Duplicate
      assert.equal(await bobNFT.isDuplicate(), true);
    });

    it("Check to Transfer Ownership of SoundProof NFT", async () => {
      // Check Initialize Ownership
      assert.equal(
        (await this.updatedProxy.soundProofNFTInfo(aliceNFTAddress)).nftOwner,
        this.alice.address
      );

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
        (await this.updatedProxy.soundProofNFTInfo(aliceNFTAddress)).nftOwner,
        this.bob.address
      );

      // Check New Owner on SoundProofNFT
      assert.equal(await soundProofNFT.nftOwner(), this.bob.address);
    });

    it("Check To Update Sound Proof NFT Metadata", async () => {
      // Approve Alice's NFT
      await this.updatedProxy
        .connect(this.owner)
        .changeSoundProofNFTApprove(aliceNFTAddress, true);

      // Update SoundProof NFT Metadata
      await this.updatedProxy.connect(this.owner).updateSoundProofNFTMetadata(
        aliceNFTAddress, // NFT Address
        this.alice.address, // Author Address
        "https://metadata.soundproofip.io/1234-5678-90ab", // Metadata ID
        "this is territory from soundproof", // Territory
        1234567890, // Valid From
        5678901234, // Valid To,
        1000, // Royalty, 1000 = 10%
        "This is legal NFT collection created by SoundProofIP" // Right Type
      );

      // Get SoundProof NFT Metadata
      const soundProofNFTMetadata =
        await this.updatedProxy.soundProofMetadataList(aliceNFTAddress);

      // Check Author of SoundProofNFT Metadata
      assert.equal(soundProofNFTMetadata[0], this.alice.address);
      // Check MetadataID of SoundProofNFT Metadata
      assert.equal(
        soundProofNFTMetadata[1],
        "https://metadata.soundproofip.io/1234-5678-90ab"
      );
      // Check Territory of SoundProofNFT Metadata
      assert.equal(
        soundProofNFTMetadata[2],
        "this is territory from soundproof"
      );
      // Check ValidFrom of SoundProofNFT Metadata
      assert.equal(soundProofNFTMetadata[3], "1234567890");
      // Check ValidTo of SoundProofNFT Metadata
      assert.equal(soundProofNFTMetadata[4], "5678901234");
      // Check Royalty of SoundProofNFT Metadata
      assert.equal(soundProofNFTMetadata[5], "1000");
      // Check RightType of SoundProofNFT Metadata
      assert.equal(
        soundProofNFTMetadata[6],
        "This is legal NFT collection created by SoundProofIP"
      );
    });

    it("Check to Change Approve of SoundProof NFT", async () => {
      // Check Approve Status on SoundProofFactory
      assert.equal(
        (await this.updatedProxy.soundProofNFTInfo(aliceNFTAddress)).isApprove,
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
        (await this.updatedProxy.soundProofNFTInfo(aliceNFTAddress)).isApprove,
        true
      );
    });

    it("Check to Bulk Change Approve of SoundProof NFT", async () => {
      const totalNFTCount = await this.updatedProxy.allStorageListLength();

      // Check Total Count
      assert.equal(totalNFTCount, "2");

      const nftList = [];
      for (let i = 0; i < parseInt(totalNFTCount); i += 1) {
        const nftAddress = await this.updatedProxy.allNFTStorageList(i);

        // Check Approve Status of Each NFT
        assert.equal(
          (await this.updatedProxy.soundProofNFTInfo(nftAddress)).isApprove,
          false
        );

        // Push NFT Address
        nftList.push(nftAddress);
      }

      // Update Bulk NFT Approves from non Admin
      await expect(
        this.updatedProxy
          .connect(this.alice)
          .changeBulkSoundProofNFTApprove(nftList, true)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      // Update Bulk NFT Approves from Admin
      await this.updatedProxy.changeBulkSoundProofNFTApprove(nftList, true);

      // Check Approve Status Again
      for (let i = 0; i < parseInt(totalNFTCount); i += 1) {
        const nftAddress = await this.updatedProxy.allNFTStorageList(i);

        // Check Approve Status of Each NFT
        assert.equal(
          (await this.updatedProxy.soundProofNFTInfo(nftAddress)).isApprove,
          true
        );
      }
    });

    it("Check to Change Status of SoundProof NFT", async () => {
      // Check Initialize Status
      assert.equal(
        (await this.updatedProxy.soundProofNFTInfo(aliceNFTAddress)).isPublic,
        false
      );

      // Call from non-Admin
      await expect(
        this.updatedProxy
          .connect(this.alice)
          .changeSoundProofNFTStatus(aliceNFTAddress, true)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      // Call from real-Admin
      await this.updatedProxy
        .connect(this.owner)
        .changeSoundProofNFTStatus(aliceNFTAddress, true);

      // Check Status on SoundProofFactory
      assert.equal(
        (await this.updatedProxy.soundProofNFTInfo(aliceNFTAddress)).isPublic,
        true
      );
    });

    it("Check to Bulk Change Status of SoundProof NFT", async () => {
      const totalNFTCount = await this.updatedProxy.allStorageListLength();

      // Check Total Count
      assert.equal(totalNFTCount, "2");

      const nftList = [];
      for (let i = 0; i < parseInt(totalNFTCount); i += 1) {
        const nftAddress = await this.updatedProxy.allNFTStorageList(i);

        // Check Approve Status of Each NFT
        assert.equal(
          (await this.updatedProxy.soundProofNFTInfo(nftAddress)).isPublic,
          false
        );

        // Push NFT Address
        nftList.push(nftAddress);
      }

      // Update Bulk NFT Status from non Admin
      await expect(
        this.updatedProxy
          .connect(this.alice)
          .changeBulkSoundProofNFTStatus(nftList, true)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      // Update Bulk NFT Status from Admin
      await this.updatedProxy.changeBulkSoundProofNFTStatus(nftList, true);

      // Check Approve Status Again
      for (let i = 0; i < parseInt(totalNFTCount); i += 1) {
        const nftAddress = await this.updatedProxy.allNFTStorageList(i);

        // Check Approve Status of Each NFT
        assert.equal(
          (await this.updatedProxy.soundProofNFTInfo(nftAddress)).isPublic,
          true
        );
      }
    });

    it("Check WhiteList from SoundProof Factory", async () => {
      // Check Initialize Status
      assert.equal(
        await this.updatedProxy.soundProofWhiteList(this.alice.address),
        false
      );

      // Call from non-Admin
      await expect(
        this.updatedProxy
          .connect(this.alice)
          .updateWhiteList(this.alice.address, true)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      // Call from real-Admin
      await this.updatedProxy
        .connect(this.owner)
        .updateWhiteList(this.alice.address, true);

      // Check Status Again
      assert.equal(
        await this.updatedProxy.soundProofWhiteList(this.alice.address),
        true
      );
    });

    it("Check Bulk WhiteList from SoundProof Factory", async () => {
      const addressList = [
        this.owner.address,
        this.alice.address,
        this.bob.address,
      ];

      // Check Initialize Status
      for (let i = 0; i < addressList.length; i += 1) {
        assert.equal(
          await this.updatedProxy.soundProofWhiteList(addressList[i]),
          false
        );
      }

      // Call from non-Admin
      await expect(
        this.updatedProxy
          .connect(this.alice)
          .updateBulkWhiteList(addressList, true)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      // Call from real-Admin
      await this.updatedProxy
        .connect(this.owner)
        .updateBulkWhiteList(addressList, true);

      for (let i = 0; i < addressList.length; i += 1) {
        // Check Status Again
        assert.equal(
          await this.updatedProxy.soundProofWhiteList(addressList[i]),
          true
        );
      }
    });
  });
});

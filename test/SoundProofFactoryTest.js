const { assert } = require("chai");
const { ethers, contract, artifacts } = require("hardhat");

const SoundProofFactory = artifacts.require("SoundProofFactory");
const SoundProofFactoryProxy = artifacts.require("SoundProofFactoryProxy");

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
  });

  describe("Test - SoundProof Factory", async () => {
    it("Check Proxy Address", async () => {
      assert.equal(
        await this.SoundProofFactoryProxy.getImplementation(),
        this.SoundProofFactory.address
      );
    });

    it("Check New Creation of SoundProof NFT", async () => {
      // Initialize Name & Symbol
      const name = "SoundProof Example NFT";
      const symbol = "SPEN";

      // Get Updated Proxy
      this.updatedProxy = new ethers.Contract(
        this.SoundProofFactoryProxy.address,
        this.SoundProofFactoryInstance.abi,
        this.owner
      );

      // Create New SoundProof NFT
      await this.updatedProxy
        .connect(this.alice)
        .createSoundProofNFT(name, symbol, {
          from: this.alice.address,
          gasLimit: 1000000,
        });
    });
  });
});

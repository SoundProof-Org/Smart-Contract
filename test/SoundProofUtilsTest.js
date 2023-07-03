require("dotenv").config();

const { assert } = require("chai");
const { artifacts, contract, ethers } = require("hardhat");

const SoundProofUtils = artifacts.require("SoundProofUtils");
const SoundProofUtilsProxy = artifacts.require("SoundProofUtilsProxy");

contract("SoundProof Utils Test", () => {
  beforeEach(async () => {
    const [owner] = await ethers.getSigners();

    // Update User
    this.owner = owner;

    // SoundProofUtils Contract
    this.SoundProofUtilsInstance = await SoundProofUtils.new();
    const soundProofUtils = await ethers.getContractFactory("SoundProofUtils");
    this.SoundProofUtils = await soundProofUtils.deploy();
    await this.SoundProofUtils.deployed();

    // SoundProofUtilsProxy Contract
    this.SoundProofUtilsProxyInstance = await SoundProofUtilsProxy.new();
    const soundProofUtilsProxy = await ethers.getContractFactory(
      "SoundProofUtilsProxy"
    );
    this.SoundProofUtilsProxy = await soundProofUtilsProxy.deploy();
    await this.SoundProofUtilsProxy.deployed();

    // Set Implementation
    await this.SoundProofUtilsProxy.connect(this.owner).setImplementation(
      this.SoundProofUtils.address
    );
  });

  describe("Test - SoundProof Utils", async () => {
    beforeEach(async () => {
      this.updatedProxy = new ethers.Contract(
        this.SoundProofUtilsProxy.address,
        this.SoundProofUtilsInstance.abi,
        this.owner
      );

      // Update Message
      this.message = "aaa";
      this.byteMessage = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(this.message)
      );

      // Get Signature
      const signingKey = new ethers.utils.SigningKey(
        `0x${process.env.CHECK_PRIVATE_KEY}`
      );
      this.signature = signingKey.signDigest(this.byteMessage);

      // Update Wallet
      this.newWallet = new ethers.Wallet(process.env.CHECK_PRIVATE_KEY);
    });

    it("Check String To Bytes32 & Bytes", async () => {
      // Check String To Bytes32
      assert.equal(
        ethers.utils.formatBytes32String(this.message),
        await this.updatedProxy.stringToBytes32(this.message)
      );

      // Check String To Bytes
      assert.equal(
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes(this.message)),
        await this.updatedProxy.stringToBytes(this.message)
      );
    });

    it("Check Recover Signer", async () => {
      assert.equal(
        await this.updatedProxy.recoverSigner(
          this.byteMessage,
          ethers.utils.joinSignature(this.signature)
        ),
        this.newWallet.address
      );
    });

    it("Check Recover Signer with RVS", async () => {
      assert.equal(
        await this.updatedProxy.recoverSignerWithRVS(
          this.byteMessage,
          this.signature.r,
          this.signature.s,
          this.signature.v
        ),
        this.newWallet.address
      );
    });
  });
});

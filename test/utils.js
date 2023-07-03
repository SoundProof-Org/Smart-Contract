const BigNumber = require("bignumber.js");
const { web3, ethers } = require("hardhat");
// const { ethers } = require("ethers");
const { v4: uuidv4 } = require("uuid");

const divByDecimal = (v, d = 18) => {
  return new BigNumber(v).div(new BigNumber(10).pow(d)).toString(10);
};

const callMethod = async (method, args = []) => {
  const result = await method(...args).call();
  return result;
};

const bnToString = (v, d = 18) => {
  return new BigNumber(v).toString(10);
};

const passTime = async (duration) => {
  const id = Date.now();
  return new Promise((resolve, reject) => {
    web3.currentProvider.send(
      {
        jsonrpc: "2.0",
        method: "evm_increaseTime",
        params: [Number(duration)],
        id: id,
      },
      (err1) => {
        if (err1) return reject(err1);
        web3.currentProvider.send(
          {
            jsonrpc: "2.0",
            method: "evm_mine",
            id: id + 1,
          },
          (err2, res) => {
            return err2 ? reject(err2) : resolve(res);
          }
        );
      }
    );
  });
};

const generateRandomHash = async () => {
  const uniqueId = uuidv4();
  const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(uniqueId));
  // console.log("Random: ", uniqueId, hash);

  return hash;
};

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
};

const buildData = async (
  verifyingContract,
  chainId,
  spender,
  tokenId,
  nonce,
  deadline
) => {
  try {
    const EIP712Domain = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ];

    const domain = {
      name: "SoundProofIP NFT",
      version: "v1",
      chainId,
      verifyingContract,
    };

    const Permit = [
      { name: "spender", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ];

    const message = {
      spender,
      tokenId,
      nonce,
      deadline,
    };

    return {
      primaryType: "Permit",
      domain,
      types: { EIP712Domain, Permit },
      message,
    };
  } catch (err) {
    console.log("Get Signature: ", err.message);
  }
};

module.exports = {
  divByDecimal,
  bnToString,
  callMethod,
  passTime,
  getRandomInt,
  generateRandomHash,
  buildData,
};

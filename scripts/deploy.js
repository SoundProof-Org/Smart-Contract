const hre = require("hardhat");

async function main() {
  // Deploy SoundProofFactory Contract
  const SoundProofFactory = await hre.ethers.getContractFactory(
    "SoundProofFactory"
  );
  const SoundProofFactoryInstance = await SoundProofFactory.deploy();
  await SoundProofFactoryInstance.deployed();

  // Deploy SoundProofFactoryProxy Contract
  const SoundProofFactoryProxy = await hre.ethers.getContractFactory(
    "SoundProofFactoryProxy"
  );
  const SoundProofFactoryProxyInstance = await SoundProofFactoryProxy.deploy();
  await SoundProofFactoryProxyInstance.deployed();

  // // Update setImplementation on Proxy Contract
  await SoundProofFactoryProxyInstance.setImplementation(
    SoundProofFactoryInstance.address
  );

  console.log(
    SoundProofFactoryInstance.address,
    SoundProofFactoryProxyInstance.address
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

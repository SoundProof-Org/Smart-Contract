const hre = require("hardhat");

async function main() {
  // Deploy SoundProofUtils Contract
  const SoundProofUtils = await hre.ethers.getContractFactory(
    "SoundProofUtils"
  );
  const SoundProofUtilsInstance = await SoundProofUtils.deploy();
  await SoundProofUtilsInstance.deployed();

  // Deploy SoundProofUtilsProxy Contract
  const SoundProofUtilsProxy = await hre.ethers.getContractFactory(
    "SoundProofUtilsProxy"
  );
  const SoundProofUtilsProxyInstance = await SoundProofUtilsProxy.deploy();
  await SoundProofUtilsProxyInstance.deployed();

  // Update setImplementation on Proxy Contract
  await SoundProofUtilsProxyInstance.setImplementation(
    SoundProofUtilsInstance.address
  );

  console.log(
    "SoundProof Utils: ",
    SoundProofUtilsInstance.address,
    SoundProofUtilsProxyInstance.address
  );

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

  // Update setImplementation on Proxy Contract
  await SoundProofFactoryProxyInstance.setImplementation(
    SoundProofFactoryInstance.address
  );

  console.log(
    "SoundProof Factory: ",
    SoundProofFactoryInstance.address,
    SoundProofFactoryProxyInstance.address
  );

  // // Update Utils Contract to Factory
  // await SoundProofFactoryProxyInstance.updateSoundProofUtils(
  //   SoundProofUtilsProxyInstance.address
  // );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

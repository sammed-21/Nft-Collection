const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const {
  WHITELIST_CONTRACT_ADDRESS,
  METADATA_URL,
} = require("../constants/index");

async function main() {
  // Address of the whitelist contract that you deployed in the previous module
  const whitelistContract = WHITELIST_CONTRACT_ADDRESS;
  // URL from where we can extract the metadata for a Crypto Dev NFT
  const metadataURL = METADATA_URL;

  const cryptoDevsContract = await ethers.getContractFactory("CryptoDevs");

  const deployedCryptoDevsContract = await cryptoDevsContract.deploy(
    metadataURL,
    whitelistContract
  );

  await deployedCryptoDevsContract.deployed();

  console.log(
    "crypto devs contracts address:",
    deployedCryptoDevsContract.address
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
// 0x5d507a9004bC32FF675dFC60d2F2A6E2Be72675d

require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });

const INFURA_HTTP_URL = process.env.INFURA_HTTP_URL;
const INFURA_HTTP_SEPOLIA = process.env.INFURA_HTTP_Sepolia;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
module.exports = {
  solidity: "0.8.18",
  networks: {
    goerli: {
      url: INFURA_HTTP_URL,
      accounts: [PRIVATE_KEY],
    },
    sepolia: {
      url: INFURA_HTTP_SEPOLIA,
      accounts: [PRIVATE_KEY],
    },
  },
};

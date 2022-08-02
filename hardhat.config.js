require('@nomicfoundation/hardhat-toolbox')
// loads env file
require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.9',
  paths: {
    sources: './solidity/contracts',
    artifacts: './artifacts',
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    polygon: {
      // Polygon network
      url: process.env.MAINNET_RPC,
      accounts: [process.env.DEPLOY_KEY],
    },
    mumbai: {
      // Mumbai network
      url: process.env.MUMBAI_RPC,
      accounts: [process.env.DEPLOY_KEY],
    },
  },
}

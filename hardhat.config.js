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
      url: 'https://api.polygon.io/v1/',
      accounts: [],
    },
    mumbai: {
      // Mumbai network
      url: 'https://api.polygon.io/v1/',
      accounts: [],
    },
  },
}

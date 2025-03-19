require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545", 
      chainId: 1337, 
      accounts: {
        mnemonic: "test test test test test test test test test test test junk", 
      },
    }    
  }
};
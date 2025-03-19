const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const SimpleERC20 = await ethers.getContractFactory("SimpleERC20");
  const token = await SimpleERC20.deploy(
    "Simple Token", // name
    "STK",          // symbol
    1000000,        // initial supply
    18              // decimals             
  );

  await token.waitForDeployment();
  console.log("SimpleERC20 deployed to:", token.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
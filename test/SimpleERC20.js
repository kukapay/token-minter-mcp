const { expect } = require("chai");

describe("SimpleERC20", function () {
  let SimpleERC20, token, owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    SimpleERC20 = await ethers.getContractFactory("SimpleERC20");
    token = await SimpleERC20.deploy("Simple Token", "STK", 1000000, 6);
    await token.waitForDeployment();
  });

  it("Should set the correct name, symbol, and decimals", async function () {
    expect(await token.name()).to.equal("Simple Token");
    expect(await token.symbol()).to.equal("STK");
    expect(await token.decimals()).to.equal(6);
  });

  it("Should mint initial supply to the owner with custom decimals", async function () {
    const ownerBalance = await token.balanceOf(owner.address);
    expect(ownerBalance).to.equal(ethers.parseUnits("1000000", 6)); // 1000000 * 10^6
  });

  it("Should transfer tokens correctly", async function () {
    await token.transfer(addr1.address, ethers.parseUnits("1000", 6));
    const addr1Balance = await token.balanceOf(addr1.address);
    expect(addr1Balance).to.equal(ethers.parseUnits("1000", 6));
  });
});
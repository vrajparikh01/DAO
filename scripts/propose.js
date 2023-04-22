const { ethers } = require("hardhat");

async function main() {
  const governor = await ethers.getContractAt("GovernorContract");
  const box = await ethers.getContractAt("Box");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

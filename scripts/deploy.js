const { ethers } = require("hardhat");
const { keccak256 } = require("ethers/lib/utils");

async function main() {
  let deployer = await ethers.getSigner();

  // deploy GovernaceToken contract
  const GovernaceToken = await ethers.getContractFactory("GovernaceToken");
  const governaceToken = await GovernaceToken.deploy();
  await governaceToken.deployed();
  console.log("GovernanceToken deployed to:", governaceToken.address);

  // delegate governace token to deployer
  await delegate(governaceToken.address, deployer.address);
  console.log("Delegated!");

  // deploy Timelock contract
  const MIN_DELAY = 3600;
  const TimeLock = await ethers.getContractFactory("TimeLock");
  const timelock = await TimeLock.deploy(MIN_DELAY, [], [], deployer.address);
  await timelock.deployed();
  console.log("Timelock deployed to:", timelock.address);

  // deploy Governor contract
  const VOTING_PERIOD = 5; // 5 blocks
  const VOTING_DELAY = 1; // 1 block
  const QUORUM_PERCENTAGE = 4; // 4%

  // const Governor = await ethers.getContractFactory("GovernorContract");
  // const governor = await Governor.deploy(
  //   governaceToken.address,
  //   timelock.address,
  //   VOTING_PERIOD,
  //   VOTING_DELAY,
  //   QUORUM_PERCENTAGE,
  //   { gasLimit: 30000000 }
  // );
  // await governor.deployed();
  // console.log("Governor deployed to:", governor.address);

  // deploy with bytecode and abi bcoz contract size exceeds 24kb
  const Governor = await ethers.getContractFactory("GovernorContract");
  const bytecode = Governor.bytecode;
  const abi = Governor.interface;
  const signer = await ethers.getSigner();

  const constructorArgs = [
    governaceToken.address,
    timelock.address,
    VOTING_PERIOD,
    VOTING_DELAY,
    QUORUM_PERCENTAGE,
  ];
  const encodeArgs = ethers.utils.defaultAbiCoder.encode(
    ["address", "address", "uint256", "uint256", "uint256"],
    constructorArgs
  );
  const bytecodeWithArgs = bytecode + encodeArgs.slice(2);

  const salt = "0x" + "00".repeat(32);
  const bytecodeHash = keccak256(bytecodeWithArgs);
  const contractAddress = ethers.utils.getCreate2Address(
    signer.address,
    salt,
    bytecodeHash
  );

  const governor = new ethers.Contract(contractAddress, abi, signer);
  console.log("Governor deployed to:", governor.address);

  // setting up the roles
  const proposerRole = await timelock.PROPOSER_ROLE();
  const executorRole = await timelock.EXECUTOR_ROLE();
  const adminRole = await timelock.TIMELOCK_ADMIN_ROLE();
  const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

  // only the governor can propose
  const proposerTx = await timelock.grantRole(proposerRole, governor.address);
  await proposerTx.wait(1);

  // anyone can execute
  const executorTx = await timelock.grantRole(executorRole, ADDRESS_ZERO);
  await executorTx.wait(1);

  // only the governor can set the timelock
  const revokeTx = await timelock.revokeRole(adminRole, deployer.address);
  await revokeTx.wait(1);

  // deploy Box contract
  const Box = await ethers.getContractFactory("Box");
  const box = await Box.deploy();
  await box.deployed();
  console.log("Box deployed to:", box.address);

  // transfer ownership from deployer to governor
  const transferOwnerTx = await box.transferOwnership(timelock.address);
  await transferOwnerTx.wait(1);
  console.log("Ownership transferred to timelock!");
  console.log("Yooo!! GOVERNACE SYSTUM CREATED");
}

async function delegate(governaceTokenAddress, delegateAccount) {
  const GovernaceToken = await ethers.getContractAt(
    "GovernaceToken",
    governaceTokenAddress
  );
  const tx = await GovernaceToken.delegate(delegateAccount);
  await tx.wait(1);
  // seee how many checkpoints we have
  console.log(
    "Checkpoints: ",
    await GovernaceToken.numCheckpoints(delegateAccount)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

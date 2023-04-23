const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-block.js");
const { moveTime } = require("../utils/move-time.js");
const fs = require("fs");

const {
  FUNC,
  ARGS,
  PROPOSAL_DESCRIPTION,
  MIN_DELAY,
} = require("../helper-hardhat.config");

async function main() {
  const governor = await ethers.getContractAt(
    "GovernorContract",
    "0x1125158aa411811c9C4afBD7d6cdBEC532EBa7F6"
  );
  const box = await ethers.getContractAt(
    "Box",
    "0x0165878A594ca255338adfa4d48449f69242Eb8F"
  );

  const calldata = box.interface.encodeFunctionData(FUNC, ARGS);
  const descriptionHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION)
  );

  console.log("Queueing proposal...");

  const queueTx = await governor.queue(
    [box.address],
    [0],
    [calldata],
    descriptionHash
  );
  await queueTx.wait(1);

  if (network.name === "hardhat") {
    await moveTime(MIN_DELAY + 1);
    await moveBlocks(1);
  }

  console.log("Executing proposal...");
  const executeTx = await governor.execute(
    [box.address],
    [0],
    [calldata],
    descriptionHash
  );
  await executeTx.wait(1);

  const value = await box.retrieve();
  console.log("Box new value: ", value.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

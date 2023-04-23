const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-block.js");
const fs = require("fs");

const {
  FUNC,
  ARGS,
  PROPOSAL_DESCRIPTION,
  VOTING_DELAY,
  proposalsFile,
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

  // conversion into calldata (propose fn) (encoded to bytes calldata)
  const calldata = box.interface.encodeFunctionData(FUNC, ARGS);
  console.log("Calldata: ", calldata);
  console.log(`Proposing ${FUNC} on ${box.address} with args ${ARGS}`);
  console.log(`Proposal Description: ${PROPOSAL_DESCRIPTION}`);

  const proposeTx = await governor.propose(
    [box.address],
    [0],
    [calldata],
    PROPOSAL_DESCRIPTION
  );
  const proposeReceipt = await proposeTx.wait(1);
  console.log("Propose receipt: ", proposeReceipt);

  //   if we are on development chain, move blocks to trigger voting period
  if (network.name === "hardhat") {
    await moveBlocks(VOTING_DELAY + 1);
  }

  // get the proposal id (to vote) from the events emitted by the propose fn
  const proposalId = proposeReceipt.events[0].args.proposalId;
  // read the current proposals
  let proposals = JSON.parse(fs.readFileSync(proposalsFile), "utf8");
  let chainId = network.config.chainId;
  // add the proposal to the proposals file
  proposals[chainId].push(proposalId);
  fs.writeFileSync(proposalsFile, JSON.stringify(proposals, null, 2), "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

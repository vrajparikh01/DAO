const { ethers } = require("hardhat");
const { proposalsFile, VOTING_PERIOD } = require("../helper-hardhat-config");
const { moveBlocks } = require("../utils/move-block");

const proposalIndex = 0;

async function main() {
  const proposals = JSON.parse(fs.readFileSync(proposalsFile), "utf8");
  const proposalId = proposals[network.config.chainId][proposalIndex];

  // Vote (0->against, 1->for, 2->abstain)
  const voteWay = 1;
  const reason = "I am voting for this proposal";
  const governor = await ethers.getContractAt(
    "GovernorContract",
    "0x1125158aa411811c9C4afBD7d6cdBEC532EBa7F6"
  );
  const voteTx = await governor.castVoteWithReason(proposalId, voteWay, reason);
  const voteReceipt = await voteTx.wait(1);
  console.log("Vote receipt: ", voteReceipt);

  // move blocks
  if (network.name === "hardhat") {
    await moveBlocks(VOTING_PERIOD + 1);
  }

  console.log("Voting completed!");

  // check the state of the proposal
  const state = await governor.state(proposalId);
  console.log("Proposal state: ", state);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

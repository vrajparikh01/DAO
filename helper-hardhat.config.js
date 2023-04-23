module.exports = {
  MIN_DELAY: 3600,
  VOTING_PERIOD: 5, // 5 blocks
  VOTING_DELAY: 1, // 1 block
  QUORUM_PERCENTAGE: 4, // 4%
  ADDRESS_ZERO: "0x0000000000000000000000000000000000000000",
  FUNC: "store(uint256)",
  ARGS: [42],
  PROPOSAL_DESCRIPTION: "Proposal #1: Store 42 in the box",
  proposalsFile: "proposals.json",
};

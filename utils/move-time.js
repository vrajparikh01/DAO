const { network } = require("hardhat");

async function moveTime(amount) {
  console.log("Moving time...");
  await network.provider.send({
    method: "evm_increaseTime",
    params: [amount],
  });
  console.log(`Moved ${amount} seconds!`);
}

module.exports = { moveTime };

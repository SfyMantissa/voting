const votingAddress = require('./address');

task("getIsActive",
  "Get the flag which indicates whether the vote is concluded")
  .addParam("voteid", "Vote's ID")
  .setAction(async (taskArgs) => {
    const Voting = await hre.ethers.getContractFactory("Voting");
    const voting = await Voting.attach(votingAddress);
    const isActive = await voting.getIsActive(taskArgs.voteid);
    console.log('is active: ' + isActive);
  });

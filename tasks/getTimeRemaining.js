const votingAddress = require('./address');

task("getTimeRemaining",
  "Get the time remaining until the vote stops accepting votes")
  .addParam("voteid", "Vote's ID")
  .setAction(async (taskArgs) => {
    const Voting = await hre.ethers.getContractFactory("Voting");
    const voting = await Voting.attach(votingAddress);
    const timeRemaining = await voting.getTimeRemaining(taskArgs.voteid);
    console.log('time remaining: ' + timeRemaining);
  });

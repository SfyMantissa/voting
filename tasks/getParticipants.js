const votingAddress = require('./address');

task("getParticipants",
  "Get the list of everyone who voted")
  .addParam("voteid", "Vote's ID")
  .setAction(async (taskArgs) => {
    const Voting = await hre.ethers.getContractFactory("Voting");
    const voting = await Voting.attach(votingAddress);
    const participants = await voting.getParticipants(taskArgs.voteid);
    console.log('participants are: ' + participants);
  });

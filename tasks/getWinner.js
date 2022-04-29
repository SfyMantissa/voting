const votingAddress = require('./address');

task("getWinner",
  "Get the address of the vote's winner")
  .addParam("voteid", "Vote's ID")
  .setAction(async (taskArgs) => {
    const Voting = await hre.ethers.getContractFactory("Voting");
    const voting = await Voting.attach(votingAddress);
    const winner = await voting.getWinner(taskArgs.voteid);
    console.log('winner is: ' + winner);
  });

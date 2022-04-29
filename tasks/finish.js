const votingAddress = require('./address');

task("finish",
  "Finish the vote")
  .addParam("voteid", "Vote's ID")
  .setAction(async (taskArgs) => {
    const Voting = await hre.ethers.getContractFactory("Voting");
    const voting = await Voting.attach(votingAddress);

    const txFinish = await voting.finish(taskArgs.voteid);
    const rFinish = await txFinish.wait();
    console.log('voteId is ' + rFinish.events[0].args[0] + ', '
      + 'winner is ' + rFinish.events[0].args[1] + ', '
      + 'prize is ' + rFinish.events[0].args[2]);
  });

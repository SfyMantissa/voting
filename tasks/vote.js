const votingAddress = require('./address');

task("vote",
  "Vote for user")
  .addParam("voteid", "Vote's ID")
  .addParam("nominee", "Nominee's address")
  .addParam("fee", "ETH paid to call a function")
  .setAction(async (taskArgs) => {
    const Voting = await hre.ethers.getContractFactory("Voting");
    const voting = await Voting.attach(votingAddress);

    const txVote = await voting.vote(taskArgs.voteid, taskArgs.nominee, { value: taskArgs.fee });
    const rVote = await txVote.wait();
    console.log('voteId is ' + rVote.events[0].args[0] + ', '
      + 'voter is ' + rVote.events[0].args[1] + ', '
      + 'nominee is ' + rVote.events[0].args[2]);
  });

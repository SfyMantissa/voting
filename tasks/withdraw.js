const votingAddress = require('./address');

task("withdraw",
  "Withdraw the commission")
  .addParam("voteid", "Vote's ID")
  .setAction(async (taskArgs) => {
    const Voting = await hre.ethers.getContractFactory("Voting");
    const voting = await Voting.attach(votingAddress);

    const txWithdraw = await voting.withdraw(taskArgs.voteid);
    const rWithdraw = await txWithdraw.wait();
    console.log('voteId is ' + rWithdraw.events[0].args[0] + ', '
      + 'owner is ' + rWithdraw.events[0].args[1] + ', '
      + 'commission is ' + rWithdraw.events[0].args[2]);
  });

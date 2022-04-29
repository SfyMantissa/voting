const votingAddress = require('./address');
// import { votingAddress } from './address.js';

task("addVoting",
  "Start the vote")
  .setAction(async () => {
    const Voting = await hre.ethers.getContractFactory("Voting");
    const voting = await Voting.attach(votingAddress);

    const txAddVoting = await voting.addVoting();
    const rAddVoting = await txAddVoting.wait();
    console.log('voteId is ' + rAddVoting.events[0].args[0]);
  });

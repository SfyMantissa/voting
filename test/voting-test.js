const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting", function() {

  describe("Vote initialization.", function() {

    it("addVoting: should give the owner ability to start the vote.", async function() {
      const Voting = await ethers.getContractFactory("Voting");
      const voting = await Voting.deploy();
      [owner] = await ethers.getSigners();
      await voting.deployed();
      const txAddVoting = voting.addVoting();
      await expect(txAddVoting).to.emit(voting, 'VoteIsCreated');
      const rAddVoting = await (await txAddVoting).wait();
      this.voteId = rAddVoting.events[0].args[0];
      expect(this.voteId).to.equal(0);
    });

    describe("After vote initialization (within 3 days).", function() {

      let voteId = 0;
      let fee = 10000000000000000n;
      let nominee1 = '0x83695063361619BF2765D885C51Cc6B72D650515';
      let nominee2 = '0x53b5Dd95992F7C197bCe8a9Dc92546CD83B39a98';
      let nullAddress = '0x0000000000000000000000000000000000000000';

      before(async () => {
        const Voting = await ethers.getContractFactory("Voting");
        voting = await Voting.deploy();
        [owner, voter1, voter2, voter3] = await ethers.getSigners();
        await voting.deployed();
        await voting.addVoting();
      });

      it("vote: should give the owner ability to pay fee and vote for nominee1.", async function() {
        const txVote1 = voting.connect(owner).vote(voteId, nominee1, { value: fee });
        await expect(txVote1).to.emit(voting, "VoterHasVoted");
        const rVote1 = await (await txVote1).wait();
        expect(rVote1.events[0].args[0]).to.equal(voteId);
        expect(rVote1.events[0].args[1]).to.equal(owner.address);
        expect(rVote1.events[0].args[2]).to.equal(nominee1);
      });

      it("vote: should give voter1 avility to pay fee and vote for nominee1.", async function() {
        const txVote2 = voting.connect(voter1).vote(voteId, nominee1, { value: fee });
        await expect(txVote2).to.emit(voting, "VoterHasVoted");
        const rVote2 = await (await txVote2).wait();
        expect(rVote2.events[0].args[0]).to.equal(voteId);
        expect(rVote2.events[0].args[1]).to.equal(voter1.address);
        expect(rVote2.events[0].args[2]).to.equal(nominee1);
      });

      it("vote: should give voter2 ability to pay fee and vote for nominee2.", async function() {
        const txVote3 = voting.connect(voter2).vote(voteId, nominee2, { value: fee });
        await expect(txVote3).to.emit(voting, "VoterHasVoted");
        const rVote3 = await (await txVote3).wait();
        expect(rVote3.events[0].args[0]).to.equal(voteId);
        expect(rVote3.events[0].args[1]).to.equal(voter2.address);
        expect(rVote3.events[0].args[2]).to.equal(nominee2);
      });

      it("vote: should NOT give owner ability to pay fee and vote twice.", async function() {
        await expect(voting.connect(owner).vote(voteId, nominee1, { value: fee })).to.be.revertedWith("You can only vote once :)");
      });

      it("vote: should NOT give voter3 ability to not pay the proper fee amount and vote.", async function() {
        await expect(voting.connect(voter3).vote(voteId, nominee1, { value: fee - 10n })).to.be.revertedWith("The voting fee is 0.01 ETH.");
      });

      it("getParticipants: should give the user ability to get the list of all voter addresses.", async function() {
        expect(await voting.getParticipants(voteId)).to.have.members([owner.address, voter1.address, voter2.address]);
      });

      it("getIsActive: should give the user ability to know whether endVote was called on the vote.", async function() {
        expect(await voting.getIsActive(voteId)).to.be.true;
      });

      it("getTimeRemaining: should give the user ability to know the voting time remaining.", async function() {
        expect(Number(await voting.getTimeRemaining(voteId))).to.be.a('number');
      });

      it("getWinner: should give the user ability to get the winner's address.", async function() {
        expect(await voting.getWinner(voteId)).to.equal(nullAddress);
      });

      it("finish: should NOT give the user ability to end the vote before it is concluded.", async function() {
        await expect(voting.finish(voteId)).to.be.revertedWith("Oops, the vote cannot be ended prematurely :(");
      });

      it("withdraw: should NOT give the owner ability to withdraw ETH before the vote is concluded.", async function() {
        await expect(voting.withdraw(voteId)).to.be.revertedWith("This vote is not over yet :)");
      });

      describe("After vote conclusion (after 3 days).", function() {

        it("getTimeRemaining: should return 0 (underflow control — if time elapsed goes beyond 3 days, uint32 may go out of bounds).", async function() {
          await ethers.provider.send('evm_increaseTime', [3 * 24 * 60 * 60]);
          await ethers.provider.send('evm_mine');
          expect(Number(await voting.getTimeRemaining(voteId))).to.equal(0);
        });

        it("finish: should give the user ability to end the vote after it is concluded.", async function() {
          const txFinish = voting.finish(voteId);
          await expect(txFinish).to.emit(voting, "VoteHasEnded");
          const rFinish = await (await txFinish).wait();
          const prize = 3n * fee * 90n / 100n;
          expect(rFinish.events[0].args[0]).to.equal(voteId);
          expect(rFinish.events[0].args[1]).to.equal(nominee1);
          expect(rFinish.events[0].args[2]).to.equal(prize);
        });

        it("vote: should NOT give voter3 ability to pay fee and vote for nominee1.", async function() {
          await expect(voting.connect(voter3).vote(voteId, nominee1, { value: fee })).to.be.revertedWith("Oops, that vote no longer accepts new votes :(");
        });

        it("withdraw: should give the owner ability to withdraw ETH after the vote is concluded.", async function() {
          const txWithdraw = voting.withdraw(voteId);
          await expect(txWithdraw).to.emit(voting, "Withdrawal");
          const rWithdraw = await (await txWithdraw).wait();
          const commission = 3n * fee * 10n / 100n;
          expect(rWithdraw.events[0].args[0]).to.equal(voteId);
          expect(rWithdraw.events[0].args[1]).to.equal(owner.address);
          expect(rWithdraw.events[0].args[2]).to.equal(commission);
        });

        it("getParticipants: should give the user ability to get the list of all voter addresses.", async function() {
          expect(await voting.getParticipants(voteId)).to.have.members([owner.address, voter1.address, voter2.address]);
        });

        it("getWinner: should give the user ability to get the winner's address.", async function() {
          expect(await voting.getWinner(voteId)).to.equal(nominee1);
        });

        it("getIsActive: should give the user ability to know whether endVote was called on the vote.", async function() {
          expect(await voting.getIsActive(voteId)).to.be.false;
        });

        it("getTimeRemaining: should give the user ability to know the voting time remaining.", async function() {
          expect(Number(await voting.getTimeRemaining(voteId))).to.be.a('number');
        });
      });
    });
  });
});

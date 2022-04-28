const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { solidity } = waffle;

describe("Voting", function() {

  describe("Vote initialization", function() {

    describe("startVote", function() {
      it("should return the vote's ID (can only be called by the owner).", async function() {
        const Voting = await ethers.getContractFactory("Voting");
        voting = await Voting.deploy();
        await voting.deployed();
        const txPromise = voting.startVote();
        await expect(txPromise).to.emit(voting, 'VoteIsCreated');
        const receipt = await (await txPromise).wait();
        const voteId = receipt.events[0].args[0];
        expect(voteId).to.equal(0);
      });
    });
  });

  describe("After vote initialization", function() {

    let voteId = 0;
    let nominee1 = '0x83695063361619BF2765D885C51Cc6B72D650515';
    let nominee2 = '0x53b5Dd95992F7C197bCe8a9Dc92546CD83B39a98';
    let fee = 10000000000000000n;

    before(async () => {
      const Voting = await ethers.getContractFactory("Voting");
      voting = await Voting.deploy();
      [owner, voter1, voter2, voter3] = await ethers.getSigners();
      await voting.deployed();
      await voting.startVote();
    });

    describe("Voting (within 3 days)", function() {
      it("should give the owner ability to vote for nominee1.", async function() {

        // Owner votes for nominee1.
        const txVote1 = voting.connect(owner).vote(voteId, nominee1, { value: fee });
        await expect(txVote1).to.emit(voting, "VoterHasVoted");
        const rVote1 = await (await txVote1).wait();
        expect(rVote1.events[0].args[0]).to.equal(voteId);
        expect(rVote1.events[0].args[1]).to.equal(owner.address);
        expect(rVote1.events[0].args[2]).to.equal(nominee1);

        // voter1 votes for nominee1.
        const txVote2 = voting.connect(voter1).vote(voteId, nominee1, { value: fee });
        await expect(txVote2).to.emit(voting, "VoterHasVoted");
        const rVote2 = await (await txVote2).wait();
        expect(rVote2.events[0].args[0]).to.equal(voteId);
        expect(rVote2.events[0].args[1]).to.equal(voter1.address);
        expect(rVote2.events[0].args[2]).to.equal(nominee1);

        // voter2 votes for nominee2.
        const txVote3 = voting.connect(voter2).vote(voteId, nominee2, { value: fee });
        await expect(txVote3).to.emit(voting, "VoterHasVoted");
        const rVote3 = await (await txVote3).wait();
        expect(rVote3.events[0].args[0]).to.equal(voteId);
        expect(rVote3.events[0].args[1]).to.equal(voter2.address);
        expect(rVote3.events[0].args[2]).to.equal(nominee2);

        // owner tries to vote for nominee1.
        await expect(voting.connect(owner).vote(voteId, nominee1, { value: fee })).to.be.revertedWith("You can only vote once :)");
        await expect(voting.connect(voter3).vote(voteId, nominee1, { value: fee - 10n })).to.be.revertedWith("The voting fee is 0.01 ETH.");
      });


      it("should give any user the ability to end the vote given vote's ID.", async function() {
        // should get reverted
        await expect(voting.endVote(voteId)).to.be.revertedWith("Oops, the vote cannot be ended prematurely :(");

        // should pass
        await ethers.provider.send('evm_increaseTime', [3 * 24 * 60 * 60]);
        await ethers.provider.send('evm_mine');
        const txEndVote = voting.endVote(voteId);
        await expect(txEndVote).to.emit(voting, "VoteHasEnded");
        const rEndVote = await (await txEndVote).wait();
        const prize = 3n * fee * 90n / 100n;
        expect(rEndVote.events[0].args[0]).to.equal(voteId);
        expect(rEndVote.events[0].args[1]).to.equal(nominee1);
        expect(rEndVote.events[0].args[2]).to.equal(prize);
      });

      it("should give the owner ability to withdraw 10% of the pot given vote's ID.", async function() {

        //shoudn't be able to withdraw
        // expect(await voting.withdraw(voteId)).to.be.reverted;

        //should be able to withdraw
        const txWithdraw = voting.withdraw(voteId);
        await expect(txWithdraw).to.emit(voting, "Withdrawal");
        const rWithdraw = await (await txWithdraw).wait();
        const commission = 3n * fee * 10n / 100n;
        expect(rWithdraw.events[0].args[0]).to.equal(voteId);
        expect(rWithdraw.events[0].args[1]).to.equal(owner.address);
        expect(rWithdraw.events[0].args[2]).to.equal(commission);
      });
    });

    describe("getParticipants", function() {
      it("should give the user ability to get the list of all voter addresses given vote's ID.", async function() {
        expect(await voting.getParticipants(voteId)).to.have.members([owner.address, voter1.address, voter2.address]);
      });
    });

    describe("getWinner", function() {
      it("should give the user ability to get the winner's address given vote's ID.", async function() {
        expect(await voting.getWinner(voteId)).to.equal(nominee1);
      });
    });

    describe("getIsActive", function() {
      it("should give the user ability to know whether endVote was called given vote's ID.", async function() {
        expect(await voting.getIsActive(voteId)).to.be.false;
      });
    });

    describe("getTimeRemaining", function() {
      it("should give the user ability to know the voting time remaining given vote's ID.", async function() {
        expect(Number(await voting.getTimeRemaining(voteId))).to.be.a('number');
      });
    });
  });
});

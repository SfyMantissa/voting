const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting", function() {

  beforeEach(async () => {
    const Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy();
  });

  describe("startVote", function() {
    it("should return the vote's ID (can only be called by the owner).", async function() {
      await voting.deployed();
    });
  });

  describe("vote", function() {
    it("should give the user ability to vote given vote's ID and nominee address.", async function() {
      await voting.deployed();
    });
  });

  describe("endVote", function() {
    it("should give any user the ability to end the vote given vote's ID.", async function() {
      await voting.deployed();
    });
  });

  describe("withdraw", function() {
    it("should give the owner ability to withdraw 10% of the pot given vote's ID.", async function() {
      await voting.deployed();
    });
  });

  describe("getParticipants", function() {
    it("should give the user ability to get the list of all voter addresses given vote's ID.", async function() {
      await voting.deployed();
    });
  });

  describe("getWinner", function() {
    it("should give the user ability to get the winner's address given vote's ID.", async function() {
      await voting.deployed();
    });
  });

  describe("getIsActive", function() {
    it("should give the user ability to know whether endVote was called given vote's ID.", async function() {
      await voting.deployed();
    });
  });

  describe("getTimeRemaining", function() {
    it("should give the user ability to know the voting time remaining given vote's ID.", async function() {
      await voting.deployed();
    });
  });

  describe("_maxArrayValue", function() {
    it("should return the max value in a given uint32 array.", async function() {
      await voting.deployed();
    });
  });
});

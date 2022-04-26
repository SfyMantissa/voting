// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.1;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {

  uint32 voteCount;
  mapping(uint32 => Vote) votes;

  struct Vote {
    mapping(address => uint32) nomineeIndex;
    mapping(address => bool) voterHasVoted;
    mapping(address => uint32) nomineeToVoteCount;
    address[] participants;
    uint32[] totalVotesPerNominee;
    uint32 nomineeCount;
    uint256 startTimestamp;
    bool isActive;
    address currentLeader;
    address winner;
  }

  function startVote() external onlyOwner {
    uint32 voteId = voteCount++;
    uint256 _startTimestamp = block.timestamp;
    Vote storage _vote = votes[voteId];

    _vote.startTimestamp = _startTimestamp;
    _vote.isActive = true;
  }
  
  function vote(uint32 voteId, address nominee) external payable {
    Vote storage _vote = votes[voteId];
    require(block.timestamp <= _vote.startTimestamp + 3 days, "Oops, that vote no longer accepts new votes :(");
    require(!_vote.voterHasVoted[msg.sender], "You can only vote once :)");
    require(_vote.isActive, "This vote is over :)");
    require(msg.value == 0.01 ether, "The voting fee is 0.01 ETH.");

    if (_vote.nomineeToVoteCount[nominee] == 0) {
      _vote.nomineeIndex[nominee] = _vote.nomineeCount++;
      _vote.totalVotesPerNominee.push(0);
    }

    _vote.participants.push(msg.sender);
    _vote.nomineeToVoteCount[nominee]++;
    _vote.voterHasVoted[msg.sender] = true;
    _vote.totalVotesPerNominee[_vote.nomineeIndex[nominee]] = _vote.nomineeToVoteCount[nominee];

    if (_vote.nomineeToVoteCount[nominee] >= _maxArrayValue(_vote.totalVotesPerNominee)) {
      _vote.currentLeader = nominee;
    }
  }

  function endVote(uint32 voteId) external {
    //require(block.timestamp >= votes[voteId].startTimestamp + 3 days, "Oops, the vote cannot be ended prematurely :(");
    votes[voteId].isActive = false;
    votes[voteId].winner = votes[voteId].currentLeader;

    uint256 prize = (address(this).balance / 100) * 90;
    address payable winner = payable(votes[voteId].winner);
    winner.transfer(prize);
  }

  function withdraw(uint32 voteId) external onlyOwner {
    require(!votes[voteId].isActive, "This vote is not over yet :)");
    address payable _owner = payable(address(uint160(owner())));
    _owner.transfer(address(this).balance);
  }

  function getParticipants(uint32 voteId) external view returns (address[] memory) {
    return votes[voteId].participants;
  }

  function getWinner(uint32 voteId) external view returns (address) {
    return votes[voteId].winner;
  }

  function getIsActive(uint32 voteId) external view returns (bool) {
    return votes[voteId].isActive;
  }

  function getTimeRemaining(uint32 voteId) external view returns (uint256) {
    uint256 timeRemaining = votes[voteId].startTimestamp + 3 days - block.timestamp;
    return timeRemaining;
  }

  function _maxArrayValue(uint32[] memory array) pure internal returns (uint32) {
    uint32 largest = 0; 
    uint32 i;

    for(i = 0; i < array.length; i++){
        if(array[i] > largest) {
          largest = array[i]; 
        } 
    }
    return largest;
  }
}

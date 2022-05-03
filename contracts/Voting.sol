// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.1;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @author Sfy Mantissa
/// @title Voting with prize for the winner and commission for the owner.
contract Voting is Ownable {

  uint256 voteCount;
  mapping(uint256 => Vote) votes;

  struct Vote {
    mapping(address => uint256) nomineeIndex;
    mapping(address => bool) voterHasVoted;
    mapping(address => uint256) nomineeToVoteCount;
    address[] participants;
    uint256[] totalVotesPerNominee;
    uint256 balance;
    uint256 nomineeCount;
    uint256 startTimestamp;
    bool isActive;
    address currentLeader;
    address winner;
  }

  /// @notice Gets triggered upon creation of a new vote by the owner.
  event VoteIsCreated(uint256 voteId);

  /// @notice Gets triggered upon a successful vote by the owner or any other
  ///         user.
  event VoterHasVoted(uint256 voteId, address voter, address nominee);

  /// @notice Gets triggered upon a succcessful finish of a vote by the owner
  ///         or any other user.
  event VoteHasEnded(uint256 voteId, address winner, uint256 prize);

  /// @notice Gets triggered upon a successful comission withdrawal by the
  ///         owner after the vote is over.
  event Withdrawal(uint256 voteId, address owner, uint256 commission);

  /// @notice Start the vote.
  /// @dev Each consequent vote has an index incremented by 1 starting at 0.
  ///      Multiple votes may occur simultaneously.
  function addVoting() external onlyOwner {
    uint256 voteId = voteCount++;
    uint256 _startTimestamp = block.timestamp;
    Vote storage _vote = votes[voteId];
    _vote.startTimestamp = _startTimestamp;
    _vote.isActive = true;

    emit VoteIsCreated(voteId);
  }
  
  /// @notice Vote for a nominee.
  /// @param voteId Integer which represents index of the vote.
  /// @param nominee Address of the nominee chosen by the voter.
  /// @dev Take notice of multiple require statements.
  ///      If multiple nominees have the same amount of votes, the one, for
  ///      whom the vote was placed last is considered the currentLeader.
  function vote(uint256 voteId, address nominee) external payable {
    Vote storage _vote = votes[voteId];
    require(
        block.timestamp <= _vote.startTimestamp + 3 days,
        "Oops, that vote no longer accepts new votes :("
    );
    require(!_vote.voterHasVoted[msg.sender], "You can only vote once :)");
    require(msg.value == 0.01 ether, "The voting fee is 0.01 ETH.");

    if (_vote.nomineeToVoteCount[nominee] == 0) {
      _vote.nomineeIndex[nominee] = _vote.nomineeCount++;
      _vote.totalVotesPerNominee.push(0);
    }

    _vote.balance += 10000000000000000;
    _vote.participants.push(msg.sender);
    _vote.nomineeToVoteCount[nominee]++;
    _vote.voterHasVoted[msg.sender] = true;
    _vote.totalVotesPerNominee[_vote.nomineeIndex[nominee]] 
        = _vote.nomineeToVoteCount[nominee];

    if (_vote.nomineeToVoteCount[nominee] 
        >= maxArrayValue(_vote.totalVotesPerNominee)) {
      _vote.currentLeader = nominee;
    } 

    emit VoterHasVoted(voteId, msg.sender, nominee);
  }

  /// @notice Finish the vote.
  /// @param voteId Integer which represents index of the vote.
  /// @dev Note that votes are stopped being accepted automatically after 
  ///      3 days. Votes being no longer accepted doesn't imply that the vote
  ///      is concluded. "Conclusion/finish of the vote" == isActive getting
  ///      set to "false" and prize getting sent.
  ///      Winner receives 90% of all ETH deposited.
  function finish(uint256 voteId) external {
    Vote storage _vote = votes[voteId];
    require(
        block.timestamp > _vote.startTimestamp + 3 days,
        "Oops, the vote cannot be ended prematurely :("
    );
    _vote.isActive = false;
    _vote.winner = _vote.currentLeader;
    uint256 prize = (_vote.balance * 90) / 100;
    _vote.balance = _vote.balance - prize;
    address payable winner = payable(_vote.winner);

    emit VoteHasEnded(voteId, winner, prize);
    winner.transfer(prize);
  }
  
  /// @notice Withdraw the commission.
  /// @param voteId Integer which represents index of the vote.
  /// @dev Owner receives 10% of all ETH deposited.
  function withdraw(uint256 voteId) external onlyOwner {
    Vote storage _vote = votes[voteId];
    require(!_vote.isActive, "This vote is not over yet :)");
    address payable _owner = payable(owner());
    uint256 commission = _vote.balance;

    emit Withdrawal(voteId, msg.sender, commission);
    _owner.transfer(commission);
  }

  /// @notice Get the list of everyone who voted.
  /// @param voteId Integer which represents index of the vote.
  //  @return An array of voter addresses.
  function getParticipants(uint256 voteId) 
    external
    view
    returns (address[] memory)
  {
    return votes[voteId].participants;
  }

  /// @notice Get the address of the vote's winner.
  /// @param voteId Integer which represents index of the vote.
  /// @return Winner address.
  function getWinner(uint256 voteId)
    external
    view
    returns (address) 
  {
    return votes[voteId].winner;
  }

  /// @notice Get the flag which indicates whether the vote is concluded.
  /// @param voteId Integer which represents index of the vote.
  /// @return Bool flag which is true if the vote is not concluded and
  ///         false otherwise.
  function getIsActive(uint256 voteId)
    external
    view
    returns (bool)
  {
    return votes[voteId].isActive;
  }

  /// @notice Get the time remaining until the vote stops accepting votes.
  /// @param voteId Integer which represents index of the vote.
  /// @return Time remaining in seconds; 0 if votes are no longer accepted.
  function getTimeRemaining(uint256 voteId)
    external
    view
    returns (uint256)
  {
    if (votes[voteId].isActive == false) {
      return 0;
    } else if (votes[voteId].startTimestamp + 3 days >= block.timestamp) {
      return votes[voteId].startTimestamp + 3 days - block.timestamp;
    } else {
      return 0;
    }
  }

  /// @notice Get the maximum value in an uint256 array.
  /// @param array An uint256 array.
  /// @return Integer which represents the maximum value.
  function maxArrayValue(uint256[] memory array)
    internal
    pure
    returns (uint256) 
  {
    uint256 max = 0; 

    for(uint256 i = 0; i < array.length; i++) {
      if(array[i] > max) {
        max = array[i]; 
      } 
    }

    return max;
  }
}

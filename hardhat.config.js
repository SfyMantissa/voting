require("@nomiclabs/hardhat-waffle");
require('dotenv').config();
require('solidity-coverage');

const { addVoting } = require('./tasks/addVoting');
const { vote } = require('./tasks/vote');
const { finish } = require('./tasks/finish');
const { withdraw } = require('./tasks/withdraw');
const { getParticipants } = require('./tasks/getParticipants');
const { getWinner } = require('./tasks/getWinner');
const { getIsActive } = require('./tasks/getIsActive');
const { getTimeRemaining } = require('./tasks/getTimeRemaining');

module.exports = {
  solidity: "0.8.4",
  defaultNetwork: "rinkeby",
  networks: {
    rinkeby: {
      url: process.env.ALCHEMY_KEY,
      accounts: [process.env.PRIVATE_KEY],
    }
  }
};

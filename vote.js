module.exports = { vote}

const { AVClient } = require("@aion-dk/js-client");

async function vote(boardUrl, votingRoundReference, electionCodes) {
  const client = new AVClient(boardUrl);
  await client.initialize();
  client.generateProofOfElectionCodes(electionCodes)
  await client.createVoterRegistration(votingRoundReference)
  const { items: { contestConfigs } } = client.getLatestConfig()
  const ballotConfig = client.getVoterBallotConfig()
  const ballotSelection = dummyBallotSelection(ballotConfig, contestConfigs)
  await client.constructBallot(ballotSelection)
  await client.castBallot();
}

function dummyBallotSelection(ballotConfig, contestConfigs) {
  return {
    reference: ballotConfig.content.reference,
    contestSelections: ballotConfig.content.contestReferences.map(cr => dummyContestSelection(contestConfigs[cr]))
  }
}

function dummyContestSelection(contestConfig) {
  return {
    reference: contestConfig.content.reference,
    piles: [{
      multiplier: 1,
      optionSelections: [
        { reference: contestConfig.content.options[getRandomArbitrary(0, contestConfig.content.options.length - 1)].reference }
      ]
    }]
  }
}
function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

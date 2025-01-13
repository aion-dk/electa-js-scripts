module.exports = { vote }

const { AVClient } = require("@aion-dk/js-client");

async function vote(boardUrl, votingRoundReference, electionCodes) {
  try {
    const client = new AVClient(boardUrl);
    await client.initialize();
    client.generateProofOfElectionCodes(electionCodes)
    await client.createVoterRegistration(votingRoundReference)
    const { items: { contestConfigs, votingRoundConfigs } } = client.getLatestConfig()
    const votingRoundConfig = votingRoundConfigs[votingRoundReference]
    const ballotConfig = client.getVoterBallotConfig()
    const ballotSelection = dummyBallotSelection(ballotConfig, votingRoundConfig, contestConfigs)
    await client.constructBallot(ballotSelection)
    await client.castBallot();
  } catch(error) {
     if(error.response?.data) {
      return console.log(error.response.data)
    } else {
      throw error
    }
  }
}

function dummyBallotSelection(ballotConfig, votingRoundConfig, contestConfigs) {
  let availableContestReferences = ballotConfig.content.contestReferences
      .filter(reference => votingRoundConfig.content.contestReferences.includes(reference))

  return {
    reference: ballotConfig.content.reference,
    contestSelections: availableContestReferences.map(cr => dummyContestSelection(contestConfigs[cr]))
  }
}

function dummyContestSelection(contestConfig) {
  let optionSelections = []
  while(contestConfig.content.markingType.minMarks > optionSelections.length) {
    let newSelection = { reference: contestConfig.content.options[getRandomArbitrary(0, contestConfig.content.options.length - 1)].reference }
    if(!optionSelections.map(x => x.reference ).includes(newSelection.reference)) {
      optionSelections.push(newSelection)
    }
  }

  return {
    reference: contestConfig.content.reference,
    piles: [{
      multiplier: 1,
      optionSelections: optionSelections
    }]
  }
}
function getRandomArbitrary(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

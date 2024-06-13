// @ts-check
/**
 * Prerequisites:
 * Site, organisation, trustees and an admin must be set up in Electa
 */

const { signIntoAPI, headers, createVotingRound, getContests} = require("../utils/generic")
const { electionConferenceUrl, conferenceUrl, admin } = require("../utils/variables")


async function populateVotingRound(contestAmount = 1000) {
  let signInJson = await signIntoAPI(conferenceUrl, admin)
  let contestsJson = await getContests(electionConferenceUrl, headers(signInJson.token), 1, contestAmount)

  let votingRound = {
    voting_round: {
      title: {
        "en": "title",
      },
      name: "vr-1",
      demo: true,
      contest_references: contestsJson.data.map(x => x.reference),
      status: "open"
    }
  }
  let votingRoundJson = await createVotingRound(electionConferenceUrl, votingRound, headers(signInJson.token))
  console.log(`Created voting round with reference: ${votingRoundJson.reference} `)
}

const args = process.argv;
let [contestAmount] = args.slice(2).map(x => parseInt(x))
populateVotingRound(contestAmount)


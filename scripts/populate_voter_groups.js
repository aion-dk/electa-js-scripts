// @ts-check
/**
 * Prerequisites:
 * Site, organisation, election, trustees and an admin must be set up in Electa
 */

const { signIntoAPI, createContest, createVoterGroup, headers } = require("../../../functions/api/generic")
const { benchmark } = require("../../../functions/api/benchmark");
const { electionConferenceUrl, conferenceUrl, admin } = require("../../../scenarios/electa/loadtest/variables")

async function populateVoterGroups(amount = null){
  let signInJson = await signIntoAPI(conferenceUrl, admin)

  await benchmark(`${amount} voters groups took: `, async function() {
      for (let j = 1; j <= amount; j++) {
        let contest = {
          contest: {
            title: {
              en: `contest-${j}-en-title`
            },
            reference: `contest-${j}`,
            rule_set: "normal", // normal, ranked, split
            normal_result_method: "regular"
          }
        }

        let contestJson = await createContest(electionConferenceUrl, contest, headers(signInJson.token))

        let voterGroup = {
          voter_group: {
            name: "VG" + `${j}`.padStart(4, "0"),
            reference: "VG" + `${j}`.padStart(4, "0"),
            contest_ids: [contestJson.id]
          }
        }

        await createVoterGroup(electionConferenceUrl, voterGroup, headers(signInJson.token))
      }
  })
}


const args = process.argv;
let [amount] = args.slice(2).map(x => parseInt(x))
populateVoterGroups(amount)

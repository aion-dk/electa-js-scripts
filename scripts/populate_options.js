// @ts-check
/**
 * Prerequisites:
 * Site, organisation, election, trustees and an admin must be set up in Electa
 */

const { signIntoAPI, createOption, headers, getContests } = require("../utils/generic")
const { benchmark } = require("../utils/benchmark");
const { electionConferenceUrl, conferenceUrl, admin } = require("../utils/variables")

async function populateOptions(amountPerContest = null){
  let signInJson = await signIntoAPI(conferenceUrl, admin)

  let contestsJson = await getContests(electionConferenceUrl, headers(signInJson.token), 1, 10000)

  for(const contest of contestsJson.data) {
    await benchmark(`${amountPerContest} options for contest #${contest.id} took: `, async function() {
      for (let j = 1; j <= amountPerContest; j++) {

        let option = {
          option: {
            title: {"en": "OPT" + `${j}`.padStart(4, "0")},
          }
        }

        await createOption(electionConferenceUrl, contest.id, option, headers(signInJson.token))
      }
    })
  }
}

const args = process.argv;
let [amountPerContest] = args.slice(2).map(x => parseInt(x))

populateOptions(amountPerContest)

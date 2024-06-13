// @ts-check
/**
 * Prerequisites:
 * Site, organisation, trustees and an admin must be set up in Electa
 */

const { headers, signIntoAPI} = require("../utils/generic")
const { benchmark } = require("../utils/benchmark");
const { electionConferenceUrl, conferenceUrl, admin } = require("../utils/variables")


async function prepareForVoting(threshold = 1) {
  let signInJson = await signIntoAPI(conferenceUrl, admin)


  /**
   * Conduct threshold ceremony
   */
  await fetch(`${electionConferenceUrl}/e2e/threshold_ceremony/start_ceremony`, {
    method: "POST",
    headers: headers(signInJson.token)
  })

  let body = {
    threshold: threshold // This value would depend on how many trustees are configured on the site
  }

  await fetch(`${electionConferenceUrl}/e2e/threshold_ceremony/set_threshold`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: headers(signInJson.token)
  })

  /**
   * Initialize board. This can be done earlier or later.
   * However you should note that when the board has been initialized configuration will be restricted as to ensure integrity
   */
  await fetch(`${electionConferenceUrl}/e2e/board`, {
    method: "POST",
    headers: headers(signInJson.token)
  })
}


const args = process.argv;
let [threshold] = args.slice(2).map(x => parseInt(x))
prepareForVoting(threshold)


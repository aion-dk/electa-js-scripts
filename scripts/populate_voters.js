// @ts-check
/**
 * Prerequisites:
 * Site, organisation, trustees and an admin must be set up in Electa
 */

const { signIntoAPI, createVoter, headers } = require("../utils/generic")
const { benchmark } = require("../utils/benchmark");
const { electionConferenceUrl, conferenceUrl, admin } = require("../utils/variables")

async function populateVoters(voterBatches, votersPerBatch, voterGroupAmount, batchStart = 1){
  let signInJson = await signIntoAPI(conferenceUrl, admin)

  let voterGroupsResponse = await fetch(`${electionConferenceUrl}/voter_groups`, {
    method: "GET",
    headers: headers(signInJson.token)
  })
  let voterGroupsJson = await voterGroupsResponse.json()

  await benchmark(`${(voterBatches - batchStart) * votersPerBatch} voters took: `, async function() {
    for (let i = batchStart; i < voterBatches; i++) {
      let signInJson = await signIntoAPI(conferenceUrl, admin)

      await benchmark(`Batch ${i} - ${votersPerBatch} voters took: `, async function() {
        for (let j = 1; j <= votersPerBatch; j++) {
          let voter = {
            voter_group_id: voterGroupsJson[(j+(i*votersPerBatch))%voterGroupAmount].id,
            identifier: `voter-${j+(i*votersPerBatch)}`,
            weight: 1,
            demo: true
          }

          await createVoter(electionConferenceUrl, voter, headers(signInJson.token))
        }
      })
    }
  })
}

const args = process.argv;
let [voterBatches, votersPerBatch, voterGroupAmount, batchStart = 1] = args.slice(2).map(x => parseInt(x))
populateVoters(voterBatches, votersPerBatch, voterGroupAmount, batchStart)


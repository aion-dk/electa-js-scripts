// @ts-check
/**
 * Prerequisites:
 * - Site, organisation, election and an admin must be set up in Electa
 * - variables.js has been populated with the required information
 */
const fs = require("fs");
const { signIntoAPI, createContest, createVoterGroup, headers, createOption, getContests} = require("../utils/generic")
const { benchmark } = require("../utils/benchmark");
const { electionConferenceUrl, conferenceUrl, admin } = require("../utils/variables")

async function populateResourceFromCSV(resourceType, csvPath, batchStart = 0){
  let csvHeaders;
  await fs.readFile(csvPath, "latin1", await async function (err, data) {
    if(err) {
      console.log("Error reading CSV: " + err)
      return
    }

    let lines = data.split(/\r?\n/)
    lines.pop()
    csvHeaders = lines.shift().split(";")
    lines = lines.map(line => line.split(";").map(val => val.replaceAll("\"", "")))

    switch(resourceType) {
      case "contest":
        console.log("Not yet implemented!")
        break;
      case "voter_group":
        console.log("Not yet implemented!")
        break;
      case "option":
        await createOptions(lines, batchStart)
          break;
      case "contest_voter_group_pair":
        await createContestVoterGroupPairs(lines, batchStart)

        break;
      default:
        console.log("Unknown resource type!")
        return
    }
  });
}

async function createOptions(lines, batchStart){
  let signInJson = await signIntoAPI(conferenceUrl, admin)
  let contestsJson = await getContests(electionConferenceUrl, headers(signInJson.token), 1, 1000)
  let contestsDict = {}
  for (const contest of contestsJson.data) {
    contestsDict[contest.reference] = contest.id
  }

  await inBatches(100, batchStart, lines, async function(batchRows) {
    let signInJson = await signIntoAPI(conferenceUrl, admin)

    for (const row of batchRows) {
      let option = {
        option: {
          title: { de: row[2] },
          description: { de: row[3] },
          reference: row[1]
        }
      }

      await createOption(electionConferenceUrl, contestsDict[row[0]], option, headers(signInJson.token))
    }
  })
}

async function createContestVoterGroupPairs(lines){
  await inBatches(100, batchStart, lines, async function(batchRows) {
    let signInJson = await signIntoAPI(conferenceUrl, admin)

    for (const row of batchRows) {
      let contest = {
        contest: {
          title: {
            de: row[1],
          },
          reference: row[0],
          rule_set: "normal",
          normal_result_method: "regular",
          maximum_votes: 10,
          votes_allowed_per_option: 3,
        }
      }

      let contestJson = await createContest(electionConferenceUrl, contest, headers(signInJson.token))

      let voterGroup = {
        voter_group: {
          name: `${row[1]} (${row[2]})`,
          reference: row[0],
          contest_ids: [contestJson.id]
        }
      }

      await createVoterGroup(electionConferenceUrl, voterGroup, headers(signInJson.token))
    }
  })
}

async function inBatches(batchSize, batchStart, data, batchFunction) {
  let batches = Math.ceil(data.length/batchSize)

  for (let i = batchStart; i < batches; i++) {
    await benchmark(`Finished batch #${i} - ${batchSize} resources took: `, async function() {
      let batchRows = data.slice(i * batchSize, (i + 1) * batchSize)
      await batchFunction(batchRows)
      console.log(`Starting batch #${i}`)
    })
  }
}


const args = process.argv;
let [resourceType, csvPath] = args.slice(2)
let [batchStart = 0] = args.slice(4).map(x => parseInt(x))

populateResourceFromCSV(resourceType, csvPath, batchStart)

// @ts-check
/**
 * Prerequisites:
 * - Site, organisation, trustees and an admin must be set up in Electa
 * - The threshold ceremony must be performed
 * - The board must be published
 * - A voting round must be active
 */

const { signIntoAPI, headers, getVoters, getVoterCsvWithCodes } = require("./generic")
const { benchmark } = require("./benchmark");
const { electionConferenceUrl, conferenceUrl, dbbBaseUrl, admin, boardSlug, votingRoundReference } = require("./variables")
const { vote } = require("./vote");

// Batch size is based on pagination of voters index.
async function submitVotesByIndex(batches, batchStart = 1) {
  for (let page = batchStart; page <= batches; page++) {
    let signInJson = await signIntoAPI(conferenceUrl, admin)
    await benchmark(`Voting for voters on page #${page}, took: `, async function() {
      let votersJson = await getVoters(electionConferenceUrl, page, headers(signInJson.token))
      for (let voter of votersJson.data) {
        let revealCodeJson = await (await fetch(`${electionConferenceUrl}/voters/${voter.id}/reveal?` + new URLSearchParams({
          secret: "election_code_1"
        }), {
          method: "GET",
          headers: headers(signInJson.token)
        })).json()
        await vote(`${dbbBaseUrl}/${boardSlug}`, votingRoundReference, revealCodeJson.election_code_1)
      }
    })
  }
}

async function submitVotesByDownloadCsvWithCodes(batches, batchSize = 1000, batchStart = 0) {
  let signInJson = await signIntoAPI(conferenceUrl, admin)

  console.log("Fetching voters...")
  // Reduce csv download size by querying by voter names - acts as LIKE "%name%"
  let query = {
     "grid[name]": "A" // <--- Change this to use another voter segment based on name
  }
  let voterCsvBlob = await getVoterCsvWithCodes(electionConferenceUrl, query, headers(signInJson.token))

  console.log("Processing csv data...")
  let lines = voterCsvBlob.split(/\r?\n/)
  lines.pop()
  let csvHeaders = lines.shift().split(",")
  let electionCodeColumnIndex = csvHeaders.indexOf("Election code 1")
  lines = lines.map(line => line.split(","))

  // If only specific voter groups should be targeted:
  // let voterGroupColumnIndex = csvHeaders.indexOf("Voter group")
  // lines = lines.filter(line => line[voterGroupColumnIndex].includes("VG0"))

  for (let i = batchStart; i < batches; i++) {
    console.log(`Starting batch #${i}`)
    let batchLines = lines.slice(i*batchSize, (i+1)*batchSize)
    await benchmark(`Batch #${i} - ${batchSize} votes took: `, async function() {
      for(const line of batchLines) {
        let electionCode = line[electionCodeColumnIndex]
        await vote(`${dbbBaseUrl}/${boardSlug}`, votingRoundReference, [electionCode])
      }
    })
  }
}

async function submitVotesCsvWithCodes(csvPath, electionCodeColumnIndicies, batches, batchSize = 1000, batchStart = 0) {
  let csvHeaders;
  await fs.readFile(csvPath, "utf8", await async function (err, data) {
    if (err) {
      console.log("Error reading CSV: " + err)
      return
    }

    let lines = data.split(/\r?\n/)
    lines.pop()

    lines = lines.map(line => line.split(","))

    // If only specific voter groups should be targeted:
    // let voterGroupColumnIndex = csvHeaders.indexOf("Voter group")
    // lines = lines.filter(line => line[voterGroupColumnIndex].includes("VG0"))

    for (let i = batchStart; i < batches; i++) {
      console.log(`Starting batch #${i}`)
      let batchLines = lines.slice(i * batchSize, (i + 1) * batchSize)
      await benchmark(`Batch #${i} - ${batchSize} votes took: `, async function () {
        for (const line of batchLines) {
          let electionCodes = electionCodeColumnIndicies.map(index => line[index])
          await vote(`${dbbBaseUrl}/${boardSlug}`, votingRoundReference, electionCodes)
        }
      })
    }
  })
}

const args = process.argv;

// To use a local CSV file and supporting several election codes
// let [csvPath, electionCodeColumnIndicies] = args.slice(2, 4)
// let [batches, batchSize = 1000, batchStart = 0] = args.slice(4).map(x => parseInt(x))
// submitVotesCsvWithCodes(csvPath, electionCodeColumnIndicies, batches, batchSize, batchStart)

// To fetch voters and single election code from Electa voter endpoint and vote for those voters
let [batches, batchSize = 1000, batchStart = 0] = args.slice(2).map(x => parseInt(x))
submitVotesByDownloadCsvWithCodes(batches, batchSize, batchStart)

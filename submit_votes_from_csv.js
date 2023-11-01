// @ts-check
/**
 * Prerequisites:
 * - Site, organisation, trustees and an admin must be set up in Electa
 * - The threshold ceremony must be performed
 * - The board must be published
 * - A voting round must be active
 */

const { benchmark } = require("./benchmark");
const { dbbBaseUrl, boardSlug, votingRoundReference } = require("./variables")
const { vote } = require("./vote");

async function submitVotesCsvWithCodes(csvPath, electionCodeColumnIndicies, batches, batchSize = 1000, batchStart = 0) {
  let csvHeaders;
  await fs.readFile(csvPath, "utf8", await async function (err, data) {
    if (err) {
      console.log("Error reading CSV: " + err)
      return
    }

    let lines = data.split(/\r?\n/)
    csvHeaders = lines.pop()
    electionCodeColumnIndicies = electionCodeColumnIndicies.split(",")
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
let [csvPath, electionCodeColumnIndicies] = args.slice(2, 4)
let [batches, batchSize = 1000, batchStart = 0] = args.slice(4).map(x => parseInt(x))
submitVotesCsvWithCodes(csvPath, electionCodeColumnIndicies, batches, batchSize, batchStart)

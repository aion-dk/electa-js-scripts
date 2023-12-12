require('dotenv').config()

const dbbBaseUrl = process.env.DBB_URL
const conferenceUrl = process.env.CONFERENCE_URL
const orgId = process.env.ORG_ID
const electionId = process.env.ELECTION_ID
const boardSlug = process.env.BOARD_SLUG
const votingRoundReference = process.env.VOTING_ROUND_REFERENCE
const adminCredentials = process.env.ADMIN_CREDENTIALS.split(",");
const admin = {
  email: adminCredentials[0],
  password: adminCredentials[1]
}

const orgConferenceUrl = `${conferenceUrl}/backend/organisations/${orgId}`
const electionConferenceUrl = `${orgConferenceUrl}/elections/${electionId}`

module.exports = {
  dbbBaseUrl: dbbBaseUrl,
  conferenceUrl: conferenceUrl,
  orgConferenceUrl: orgConferenceUrl,
  electionConferenceUrl: electionConferenceUrl,
  boardSlug: boardSlug,
  votingRoundReference: votingRoundReference,
  admin: admin,
}

module.exports = { signIntoAPI, createContest, createVoter, createVoterGroup, createOption, createVotingRound, getContests, getVoters, getVoterCsvWithCodes, headers }

async function signIntoAPI(conferenceUrl, admin){
  let signInResponse = await fetch(`${conferenceUrl}/backend/admins/tokens/sign_in`, {
    method: "POST",
    body: JSON.stringify(admin),
    headers: { "Content-Type": "application/json", "Accept": "application/json" }
  })

  return await signInResponse.json()
}

async function createVoterGroup(electionUrl, payload, headers){
  let voterGroupResponse = await fetch(`${electionUrl}/voter_groups`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: headers
  })

  if(!voterGroupResponse.ok) {
    console.log(voterGroupResponse.status, await voterGroupResponse.json())
    return
  }

  return await voterGroupResponse.json()
}

async function createContest(electionUrl, payload, headers) {
  let contestResponse = await fetch(`${electionUrl}/contests`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: headers
  })

  if(!contestResponse.ok) {
    console.log(contestResponse.status, await contestResponse.json())
    return
  }

  return await contestResponse.json()
}

async function createOption(electionUrl, contestId, payload, headers) {
  let optionResponse = await fetch(`${electionUrl}/contests/${contestId}/options`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: headers
  })

  if(!optionResponse.ok) {
    console.log(optionResponse.status, await optionResponse.json())
    return
  }

  return await optionResponse.json()
}

async function createVoter(electionUrl, payload, headers) {
  let voterResponse = await fetch(`${electionUrl}/voters`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: headers
  })


  if(!voterResponse.ok) {
    console.log(voterResponse.status, await voterResponse.json())
    return
  }

  return await voterResponse.json()
}

async function createVotingRound(electionUrl, payload, headers) {
  let votingRoundResponse = await fetch(`${electionUrl}/voting_rounds`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: headers
  })

  if(!votingRoundResponse.ok) {
    console.log(votingRoundResponse.status, await votingRoundResponse.json())
    return
  }

  return await votingRoundResponse.json()
}

async function getVoters(electionUrl, page, headers) {
  let votersResponse = await fetch(`${electionUrl}/voters?` + new URLSearchParams({
    page: page
  }), {
    method: "GET",
    headers: headers
  })

  return await votersResponse.json()
}

async function getContests(electionUrl, headers, page, per = 25) {
  let contestsResponse = await fetch(`${electionUrl}/contests?` + new URLSearchParams({
    page: page,
    per: per,
  }), {
    method: "GET",
    headers: headers
  })

  return await contestsResponse.json()
}


async function getVoterCsvWithCodes(electionUrl, query, headers) {
  let url = `${electionUrl}/voters/download_with_codes?` + new URLSearchParams(query)
  let votersCsvResponse = await fetch(url, {
    method: "GET",
    headers: headers
  })

  if(!votersCsvResponse.ok) {
    console.log(votersCsvResponse.status, await votersCsvResponse.json())
    return
  }

  return await votersCsvResponse.text()
}

function headers(token) {
  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": `Bearer ${token}`
  }
}

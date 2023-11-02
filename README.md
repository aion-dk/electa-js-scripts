# Using Electa API to populate an election
Most of the scripts provided will output simple time benchmarks for the operations performed.
### Prerequisites
Site, organisation, election, trustees and an admin must be set up in Electa.
Add information about the context in a `.env` file.
An `example.env` has been provided. Copy it and rename it to `.env`.

## Populating an election
### Voter groups and contests
A contest is created and attached to each voter group created.
```bash
node populate_voter_groups.js amount
```

### Options for contests
This script creates a number of options for each contest of the election.
```bash
node populate_options.js amountPerContest
```

### Voters
Creates an amount of voters equalling `voterBatches * votersPerBatch`.
If the script is cancelled/fails or has to be split in multiple processes, then the `batchStart` can be used to pick up the creation process at a specific batch.

Voter group amount annotates how many voting rounds they should be spread across (from first to `voterGroupAmount`)
```bash
node populate_voters.js  voterBatches votersPerBatch voterGroupAmount batchStart
```

### Voting Round
Creates a voting round where it assigns the first `contestAmount` contests to the voting round.
```bash
node populate_voting_round.js contestAmount
# => Created voting round with reference: 123456
```

### Threshold ceremony and board publishing
The threshold ceremony is performed with a certain threshold, and afterwards the board is published.
```bash
node prepare_for_voting.js threshold
```

## Submitting votes
Starts submitting votes for an amount of voters equalling `batches * batchSize`.
If the script is cancelled/fails or has to be split in multiple processes, then the `batchStart` can be used to pick up the voting process at a specific batch.

_Through API download of voter credentials_
```bash
node submit_votes.js batches batchSize batchStart
```

_Through local CSV with voter credentials_
```bash
node submit_votes_from_csv.js csvPath electionCodeIndicies batches batchSize batchStart
```

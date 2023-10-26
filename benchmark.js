module.exports = { benchmark }

async function benchmark(message, func){
  let startTime = Date.now()
  await func();
  let endTime = Date.now()
  console.log(`${message} ${Math.abs(endTime - startTime)/1000}s`)
}

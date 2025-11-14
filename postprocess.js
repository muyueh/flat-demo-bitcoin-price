// This can be a typescript file as well

// Helper library written for useful postprocessing tasks with Flat Data
// Has helper functions for manipulating csv, txt, json, excel, zip, and image files
import { readJSON, writeJSON } from 'https://deno.land/x/flat@0.0.14/mod.ts'

// Step 1: Read the downloaded_filename JSON
const filename = Deno.args[0] // Same name as downloaded_filename `const filename = 'btc-price.json';`
const json = await readJSON(filename)
console.log(json)

if (typeof json !== 'object' || json === null) {
  throw new Error('Unexpected Binance ticker response: missing object payload')
}

if ('code' in json && 'msg' in json && typeof json.msg === 'string') {
  const code = typeof json.code === 'number' || typeof json.code === 'string' ? json.code : 'unknown'
  throw new Error(`Binance API responded with an error (${code}): ${json.msg}`)
}

const { symbol, price } = json
const parsedPrice = Number(price)

if (typeof symbol !== 'string' || !symbol.length) {
  throw new Error('Unexpected Binance ticker response: missing symbol')
}

if (!Number.isFinite(parsedPrice)) {
  throw new Error('Unexpected Binance ticker response: price is not numeric')
}

const processed = {
  symbol,
  priceUSD: parsedPrice,
  fetchedAt: new Date().toISOString()
}

// Step 3. Write a new JSON file with our filtered data
const newFilename = `btc-price-postprocessed.json` // name of a new file to be saved
await writeJSON(newFilename, processed) // create a new JSON file with the processed Bitcoin price
console.log('Wrote a post process file')


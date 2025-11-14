// This can be a typescript file as well

// Helper library written for useful postprocessing tasks with Flat Data
// Has helper functions for manipulating csv, txt, json, excel, zip, and image files
import { readJSON, writeJSON } from 'https://deno.land/x/flat@0.0.14/mod.ts'

// Step 1: Read the downloaded_filename JSON
const filename = Deno.args[0] // Same name as downloaded_filename
const json = await readJSON(filename)
console.log(json)

if (typeof json !== 'object' || json === null) {
  throw new Error('Unexpected Open-Meteo response: missing object payload')
}

const { latitude, longitude, timezone, hourly, hourly_units: hourlyUnits } = json

if (typeof latitude !== 'number' || typeof longitude !== 'number') {
  throw new Error('Unexpected Open-Meteo response: missing coordinates')
}

if (!hourly || typeof hourly !== 'object') {
  throw new Error('Unexpected Open-Meteo response: missing hourly forecast')
}

const times = Array.isArray(hourly.time) ? hourly.time : []
const temperatures = Array.isArray(hourly.temperature_2m) ? hourly.temperature_2m : []

if (!times.length || !temperatures.length) {
  throw new Error('Unexpected Open-Meteo response: hourly arrays are empty')
}

const forecastLength = Math.min(times.length, temperatures.length, 24)

if (forecastLength === 0) {
  throw new Error('Unexpected Open-Meteo response: no overlapping hourly entries')
}

const forecast = []
for (let index = 0; index < forecastLength; index += 1) {
  const time = times[index]
  const temperature = temperatures[index]

  if (typeof time !== 'string' || !time.length) {
    throw new Error(`Unexpected Open-Meteo response: missing time at index ${index}`)
  }

  if (typeof temperature !== 'number' || !Number.isFinite(temperature)) {
    throw new Error(`Unexpected Open-Meteo response: missing temperature at index ${index}`)
  }

  forecast.push({ time, temperatureC: temperature })
}

const timezoneValue = typeof timezone === 'string' && timezone.length ? timezone : 'UTC'
const temperatureUnit =
  typeof hourlyUnits === 'object' &&
  hourlyUnits !== null &&
  typeof hourlyUnits.temperature_2m === 'string'
    ? hourlyUnits.temperature_2m
    : '°C'
const fetchedAt = new Date().toISOString()
const source =
  'https://api.open-meteo.com/v1/forecast?latitude=25.04&longitude=121.56&hourly=temperature_2m'

const processed = forecast.map((entry) => ({
  location: 'Taipei, Taiwan',
  latitude,
  longitude,
  timezone: timezoneValue,
  temperatureUnit,
  fetchedAt,
  source,
  time: entry.time,
  temperatureC: entry.temperatureC
}))

// Step 3. Write a new JSON file with our filtered data
const newFilename = 'taipei-weather-postprocessed.json' // name of a new file to be saved
await writeJSON(newFilename, processed) // create a new JSON file with the processed forecast
console.log('Wrote a post process file')

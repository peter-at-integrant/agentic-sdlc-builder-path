// Client-side implementations of the WanderMatch "MCP" tools, for the browser.
// get_climate is REAL (open-meteo, keyless, CORS-friendly); the rest are stubs.
import { COST, FARE, FARE_ORIGIN, ADVISORY } from './data'

// Tool schemas handed to Claude (tool-use loop).
export const TOOL_DEFS = [
  {
    name: 'get_climate',
    description:
      "Real climate for a place via open-meteo (last year's actuals for a month). Pass `country` to disambiguate. Returns avg high/low + precipitation.",
    input_schema: {
      type: 'object' as const,
      properties: {
        location: { type: 'string', description: 'City/place, e.g. "Istanbul"' },
        country: { type: 'string', description: 'Country to disambiguate, e.g. "Turkey"' },
        month: { type: 'number', description: 'Month 1-12' },
      },
      required: ['location'],
    },
  },
  {
    name: 'get_cost',
    description: 'Daily ON-THE-GROUND cost bands (USD) for a city. Seeded stub; excludes airfare.',
    input_schema: {
      type: 'object' as const,
      properties: { city: { type: 'string' } },
      required: ['city'],
    },
  },
  {
    name: 'get_fare',
    description: `Round-trip airfare band (USD) from an origin to a city. Seeded stub — models fares ONLY from ${FARE_ORIGIN}; other origins return null (unverified).`,
    input_schema: {
      type: 'object' as const,
      properties: { origin: { type: 'string' }, city: { type: 'string' } },
      required: ['origin', 'city'],
    },
  },
  {
    name: 'get_advisory',
    description: 'Travel-advisory level (1-4) for a country. >=3 means reconsider/do-not-travel. Seeded stub.',
    input_schema: {
      type: 'object' as const,
      properties: { country: { type: 'string' } },
      required: ['country'],
    },
  },
]

const normCountry = (s: string) =>
  s.toLowerCase().replace(/republic of |the /g, '').replace(/ü/g, 'u').trim().replace(/^turkey$/, 'turkiye')

async function getClimate(location: string, country?: string, month?: number) {
  const geo: any = await (
    await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=5&language=en&format=json`)
  ).json()
  const results: any[] = geo?.results ?? []
  if (!results.length) return { error: 'location_not_found', location }
  let place = results[0]
  let geocode_note: string | undefined
  if (country) {
    const want = normCountry(country)
    const m = results.find((r) => {
      const c = normCountry(String(r.country ?? ''))
      return c === want || c.includes(want) || want.includes(c)
    })
    if (m) place = m
    else geocode_note = `country hint '${country}' didn't match (got '${place.country}') — verify`
  }
  const now = new Date()
  const mm = month ?? now.getUTCMonth() + 1
  const year = now.getUTCFullYear() - 1
  const pad = (n: number) => String(n).padStart(2, '0')
  const lastDay = new Date(Date.UTC(year, mm, 0)).getUTCDate()
  const url =
    `https://archive-api.open-meteo.com/v1/archive?latitude=${place.latitude}&longitude=${place.longitude}` +
    `&start_date=${year}-${pad(mm)}-01&end_date=${year}-${pad(mm)}-${pad(lastDay)}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
  const w: any = await (await fetch(url)).json()
  const highs: number[] = w?.daily?.temperature_2m_max ?? []
  const lows: number[] = w?.daily?.temperature_2m_min ?? []
  const precip: number[] = w?.daily?.precipitation_sum ?? []
  if (!highs.length) return { error: 'no_climate_data', location: place.name }
  const avg = (a: number[]) => Math.round((a.reduce((s, x) => s + (x ?? 0), 0) / a.length) * 10) / 10
  return {
    location: [place.name, place.country].filter(Boolean).join(', '),
    resolved_country: place.country ?? null,
    geocode_note,
    month: mm,
    avg_high_c: avg(highs),
    avg_low_c: avg(lows),
    precip_mm: Math.round(precip.reduce((s, x) => s + (x ?? 0), 0)),
    source: 'open-meteo (archive)',
  }
}

function getCost(city: string) {
  const row = COST[city.trim().toLowerCase()]
  if (!row) return { city, daily_cost_usd: null, source: 'seeded-stub', note: 'no seed data for this city' }
  return { city, daily_cost_usd: row, currency: 'USD', scope: 'on-the-ground (excl. airfare)', source: 'seeded-stub' }
}

function getFare(origin: string, city: string) {
  if (!origin.trim().toLowerCase().startsWith(FARE_ORIGIN)) {
    return { origin, city, roundtrip_usd: null, source: 'seeded-stub', note: `fare unverified: stub only models fares from ${FARE_ORIGIN}` }
  }
  const row = FARE[city.trim().toLowerCase()]
  if (!row) return { origin, city, roundtrip_usd: null, source: 'seeded-stub', note: 'no fare data for this destination' }
  return { origin, city, roundtrip_usd: row, currency: 'USD', source: 'seeded-stub' }
}

function getAdvisory(country: string) {
  const row = ADVISORY[country.trim().toLowerCase()]
  if (!row) return { country, advisory_level: null, label: 'unknown', source: 'seeded-stub', note: 'no advisory data — do not treat as safe' }
  return { country, advisory_level: row.level, label: row.label, source: 'seeded-stub' }
}

// Dispatch a tool call from the loop.
export async function runTool(name: string, input: any): Promise<unknown> {
  switch (name) {
    case 'get_climate':
      return getClimate(input.location, input.country, input.month)
    case 'get_cost':
      return getCost(input.city ?? '')
    case 'get_fare':
      return getFare(input.origin ?? '', input.city ?? '')
    case 'get_advisory':
      return getAdvisory(input.country ?? '')
    default:
      return { error: `unknown tool: ${name}` }
  }
}

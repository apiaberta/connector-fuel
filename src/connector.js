/**
 * connector.js
 *
 * This is where you fetch data from the government source,
 * normalise it to your schema, and store it in MongoDB.
 *
 * Rules:
 * - NEVER expose raw source data directly
 * - Always validate and normalise before storing
 * - Handle errors gracefully (source may be down)
 * - Log what you fetch and any anomalies
 */

// import { MyModel } from './db/model.js'

export async function fetchAndStore() {
  // 1. Fetch from source
  // const response = await fetch('https://source.gov.pt/api/data')
  // const raw = await response.json()

  // 2. Normalise
  // const records = raw.map(normalise)

  // 3. Store (upsert to avoid duplicates)
  // for (const record of records) {
  //   await MyModel.findOneAndUpdate(
  //     { id: record.id },
  //     record,
  //     { upsert: true, new: true }
  //   )
  // }

  // 4. Return summary
  // return { fetched: raw.length, stored: records.length }

  throw new Error('fetchAndStore() not implemented - see connector.js')
}

/**
 * Normalise a raw record from the source into your schema.
 * All field names should be in English, snake_case.
 */
function normalise(raw) {
  return {
    // id:          raw.some_id,
    // name:        raw.nome,
    // value:       parseFloat(raw.valor),
    // updated_at:  new Date(raw.data),
  }
}

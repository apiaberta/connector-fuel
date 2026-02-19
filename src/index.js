import Fastify from 'fastify'
import mongoose from 'mongoose'
import cron from 'node-cron'
import { dataRoutes } from './routes/data.js'
import { fetchAndStore } from './connector.js'

const app = Fastify({
  logger: {
    transport: process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty' }
      : undefined
  }
})

const SERVICE_NAME = 'my-service' // TODO: change this
const PORT = parseInt(process.env.PORT || '3001')
const MONGO_URI = process.env.MONGO_URI || `mongodb://localhost:27017/apiaberta-${SERVICE_NAME}`

// ─── Required endpoints (contract with gateway) ────────────────────────────

// Health check - MANDATORY
app.get('/health', async () => ({
  status: 'ok',
  service: SERVICE_NAME,
  timestamp: new Date().toISOString()
}))

// Metadata - MANDATORY
app.get('/meta', async () => ({
  service: SERVICE_NAME,
  source: 'https://source-url.gov.pt', // TODO: replace with actual source
  description: 'What this service provides',
  last_updated: await getLastUpdated(),
  record_count: await getRecordCount(),
  update_frequency: 'daily'
}))

// ─── Data routes ────────────────────────────────────────────────────────────

await app.register(dataRoutes, { prefix: '/v1' })

// ─── Cron: fetch data on a schedule ─────────────────────────────────────────

// TODO: adjust schedule as needed
cron.schedule('0 6 * * *', async () => {
  app.log.info('Running scheduled data fetch...')
  try {
    await fetchAndStore()
    app.log.info('Data fetch complete')
  } catch (err) {
    app.log.error({ err }, 'Data fetch failed')
  }
})

// ─── Startup ────────────────────────────────────────────────────────────────

await mongoose.connect(MONGO_URI)
app.log.info('Connected to MongoDB')

// Fetch on startup if no data exists
await fetchAndStore().catch(err => app.log.warn({ err }, 'Initial fetch failed'))

await app.listen({ port: PORT, host: '0.0.0.0' })

// ─── Helpers ────────────────────────────────────────────────────────────────

async function getLastUpdated() {
  // TODO: query your model for the most recent record
  return null
}

async function getRecordCount() {
  // TODO: return count from your model
  return 0
}

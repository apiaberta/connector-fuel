import Fastify from 'fastify'
import mongoose from 'mongoose'
import cron from 'node-cron'
import { dataRoutes } from './routes/data.js'
import { fetchAndStore } from './connector.js'
import { FuelSummary, Station } from './db/models.js'

const app = Fastify({
  logger: {
    transport: process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty' }
      : undefined
  }
})

const SERVICE_NAME = 'connector-fuel'
const PORT      = parseInt(process.env.PORT || '3001')
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/apiaberta-fuel'

// ─── Required endpoints ──────────────────────────────────────────────────────

app.get('/health', async () => ({
  status: 'ok',
  service: SERVICE_NAME,
  timestamp: new Date().toISOString()
}))

app.get('/meta', async () => {
  const lastSummary = await FuelSummary.findOne().sort({ updated_at: -1 })
  const stationCount = await Station.countDocuments({ price_eur: { $gt: 0 } })

  return {
    service:          SERVICE_NAME,
    source:           'https://precoscombustiveis.dgeg.gov.pt',
    description:      'Fuel prices across Portugal from DGEG, updated daily',
    last_updated:     lastSummary?.updated_at || null,
    record_count:     stationCount,
    update_frequency: 'daily at 07:30 PT'
  }
})

// ─── Data routes ─────────────────────────────────────────────────────────────

await app.register(dataRoutes)

// ─── Cron: fetch daily at 07:30 Lisbon time ─────────────────────────────────

cron.schedule('30 7 * * *', async () => {
  app.log.info('Starting DGEG fuel data fetch...')
  try {
    const result = await fetchAndStore()
    app.log.info({ result }, 'Fuel data fetch complete')
  } catch (err) {
    app.log.error({ err }, 'Fuel data fetch failed')
  }
}, { timezone: 'Europe/Lisbon' })

// ─── Startup ─────────────────────────────────────────────────────────────────

await mongoose.connect(MONGO_URI)
app.log.info('Connected to MongoDB')

// Initial fetch if no data today
const today = new Date().toISOString().split('T')[0]
const hasData = await FuelSummary.findOne({ date: today })
if (!hasData) {
  app.log.info('No data for today — running initial fetch...')
  fetchAndStore()
    .then(r => app.log.info({ result: r }, 'Initial fetch complete'))
    .catch(err => app.log.error({ err }, 'Initial fetch failed'))
}

await app.listen({ port: PORT, host: '0.0.0.0' })

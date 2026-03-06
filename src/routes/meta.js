import { Station, FuelSummary } from '../db/models.js'

export async function metaRoutes(app) {
  app.get('/fuel/meta', {
    schema: {
      description: 'Metadata and stats for the fuel connector',
      tags: ['Fuel']
    }
  }, async () => {
    const [stationCount, summaryCount, lastStation] = await Promise.all([
      Station.countDocuments(),
      FuelSummary.countDocuments(),
      Station.findOne().sort({ updated_at: -1 }).select('updated_at').lean()
    ])
    return {
      connector:    'connector-fuel',
      version:      '1.0.0',
      description:  'Portuguese fuel station prices from DGEG (Direção-Geral de Energia e Geologia)',
      source:       'https://precoscombustiveis.dgeg.gov.pt',
      update_freq:  'Daily at 07:30 Europe/Lisbon',
      endpoints: [
        { path: '/v1/fuel/prices',   description: 'National average prices by fuel type' },
        { path: '/v1/fuel/stations', description: 'Individual station prices with filters' }
      ],
      stats: {
        stations:  stationCount,
        summaries: summaryCount,
        last_sync: lastStation?.updated_at ?? null
      }
    }
  })
}

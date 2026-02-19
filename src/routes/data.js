import { Station, FuelSummary } from '../db/models.js'

export async function dataRoutes(app) {

  // GET /v1/fuel/prices — current national averages per fuel type
  app.get('/fuel/prices', {
    schema: {
      description: 'Current national average fuel prices in Portugal',
      tags: ['Fuel'],
      querystring: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'YYYY-MM-DD (default: today)' }
        }
      }
    }
  }, async (req) => {
    const date = req.query.date || new Date().toISOString().split('T')[0]
    const summaries = await FuelSummary.find({ date }).sort({ fuel_slug: 1 })

    return {
      data: summaries.map(s => ({
        fuel_slug:     s.fuel_slug,
        fuel_name:     s.fuel_name,
        road_vehicle:  s.road_vehicle,
        avg_price_eur: s.avg_price,
        min_price_eur: s.min_price,
        max_price_eur: s.max_price,
        station_count: s.station_count,
        date:          s.date,
        updated_at:    s.updated_at
      }))
    }
  })

  // GET /v1/fuel/stations — list stations with filters
  app.get('/fuel/stations', {
    schema: {
      description: 'List fuel stations with prices',
      tags: ['Fuel'],
      querystring: {
        type: 'object',
        properties: {
          fuel:     { type: 'string', description: 'Fuel slug (e.g. gasoline_95)' },
          district: { type: 'string', description: 'Filter by district name' },
          brand:    { type: 'string', description: 'Filter by brand (e.g. GALP, BP)' },
          sort:     { type: 'string', enum: ['price_asc', 'price_desc'], default: 'price_asc' },
          page:     { type: 'integer', default: 1, minimum: 1 },
          limit:    { type: 'integer', default: 20, maximum: 100 }
        }
      }
    }
  }, async (req) => {
    const { fuel = 'gasoline_95', district, brand, sort = 'price_asc', page = 1, limit = 20 } = req.query

    const query = { fuel_slug: fuel, price_eur: { $gt: 0 } }
    if (district) query.district = new RegExp(district, 'i')
    if (brand)    query.brand    = new RegExp(brand, 'i')

    const sortOrder = sort === 'price_asc' ? { price_eur: 1 } : { price_eur: -1 }
    const skip = (page - 1) * limit

    const [stations, total] = await Promise.all([
      Station.find(query).sort(sortOrder).skip(skip).limit(limit),
      Station.countDocuments(query)
    ])

    return {
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
      data: stations.map(s => ({
        station_id:    s.station_id,
        name:          s.name,
        brand:         s.brand,
        fuel_name:     s.fuel_name,
        price_eur:     s.price_eur,
        address:       s.address,
        locality:      s.locality,
        municipality:  s.municipality,
        district:      s.district,
        postal_code:   s.postal_code,
        location:      s.lat ? { lat: s.lat, lng: s.lng } : null,
        updated_at:    s.updated_at
      }))
    }
  })

  // GET /v1/fuel/cheapest — cheapest stations near a point
  app.get('/fuel/cheapest', {
    schema: {
      description: 'Find the cheapest fuel stations',
      tags: ['Fuel'],
      querystring: {
        type: 'object',
        properties: {
          fuel:  { type: 'string', default: 'gasoline_95' },
          limit: { type: 'integer', default: 10, maximum: 50 }
        }
      }
    }
  }, async (req) => {
    const { fuel = 'gasoline_95', limit = 10 } = req.query
    const stations = await Station
      .find({ fuel_slug: fuel, price_eur: { $gt: 0 } })
      .sort({ price_eur: 1 })
      .limit(limit)

    return {
      data: stations.map(s => ({
        name:         s.name,
        brand:        s.brand,
        price_eur:    s.price_eur,
        municipality: s.municipality,
        district:     s.district,
        location:     s.lat ? { lat: s.lat, lng: s.lng } : null
      }))
    }
  })
}

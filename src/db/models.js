import mongoose from 'mongoose'

// Individual station prices
const stationSchema = new mongoose.Schema({
  station_id:        { type: Number, required: true },
  fuel_slug:         { type: String, required: true },
  fuel_name:         String,
  name:              String,
  brand:             String,
  type:              String,
  price_eur:         Number,
  address:           String,
  locality:          String,
  municipality:      String,
  district:          String,
  postal_code:       String,
  lat:               Number,
  lng:               Number,
  source_updated_at: Date,
  updated_at:        { type: Date, default: Date.now }
})
stationSchema.index({ station_id: 1, fuel_slug: 1 }, { unique: true })
stationSchema.index({ fuel_slug: 1, price_eur: 1 })
stationSchema.index({ lat: 1, lng: 1 })

// Daily national summaries
const summarySchema = new mongoose.Schema({
  fuel_slug:     { type: String, required: true },
  fuel_name:     String,
  road_vehicle:  Boolean,
  avg_price:     Number,
  min_price:     Number,
  max_price:     Number,
  station_count: Number,
  date:          { type: String, required: true }, // YYYY-MM-DD
  updated_at:    { type: Date, default: Date.now }
})
summarySchema.index({ fuel_slug: 1, date: 1 }, { unique: true })

export const Station    = mongoose.model('Station', stationSchema)
export const FuelSummary = mongoose.model('FuelSummary', summarySchema)

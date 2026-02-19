/**
 * connector.js — DGEG fuel prices
 * Source: https://precoscombustiveis.dgeg.gov.pt
 * Updates: daily (07:00 PT)
 */

import { Station, FuelSummary } from './db/models.js'

const BASE_URL = 'https://precoscombustiveis.dgeg.gov.pt/api/PrecoComb'
const HEADERS  = { 'User-Agent': 'Mozilla/5.0 (apiaberta.pt data connector)' }

const FUEL_TYPES = [
  // Gasolinas
  { id: 3201, slug: 'gasoline_95',          name: 'Gasolina simples 95',                  road: true  },
  { id: 3205, slug: 'gasoline_95_plus',     name: 'Gasolina especial 95',                 road: true  },
  { id: 3400, slug: 'gasoline_98',          name: 'Gasolina 98',                          road: true  },
  { id: 3405, slug: 'gasoline_98_plus',     name: 'Gasolina especial 98',                 road: true  },
  { id: 3210, slug: 'gasoline_2stroke',     name: 'Gasolina mistura (2 tempos)',          road: false },
  // Gasóleos
  { id: 2101, slug: 'diesel',               name: 'Gasóleo simples',                      road: true  },
  { id: 2105, slug: 'diesel_plus',          name: 'Gasóleo especial',                     road: true  },
  { id: 2150, slug: 'diesel_colored',       name: 'Gasóleo colorido',                     road: false },
  { id: 2155, slug: 'diesel_heating',       name: 'Gasóleo de aquecimento',               road: false },
  { id: 2115, slug: 'biodiesel_b15',        name: 'Biodiesel B15',                        road: false },
  // Gás
  { id: 1120, slug: 'gpl_auto',             name: 'GPL Auto',                             road: true  },
  { id: 1141, slug: 'gnc_m3',              name: 'GNC (gás natural comprimido) €/m³',    road: true  },
  { id: 1143, slug: 'gnc_kg',              name: 'GNC (gás natural comprimido) €/kg',    road: true  },
  { id: 1142, slug: 'gnl_kg',              name: 'GNL (gás natural liquefeito) €/kg',    road: true  },
]

export async function fetchAndStore() {
  let totalFetched = 0
  const summaries = []

  for (const fuel of FUEL_TYPES) {
    const stations = await fetchAllPages(fuel.id)
    if (!stations.length) continue

    // Upsert each station
    for (const raw of stations) {
      await Station.findOneAndUpdate(
        { station_id: raw.Id, fuel_slug: fuel.slug },
        normalise(raw, fuel),
        { upsert: true, new: true }
      )
    }

    // Compute daily summary
    const prices = stations
      .map(s => parsePrice(s.Preco))
      .filter(p => p > 0)

    if (prices.length) {
      const summary = {
        fuel_slug:    fuel.slug,
        fuel_name:    fuel.name,
        road_vehicle: fuel.road,
        avg_price:    avg(prices),
        min_price:    Math.min(...prices),
        max_price:    Math.max(...prices),
        station_count: prices.length,
        date:         new Date().toISOString().split('T')[0],
        updated_at:   new Date()
      }
      await FuelSummary.findOneAndUpdate(
        { fuel_slug: fuel.slug, date: summary.date },
        summary,
        { upsert: true, new: true }
      )
      summaries.push(summary)
    }

    totalFetched += stations.length
  }

  return { fetched: totalFetched, fuel_types: summaries.length, summaries }
}

async function fetchAllPages(fuelTypeId, pageSize = 500) {
  const all = []
  let page = 1

  while (true) {
    const url = `${BASE_URL}/PesquisarPostos?idsTiposComb=${fuelTypeId}&qtdPorPagina=${pageSize}&pagina=${page}`
    const res = await fetch(url, { headers: HEADERS })
    const data = await res.json()
    const batch = data.resultado || []
    if (!batch.length) break
    all.push(...batch)
    if (batch.length < pageSize) break
    page++
  }

  return all
}

function normalise(raw, fuel) {
  return {
    station_id:   raw.Id,
    fuel_slug:    fuel.slug,
    fuel_name:    fuel.name,
    name:         raw.Nome?.trim(),
    brand:        raw.Marca?.trim(),
    type:         raw.TipoPosto?.trim(),
    price_eur:    parsePrice(raw.Preco),
    address:      raw.Morada?.trim(),
    locality:     raw.Localidade?.trim(),
    municipality: raw.Municipio?.trim(),
    district:     raw.Distrito?.trim(),
    postal_code:  raw.CodPostal?.trim(),
    lat:          raw.Latitude,
    lng:          raw.Longitude,
    source_updated_at: raw.DataAtualizacao ? new Date(raw.DataAtualizacao) : null,
    updated_at:   new Date()
  }
}

function parsePrice(str) {
  if (!str) return 0
  return parseFloat(str.replace(',', '.').replace(/[^\d.]/g, '')) || 0
}

function avg(arr) {
  return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 1000) / 1000
}

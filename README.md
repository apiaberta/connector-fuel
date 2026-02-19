# connector-fuel

DGEG fuel prices connector for [API Aberta](https://apiaberta.pt).

Fetches fuel prices from all Portuguese stations via [precoscombustiveis.dgeg.gov.pt](https://precoscombustiveis.dgeg.gov.pt), normalises the data and exposes it via a REST API.

## Endpoints

```
GET /health                   → service health check
GET /meta                     → data source metadata

GET /v1/fuel/prices           → national average prices per fuel type
GET /v1/fuel/stations         → list stations (filter by fuel, district, brand)
GET /v1/fuel/cheapest         → cheapest stations nationwide
```

## Usage

```bash
# National averages
curl -H "X-API-Key: YOUR_KEY" https://api.apiaberta.pt/v1/fuel/prices

# Cheapest gasoline 95 stations
curl -H "X-API-Key: YOUR_KEY" "https://api.apiaberta.pt/v1/fuel/stations?fuel=gasoline_95&sort=price_asc&limit=10"

# Filter by district
curl -H "X-API-Key: YOUR_KEY" "https://api.apiaberta.pt/v1/fuel/stations?fuel=gasoline_95&district=Lisboa"
```

## Fuel slugs

| Slug | Description |
|------|-------------|
| `gasoline_95` | Gasolina simples 95 |
| `gasoline_95_plus` | Gasolina especial 95 |
| `gasoline_2stroke` | Gasolina de mistura (2 tempos) |

## Setup

```bash
npm install
PORT=3001 MONGO_URI=mongodb://localhost:27017/apiaberta-fuel node src/index.js
```

Data is fetched automatically on startup (if no data for today) and daily at 07:30 Lisbon time.

## Data source

[DGEG - Preços de Combustíveis](https://precoscombustiveis.dgeg.gov.pt) — official Portuguese government fuel price registry. Updated daily by fuel stations.

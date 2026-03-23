# API Aberta — Fuel Prices Connector (DGEG)

Microservice that fetches and serves fuel prices from DGEG (Direção-Geral de Energia e Geologia).

## Features

- Daily automatic sync with DGEG data
- Historical price tracking
- Station details and locations
- Price statistics by fuel type
- MongoDB storage

## Endpoints

- `GET /health` — Service health check
- `GET /meta` — Service metadata
- `GET /prices` — Current fuel prices by fuel type
- `GET /stations` — List of fuel stations (with filters)
- `GET /stations/:id` — Station details
- `GET /history` — Historical price trends

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with MongoDB URI
npm start
```

## Environment Variables

See `.env.example`.

## Data Source

Official DGEG fuel prices API.

## License

MIT

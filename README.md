# connector-fuel

Conector de preços de combustíveis DGEG para a [API Aberta](https://apiaberta.pt).

Faz fetch dos preços de todos os postos de abastecimento portugueses via [precoscombustiveis.dgeg.gov.pt](https://precoscombustiveis.dgeg.gov.pt), normaliza os dados e expõe-os via REST API interna (consumida pelo Gateway).

**Estado:** ✅ Live em produção  
**Porta:** :3001  
**Dados:** 14 tipos de combustível, todos os postos a nível nacional

## Endpoints

```
GET /health                   → healthcheck do serviço
GET /meta                     → metadata da fonte de dados (última sync, total de postos)

GET /v1/fuel/prices           → médias nacionais por tipo de combustível
GET /v1/fuel/stations         → postos (filtro por combustível, distrito, marca, sort)
GET /v1/fuel/cheapest         → postos mais baratos por tipo de combustível
```

## Exemplos

```bash
# Médias nacionais (todos os combustíveis)
curl -H "X-API-Key: YOUR_KEY" https://api.apiaberta.pt/v1/fuel/prices

# Listar postos de Gasóleo em Lisboa
curl -H "X-API-Key: YOUR_KEY" \
  "https://api.apiaberta.pt/v1/fuel/stations?fuel=diesel&district=Lisboa&sort=price_asc&limit=20"

# 10 postos mais baratos de Gasolina 95 em todo o país
curl -H "X-API-Key: YOUR_KEY" \
  "https://api.apiaberta.pt/v1/fuel/cheapest?fuel=gasoline_95&limit=10"
```

## Parâmetros de query

### `GET /v1/fuel/stations`

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `fuel` | string | `gasoline_95` | Slug do tipo de combustível |
| `district` | string | — | Filtro por distrito (ex.: `Lisboa`, `Porto`) |
| `brand` | string | — | Filtro por marca (ex.: `BP`, `Galp`) |
| `sort` | string | `price_asc` | Ordenação: `price_asc`, `price_desc` |
| `page` | number | `1` | Página (paginação) |
| `limit` | number | `20` | Resultados por página (máx. 100) |

### `GET /v1/fuel/cheapest`

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `fuel` | string | `gasoline_95` | Slug do tipo de combustível |
| `limit` | number | `10` | Número de postos a devolver |

## Tipos de combustível (slugs)

| Slug | Nome | Estrada |
|------|------|---------|
| `gasoline_95` | Gasolina simples 95 | ✅ |
| `gasoline_95_plus` | Gasolina especial 95 | ✅ |
| `gasoline_98` | Gasolina 98 | ✅ |
| `gasoline_98_plus` | Gasolina especial 98 | ✅ |
| `gasoline_2stroke` | Gasolina mistura (2 tempos) | ❌ |
| `diesel` | Gasóleo simples | ✅ |
| `diesel_plus` | Gasóleo especial | ✅ |
| `diesel_colored` | Gasóleo colorido | ❌ |
| `diesel_heating` | Gasóleo de aquecimento | ❌ |
| `biodiesel_b15` | Biodiesel B15 | ❌ |
| `gpl_auto` | GPL Auto | ✅ |
| `gnc_m3` | GNC (gás natural comprimido) €/m³ | ✅ |
| `gnc_kg` | GNC (gás natural comprimido) €/kg | ✅ |
| `gnl_kg` | GNL (gás natural liquefeito) €/kg | ✅ |

## Cron Schedule

| Evento | Horário | Descrição |
|--------|---------|-----------|
| Sync automático | Todos os dias às **07:30** (hora de Lisboa) | Fetch de todos os postos para todos os 14 tipos |
| Sync no arranque | Na inicialização do processo | Se não houver dados de hoje, faz fetch imediatamente |

A sincronização diária demora tipicamente 2–5 minutos (14 tipos × paginação de 500 postos/página).

## Setup (dev)

```bash
npm install
PORT=3001 MONGO_URI=mongodb://localhost:27017/apiaberta-fuel node src/index.js
```

## Deploy (produção)

```bash
# No VPS (gerido via PM2)
cd /root/.openclaw/workspace/connector-fuel
pm2 start src/index.js --name connector-fuel \
  --env production \
  -- # PORT e MONGO_URI via .env ou ecosystem

pm2 save
pm2 logs connector-fuel
```

## Variáveis de ambiente

| Variável | Descrição | Default |
|----------|-----------|---------|
| `PORT` | Porta HTTP interna | `3001` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/apiaberta-fuel` |

## Fonte de dados

[DGEG — Preços de Combustíveis](https://precoscombustiveis.dgeg.gov.pt) — registo oficial do Governo Português. As gasolineiras são obrigadas por lei a comunicar os preços diariamente.

API interna DGEG: `GET https://precoscombustiveis.dgeg.gov.pt/api/PesquisarPostos?idsTiposComb={id}&qtdPorPagina=500&pagina={n}`

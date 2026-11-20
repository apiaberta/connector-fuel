import { accentInsensitiveRegex } from './accentRegex.js'

export function buildStationQuery({ fuel = 'gasoline_95', district, municipality, brand } = {}) {
    const query = { fuel_slug: fuel, price_eur: { $gt: 0 } }
    if (district)     query.district     = new RegExp(district, 'i')
    if (municipality) query.municipality = accentInsensitiveRegex(municipality)
    if (brand)        query.brand        = new RegExp(brand, 'i')
    return query
}

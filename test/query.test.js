import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { accentInsensitiveRegex } from '../src/accentRegex.js'
import { buildStationQuery } from '../src/query.js'

describe('municipality filter', () => {
    it('matches Fundão with Fundao, any case', () => {
        const re = accentInsensitiveRegex('Fundao')
        assert.equal(re.test('Fundão'), true)
        assert.equal(re.test('FUNDÃO'), true)
        assert.equal(re.test('Covilhã'), false)
    })

    it('adds municipality to the station query without dropping fuel or price', () => {
        const q = buildStationQuery({ fuel: 'diesel', municipality: 'Fundao' })
        assert.equal(q.fuel_slug, 'diesel')
        assert.deepEqual(q.price_eur, { $gt: 0 })
        assert.equal(q.municipality.test('Fundão'), true)
    })

    it('keeps the default fuel when none is given', () => {
        assert.equal(buildStationQuery({}).fuel_slug, 'gasoline_95')
    })
})

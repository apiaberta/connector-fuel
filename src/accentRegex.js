const VOWEL_CLASS = {
    a: '[aáàâãä]', e: '[eéèêë]', i: '[iíìîï]', o: '[oóòôõö]', u: '[uúùûü]', c: '[cç]'
}

// Case- and accent-insensitive match: "Fundao" finds "Fundão".
export function accentInsensitiveRegex(text) {
    const plain = String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
    const pattern = [...plain].map(ch => {
        const cls = VOWEL_CLASS[ch.toLowerCase()]
        return cls ?? ch.replace(/[.*+?^${}()|[\]\\/-]/g, '\\$&')
    }).join('')
    return new RegExp(pattern, 'i')
}

export function normalizeRegionalName(name) {
  if (!name) {
    return ''
  }

  let normalizedName = name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')

  // Quitar el prefijo "DRE" utilizado por el GeoJSON
  normalizedName = normalizedName
    .replace(/^dre\s+/, '')

  // Corregir diferencias entre CSV y GeoJSON
  const aliases = {
    'ssan jose oeste': 'san jose oeste',
    'zona norte norte': 'norte norte',
    'central del pacifico': 'aguirre',
  }

  return aliases[normalizedName] ?? normalizedName
}
// Utilidad para compartir por WhatsApp — funciona igual en móvil (abre la app)
// y en escritorio (abre web.whatsapp.com), sin necesitar ningún número de teléfono.
export function shareOnWhatsApp(text) {
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

export function buildPlaceShareText(place, siteUrl = 'https://guiame.pages.dev') {
  const priceLine = place.price?.free ? 'Gratis' : (place.price?.label || '')
  return [
    `¡Mira este plan para niños! ${place.emoji || ''} *${place.name}*`,
    place.desc,
    `📍 ${place.zone}${priceLine ? ` · ${priceLine}` : ''}`,
    '',
    `Encuéntralo junto a más planes familiares en KidGuide Colombia:`,
    siteUrl,
  ].filter(Boolean).join('\n')
}

export function buildSiteShareText(siteUrl = 'https://guiame.pages.dev') {
  return [
    '¿A dónde vamos con los niños hoy? 🌟',
    'KidGuide Colombia tiene planes familiares curados por ciudad, con filtros por edad, clima y precio.',
    siteUrl,
  ].join('\n')
}

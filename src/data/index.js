// ─────────────────────────────────────────────────────────────
// KidGuide – Registro central de ciudades
//
// Para añadir una nueva ciudad:
//   1. Crea src/data/places_CIUDAD.js con el array PLACES_CIUDAD
//   2. Importa aquí y añade la entrada en PLACES_BY_CITY
//   3. Activa la ciudad en categories.js (active: true)
// ─────────────────────────────────────────────────────────────

import { PLACES as PLACES_MEDELLIN }     from '@/data/places_medellin'
import { PLACES_BOGOTA }                 from '@/data/places_bogota'
import { PLACES_CALI }                   from '@/data/places_cali'
import { PLACES_CARTAGENA }              from '@/data/places_cartagena'

export const PLACES_BY_CITY = {
  medellin:  PLACES_MEDELLIN,
  bogota:    PLACES_BOGOTA,
  cali:      PLACES_CALI,
  cartagena: PLACES_CARTAGENA,
}

export function getPlacesForCity(cityId) {
  return PLACES_BY_CITY[cityId] || []
}

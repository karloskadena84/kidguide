import { ref, computed } from 'vue'
import { getPlacesForCity } from '@/data/index'

const TODAY = new Date().getDay()

/**
 * Genera un hash numérico estable basado en la fecha actual.
 * El resultado es IGUAL para todos los usuarios el mismo día,
 * y DIFERENTE en cada día calendario.
 */
function getDayHash() {
  const d = new Date()
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  let h = 0
  for (let i = 0; i < key.length; i++) {
    h = Math.imul(31, h) + key.charCodeAt(i) | 0
  }
  return Math.abs(h)
}

/**
 * Fisher-Yates shuffle seeded por un número.
 * Devuelve un NUEVO array (no muta el original).
 * El mismo seed siempre produce el mismo orden.
 */
function seededShuffle(arr, seed) {
  const a = [...arr]
  let s = seed
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function usePlaces(cityRef) {
  const search    = ref('')
  const activecat = ref('all')
  const todayOnly = ref(false)
  const freeOnly  = ref(false)

  const cityPlaces = computed(() =>
    getPlacesForCity(cityRef?.value || 'medellin')
  )

  const filtered = computed(() => cityPlaces.value.filter(p => {
    if (activecat.value !== 'all' && p.cat !== activecat.value) return false
    if (todayOnly.value && !p.days.includes(TODAY)) return false
    if (freeOnly.value  && !p.price.free)           return false
    const q = search.value.toLowerCase()
    return !q
      || p.name.toLowerCase().includes(q)
      || p.zone.toLowerCase().includes(q)
      || p.desc.toLowerCase().includes(q)
      || p.tags.some(t => t.includes(q))
  }))

  const todayPlaces  = computed(() => seededShuffle(cityPlaces.value.filter(p => p.days.includes(TODAY)), getDayHash()))
  const totalFree    = computed(() => cityPlaces.value.filter(p => p.price.free).length)
  const todayCount   = computed(() => cityPlaces.value.filter(p => p.days.includes(TODAY)).length)
  const totalPlaces  = computed(() => cityPlaces.value.length)

  /**
   * Lista completa mezclada con el seed del día.
   * Cada día el grid aparece en un orden diferente.
   */
  const dailyShuffled = computed(() => seededShuffle(cityPlaces.value, getDayHash()))

  /**
   * Lugar destacado del día: uno distinto cada día entre
   * los que están abiertos hoy, determinístico para todos.
   */
  const todayFeaturedCard = computed(() => {
    const open = todayPlaces.value
    if (!open.length) return null
    return open[getDayHash() % open.length]
  })

  const clearFilters = () => {
    search.value    = ''
    activecat.value = 'all'
    todayOnly.value = false
    freeOnly.value  = false
  }

  const hasFilters = computed(() =>
    !!(search.value || activecat.value !== 'all' || todayOnly.value || freeOnly.value)
  )

  return {
    search, activecat, todayOnly, freeOnly,
    filtered, todayPlaces, cityPlaces,
    totalFree, todayCount, totalPlaces,
    clearFilters, hasFilters, TODAY,
    dailyShuffled, todayFeaturedCard,
  }
}

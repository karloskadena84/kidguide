import { ref, computed, watchEffect } from 'vue'
import { fetchPlacesForCity, fetchCitySettings } from '@/services/placesApi'

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

  const cityPlaces = ref([])
  const loading     = ref(false)
  const loadError   = ref(null)

  // --- NUEVO: configuración de destacado/planes de hoy (auto vs manual) ---
  const citySettings = ref(null) // { featuredMode, featuredPlaceId, todayMode, todayPlaceIds }

  watchEffect(async () => {
    const city = cityRef?.value || 'medellin'
    loading.value = true
    loadError.value = null
    try {
      const [places, settings] = await Promise.all([
        fetchPlacesForCity(city),
        fetchCitySettings(city).catch(() => null), // si falla, se sigue en modo automático
      ])
      cityPlaces.value = places
      citySettings.value = settings
    } catch (err) {
      console.error('Error cargando lugares:', err)
      loadError.value = err.message
      cityPlaces.value = []
    } finally {
      loading.value = false
    }
  })
  // --- fin de lo nuevo ---

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

  const totalFree    = computed(() => cityPlaces.value.filter(p => p.price.free).length)
  const todayCount   = computed(() => cityPlaces.value.filter(p => p.days.includes(TODAY)).length)
  const totalPlaces  = computed(() => cityPlaces.value.length)

  /**
   * Lista completa mezclada con el seed del día (modo automático de siempre).
   */
  const dailyShuffled = computed(() => seededShuffle(cityPlaces.value, getDayHash()))

  /**
   * Planes para hoy.
   * - Manual: el admin eligió a mano una lista de lugares para hoy (respeta su orden).
   * - Automático (por defecto): lugares abiertos hoy, mezclados con la semilla del día.
   * Si la lista manual quedara vacía (p. ej. todos los lugares elegidos se borraron),
   * cae de vuelta al modo automático para no dejar la sección vacía.
   */
  const todayPlaces = computed(() => {
    const settings = citySettings.value
    if (settings?.todayMode === 'manual' && settings.todayPlaceIds?.length) {
      const byId = new Map(cityPlaces.value.map(p => [p.dbId, p]))
      const manual = settings.todayPlaceIds.map(id => byId.get(id)).filter(Boolean)
      if (manual.length) return manual
    }
    return seededShuffle(cityPlaces.value.filter(p => p.days.includes(TODAY)), getDayHash())
  })

  /**
   * Lugar destacado del día.
   * - Manual: el admin eligió a mano un lugar específico como destacado.
   * - Automático (por defecto): uno distinto cada día entre los abiertos hoy,
   *   determinístico para todos los visitantes (mismo algoritmo de siempre).
   * Si el lugar elegido a mano ya no existe/está inactivo, cae de vuelta al automático.
   */
  const todayFeaturedCard = computed(() => {
    const settings = citySettings.value
    if (settings?.featuredMode === 'manual' && settings.featuredPlaceId) {
      const manual = cityPlaces.value.find(p => p.dbId === settings.featuredPlaceId)
      if (manual) return manual
    }
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
    loading, loadError,
  }
}

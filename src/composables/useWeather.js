import { ref, watch } from 'vue'

// ─────────────────────────────────────────────────────────────
// COORDS por ciudad
// ─────────────────────────────────────────────────────────────
const CITY_COORDS = {
  medellin:  { lat: 6.2687,  lon: -75.5680, name: 'Medellín'  },
  bogota:    { lat: 4.6578,  lon: -74.1027, name: 'Bogotá'    },
  cali:      { lat: 3.4497,  lon: -76.5306, name: 'Cali'      },
  cartagena: { lat: 10.4236, lon: -75.5518, name: 'Cartagena' },
}

// ─────────────────────────────────────────────────────────────
// WMO code → tema visual + metadatos de UI
// ─────────────────────────────────────────────────────────────
export const WX_META = {
  sunny:  { ico: '☀️',  label: 'Soleado',  bg: 'rgba(254,243,199,0.72)', border: '#FCD34D', accent: '#92620A', outdoor: true  },
  cloudy: { ico: '⛅',  label: 'Nublado',  bg: 'rgba(226,232,240,0.72)', border: '#94A3B8', accent: '#334155', outdoor: true  },
  rainy:  { ico: '🌧️', label: 'Lluvia',   bg: 'rgba(219,234,254,0.72)', border: '#93C5FD', accent: '#1E4D8C', outdoor: false },
  stormy: { ico: '⛈️', label: 'Tormenta', bg: 'rgba(233,229,244,0.72)', border: '#A78BFA', accent: '#4C1D95', outdoor: false },
  foggy:  { ico: '🌫️', label: 'Niebla',   bg: 'rgba(241,240,237,0.72)', border: '#CBD5E1', accent: '#475569', outdoor: true  },
  snow:   { ico: '❄️',  label: 'Frío',     bg: 'rgba(219,234,254,0.72)', border: '#93C5FD', accent: '#1E3A5F', outdoor: true  },
}

const WX_MSG = {
  sunny:  { title: city => `¡Día soleado en ${city}!`,     sub: '¡Perfecto para salir al aire libre hoy!' },
  cloudy: { title: city => `Cielo nublado en ${city}`,     sub: 'Buen día para museos y actividades' },
  rainy:  { title: city => `¡Hoy llueve en ${city}!`,      sub: 'Te sugerimos planes bajo techo para hoy 🌂' },
  stormy: { title: city => `Tormenta en ${city}`,          sub: 'Mejor buscar planes bajo techo hoy ⛈️' },
  foggy:  { title: city => `Mañana con niebla en ${city}`, sub: 'Buenas condiciones para actividades interiores' },
  snow:   { title: city => `¡Hace frío en ${city}!`,       sub: 'Abriga bien a los peques antes de salir 🧥' },
}

// ─────────────────────────────────────────────────────────────
// WMO code → theme string
// ─────────────────────────────────────────────────────────────
function wmoToTheme(code) {
  if (code === 0)               return 'sunny'
  if (code <= 3)                return 'cloudy'
  if (code >= 45 && code <= 48) return 'foggy'
  if (code >= 51 && code <= 67) return 'rainy'
  if (code >= 71 && code <= 77) return 'snow'
  if (code >= 80 && code <= 82) return 'rainy'
  if (code >= 85 && code <= 86) return 'snow'
  if (code >= 95 && code <= 99) return 'stormy'
  return 'cloudy'
}

// ─────────────────────────────────────────────────────────────
// Clasificación inteligente usando 3 señales en vez de 1
// Evita falsos positivos de lluvia
// ─────────────────────────────────────────────────────────────
function classifyWeather({ code, precipitation, precipProb, cloudCover }) {
  if (precipitation >= 0.3) {
    if (code >= 95) return 'stormy'
    return 'rainy'
  }

  const codeIsRain  = (code >= 51 && code <= 67) || (code >= 80 && code <= 82)
  const codeIsStorm = code >= 95 && code <= 99
  const lowPrecipProb = precipProb < 40

  if ((codeIsRain || codeIsStorm) && lowPrecipProb && precipitation < 0.1) {
    return cloudCover > 70 ? 'cloudy' : 'sunny'
  }

  return wmoToTheme(code)
}

// ─────────────────────────────────────────────────────────────
// CAPA 3 — Fallback por hora local (nunca falla)
// ─────────────────────────────────────────────────────────────
function localFallback(cityId) {
  const h = new Date().getHours()
  if (cityId === 'cartagena') {
    return (h >= 14 && h <= 18) ? 'rainy' : 'sunny'
  }
  if (cityId === 'bogota') {
    if (h >= 5  && h <= 8)  return 'foggy'
    if (h >= 14 && h <= 19) return 'rainy'
    return 'cloudy'
  }
  // Medellín y Cali
  if (h >= 6  && h <= 11) return 'sunny'
  if (h >= 12 && h <= 14) return 'cloudy'
  if (h >= 15 && h <= 19) return 'rainy'
  return 'cloudy'
}

// ─────────────────────────────────────────────────────────────
// CAPA 1 — Cache localStorage (TTL 30 min)
// ─────────────────────────────────────────────────────────────
const CACHE_KEY = 'kg_wx_v3'
const CACHE_TTL = 30 * 60 * 1000

function getCached(cityId) {
  try {
    localStorage.removeItem(`kg_wx_v1_${cityId}`)
    localStorage.removeItem(`kg_wx_v2_${cityId}`)
    const raw = localStorage.getItem(`${CACHE_KEY}_${cityId}`)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return null
    return data
  } catch { return null }
}

function setCache(cityId, data) {
  try {
    localStorage.setItem(`${CACHE_KEY}_${cityId}`, JSON.stringify({ data, ts: Date.now() }))
  } catch {}
}

// ─────────────────────────────────────────────────────────────
// CAPA 2 — Open-Meteo con AbortController (timeout 4s)
// ─────────────────────────────────────────────────────────────
async function fetchOpenMeteo(coords) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 4000)

  try {
    const url = [
      'https://api.open-meteo.com/v1/forecast',
      `?latitude=${coords.lat}&longitude=${coords.lon}`,
      '&current=weather_code,temperature_2m,apparent_temperature',
      ',precipitation,precipitation_probability,cloud_cover',
      '&timezone=America%2FBogota',
    ].join('')

    const res  = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const cur  = json?.current ?? {}

    return {
      code:          cur.weather_code            ?? 0,
      temp:          Math.round(cur.temperature_2m        ?? 20),
      feels:         Math.round(cur.apparent_temperature  ?? 20),
      precipitation: cur.precipitation             ?? 0,
      precipProb:    cur.precipitation_probability ?? 0,
      cloudCover:    cur.cloud_cover               ?? 0,
    }
  } catch (err) {
    clearTimeout(timer)
    throw err
  }
}

// ─────────────────────────────────────────────────────────────
// Composable principal
// ─────────────────────────────────────────────────────────────
export function useWeather(cityRef) {
  const theme    = ref('sunny')
  const temp     = ref(null)
  const feels    = ref(null)
  const cityName = ref('')
  const loading  = ref(false)
  const source   = ref('fallback')

  function applyTheme(themeVal, cityId, tempVal = null, feelsVal = null, src = 'api') {
    theme.value    = themeVal
    temp.value     = tempVal
    feels.value    = feelsVal
    cityName.value = CITY_COORDS[cityId]?.name ?? cityId
    source.value   = src
  }

  async function fetchWeather(cityId) {
    const coords = CITY_COORDS[cityId]
    if (!coords) return

    applyTheme(localFallback(cityId), cityId, null, null, 'fallback')

    const cached = getCached(cityId)
    if (cached) {
      const th = classifyWeather({
        code:          cached.code,
        precipitation: cached.precipitation ?? 0,
        precipProb:    cached.precipProb    ?? 0,
        cloudCover:    cached.cloudCover    ?? 0,
      })
      applyTheme(th, cityId, cached.temp, cached.feels, 'cache')

      const raw = localStorage.getItem(`${CACHE_KEY}_${cityId}`)
      const age = raw ? Date.now() - JSON.parse(raw).ts : Infinity
      if (age < CACHE_TTL * 0.8) return
    }

    loading.value = true
    try {
      const data = await fetchOpenMeteo(coords)
      const th   = classifyWeather(data)
      applyTheme(th, cityId, data.temp, data.feels, 'api')
      setCache(cityId, data)
    } catch (err) {
      console.warn('[useWeather] API no disponible, usando fallback:', err.message)
    } finally {
      loading.value = false
    }
  }

  watch(
    () => cityRef?.value,
    (cityId) => { if (cityId) fetchWeather(cityId) },
    { immediate: true }
  )

  const meta    = () => WX_META[theme.value]  || WX_META.cloudy
  const msg     = () => WX_MSG[theme.value]   || WX_MSG.cloudy
  const title   = () => msg().title(cityName.value || '')
  const subtext = () => msg().sub

  return { theme, temp, feels, cityName, loading, source, meta, title, subtext }
}

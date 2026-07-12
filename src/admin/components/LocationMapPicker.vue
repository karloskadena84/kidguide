<template>
  <div class="map-picker">
    <div class="map-picker__search">
      <input
        v-model="query"
        type="text"
        placeholder="Buscar dirección o lugar (ej: Parque Explora, Medellín)…"
        @keyup.enter="searchAddress"
      />
      <button type="button" @click="searchAddress" :disabled="searching">
        {{ searching ? 'Buscando…' : 'Buscar' }}
      </button>
    </div>
    <p v-if="searchError" class="map-picker__error">{{ searchError }}</p>

    <div ref="mapEl" class="map-picker__map"></div>

    <div class="map-picker__coords">
      <span><strong>Lat:</strong> {{ lat != null ? lat.toFixed(6) : '—' }}</span>
      <span><strong>Lng:</strong> {{ lng != null ? lng.toFixed(6) : '—' }}</span>
    </div>

    <button
      v-if="suggestedAddress"
      type="button"
      class="map-picker__suggest-btn"
      @click="$emit('use-address', suggestedAddress)"
    >
      📍 Usar esta dirección: "{{ suggestedAddress }}"
    </button>

    <p class="map-picker__hint">Arrastra el pin o haz click en el mapa para ajustar la ubicación exacta.</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  lat:  { type: Number, default: null },
  lng:  { type: Number, default: null },
  city: { type: String, default: 'medellin' },
})
const emit = defineEmits(['update:lat', 'update:lng', 'use-address'])

// Centros aproximados de cada ciudad — se usan solo si el lugar todavía no tiene coordenadas
const CITY_CENTERS = {
  medellin:  [6.2442, -75.5812],
  bogota:    [4.7110, -74.0721],
  cali:      [3.4516, -76.5320],
  cartagena: [10.3910, -75.4794],
}

const mapEl = ref(null)
const query = ref('')
const searching = ref(false)
const searchError = ref('')
const suggestedAddress = ref('')

let map = null
let marker = null

// Ícono propio (evita el problema clásico de Leaflet + bundlers modernos
// donde el pin por defecto no carga porque las rutas de imagen no resuelven bien)
const pinIcon = L.divIcon({
  className: 'map-picker__pin',
  html: '<div class="map-picker__pin-dot">📍</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 28],
})

function placeMarker(latVal, lngVal) {
  if (marker) {
    marker.setLatLng([latVal, lngVal])
  } else {
    marker = L.marker([latVal, lngVal], { icon: pinIcon, draggable: true }).addTo(map)
    marker.on('dragend', () => {
      const pos = marker.getLatLng()
      emitCoords(pos.lat, pos.lng)
      reverseGeocode(pos.lat, pos.lng)
    })
  }
}

function emitCoords(latVal, lngVal) {
  emit('update:lat', Number(latVal.toFixed(6)))
  emit('update:lng', Number(lngVal.toFixed(6)))
}

onMounted(() => {
  const hasCoords = props.lat != null && props.lng != null
  const initialCenter = hasCoords ? [props.lat, props.lng] : (CITY_CENTERS[props.city] || CITY_CENTERS.medellin)

  map = L.map(mapEl.value, { scrollWheelZoom: false }).setView(initialCenter, hasCoords ? 16 : 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; colaboradores de OpenStreetMap',
    maxZoom: 19,
  }).addTo(map)

  if (hasCoords) placeMarker(props.lat, props.lng)

  map.on('click', (e) => {
    placeMarker(e.latlng.lat, e.latlng.lng)
    emitCoords(e.latlng.lat, e.latlng.lng)
    reverseGeocode(e.latlng.lat, e.latlng.lng)
  })
})

onBeforeUnmount(() => {
  if (map) { map.remove(); map = null }
})

// Si el formulario carga otro lugar (lat/lng cambian desde afuera), sincroniza el mapa
watch(() => [props.lat, props.lng], ([newLat, newLng]) => {
  if (newLat != null && newLng != null && map) {
    map.setView([newLat, newLng], 16)
    placeMarker(newLat, newLng)
  }
})

async function searchAddress() {
  if (!query.value.trim()) return
  searching.value = true
  searchError.value = ''
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=co&q=${encodeURIComponent(query.value)}`
    const res = await fetch(url, { headers: { 'Accept-Language': 'es' } })
    const data = await res.json()
    if (!data.length) {
      searchError.value = 'No se encontró esa dirección. Intenta ser más específico (agrega la ciudad).'
      return
    }
    const latNum = Number(data[0].lat)
    const lngNum = Number(data[0].lon)
    map.setView([latNum, lngNum], 17)
    placeMarker(latNum, lngNum)
    emitCoords(latNum, lngNum)
    reverseGeocode(latNum, lngNum)
  } catch (err) {
    searchError.value = 'No se pudo buscar en este momento. Intenta de nuevo.'
  } finally {
    searching.value = false
  }
}

async function reverseGeocode(latVal, lngVal) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latVal}&lon=${lngVal}`
    const res = await fetch(url, { headers: { 'Accept-Language': 'es' } })
    const data = await res.json()
    suggestedAddress.value = data.display_name || ''
  } catch (err) {
    suggestedAddress.value = ''
  }
}
</script>

<style scoped>
.map-picker { margin-bottom: 16px; }

.map-picker__search {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
.map-picker__search input {
  flex: 1;
  padding: 9px 12px;
  border-radius: 9px;
  border: 1px solid var(--border, #E3E3EF);
  font-family: inherit;
  font-size: 13px;
}
.map-picker__search button {
  border: none;
  background: var(--primary, #630ED4);
  color: white;
  border-radius: 9px;
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}
.map-picker__search button:disabled { opacity: 0.6; }

.map-picker__error {
  font-size: 12px;
  color: var(--danger, #DC2626);
  margin: 0 0 8px;
}

.map-picker__map {
  height: 260px;
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--border, #E3E3EF);
  z-index: 1; /* mantiene el mapa por debajo del modal/overlay */
}

.map-picker__coords {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-muted, #6B6B85);
}

.map-picker__suggest-btn {
  display: block;
  width: 100%;
  text-align: left;
  margin-top: 8px;
  padding: 9px 12px;
  border-radius: 9px;
  border: 1px dashed var(--primary, #630ED4);
  background: var(--primary-tint, #F3ECFC);
  color: var(--primary, #630ED4);
  font-size: 12.5px;
  font-weight: 600;
}

.map-picker__hint {
  font-size: 11px;
  color: var(--text-muted, #6B6B85);
  margin: 8px 0 0;
}

:deep(.map-picker__pin) { background: none; border: none; }
:deep(.map-picker__pin-dot) {
  font-size: 28px;
  line-height: 1;
  filter: drop-shadow(0 3px 4px rgba(0,0,0,0.35));
  cursor: grab;
}
</style>

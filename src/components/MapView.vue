<template>
  <div class="map-view">
    <p class="map-view__info">
      🗺️ {{ places.length }} lugares en el mapa · Toca un marcador para ver detalles
    </p>
    <div ref="mapEl" class="map-view__map" />
    <div class="map-view__legend">
      <span
        v-for="c in CATEGORIES.slice(1)"
        :key="c.id"
        class="map-view__legend-item"
        :style="{ color: c.color, background: c.light }"
      >{{ c.icon }} {{ c.label.split(' ')[0] }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { CATEGORIES, getCat } from '@/data/categories'

const props = defineProps({
  places: { type: Array,  required: true, default: () => [] },
  city:   { type: String, default: 'medellin' },
})

const CITY_CENTERS = {
  medellin:  { center: [6.2442, -75.5812], zoom: 12 },
  bogota:    { center: [4.7110, -74.0721], zoom: 11 },
  cali:      { center: [3.4516, -76.5320], zoom: 12 },
  cartagena: { center: [10.3910,-75.4794], zoom: 12 },
}

const mapEl   = ref(null)
const mapInst = ref(null)

const CAT_COLORS = {
  parques: '#059669', granjas: '#D97706',
  restaurantes: '#DC2626', centros: '#2563EB', actividades: '#DB2777',
}

function loadLeaflet(cb) {
  if (window.L) return cb()
  if (!document.querySelector('#lft-css')) {
    const l = document.createElement('link')
    l.id = 'lft-css'; l.rel = 'stylesheet'
    l.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(l)
  }
  if (!document.querySelector('#lft-js')) {
    const s = document.createElement('script')
    s.id = 'lft-js'
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    s.onload = cb
    document.head.appendChild(s)
  }
}

function initMap() {
  if (!mapEl.value || mapInst.value) return
  const L = window.L
  const { center, zoom } = CITY_CENTERS[props.city] || CITY_CENTERS.medellin
  mapInst.value = L.map(mapEl.value, { zoomControl: true }).setView(center, zoom)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors', maxZoom: 18,
  }).addTo(mapInst.value)
  addMarkers()
}

function addMarkers() {
  if (!mapInst.value || !window.L) return
  const L = window.L
  // Limpiar marcadores anteriores
  mapInst.value.eachLayer(l => { if (l instanceof L.Marker) mapInst.value.removeLayer(l) })

  props.places.filter(p => p.coords).forEach(p => {
    const color = CAT_COLORS[p.cat] || '#7C3AED'
    const icon = L.divIcon({
      className: '',
      html: `<div style="background:${color};width:36px;height:36px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:17px;box-shadow:0 2px 8px rgba(0,0,0,0.28)">${p.emoji}</div>`,
      iconSize: [36, 36], iconAnchor: [18, 18],
    })
    const priceBadge = p.price.free
      ? `<span style="background:#D1FAE5;color:#065F46;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:700">✓ Gratis</span>`
      : `<span style="background:#FEF3C7;color:#92400E;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:700">${p.price.label}</span>`
    L.marker(p.coords, { icon }).addTo(mapInst.value).bindPopup(
      `<div style="font-family:sans-serif;min-width:170px;padding:4px 0">
        <b style="font-size:14px">${p.emoji} ${p.name}</b><br>
        <span style="color:#6B7280;font-size:12px">📍 ${p.zone} · 👶 ${p.age} años</span><br>
        <div style="margin:6px 0">${priceBadge}</div>
        <span style="color:#6B7280;font-size:11px">🕐 ${p.sched}</span>
      </div>`, { maxWidth: 230 }
    )
  })
}

watch(() => props.city, (newCity) => {
  if (!mapInst.value) return
  const { center, zoom } = CITY_CENTERS[newCity] || CITY_CENTERS.medellin
  mapInst.value.flyTo(center, zoom)
})

watch(() => props.places, addMarkers, { deep: true })

onMounted(() => loadLeaflet(initMap))
onBeforeUnmount(() => { if (mapInst.value) { mapInst.value.remove(); mapInst.value = null } })
</script>

<style lang="scss" scoped>
@use 'sass:color';
.map-view {
  &__info {
    background: $brand-light;
    border-radius: $r-sm;
    padding: 9px 16px;
    margin-bottom: 12px;
    font-size: 13px;
    color: color.adjust($brand, $lightness: -20%);
    font-weight: 600;
  }

  &__map {
    height: 450px;
    border-radius: $r-lg;
    overflow: hidden;
    border: 1px solid $border;

    @media (max-width: $bp-md) { height: 320px; border-radius: $r-md; }
  }

  &__legend {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    flex-wrap: wrap;
  }

  &__legend-item {
    font-size: 12px;
    font-weight: 700;
    padding: 3px 12px;
    border-radius: 20px;
  }
}
</style>

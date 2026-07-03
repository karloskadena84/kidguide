<template>
  <div>
    <div class="header-row">
      <div>
        <h1>Lugares</h1>
        <p class="stat-line" v-if="!loading">
          <strong>{{ filteredPlaces.length }}</strong> lugares
          <span class="dot">·</span>
          <strong>{{ freeCount }}</strong> gratuitos
          <span class="dot">·</span>
          <strong>{{ featuredCount }}</strong> destacados
          <span class="dot">·</span>
          <strong>{{ inactiveCount }}</strong> inactivos
        </p>
      </div>
      <button class="primary" @click="openCreate">+ Nuevo lugar</button>
    </div>

    <!-- Pestañas de ciudad, mismo lenguaje visual del sitio público -->
    <div class="city-tabs">
      <button
        v-for="c in cityTabs"
        :key="c.value"
        :class="{ active: cityFilter === c.value }"
        @click="cityFilter = c.value"
      >
        {{ c.emoji }} {{ c.label }}
        <span class="count">{{ countByCity(c.value) }}</span>
      </button>
    </div>

    <div class="filters">
      <div class="search-wrap">
        <span class="search-icon">⌕</span>
        <input v-model="search" type="text" placeholder="Buscar por nombre…" />
      </div>
    </div>

    <p v-if="loading" class="muted">Cargando…</p>
    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="!loading && filteredPlaces.length === 0" class="empty">
      <p>No hay lugares que coincidan con este filtro.</p>
      <button class="ghost-link" @click="clearFilters">Limpiar filtros</button>
    </div>

    <table v-if="!loading && filteredPlaces.length" class="table">
      <thead>
        <tr>
          <th>Lugar</th>
          <th>Categoría</th>
          <th>Activo</th>
          <th>Destacado</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in filteredPlaces" :key="p.id">
          <td>
            <div class="place-cell">
              <span class="emoji-swatch" :style="{ background: categoryMeta(p.cat).bg }">{{ p.emoji || '📍' }}</span>
              <div>
                <div class="place-name">{{ p.name }}</div>
                <div class="place-zone">{{ p.zone }} · {{ cityLabel(p.city) }}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="cat-chip" :style="{ background: categoryMeta(p.cat).bg, color: categoryMeta(p.cat).color }">
              {{ categoryMeta(p.cat).label }}
            </span>
          </td>
          <td>
            <button class="pill" :class="p.active ? 'on' : 'off'" @click="toggleActive(p)">
              {{ p.active ? '✓ Activo' : 'Inactivo' }}
            </button>
          </td>
          <td>
            <button class="pill" :class="p.featured ? 'star' : 'off'" @click="toggleFeatured(p)">
              {{ p.featured ? '★ Sí' : 'No' }}
            </button>
          </td>
          <td class="actions">
            <button @click="openEdit(p)">Editar</button>
            <button class="danger" @click="remove(p)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <PlaceFormModal
      v-if="showForm"
      :place="editingPlace"
      @close="showForm = false"
      @saved="onSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchAllPlacesAdmin, updatePlace, deletePlace } from '@/services/placesApi'
import PlaceFormModal from '../components/PlaceFormModal.vue'

const CATEGORY_META = {
  parques:      { label: 'Parques & Museos',    bg: '#ECFDF3', color: '#067647' },
  granjas:      { label: 'Granjas & Animales',  bg: '#FFF4E5', color: '#B45309' },
  restaurantes: { label: 'Restaurantes',        bg: '#FDECEA', color: '#C0392B' },
  centros:      { label: 'Entretenimiento',     bg: '#F3ECFC', color: '#7C2FD1' },
  actividades:  { label: 'Actividades',         bg: '#EAF2FF', color: '#1D4ED8' },
}
function categoryMeta(cat) {
  return CATEGORY_META[cat] || { label: cat, bg: '#F0F0F5', color: '#6B6B85' }
}

const CITY_LABELS = { medellin: 'Medellín', bogota: 'Bogotá', cali: 'Cali', cartagena: 'Cartagena' }
function cityLabel(city) {
  return CITY_LABELS[city] || city
}

const cityTabs = [
  { value: '', label: 'Todas', emoji: '🗺️' },
  { value: 'medellin', label: 'Medellín', emoji: '🏙️' },
  { value: 'bogota', label: 'Bogotá', emoji: '🏔️' },
  { value: 'cali', label: 'Cali', emoji: '🌴' },
  { value: 'cartagena', label: 'Cartagena', emoji: '🏖️' },
]

const places = ref([])
const loading = ref(true)
const error = ref('')
const cityFilter = ref('')
const search = ref('')
const showForm = ref(false)
const editingPlace = ref(null)

function countByCity(city) {
  if (!city) return places.value.length
  return places.value.filter((p) => p.city === city).length
}

const filteredPlaces = computed(() =>
  places.value.filter((p) => {
    if (cityFilter.value && p.city !== cityFilter.value) return false
    if (search.value && !p.name.toLowerCase().includes(search.value.toLowerCase())) return false
    return true
  })
)

const freeCount = computed(() => filteredPlaces.value.filter((p) => p.priceFree).length)
const featuredCount = computed(() => filteredPlaces.value.filter((p) => p.featured).length)
const inactiveCount = computed(() => filteredPlaces.value.filter((p) => !p.active).length)

async function load() {
  loading.value = true
  error.value = ''
  try {
    places.value = await fetchAllPlacesAdmin()
  } catch (err) {
    error.value = 'No se pudieron cargar los lugares. Verifica tu sesión.'
  } finally {
    loading.value = false
  }
}

onMounted(load)

function clearFilters() {
  search.value = ''
  cityFilter.value = ''
}

function openCreate() {
  editingPlace.value = null
  showForm.value = true
}

function openEdit(place) {
  editingPlace.value = place
  showForm.value = true
}

async function toggleActive(place) {
  await updatePlace(place.id, { active: !place.active })
  load()
}

async function toggleFeatured(place) {
  await updatePlace(place.id, { featured: !place.featured })
  load()
}

async function remove(place) {
  if (!confirm(`¿Eliminar "${place.name}"? Esta acción no se puede deshacer.`)) return
  await deletePlace(place.id)
  load()
}

function onSaved() {
  showForm.value = false
  load()
}
</script>

<style scoped>
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}
h1 { margin: 0 0 6px; font-size: 26px; font-weight: 800; letter-spacing: -0.02em; }

.stat-line {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
}
.stat-line strong { color: var(--text); font-weight: 700; }
.stat-line .dot { margin: 0 6px; opacity: 0.5; }

.primary {
  background: var(--primary);
  color: white;
  border: none;
  padding: 11px 20px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(99, 14, 212, 0.25);
}

/* Pestañas de ciudad */
.city-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0;
}
.city-tabs button {
  border: none;
  background: transparent;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-muted);
  border-bottom: 2px solid transparent;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: -1px;
}
.city-tabs button.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}
.city-tabs .count {
  background: var(--bg);
  color: var(--text-muted);
  border-radius: 10px;
  padding: 1px 7px;
  font-size: 11px;
  font-weight: 700;
}
.city-tabs button.active .count {
  background: var(--primary-tint);
  color: var(--primary);
}

.filters {
  margin-bottom: 16px;
}
.search-wrap {
  position: relative;
  max-width: 320px;
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%) rotate(90deg);
  color: var(--text-muted);
  font-size: 15px;
}
.search-wrap input {
  width: 100%;
  padding: 10px 12px 10px 34px;
  border-radius: 999px;
  border: 1px solid var(--border);
  font-family: inherit;
  font-size: 13px;
  background: var(--surface);
}
.search-wrap input:focus {
  outline: 2px solid var(--primary-tint);
  border-color: var(--primary);
}

.empty {
  text-align: center;
  padding: 48px 20px;
  color: var(--text-muted);
  background: var(--surface);
  border: 1px dashed var(--border);
  border-radius: 14px;
}
.ghost-link {
  border: none;
  background: none;
  color: var(--primary);
  font-weight: 700;
  font-size: 13px;
  margin-top: 8px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: var(--surface);
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--border);
}
.table th, .table td {
  text-align: left;
  padding: 14px;
  font-size: 13px;
  border-bottom: 1px solid var(--border);
}
.table th {
  color: var(--text-muted);
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: var(--bg);
  position: sticky;
  top: 0;
}
.table tbody tr:hover { background: var(--bg); }
.table tbody tr:last-child td { border-bottom: none; }

.place-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}
.emoji-swatch {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  flex-shrink: 0;
}
.place-name { font-weight: 700; color: var(--text); }
.place-zone { font-size: 12px; color: var(--text-muted); margin-top: 1px; }

.cat-chip {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
}

.pill {
  border: none;
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 700;
}
.pill.on { background: var(--success-tint); color: var(--success); }
.pill.off { background: #F0F0F5; color: var(--text-muted); }
.pill.star { background: var(--accent-tint); color: #B45309; }

.actions { display: flex; gap: 8px; }
.actions button {
  border: 1px solid var(--border);
  background: white;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
}
.actions button:hover { border-color: var(--primary); color: var(--primary); }
.actions .danger { color: var(--danger); border-color: #F5C6C0; }
.actions .danger:hover { border-color: var(--danger); color: var(--danger); background: var(--danger-tint); }

.muted { color: var(--text-muted); font-size: 13px; }
.error { color: var(--danger); }
</style>

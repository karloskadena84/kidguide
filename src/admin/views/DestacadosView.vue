<template>
  <div>
    <div class="header-row">
      <div>
        <h1>Destacados</h1>
        <p class="stat-line">Controla el "destacado del día" y los "planes para hoy" de cada ciudad</p>
      </div>
    </div>

    <div class="city-tabs">
      <button
        v-for="c in cities"
        :key="c.value"
        :class="{ active: cityFilter === c.value }"
        @click="selectCity(c.value)"
      >
        {{ c.emoji }} {{ c.label }}
      </button>
    </div>

    <p v-if="loading" class="muted">Cargando…</p>
    <p v-if="error" class="error">{{ error }}</p>

    <template v-if="!loading">
      <!-- Destacado del día -->
      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>⭐ Destacado del día</h2>
            <p class="muted">El lugar que se muestra como "recomendado" en la tarjeta principal.</p>
          </div>
          <div class="mode-switch">
            <button :class="{ active: form.featuredMode === 'auto' }" @click="form.featuredMode = 'auto'">🎲 Automático</button>
            <button :class="{ active: form.featuredMode === 'manual' }" @click="form.featuredMode = 'manual'">✋ Manual</button>
          </div>
        </div>

        <p v-if="form.featuredMode === 'auto'" class="muted hint">
          Se elige solo, distinto cada día, entre los lugares abiertos hoy — igual que siempre.
        </p>

        <div v-else class="manual-picker">
          <input v-model="featuredSearch" type="text" placeholder="Buscar lugar por nombre…" />
          <div class="options">
            <button
              v-for="p in filteredFeaturedOptions"
              :key="p.id"
              class="option"
              :class="{ selected: form.featuredPlaceId === p.id }"
              @click="form.featuredPlaceId = p.id"
            >
              {{ p.emoji }} {{ p.name }}
              <span class="check" v-if="form.featuredPlaceId === p.id">✓</span>
            </button>
            <p v-if="!filteredFeaturedOptions.length" class="muted">Sin resultados.</p>
          </div>
          <p v-if="selectedFeaturedPlace" class="current">
            Elegido: <strong>{{ selectedFeaturedPlace.emoji }} {{ selectedFeaturedPlace.name }}</strong>
          </p>
        </div>
      </section>

      <!-- Planes para hoy -->
      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>📋 Planes para hoy</h2>
            <p class="muted">La lista de lugares que aparece en el carrusel "¿A dónde vamos hoy?".</p>
          </div>
          <div class="mode-switch">
            <button :class="{ active: form.todayMode === 'auto' }" @click="form.todayMode = 'auto'">🎲 Automático</button>
            <button :class="{ active: form.todayMode === 'manual' }" @click="form.todayMode = 'manual'">✋ Manual</button>
          </div>
        </div>

        <p v-if="form.todayMode === 'auto'" class="muted hint">
          Se calcula solo: lugares abiertos hoy, en un orden distinto cada día — igual que siempre.
        </p>

        <div v-else class="manual-picker">
          <input v-model="todaySearch" type="text" placeholder="Buscar lugar para agregar…" />
          <div class="options">
            <button
              v-for="p in filteredTodayOptions"
              :key="p.id"
              class="option"
              @click="addTodayPlace(p.id)"
            >
              + {{ p.emoji }} {{ p.name }}
            </button>
            <p v-if="!filteredTodayOptions.length" class="muted">Sin resultados (o ya están todos agregados).</p>
          </div>

          <p class="current-label" v-if="selectedTodayPlaces.length">Orden actual (arriba = primero en el carrusel):</p>
          <div class="today-list">
            <div v-for="(p, idx) in selectedTodayPlaces" :key="p.id" class="today-item">
              <span class="idx">{{ idx + 1 }}</span>
              <span class="name">{{ p.emoji }} {{ p.name }}</span>
              <div class="today-actions">
                <button :disabled="idx === 0" @click="moveTodayPlace(idx, -1)" title="Subir">↑</button>
                <button :disabled="idx === selectedTodayPlaces.length - 1" @click="moveTodayPlace(idx, 1)" title="Bajar">↓</button>
                <button class="remove" @click="removeTodayPlace(p.id)" title="Quitar">✕</button>
              </div>
            </div>
            <p v-if="!selectedTodayPlaces.length" class="muted">No has agregado ningún lugar todavía.</p>
          </div>
        </div>
      </section>

      <div class="save-row">
        <p v-if="saveError" class="error">{{ saveError }}</p>
        <p v-if="saved" class="success-msg">✓ Guardado</p>
        <button class="primary" :disabled="saving" @click="save">
          {{ saving ? 'Guardando…' : 'Guardar cambios' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { fetchAllPlacesAdmin, fetchCitySettings, updateCitySettings, clearCitySettingsCache } from '@/services/placesApi'

const cities = [
  { value: 'medellin', label: 'Medellín', emoji: '🏙️' },
  { value: 'bogota', label: 'Bogotá', emoji: '🏔️' },
  { value: 'cali', label: 'Cali', emoji: '🌴' },
  { value: 'cartagena', label: 'Cartagena', emoji: '🏖️' },
]

const cityFilter = ref('medellin')
const allPlaces = ref([])
const loading = ref(true)
const error = ref('')
const saving = ref(false)
const saveError = ref('')
const saved = ref(false)

const featuredSearch = ref('')
const todaySearch = ref('')

const form = ref({
  featuredMode: 'auto',
  featuredPlaceId: null,
  todayMode: 'auto',
  todayPlaceIds: [],
})

const placesInCity = computed(() => allPlaces.value.filter((p) => p.city === cityFilter.value && p.active))

const filteredFeaturedOptions = computed(() => {
  const q = featuredSearch.value.toLowerCase()
  return placesInCity.value.filter((p) => !q || p.name.toLowerCase().includes(q))
})

const selectedFeaturedPlace = computed(() =>
  placesInCity.value.find((p) => p.id === form.value.featuredPlaceId)
)

const filteredTodayOptions = computed(() => {
  const q = todaySearch.value.toLowerCase()
  return placesInCity.value.filter(
    (p) => !form.value.todayPlaceIds.includes(p.id) && (!q || p.name.toLowerCase().includes(q))
  )
})

const selectedTodayPlaces = computed(() => {
  const byId = new Map(placesInCity.value.map((p) => [p.id, p]))
  return form.value.todayPlaceIds.map((id) => byId.get(id)).filter(Boolean)
})

function addTodayPlace(id) {
  form.value.todayPlaceIds.push(id)
  todaySearch.value = ''
}
function removeTodayPlace(id) {
  form.value.todayPlaceIds = form.value.todayPlaceIds.filter((x) => x !== id)
}
function moveTodayPlace(idx, dir) {
  const arr = form.value.todayPlaceIds
  const target = idx + dir
  if (target < 0 || target >= arr.length) return
  ;[arr[idx], arr[target]] = [arr[target], arr[idx]]
}

async function loadPlaces() {
  loading.value = true
  error.value = ''
  try {
    allPlaces.value = await fetchAllPlacesAdmin()
    await loadSettings()
  } catch (err) {
    error.value = 'No se pudieron cargar los lugares.'
  } finally {
    loading.value = false
  }
}

async function loadSettings() {
  try {
    const settings = await fetchCitySettings(cityFilter.value)
    form.value = {
      featuredMode: settings.featuredMode || 'auto',
      featuredPlaceId: settings.featuredPlaceId || null,
      todayMode: settings.todayMode || 'auto',
      todayPlaceIds: settings.todayPlaceIds ? [...settings.todayPlaceIds] : [],
    }
  } catch (err) {
    error.value = 'No se pudo cargar la configuración de esta ciudad.'
  }
}

function selectCity(city) {
  cityFilter.value = city
  featuredSearch.value = ''
  todaySearch.value = ''
  saved.value = false
  loadSettings()
}

async function save() {
  saving.value = true
  saveError.value = ''
  saved.value = false
  try {
    await updateCitySettings(cityFilter.value, form.value)
    clearCitySettingsCache()
    saved.value = true
    setTimeout(() => (saved.value = false), 2500)
  } catch (err) {
    saveError.value = 'No se pudo guardar. Intenta de nuevo.'
  } finally {
    saving.value = false
  }
}

onMounted(loadPlaces)
</script>

<style scoped>
.header-row { margin-bottom: 20px; }
h1 { margin: 0 0 6px; font-size: 26px; font-weight: 800; letter-spacing: -0.02em; }
.stat-line { margin: 0; font-size: 13px; color: var(--text-muted); }
.muted { color: var(--text-muted); font-size: 13px; }
.error { color: var(--danger); }

.city-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border);
}
.city-tabs button {
  border: none;
  background: transparent;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-muted);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}
.city-tabs button.active { color: var(--primary); border-bottom-color: var(--primary); }

.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 18px;
}
.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 16px;
}
h2 { margin: 0 0 4px; font-size: 16px; font-weight: 800; }

.mode-switch {
  display: flex;
  gap: 4px;
  background: var(--bg);
  border-radius: 10px;
  padding: 3px;
  flex-shrink: 0;
}
.mode-switch button {
  border: none;
  background: transparent;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
}
.mode-switch button.active { background: var(--primary); color: white; }

.hint { margin: 8px 0 0; }

.manual-picker { margin-top: 10px; }
.manual-picker input {
  width: 100%;
  padding: 9px 12px;
  border-radius: 9px;
  border: 1px solid var(--border);
  font-family: inherit;
  font-size: 13px;
  margin-bottom: 10px;
}
.options {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 220px;
  overflow-y: auto;
}
.option {
  text-align: left;
  border: 1px solid var(--border);
  background: white;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.option.selected { border-color: var(--primary); background: var(--primary-tint); color: var(--primary); font-weight: 700; }
.option .check { font-weight: 800; }

.current { margin: 10px 0 0; font-size: 13px; }
.current-label { margin: 14px 0 6px; font-size: 12px; font-weight: 700; color: var(--text-muted); }

.today-list { display: flex; flex-direction: column; gap: 6px; }
.today-item {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 7px 10px;
  font-size: 13px;
}
.today-item .idx {
  background: var(--primary-tint);
  color: var(--primary);
  font-weight: 800;
  font-size: 11px;
  border-radius: 6px;
  padding: 2px 7px;
}
.today-item .name { flex: 1; }
.today-actions { display: flex; gap: 4px; }
.today-actions button {
  border: 1px solid var(--border);
  background: white;
  border-radius: 6px;
  width: 26px;
  height: 26px;
  font-size: 12px;
}
.today-actions button:disabled { opacity: 0.3; }
.today-actions .remove { color: var(--danger); border-color: #F5C6C0; }

.save-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 20px;
}
.primary {
  background: var(--primary);
  color: white;
  border: none;
  padding: 11px 22px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
}
.primary:disabled { opacity: 0.6; }
.success-msg { color: var(--success); font-weight: 700; font-size: 13px; margin: 0; }
</style>

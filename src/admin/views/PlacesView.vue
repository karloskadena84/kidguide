<template>
  <div>
    <div class="header-row">
      <div>
        <h1>Lugares</h1>
        <p class="muted">{{ places.length }} lugares en total</p>
      </div>
      <button class="primary" @click="openCreate">+ Nuevo lugar</button>
    </div>

    <div class="filters">
      <select v-model="cityFilter">
        <option value="">Todas las ciudades</option>
        <option value="medellin">Medellín</option>
        <option value="bogota">Bogotá</option>
        <option value="cali">Cali</option>
        <option value="cartagena">Cartagena</option>
      </select>
      <input v-model="search" type="text" placeholder="Buscar por nombre…" />
    </div>

    <p v-if="loading" class="muted">Cargando…</p>
    <p v-if="error" class="error">{{ error }}</p>

    <table v-if="!loading" class="table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Ciudad</th>
          <th>Categoría</th>
          <th>Activo</th>
          <th>Destacado</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in filteredPlaces" :key="p.id">
          <td>{{ p.emoji }} {{ p.name }}</td>
          <td class="capitalize">{{ p.city }}</td>
          <td>{{ p.cat }}</td>
          <td>
            <button class="pill" :class="p.active ? 'on' : 'off'" @click="toggleActive(p)">
              {{ p.active ? 'Activo' : 'Inactivo' }}
            </button>
          </td>
          <td>
            <button class="pill" :class="p.featured ? 'on' : 'off'" @click="toggleFeatured(p)">
              {{ p.featured ? 'Sí' : 'No' }}
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

const places = ref([])
const loading = ref(true)
const error = ref('')
const cityFilter = ref('')
const search = ref('')
const showForm = ref(false)
const editingPlace = ref(null)

const filteredPlaces = computed(() =>
  places.value.filter((p) => {
    if (cityFilter.value && p.city !== cityFilter.value) return false
    if (search.value && !p.name.toLowerCase().includes(search.value.toLowerCase())) return false
    return true
  })
)

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
h1 { margin: 0 0 4px; font-size: 24px; }
.muted { color: #6B6B85; font-size: 13px; margin: 0; }

.primary {
  background: #505ACD;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}
.filters select, .filters input {
  padding: 9px 12px;
  border-radius: 8px;
  border: 1px solid #E3E3EF;
  font-family: inherit;
  font-size: 13px;
}
.filters input { flex: 1; }

.table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #E3E3EF;
}
.table th, .table td {
  text-align: left;
  padding: 12px 14px;
  font-size: 13px;
  border-bottom: 1px solid #F0F0F5;
}
.table th { color: #6B6B85; font-weight: 600; background: #FAFAFC; }
.capitalize { text-transform: capitalize; }

.pill {
  border: none;
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 700;
}
.pill.on { background: #D1FAE5; color: #059669; }
.pill.off { background: #F0F0F5; color: #6B6B85; }

.actions { display: flex; gap: 8px; }
.actions button {
  border: 1px solid #E3E3EF;
  background: white;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
}
.actions .danger { color: #DC2626; border-color: #FCA5A5; }

.error { color: #DC2626; }
</style>

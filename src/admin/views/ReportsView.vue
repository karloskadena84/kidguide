<template>
  <div>
    <h1>Reportes</h1>
    <p class="muted">Correcciones y sugerencias enviadas desde el sitio.</p>

    <p v-if="loading" class="muted">Cargando…</p>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="!loading && reports.length === 0" class="muted">No hay reportes todavía.</p>

    <div class="list">
      <div v-for="r in reports" :key="r.id" class="card">
        <div class="row">
          <span class="type">{{ r.type }}</span>
          <span class="date">{{ formatDate(r.createdAt) }}</span>
        </div>
        <p class="place" v-if="r.placeName">Sobre: {{ r.placeName }}</p>
        <p class="message">{{ r.message }}</p>
        <p class="contact" v-if="r.contactInfo">Contacto: {{ r.contactInfo }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchReports } from '@/services/placesApi'

const reports = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    reports.value = await fetchReports()
  } catch (err) {
    error.value = 'No se pudieron cargar los reportes.'
  } finally {
    loading.value = false
  }
})

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
h1 { margin: 0 0 4px; font-size: 24px; }
.muted { color: #6B6B85; font-size: 13px; }
.error { color: #DC2626; }

.list { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
.card {
  background: white;
  border: 1px solid #E3E3EF;
  border-radius: 12px;
  padding: 16px;
}
.row { display: flex; justify-content: space-between; margin-bottom: 8px; }
.type {
  text-transform: uppercase;
  font-size: 11px;
  font-weight: 700;
  color: #505ACD;
  background: #EEF0FC;
  padding: 3px 8px;
  border-radius: 6px;
}
.date { font-size: 12px; color: #6B6B85; }
.place { font-size: 12px; color: #6B6B85; margin: 0 0 6px; }
.message { font-size: 14px; margin: 0 0 6px; }
.contact { font-size: 12px; color: #6B6B85; margin: 0; }
</style>

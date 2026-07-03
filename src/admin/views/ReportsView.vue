<template>
  <div>
    <div class="header-row">
      <div>
        <h1>Reportes</h1>
        <p class="stat-line" v-if="!loading">
          <strong>{{ reports.length }}</strong> en total
          <span class="dot">·</span>
          <strong>{{ countByStatus('pending') }}</strong> pendientes
        </p>
      </div>
    </div>

    <!-- Pestañas de estado -->
    <div class="status-tabs">
      <button
        v-for="s in statusTabs"
        :key="s.value"
        :class="{ active: statusFilter === s.value }"
        @click="statusFilter = s.value"
      >
        {{ s.emoji }} {{ s.label }}
        <span class="count">{{ s.value ? countByStatus(s.value) : reports.length }}</span>
      </button>
    </div>

    <p v-if="loading" class="muted">Cargando…</p>
    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="!loading && filteredReports.length === 0" class="empty">
      <p v-if="statusFilter === 'pending'">🎉 No hay reportes pendientes — estás al día.</p>
      <p v-else>No hay reportes en esta categoría.</p>
    </div>

    <div class="list">
      <div v-for="r in filteredReports" :key="r.id" class="card" :class="{ resolved: r.status === 'resolved' }">
        <div class="card-top">
          <div class="badges">
            <span class="type-chip" :style="{ background: typeMeta(r.type).bg, color: typeMeta(r.type).color }">
              {{ typeMeta(r.type).emoji }} {{ typeMeta(r.type).label }}
            </span>
            <span class="status-pill" :class="r.status">{{ statusLabel(r.status) }}</span>
          </div>
          <span class="date">{{ formatDate(r.createdAt) }}</span>
        </div>

        <p class="place" v-if="r.placeName">📍 {{ r.placeName }}</p>
        <p class="message">{{ r.message }}</p>
        <p class="contact" v-if="r.contactInfo">✉️ {{ r.contactInfo }}</p>

        <div class="card-actions">
          <button v-if="r.status !== 'reviewed'" class="action" @click="setStatus(r, 'reviewed')">
            👀 Marcar revisado
          </button>
          <button v-if="r.status !== 'resolved'" class="action primary" @click="setStatus(r, 'resolved')">
            ✓ Marcar resuelto
          </button>
          <button v-if="r.status !== 'pending'" class="action ghost" @click="setStatus(r, 'pending')">
            ↺ Reabrir
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchReports, updateReportStatus } from '@/services/placesApi'

const TYPE_META = {
  precio:    { label: 'Precio',    emoji: '💰', bg: '#FFF4E5', color: '#B45309' },
  horario:   { label: 'Horario',   emoji: '🕐', bg: '#EAF2FF', color: '#1D4ED8' },
  direccion: { label: 'Dirección', emoji: '📌', bg: '#F3ECFC', color: '#7C2FD1' },
  edad:      { label: 'Edad',      emoji: '👶', bg: '#ECFDF3', color: '#067647' },
  otro:      { label: 'Otro',      emoji: '📝', bg: '#F0F0F5', color: '#6B6B85' },
}
function typeMeta(type) {
  return TYPE_META[type] || { label: type, emoji: '📝', bg: '#F0F0F5', color: '#6B6B85' }
}

const STATUS_LABELS = { pending: 'Pendiente', reviewed: 'Revisado', resolved: 'Resuelto' }
function statusLabel(status) {
  return STATUS_LABELS[status] || status
}

const statusTabs = [
  { value: 'pending', label: 'Pendientes', emoji: '🕓' },
  { value: 'reviewed', label: 'Revisados', emoji: '👀' },
  { value: 'resolved', label: 'Resueltos', emoji: '✓' },
  { value: '', label: 'Todos', emoji: '📨' },
]

const reports = ref([])
const loading = ref(true)
const error = ref('')
const statusFilter = ref('pending')

function countByStatus(status) {
  return reports.value.filter((r) => r.status === status).length
}

const filteredReports = computed(() =>
  statusFilter.value ? reports.value.filter((r) => r.status === statusFilter.value) : reports.value
)

async function load() {
  loading.value = true
  error.value = ''
  try {
    reports.value = await fetchReports()
  } catch (err) {
    error.value = 'No se pudieron cargar los reportes.'
  } finally {
    loading.value = false
  }
}

onMounted(load)

async function setStatus(report, status) {
  const previous = report.status
  report.status = status // optimista: refleja el cambio de inmediato
  try {
    await updateReportStatus(report.id, status)
  } catch (err) {
    report.status = previous // revertir si falla
    error.value = 'No se pudo actualizar el estado del reporte.'
  }
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
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

.stat-line { margin: 0; font-size: 13px; color: var(--text-muted); }
.stat-line strong { color: var(--text); font-weight: 700; }
.stat-line .dot { margin: 0 6px; opacity: 0.5; }

.status-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border);
}
.status-tabs button {
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
.status-tabs button.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}
.status-tabs .count {
  background: var(--bg);
  color: var(--text-muted);
  border-radius: 10px;
  padding: 1px 7px;
  font-size: 11px;
  font-weight: 700;
}
.status-tabs button.active .count {
  background: var(--primary-tint);
  color: var(--primary);
}

.muted { color: var(--text-muted); font-size: 13px; }
.error { color: var(--danger); }

.empty {
  text-align: center;
  padding: 48px 20px;
  color: var(--text-muted);
  background: var(--surface);
  border: 1px dashed var(--border);
  border-radius: 14px;
}

.list { display: flex; flex-direction: column; gap: 12px; }

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 18px;
  transition: opacity 0.2s;
}
.card.resolved { opacity: 0.6; }

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.badges { display: flex; gap: 8px; align-items: center; }

.type-chip {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
}

.status-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
}
.status-pill.pending { background: #FFF4E5; color: #B45309; }
.status-pill.reviewed { background: #EAF2FF; color: #1D4ED8; }
.status-pill.resolved { background: var(--success-tint); color: var(--success); }

.date { font-size: 12px; color: var(--text-muted); }
.place { font-size: 13px; font-weight: 700; color: var(--text); margin: 0 0 6px; }
.message { font-size: 14px; color: var(--text); margin: 0 0 8px; line-height: 1.5; }
.contact { font-size: 12px; color: var(--text-muted); margin: 0 0 10px; }

.card-actions { display: flex; gap: 8px; }
.action {
  border: 1px solid var(--border);
  background: white;
  border-radius: 8px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text);
}
.action.primary {
  background: var(--success-tint);
  border-color: transparent;
  color: var(--success);
}
.action.ghost {
  color: var(--text-muted);
}
</style>

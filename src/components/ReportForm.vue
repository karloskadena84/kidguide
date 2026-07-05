<template>
  <div class="report">
    <!-- Trigger button -->
    <button class="report__trigger" @click="open = true">
      🚩 Reportar información incorrecta
    </button>

    <!-- Panel de reporte -->
    <Teleport to="body">
      <div v-if="open" class="report-overlay" @click.self="close">
        <div class="report-panel fade-up">

          <!-- Header -->
          <div class="report-panel__header">
            <div>
              <h3 class="report-panel__title">🚩 Reportar error en "{{ place.name }}"</h3>
              <p class="report-panel__sub">
                Tu reporte es validado por IA antes de enviarse al equipo
              </p>
            </div>
            <button class="report-panel__close" @click="close">✕</button>
          </div>

          <!-- Estado: enviado -->
          <div v-if="phase === 'done'" class="report-panel__result report-panel__result--ok fade-up">
            <div class="report-icon">✅</div>
            <h4>¡Reporte recibido!</h4>
            <p>{{ aiResult?.feedback || 'Gracias por ayudarnos a mantener la información actualizada.' }}</p>
            <div class="report-meta">
              <span class="report-meta__tag report-meta__tag--hf">
                🤗 Clasificado por HuggingFace
              </span>
              <span class="report-meta__tag" :style="{ background: confidenceColor, color: '#fff' }">
                {{ confidenceLabel }} ({{ confidencePct }}%)
              </span>
            </div>
            <button class="report-btn report-btn--secondary" @click="close">Cerrar</button>
          </div>

          <!-- Estado: rechazado -->
          <div v-else-if="phase === 'rejected'" class="report-panel__result report-panel__result--warn fade-up">
            <div class="report-icon">🤔</div>
            <h4>No pudimos procesar el reporte</h4>
            <p>{{ aiResult?.feedback || 'Por favor sé más específico sobre qué información está incorrecta.' }}</p>
            <button class="report-btn report-btn--secondary" @click="phase = 'idle'">Intentar de nuevo</button>
          </div>

          <!-- Formulario -->
          <form v-else class="report-form" @submit.prevent="submit">

            

            <!-- Info actual en la app -->
            <div class="report-form__info-box">
              <p class="report-form__info-title">📋 Lo que aparece actualmente en KidGuide:</p>
              <div class="report-form__info-data">
                <span v-if="form.type === 'precio'">💰 {{ place.price.free ? 'Gratis' : place.price.label }} {{ place.price.note ? `(${place.price.note})` : '' }}</span>
                <span v-else-if="form.type === 'horario'">🕐 {{ place.sched }}</span>
                <span v-else-if="form.type === 'direccion'">📌 {{ place.address }}</span>
                <span v-else-if="form.type === 'edad'">👶 {{ place.age }} años</span>
                <span v-else>📝 {{ place.desc.slice(0, 80) }}…</span>
              </div>
            </div>

            <!-- Información correcta -->
            <div class="report-form__field">
              <label class="report-form__label">¿Cuál es la información correcta? *</label>
              <input
                v-model="form.correct"
                class="report-form__input"
                :placeholder="placeholder"
                required
              />
            </div>

            <!-- Tipo de error -->
            <div class="report-form__field">
              <label class="report-form__label">¿Qué información está incorrecta?</label>
              <div class="report-types">
                <button
                  v-for="t in REPORT_TYPES"
                  :key="t.id"
                  type="button"
                  :class="['report-type', { 'report-type--active': form.type === t.id }]"
                  @click="form.type = t.id"
                >
                  {{ t.icon }} {{ t.label }}
                </button>
              </div>
            </div>

            <!-- Fuente -->
            <div class="report-form__field">
              <label class="report-form__label">¿Cómo lo sabes? (opcional)</label>
              <input
                v-model="form.source"
                class="report-form__input"
                placeholder="Ej: Fui la semana pasada · Vi el cartel en la entrada · Página oficial"
              />
            </div>

            <!-- Error -->
            <div v-if="phase === 'error'" class="report-form__error">
              ⚠️ Error al procesar. Intenta de nuevo.
            </div>

            <!-- HF clasificación en curso -->
            <div v-if="phase === 'classifying'" class="report-form__classifying">
              <span class="spin">🤗</span>
              Validando con HuggingFace bart-large-mnli…
            </div>

            <button
              type="submit"
              class="report-btn report-btn--primary"
              :disabled="!form.type || !form.correct || phase === 'loading' || phase === 'classifying'"
            >
              <span v-if="phase === 'loading' || phase === 'classifying'">
                <span class="spin">✦</span> Procesando…
              </span>
              <span v-else">🚩 Enviar reporte</span>
            </button>

            <p class="report-form__note">
              🤗 Tu reporte es clasificado automáticamente por
              <strong>facebook/bart-large-mnli</strong> en HuggingFace
            </p>
          </form>

        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { submitReport } from '@/services/placesApi'

// ── Constantes ────────────────────────────────
const WORKER_URL  = import.meta.env.VITE_WORKER_URL
const HF_ENDPOINT = WORKER_URL ? `${WORKER_URL}/hf` : null
const HF_MODEL    = 'facebook/bart-large-mnli'

const REPORT_TYPES = [
  { id: 'precio',     icon: '💰', label: 'Precio'    },
  { id: 'horario',    icon: '🕐', label: 'Horario'   },
  { id: 'direccion',  icon: '📌', label: 'Dirección' },
  { id: 'edad',       icon: '👶', label: 'Edad'      },
  { id: 'otro',       icon: '📝', label: 'Otro'      },
]

// Etiquetas que bart-large-mnli usará para clasificar
const VALID_LABELS   = ['corrección de información', 'dato desactualizado', 'error en el precio', 'error en el horario']
const INVALID_LABELS = ['spam', 'contenido irrelevante', 'insulto', 'publicidad']
const ALL_LABELS     = [...VALID_LABELS, ...INVALID_LABELS]

// ── Props ─────────────────────────────────────
const props = defineProps({
  place: { type: Object, required: true },
})
defineEmits(['reported'])

// ── Estado ────────────────────────────────────
const open    = ref(false)
const phase   = ref('idle') // idle | classifying | loading | done | rejected | error
const aiResult = ref(null)
const hfScores = ref(null)

const form = reactive({ type: '', correct: '', source: '' })

// ── Computed ──────────────────────────────────
const placeholder = computed(() => {
  const map = {
    precio:    'Ej: Ahora cuesta $20.000 por persona',
    horario:   'Ej: Ahora abre de martes a domingo de 9am a 5pm',
    direccion: 'Ej: La dirección correcta es Cl. 52 #73-100',
    edad:      'Ej: Solo admiten niños de 5 años en adelante',
    otro:      'Describe el error con el mayor detalle posible',
  }
  return map[form.type] || 'Describe la información correcta...'
})

// Calcular confianza del modelo
const topScore = computed(() => {
  if (!hfScores.value) return null
  return hfScores.value[0]
})

const confidencePct = computed(() =>
  topScore.value ? Math.round(topScore.value.score * 100) : 0
)

const confidenceLabel = computed(() => {
  const pct = confidencePct.value
  if (pct >= 70) return 'Alta confianza'
  if (pct >= 45) return 'Confianza media'
  return 'Baja confianza'
})

const confidenceColor = computed(() => {
  const pct = confidencePct.value
  if (pct >= 70) return '#059669'
  if (pct >= 45) return '#D97706'
  return '#DC2626'
})

// ── Métodos ───────────────────────────────────
const close = () => {
  open.value  = false
  phase.value = 'idle'
  aiResult.value = null
  hfScores.value = null
  Object.assign(form, { type: '', correct: '', source: '' })
}

// Paso 1: clasificar con HuggingFace bart-large-mnli (via Worker proxy)
async function classifyWithHuggingFace(text) {
  const endpoint = HF_ENDPOINT || `https://api-inference.huggingface.co/models/${HF_MODEL}`

  const body = HF_ENDPOINT
    ? JSON.stringify({ model: HF_MODEL, inputs: text, parameters: { candidate_labels: ALL_LABELS } })
    : JSON.stringify({ inputs: text, parameters: { candidate_labels: ALL_LABELS } })

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })

  if (res.status === 503) {
    // Modelo cargando en HF — fallback: aceptar el reporte directamente
    throw new Error('model_loading')
  }

  if (!res.ok) throw new Error(`HF error: ${res.status}`)
  const data = await res.json()

  const scores = data.labels.map((label, i) => ({
    label,
    score: data.scores[i],
  }))

  return scores.sort((a, b) => b.score - a.score)
}

// Determinar si el reporte es válido según HuggingFace
function isValidReport(scores) {
  if (!scores?.length) return false
  const topLabel = scores[0].label
  const topScore = scores[0].score
  // Es válido si la etiqueta más probable es de las válidas y con score > 0.25
  return VALID_LABELS.includes(topLabel) && topScore > 0.25
}

// Paso 2: enriquecer con Claude para feedback al usuario
async function enrichWithClaude(reportText, hfCategory, isValid) {
  if (!WORKER_URL) return { feedback: 'Reporte recibido correctamente.' }

  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      system: `Eres el sistema de moderación de KidGuide Medellín. Un usuario reportó información incorrecta sobre un lugar para niños. HuggingFace clasificó el reporte como: "${hfCategory}". Responde SOLO JSON sin texto extra: {"feedback":"mensaje breve y cálido para el usuario (máx 1 oración)","priority":"alta|media|baja"}`,
      messages: [{
        role: 'user',
        content: `Lugar: ${props.place.name}\nTipo de error: ${form.type}\nReporte: ${reportText}\nVálido según HF: ${isValid}`,
      }],
    }),
  })

  const data = await res.json()
  const txt  = (data.content?.[0]?.text || '{}').replace(/```json|```/g, '').trim()
  try { return JSON.parse(txt) } catch { return { feedback: 'Reporte recibido. ¡Gracias por tu aporte!' } }
}

const submit = async () => {
  const reportText = `El ${form.type} del lugar "${props.place.name}" está incorrecto. La información correcta es: ${form.correct}. ${form.source ? `Fuente: ${form.source}` : ''}`

  try {
    // ── Paso 1: HuggingFace clasifica el reporte ──────────
    phase.value = 'classifying'
    const scores = await classifyWithHuggingFace(reportText)
    hfScores.value = scores
    const valid       = isValidReport(scores)
    const topCategory = scores[0]?.label || 'desconocido'

    if (!valid) {
      aiResult.value = {
        feedback: 'El reporte no parece contener información suficiente. Por favor sé más específico.',
      }
      phase.value = 'rejected'
      return
    }

    // ── Paso 2: Claude enriquece el feedback ──────────────
    phase.value = 'loading'
    const enriched = await enrichWithClaude(reportText, topCategory, valid)
    aiResult.value = enriched

    // ── Paso 3: Persistir en Discord via Worker Y en la base de datos ───
    if (WORKER_URL) {
      await fetch(`${WORKER_URL}/report`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          place:       props.place.name,
          type:        form.type,
          correct:     form.correct,
          source:      form.source,
          hfCategory:  topCategory,
          confidence:  confidencePct.value,
          priority:    enriched?.priority || 'media',
        }),
      })
    }

    // Guardar también en la base de datos, para que aparezca en el dashboard admin
    submitReport({
      type: form.type,
      placeName: props.place.name,
      message: `${form.correct}${form.source ? ` (Fuente: ${form.source})` : ''}`,
      contactInfo: null,
    }).catch((err) => console.error('No se pudo guardar el reporte en la base de datos:', err))

    phase.value = 'done'

  } catch (err) {
    console.error('Report error:', err)
    // Si HF o Discord fallan, aceptar el reporte igualmente
    aiResult.value = { feedback: '¡Reporte recibido! Lo revisaremos pronto.' }
    // Intentar persistir de todas formas
    if (WORKER_URL) {
      fetch(`${WORKER_URL}/report`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          place:   props.place.name,
          type:    form.type,
          correct: form.correct,
          source:  form.source,
          hfCategory: 'error-fallback',
          confidence: 0,
          priority:   'media',
        }),
      }).catch(() => {})
    }

    // Igual intentar guardar en la base de datos
    submitReport({
      type: form.type,
      placeName: props.place.name,
      message: `${form.correct}${form.source ? ` (Fuente: ${form.source})` : ''}`,
      contactInfo: null,
    }).catch(() => {})

    phase.value = 'done'
  }
}
</script>

<style lang="scss" scoped>
.report {
  &__trigger {
    width: 100%;
    padding: 8px 14px;
    border-radius: $r-sm;
    border: 1.5px solid #FCA5A5;
    background: #FEF2F2;
    color: #DC2626;
    font-size: 12px;
    font-weight: 700;
    font-family: $font-body;
    cursor: pointer;
    transition: $t-fast;
    margin-bottom: 16px;

    &:hover {
      background: #FEE2E2;
      transform: scale(1.01);
    }
  }
}

.report-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15,10,40,.65);
  z-index: 400;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 12px;
}

.report-panel {
  background: $white;
  border-radius: $r-xl $r-xl $r-lg $r-lg;
  width: 100%;
  max-width: 500px;
  max-height: 88vh;
  overflow-y: auto;

  &__header {
    background: linear-gradient(135deg, #DC2626, #F59E0B);
    padding: 18px 20px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    border-radius: $r-xl $r-xl 0 0;
  }

  &__title {
    font-family: $font-display;
    color: $white;
    font-size: 17px;
    margin-bottom: 2px;
  }

  &__sub {
    color: rgba(255,255,255,.8);
    font-size: 12px;
  }

  &__close {
    background: rgba(255,255,255,.25);
    border: none;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    color: $white;
    font-size: 14px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: $t-fast;
    &:hover { background: rgba(255,255,255,.4); }
  }

  &__result {
    padding: 32px 20px;
    text-align: center;

    h4 { font-family: $font-display; font-size: 20px; margin-bottom: 8px; }
    p  { color: $muted; font-size: 13px; max-width: 340px; margin: 0 auto 14px; line-height: 1.6; }

    &--ok   h4 { color: #059669; }
    &--warn h4 { color: #D97706; }
  }
}

.report-icon { font-size: 48px; margin-bottom: 10px; }

.report-meta {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 16px;

  &__tag {
    font-size: 11px;
    font-weight: 700;
    border-radius: 20px;
    padding: 3px 12px;
    background: #F3F4F6;
    color: $text;

    &--hf { background: #FFF7ED; color: #C2410C; }
  }
}

.report-form {
  padding: 18px 20px;

  &__field { margin-bottom: 16px; }

  &__label {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: $text;
    margin-bottom: 8px;
  }

  &__input {
    width: 100%;
    padding: 9px 14px;
    border-radius: $r-sm;
    border: 1.5px solid $border;
    font-size: 13px;
    font-family: $font-body;
    color: $text;
    transition: $t-fast;

    &:focus {
      outline: none;
      border-color: $brand;
      box-shadow: 0 0 0 3px rgba($brand, .1);
    }
  }

  &__info-box {
    background: #F8F7FF;
    border-radius: $r-sm;
    padding: 10px 14px;
    margin-bottom: 16px;
    border: 1px solid $brand-light;
  }

  &__info-title { font-size: 11px; font-weight: 700; color: $brand; margin-bottom: 4px; }
  &__info-data  { font-size: 12px; color: $text; }

  &__error {
    background: #FEF2F2;
    border-radius: $r-sm;
    padding: 8px 12px;
    margin-bottom: 12px;
    font-size: 12px;
    color: #DC2626;
  }

  &__classifying {
    text-align: center;
    padding: 10px 0;
    font-size: 13px;
    color: #C2410C;
    font-weight: 600;
    margin-bottom: 8px;
  }

  &__note {
    text-align: center;
    font-size: 10px;
    color: $subtle;
    margin-top: 8px;
    line-height: 1.5;
  }
}

// Tipos de error
.report-types {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.report-type {
  padding: 6px 14px;
  border-radius: $r-pill;
  border: 2px solid $border;
  background: $white;
  color: $muted;
  font-size: 12px;
  font-weight: 700;
  font-family: $font-body;
  transition: $t-fast;

  &:hover { transform: scale(1.03); }

  &--active {
    border-color: #DC2626;
    background: #FEF2F2;
    color: #DC2626;
  }
}

// Botones
.report-btn {
  width: 100%;
  padding: 12px;
  border-radius: $r-pill;
  border: none;
  font-family: $font-body;
  font-weight: 700;
  font-size: 14px;
  transition: $t-fast;

  &:hover:not(:disabled) { opacity: .9; transform: scale(1.01); }
  &:disabled { opacity: .6; cursor: not-allowed; }

  &--primary {
    background: linear-gradient(135deg, #DC2626, #F59E0B);
    color: $white;
  }

  &--secondary {
    background: $surface;
    color: $text;
    margin-top: 8px;
  }
}
</style>

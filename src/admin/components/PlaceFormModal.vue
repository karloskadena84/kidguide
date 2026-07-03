<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <h2>{{ place ? 'Editar lugar' : 'Nuevo lugar' }}</h2>

      <form @submit.prevent="submit">
        <div class="grid">
          <label>Nombre
            <input v-model="form.name" required />
          </label>
          <label>Emoji
            <input v-model="form.emoji" maxlength="4" />
          </label>

          <label>Ciudad
            <select v-model="form.city" required>
              <option value="medellin">Medellín</option>
              <option value="bogota">Bogotá</option>
              <option value="cali">Cali</option>
              <option value="cartagena">Cartagena</option>
            </select>
          </label>
          <label>Categoría
            <select v-model="form.cat" required>
              <option value="parques">Parques & Museos</option>
              <option value="granjas">Granjas & Animales</option>
              <option value="restaurantes">Restaurantes</option>
              <option value="centros">Entretenimiento</option>
              <option value="actividades">Actividades</option>
            </select>
          </label>

          <label>Zona / barrio
            <input v-model="form.zone" />
          </label>
          <label>Edad recomendada
            <input v-model="form.age" placeholder="ej: 2-12" />
          </label>

          <label>Latitud
            <input v-model.number="form.lat" type="number" step="any" />
          </label>
          <label>Longitud
            <input v-model.number="form.lng" type="number" step="any" />
          </label>

          <label class="span-2">Dirección
            <input v-model="form.address" />
          </label>

          <label>¿Gratis?
            <select v-model="form.priceFree">
              <option :value="true">Sí</option>
              <option :value="false">No</option>
            </select>
          </label>
          <label>Precio (texto)
            <input v-model="form.priceLabel" placeholder="ej: ~$25.000" />
          </label>

          <label class="span-2">Horario
            <input v-model="form.sched" placeholder="ej: Mar–Dom · 9am–6pm" />
          </label>

          <label class="span-2">Descripción
            <textarea v-model="form.desc" rows="3" />
          </label>

          <label class="span-2">Tip / consejo
            <textarea v-model="form.tip" rows="2" />
          </label>

          <label class="span-2">Tags (separados por coma)
            <input v-model="tagsInput" placeholder="ej: ciencia, interactivo, acuario" />
          </label>

          <label>Estrellas (1-5)
            <input v-model.number="form.stars" type="number" min="1" max="5" />
          </label>
        </div>

        <p v-if="error" class="error">{{ error }}</p>

        <div class="footer">
          <button type="button" class="ghost" @click="$emit('close')">Cancelar</button>
          <button type="submit" class="primary" :disabled="saving">
            {{ saving ? 'Guardando…' : 'Guardar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { createPlace, updatePlace } from '@/services/placesApi'

const props = defineProps({ place: { type: Object, default: null } })
const emit = defineEmits(['close', 'saved'])

const saving = ref(false)
const error = ref('')

const form = reactive({
  name: props.place?.name || '',
  emoji: props.place?.emoji || '',
  city: props.place?.city || 'medellin',
  cat: props.place?.cat || 'parques',
  zone: props.place?.zone || '',
  age: props.place?.age || '',
  lat: props.place?.lat ?? null,
  lng: props.place?.lng ?? null,
  address: props.place?.address || '',
  priceFree: props.place?.priceFree ?? false,
  priceLabel: props.place?.priceLabel || '',
  sched: props.place?.sched || '',
  desc: props.place?.desc || '',
  tip: props.place?.tip || '',
  stars: props.place?.stars || 5,
  days: props.place?.days || [0, 1, 2, 3, 4, 5, 6],
})

const tagsInput = ref((props.place?.tags || []).join(', '))

async function submit() {
  saving.value = true
  error.value = ''
  try {
    const payload = {
      ...form,
      tags: tagsInput.value.split(',').map((t) => t.trim()).filter(Boolean),
    }
    if (props.place) {
      await updatePlace(props.place.id, payload)
    } else {
      await createPlace(payload)
    }
    emit('saved')
  } catch (err) {
    error.value = 'No se pudo guardar. Intenta de nuevo.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(26,26,46,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 50;
}
.modal {
  background: white;
  border-radius: 16px;
  padding: 28px;
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  overflow-y: auto;
}
h2 { margin: 0 0 16px; font-size: 18px; }

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.span-2 { grid-column: span 2; }

label {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  color: #333;
}

input, select, textarea {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #E3E3EF;
  font-family: inherit;
  font-size: 13px;
}

.footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.primary {
  background: #505ACD;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 13px;
}
.primary:disabled { opacity: 0.6; }

.ghost {
  background: white;
  border: 1px solid #E3E3EF;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
}

.error { color: #DC2626; font-size: 13px; }
</style>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal__drag-handle"></div>

        <div class="modal__header" :style="headerStyle">
          <button class="modal__close" @click="$emit('close')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
          <div v-if="!place.imageUrl" class="modal__emoji">{{ place.emoji }}</div>
          <h2 class="modal__title">{{ place.name }}</h2>
          <p class="modal__zone">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
            {{ place.zone }}
          </p>
        </div>

        <!-- Body -->
        <div class="modal__body">
          <span class="modal__cat-badge" :style="{ background: cat.bgSoft || cat.color + '22', color: cat.color }">
            {{ cat.emoji }} {{ cat.label }}
          </span>

          <div class="modal__stats">
            <div class="modal__stat">
              <span class="modal__stat-icon">💰</span>
              <span class="modal__stat-label">{{ place.price?.free ? 'Gratis' : (place.price?.label || '—') }}</span>
            </div>
            <div class="modal__stat">
              <span class="modal__stat-icon">🧒</span>
              <span class="modal__stat-label">{{ place.age || 'Todas las edades' }}</span>
            </div>
            <div class="modal__stat" :class="{ 'modal__stat--open': isOpenToday }">
              <span class="modal__stat-icon">{{ isOpenToday ? '✅' : '🕐' }}</span>
              <span class="modal__stat-label">{{ isOpenToday ? 'Abierto hoy' : 'Cerrado hoy' }}</span>
            </div>
          </div>

          <p class="modal__desc">{{ place.desc }}</p>

          <div v-if="place.tip" class="modal__tip">
            <p class="modal__tip-title">💡 Tip</p>
            <p class="modal__tip-text">{{ place.tip }}</p>
          </div>

          <p v-if="place.sched" class="modal__sched">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
            <strong>Horario:</strong> {{ place.sched }}
          </p>

          <div v-if="place.address" class="modal__address">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
            <span>{{ place.address }}</span>
            <button v-if="place.coords" class="modal__directions-btn" @click="openMaps">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m3 11 18-8-8 18-2-8-8-2z"/></svg>
              Cómo llegar
            </button>
          </div>

          <div v-if="place.tags?.length" class="modal__tags">
            <span v-for="t in place.tags" :key="t" class="modal__tag">#{{ t }}</span>
          </div>

          <div v-if="place.stars" class="modal__stars">
            <span v-for="i in 5" :key="i" class="modal__star" :class="{ 'modal__star--off': i > place.stars }">★</span>
          </div>

          <ReportForm :place="place" />

          <!-- Barra de acciones -->
          <div class="modal__actions">
            <button class="modal__cta" @click="$emit('close')">Volver al directorio</button>
            <button class="modal__icon-btn modal__icon-btn--whatsapp" title="Compartir en WhatsApp" @click="shareThisPlace">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.86 9.86 0 0 0 12.04 2zm0 1.67c2.2 0 4.26.86 5.82 2.42a8.2 8.2 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.25 8.24a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.18 8.18 0 0 1-1.26-4.37c0-4.55 3.7-8.24 8.26-8.24zm-3.1 4.3c-.15 0-.4.06-.6.29-.21.24-.8.78-.8 1.9s.82 2.21.93 2.36c.12.15 1.6 2.44 3.87 3.42 1.92.83 2.31.66 2.72.62.42-.04 1.36-.55 1.55-1.09.19-.53.19-.98.14-1.08-.06-.1-.21-.16-.44-.28-.24-.12-1.36-.67-1.57-.75-.21-.08-.36-.12-.52.12-.15.24-.6.75-.73.9-.14.15-.27.17-.5.06-.24-.12-1-.37-1.9-1.17-.7-.63-1.18-1.4-1.31-1.64-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.43.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.52-1.27-.72-1.73-.19-.46-.38-.4-.52-.4z"/></svg>
            </button>
            <button v-if="place.coords" class="modal__icon-btn" title="Cómo llegar" @click="openMaps">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 11 18-8-8 18-2-8-8-2z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { getCat }   from '@/data/categories'
import ReportForm   from '@/components/ReportForm.vue'
import { shareOnWhatsApp, buildPlaceShareText } from '@/utils/share'

const props = defineProps({
  place: { type: Object, required: true },
  today: { type: Number, required: true },
})
defineEmits(['close'])

const cat = computed(() => getCat(props.place.cat))
const gradient = computed(() => `linear-gradient(145deg, ${cat.value.color}DD, ${cat.value.color}99)`)
const headerStyle = computed(() => {
  if (props.place.imageUrl) {
    return {
      backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.55)), url(${props.place.imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }
  return { background: gradient.value }
})

const isOpenToday = computed(() => props.place.days?.includes(props.today))

const openMaps = () => window.open(`https://maps.google.com/?q=${props.place.coords[0]},${props.place.coords[1]}`, '_blank')
const shareThisPlace = () => shareOnWhatsApp(buildPlaceShareText(props.place))
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(20, 15, 35, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;

  @media (max-width: $bp-md) {
    align-items: flex-end;
    padding: 0;
  }
}

.modal {
  background: $white;
  border-radius: $r-2xl;
  width: 100%;
  max-width: 480px;
  max-height: 88vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 70px rgba(20, 15, 35, 0.35);

  @media (max-width: $bp-md) {
    max-height: 92vh;
    border-radius: $r-2xl $r-2xl 0 0;
  }
}

.modal__drag-handle {
  display: none;
  @media (max-width: $bp-md) {
    display: block;
    width: 40px;
    height: 4px;
    border-radius: 4px;
    background: rgba(0,0,0,0.15);
    margin: 10px auto 0;
    flex-shrink: 0;
  }
}

.modal__header {
  position: relative;
  padding: 60px 20px 18px;
  color: $white;
  flex-shrink: 0;
  background-size: cover;
  background-position: center;
}

.modal__close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0,0,0,0.35);
  color: $white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &:hover { background: rgba(0,0,0,0.5); }
}

.modal__emoji { font-size: 40px; margin-bottom: 6px; filter: drop-shadow(0 4px 10px rgba(0,0,0,.3)); }
.modal__title { margin: 0 0 4px; font-family: $font-display; font-size: 22px; font-weight: 800; text-shadow: 0 2px 8px rgba(0,0,0,.35); }
.modal__zone { margin: 0; display: flex; align-items: center; gap: 4px; font-size: 13px; color: rgba(255,255,255,.9); text-shadow: 0 1px 4px rgba(0,0,0,.3); }

.modal__body {
  overflow-y: auto;
  flex: 1;
  padding: 18px 20px 20px;
  -webkit-overflow-scrolling: touch;
  @media (max-width: $bp-md) { padding: 14px 16px 40px; }
}

.modal__cat-badge {
  display: inline-block;
  padding: 5px 12px;
  border-radius: $r-pill;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 12px;
}

.modal__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 14px;
}
.modal__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
  border-radius: 16px;
  background: $bg;
  border: 1px solid #E3E3EF;
  text-align: center;
}
.modal__stat--open { background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.3); }
.modal__stat-icon { font-size: 18px; }
.modal__stat-label { font-size: 11.5px; font-weight: 700; color: $text; line-height: 1.2; }

.modal__desc {
  font-size: 14px;
  color: $muted;
  line-height: 1.75;
  margin: 0 0 14px;
}

.modal__tip {
  background: #FFF8E1;
  border: 1px solid #F5D98B;
  border-radius: 16px;
  padding: 12px 14px;
  margin-bottom: 14px;
}
.modal__tip-title { margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #B7791F; }
.modal__tip-text { margin: 0; font-size: 13.5px; color: #7A5A1E; line-height: 1.5; }

.modal__sched {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13.5px;
  color: $muted;
  margin: 0 0 12px;
  strong { color: $text; }
}

.modal__address {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #F3ECFC;
  border-radius: 16px;
  padding: 12px 14px;
  margin-bottom: 14px;
  font-size: 13px;
  color: $text;
  span { flex: 1; }
}
.modal__directions-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  background: $primary;
  color: $white;
  border: none;
  border-radius: $r-pill;
  padding: 8px 13px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  &:hover { filter: brightness(1.08); }
}

.modal__tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.modal__tag { font-size: 12.5px; font-weight: 700; color: $accent-green; }

.modal__stars { margin-bottom: 16px; font-size: 18px; color: $secondary-container; }
.modal__star--off { color: #E3E3EF; }

.modal__actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}
.modal__cta {
  flex: 1;
  padding: 13px;
  border: 1px solid #E3E3EF;
  background: $white;
  color: $text;
  border-radius: $r-pill;
  font-family: $font-display;
  font-size: 14.5px;
  font-weight: 700;
  cursor: pointer;
  transition: $t-fast;
  &:hover { background: $bg; }
}
.modal__icon-btn {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid #E3E3EF;
  background: $white;
  color: $text;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: $t-fast;
  &:hover { background: $bg; }
}
.modal__icon-btn--whatsapp {
  background: #25D366;
  border-color: #25D366;
  color: $white;
  &:hover { background: #20BD5A; }
}
</style>

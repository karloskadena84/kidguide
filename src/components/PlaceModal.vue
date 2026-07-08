<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal fade-up">
        <!-- Header -->
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
          <!-- Compartir en WhatsApp — súper visible, arriba de todo -->
          <button class="modal__whatsapp-btn" @click="shareThisPlace">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.86 9.86 0 0 0 12.04 2zm0 1.67c2.2 0 4.26.86 5.82 2.42a8.2 8.2 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.25 8.24a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.18 8.18 0 0 1-1.26-4.37c0-4.55 3.7-8.24 8.26-8.24zm-3.1 4.3c-.15 0-.4.06-.6.29-.21.24-.8.78-.8 1.9s.82 2.21.93 2.36c.12.15 1.6 2.44 3.87 3.42 1.92.83 2.31.66 2.72.62.42-.04 1.36-.55 1.55-1.09.19-.53.19-.98.14-1.08-.06-.1-.21-.16-.44-.28-.24-.12-1.36-.67-1.57-.75-.21-.08-.36-.12-.52.12-.15.24-.6.75-.73.9-.14.15-.27.17-.5.06-.24-.12-1-.37-1.9-1.17-.7-.63-1.18-1.4-1.31-1.64-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.43.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.52-1.27-.72-1.73-.19-.46-.38-.4-.52-.4z"/></svg>
            Compartir en WhatsApp
          </button>

          <!-- Badges row -->
          <div class="modal__chips">
            <span class="chip" :class="place.price.free ? 'chip--free' : 'chip--paid'">
              💰 {{ place.price.free ? 'Gratis' : place.price.label }}
            </span>
            <span v-if="place.price.note && !place.price.free" class="chip chip--note">
              {{ place.price.note }}
            </span>
            <span class="chip">👶 {{ place.age }}</span>
            <span class="chip" :class="isOpenToday ? 'chip--open' : 'chip--closed'">
              {{ isOpenToday ? '✅ Abierto hoy' : '❌ No abierto hoy' }}
            </span>
          </div>

          <!-- Descripción -->
          <p class="modal__desc">{{ place.desc }}</p>

          <!-- Tip -->
          <div class="modal__tip">
            <span class="modal__tip-label">💡 Tip</span>
            <p>{{ place.tip }}</p>
          </div>

          <!-- Horario -->
          <p class="modal__sched">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            <strong>Horario:</strong> {{ place.sched }}
          </p>

          <!-- Dirección + Cómo llegar -->
          <div v-if="place.address" class="modal__directions">
            <p class="modal__directions-addr">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
              {{ place.address }}
            </p>
            <button v-if="place.coords" class="modal__directions-btn" @click="openMaps">
              🧭 Cómo llegar
            </button>
          </div>

          <!-- Tags -->
          <div class="modal__tags">
            <span
              v-for="tag in place.tags"
              :key="tag"
              class="modal__tag"
              :style="{ color: cat.color }"
            >#{{ tag }}</span>
          </div>

          <!-- Stars -->
          <div class="modal__stars">
            <span v-for="i in 5" :key="i" :class="['modal__star', i <= place.stars ? 'modal__star--on' : '']">★</span>
          </div>

          <!-- Reporte -->
          <ReportForm :place="place" />

          <!-- CTA -->
          <button class="modal__cta" :style="{ background: cat.color }" @click="$emit('close')">
            Volver al directorio
          </button>
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

const cat         = computed(() => getCat(props.place.cat))
const gradient    = computed(() => `linear-gradient(145deg, ${cat.value.color}DD, ${cat.value.color}99)`)
const headerStyle = computed(() => {
  if (props.place.imageUrl) {
    // Foto real de fondo + degradado oscuro encima para que el texto blanco siga siendo legible
    return {
      backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.55)), url(${props.place.imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }
  return { background: gradient.value }
})
const isOpenToday = computed(() => props.place.days.includes(props.today))
const openMaps    = () => window.open(`https://maps.google.com/?q=${props.place.coords[0]},${props.place.coords[1]}`, '_blank')
const shareThisPlace = () => shareOnWhatsApp(buildPlaceShareText(props.place))
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(29,26,36,.6);
  z-index: 300;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
  backdrop-filter: blur(3px);
  // Tap fuera en móvil — el overlay cubre el área superior
  cursor: pointer;

  @media (min-width: $bp-md) {
    padding: 24px;
    align-items: center;
  }
}

.modal {
  background: $white;
  border-radius: $r-2xl $r-2xl 0 0;
  width: 100%;
  max-width: 500px;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 -8px 40px rgba(0,0,0,0.2);
  cursor: default;  // ← cancela el cursor pointer del overlay

  // Handle visual bottom-sheet
  &::before {
    content: '';
    display: block;
    width: 40px;
    height: 4px;
    background: rgba(0,0,0,0.12);
    border-radius: $r-pill;
    margin: 10px auto 0;
    flex-shrink: 0;

    @media (min-width: $bp-md) { display: none; }
  }

  @media (min-width: $bp-md) {
    border-radius: $r-2xl;
    box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  }

  &__header {
    padding: 24px 20px 18px;
    text-align: center;
    flex-shrink: 0;
    position: relative;
    @media (max-width: $bp-md) { padding: 20px 16px 14px; }
  }

  &__close {
    position: absolute;
    top: 14px; right: 14px;
    width: 30px; height: 30px;
    border-radius: 50%;
    background: rgba(255,255,255,.25);
    border: none;
    color: $white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: $t-fast;
    &:hover { background: rgba(255,255,255,.4); }
  }

  &__emoji {
    font-size: 54px;
    line-height: 1;
    margin-bottom: 8px;
    @media (max-width: $bp-md) { font-size: 44px; }
  }

  &__title {
    font-family: $font-display;
    font-size: 22px;
    font-weight: 700;
    color: $white;
    margin-bottom: 4px;
    @media (max-width: $bp-md) { font-size: 18px; }
  }

  &__zone { color: rgba(255,255,255,.85); font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 4px; }

  &__body {
    overflow-y: auto;
    flex: 1;
    padding: 18px 20px 20px;
    -webkit-overflow-scrolling: touch;
    @media (max-width: $bp-md) { padding: 14px 16px 40px; }
  }

  &__whatsapp-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 13px;
    margin-bottom: 16px;
    background: #25D366;
    color: white;
    border: none;
    border-radius: $r-pill;
    font-family: $font-display;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(37, 211, 102, 0.35);
    transition: $t-fast;
    &:hover { background: #20BD5A; transform: translateY(-1px); }
    &:active { transform: translateY(0); }
  }

  &__chips {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 14px;
  }

  &__desc {
    font-size: 14px;
    color: $muted;
    line-height: 1.75;
    margin-bottom: 14px;
  }

  &__tip {
    background: #FFFBEB;
    border-radius: $r-lg;
    padding: 12px 16px;
    border: 1px solid #FCD34D;
    margin-bottom: 12px;
    font-size: 13px;
    color: $text;
    line-height: 1.6;

    &-label { font-weight: 700; color: #D97706; display: block; margin-bottom: 3px; }
  }

  &__sched {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: $muted;
    margin-bottom: 12px;
  }

  &__directions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    background: $surface-low;
    border-radius: $r-lg;
    padding: 10px 14px;
    margin-bottom: 14px;

    &-addr {
      font-size: 12px;
      color: $muted;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    &-btn {
      flex-shrink: 0;
      padding: 7px 16px;
      border-radius: $r-pill;
      background: #4285F4;
      color: $white;
      border: none;
      font-size: 12px;
      font-weight: 700;
      font-family: $font-body;
      cursor: pointer;
      transition: $t-fast;
      white-space: nowrap;
      &:hover { opacity: .9; transform: scale(1.02); }
    }
  }

  &__tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }

  &__tag {
    font-size: 12px;
    font-weight: 700;
  }

  &__stars {
    display: flex;
    gap: 3px;
    margin-bottom: 16px;
  }

  &__star {
    font-size: 18px;
    color: $surface-highest;
    &--on { color: $secondary-container; }
  }

  &__cta {
    width: 100%;
    padding: 14px;
    border-radius: $r-pill;
    color: $white;
    border: none;
    font-family: $font-display;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: $t-fast;
    margin-top: 4px;
    &:hover { filter: brightness(1.08); transform: translateY(-1px); }
  }
}

// ── Chips ─────────────────────────────────────────────────────
.chip {
  font-size: 12px;
  font-weight: 700;
  border-radius: $r-pill;
  padding: 5px 13px;
  background: $surface;
  color: $text;
  font-family: $font-body;

  &--free   { background: #D1FAE5; color: #065F46; }
  &--paid   { background: #FEF3C7; color: $on-secondary-container; }
  &--note   { font-size: 11px; color: $muted; background: $surface-high; }
  &--open   { background: #D1FAE5; color: #065F46; }
  &--closed { background: #FEE2E2; color: $accent-red; }
}
</style>

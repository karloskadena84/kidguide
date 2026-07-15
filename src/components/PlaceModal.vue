<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal fade-up">
        <!-- Header -->
        <div class="modal__header" :style="headerStyle">
          <span class="modal__open-pill" :class="isOpenToday ? 'is-open' : 'is-closed'">
            {{ isOpenToday ? '🟢 Abierto hoy' : '⚪️ Cerrado hoy' }}
          </span>
          <button class="modal__close" @click="$emit('close')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
          <div v-if="!place.imageUrl" class="modal__emoji">{{ place.emoji }}</div>
        </div>

        <!-- Body (oscuro) -->
        <div class="modal__body">
          <div class="modal__cat-badge" :style="{ color: cat.color, background: cat.color + '22' }">
            <span>{{ cat.icon }}</span> {{ cat.label }}
          </div>

          <h2 class="modal__title">{{ place.name }}</h2>
          <p class="modal__zone">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
            {{ place.zone }}
            <span class="modal__zone-dot">·</span>
            <span class="modal__zone-star">★ {{ place.stars?.toFixed(1) }}</span>
          </p>

          <!-- Stat boxes -->
          <div class="modal__stats">
            <div class="stat">
              <span class="stat__label">{{ place.price.free ? 'Precio' : 'Desde' }}</span>
              <span class="stat__value">{{ place.price.free ? '🎉 Gratis' : place.price.label }}</span>
            </div>
            <div class="stat">
              <span class="stat__label">Edades</span>
              <span class="stat__value">{{ place.age || 'Todos' }}</span>
            </div>
            <div class="stat">
              <span class="stat__label">Horario</span>
              <span class="stat__value stat__value--sched">{{ place.sched }}</span>
            </div>
          </div>

          <!-- Descripción -->
          <p class="modal__desc">{{ place.desc }}</p>

          <!-- Tip -->
          <div v-if="place.tip" class="modal__tip">
            <span class="modal__tip-label">💡 Tip de KidGuide</span>
            <p>{{ place.tip }}</p>
          </div>

          <div class="modal__divider"></div>

          <!-- Dirección -->
          <p v-if="place.address" class="modal__row">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
            {{ place.address }}
          </p>

          <!-- Tags -->
          <div class="modal__tags">
            <span
              v-for="tag in place.tags"
              :key="tag"
              class="modal__tag"
            >{{ tag }}</span>
          </div>

          <div class="modal__divider"></div>

          <!-- Reporte, en su propia "isla" clara -->
          <div class="modal__report-island">
            <ReportForm :place="place" />
          </div>
        </div>

        <!-- Barra de acciones inferior -->
        <div class="modal__actions">
          <button class="modal__cta" @click="$emit('close')">Volver al directorio</button>
          <button class="modal__icon-btn modal__icon-btn--whatsapp" title="Compartir en WhatsApp" @click="shareThisPlace">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.86 9.86 0 0 0 12.04 2zm0 1.67c2.2 0 4.26.86 5.82 2.42a8.2 8.2 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.25 8.24a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.18 8.18 0 0 1-1.26-4.37c0-4.55 3.7-8.24 8.26-8.24zm-3.1 4.3c-.15 0-.4.06-.6.29-.21.24-.8.78-.8 1.9s.82 2.21.93 2.36c.12.15 1.6 2.44 3.87 3.42 1.92.83 2.31.66 2.72.62.42-.04 1.36-.55 1.55-1.09.19-.53.19-.98.14-1.08-.06-.1-.21-.16-.44-.28-.24-.12-1.36-.67-1.57-.75-.21-.08-.36-.12-.52.12-.15.24-.6.75-.73.9-.14.15-.27.17-.5.06-.24-.12-1-.37-1.9-1.17-.7-.63-1.18-1.4-1.31-1.64-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.43.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.52-1.27-.72-1.73-.19-.46-.38-.4-.52-.4z"/></svg>
          </button>
          <button v-if="place.coords" class="modal__icon-btn" title="Cómo llegar" @click="openMaps">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
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
// Paleta oscura propia de KidGuide — no gris genérico, con tinte morado de marca
$dm-bg:      #18151F;
$dm-surface: #221E2C;
$dm-border:  rgba(255,255,255,0.08);
$dm-text:    #F5F3F8;
$dm-muted:   #A79FB3;

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10,8,14,.7);
  z-index: 300;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
  backdrop-filter: blur(3px);
  cursor: pointer;

  @media (min-width: $bp-md) {
    padding: 24px;
    align-items: center;
  }
}

.modal {
  background: $dm-bg;
  border-radius: $r-2xl $r-2xl 0 0;
  width: 100%;
  max-width: 500px;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 -8px 40px rgba(0,0,0,0.45);
  cursor: default;
  position: relative;

  &::before {
    content: '';
    display: block;
    width: 40px;
    height: 4px;
    background: rgba(255,255,255,0.25);
    border-radius: $r-pill;
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;

    @media (min-width: $bp-md) { display: none; }
  }

  @media (min-width: $bp-md) {
    border-radius: $r-2xl;
    box-shadow: 0 24px 70px rgba(0,0,0,0.5);
  }

  &__header {
    height: 190px;
    flex-shrink: 0;
    position: relative;
    @media (max-width: $bp-md) { height: 160px; }
  }

  &__open-pill {
    position: absolute;
    top: 16px; left: 16px;
    z-index: 2;
    padding: 6px 13px;
    border-radius: $r-pill;
    font-family: $font-body;
    font-size: 12px;
    font-weight: 700;
    backdrop-filter: blur(6px);
    &.is-open   { background: rgba($accent-green, .22); color: lighten($accent-green, 18%); border: 1px solid rgba($accent-green, .4); }
    &.is-closed { background: rgba(255,255,255,.12); color: rgba(255,255,255,.75); border: 1px solid rgba(255,255,255,.18); }
  }

  &__close {
    position: absolute;
    top: 14px; right: 14px;
    z-index: 2;
    width: 32px; height: 32px;
    border-radius: 50%;
    background: rgba(0,0,0,.4);
    backdrop-filter: blur(6px);
    border: none;
    color: $white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: $t-fast;
    &:hover { background: rgba(0,0,0,.6); transform: rotate(90deg); }
  }

  &__emoji {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 60px;
    filter: drop-shadow(0 4px 10px rgba(0,0,0,.4));
  }

  &__body {
    overflow-y: auto;
    flex: 1;
    padding: 20px 22px 4px;
    -webkit-overflow-scrolling: touch;
    @media (max-width: $bp-md) { padding: 18px 18px 4px; }
  }

  &__cat-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 12px;
    padding: 5px 13px;
    border-radius: $r-pill;
    font-family: $font-display;
    font-size: 12px;
    font-weight: 700;
  }

  &__title {
    font-family: $font-display;
    font-size: 23px;
    font-weight: 700;
    color: $dm-text;
    margin-bottom: 6px;
    line-height: 1.25;
    @media (max-width: $bp-md) { font-size: 19px; }
  }

  &__zone {
    color: $dm-muted;
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 18px;
  }
  &__zone-dot { opacity: .6; }
  &__zone-star { color: $secondary-container; }

  &__stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 18px;
  }

  &__divider {
    height: 1px;
    background: $dm-border;
    margin: 18px 0;
  }

  &__desc {
    font-family: $font-body;
    font-size: 14.5px;
    color: $dm-text;
    line-height: 1.7;
    margin-bottom: 14px;
  }

  &__tip {
    background: rgba($secondary-container, 0.14);
    border-radius: $r-lg;
    padding: 13px 16px;
    border: 1px solid rgba($secondary-container, 0.3);
    font-size: 13.5px;
    color: $dm-text;
    line-height: 1.6;
    margin-bottom: 4px;

    &-label {
      font-family: $font-display;
      font-weight: 700;
      color: $secondary-container;
      display: block;
      margin-bottom: 4px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    p { margin: 0; }
  }

  &__row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 13.5px;
    color: $dm-muted;
    line-height: 1.5;
    margin-bottom: 10px;
    svg { flex-shrink: 0; margin-top: 1px; opacity: .7; }
  }

  &__tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin: 10px 0 4px;
  }

  &__tag {
    font-size: 11.5px;
    font-weight: 700;
    padding: 5px 12px;
    border-radius: $r-pill;
    background: $dm-surface;
    color: $dm-muted;
    border: 1px solid $dm-border;
  }

  &__report-island {
    background: $white;
    border-radius: $r-lg;
    padding: 14px;
    margin: 4px 0 18px;
  }

  &__actions {
    flex-shrink: 0;
    display: flex;
    gap: 10px;
    padding: 14px 22px calc(16px + env(safe-area-inset-bottom, 0px));
    background: $dm-surface;
    border-top: 1px solid $dm-border;
    @media (max-width: $bp-md) { padding: 12px 18px calc(14px + env(safe-area-inset-bottom, 0px)); }
  }

  &__cta {
    flex: 1;
    padding: 13px;
    border-radius: $r-pill;
    background: $white;
    color: $dm-bg;
    border: none;
    font-family: $font-display;
    font-size: 14.5px;
    font-weight: 700;
    cursor: pointer;
    transition: $t-fast;
    &:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(0,0,0,.3); }
  }

  &__icon-btn {
    flex-shrink: 0;
    width: 46px; height: 46px;
    border-radius: $r-lg;
    background: rgba(255,255,255,.06);
    border: 1px solid $dm-border;
    color: $dm-text;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: $t-fast;
    &:hover { background: rgba(255,255,255,.12); transform: translateY(-1px); }

    &--whatsapp {
      color: #25D366;
      &:hover { background: rgba(37,211,102,.15); border-color: rgba(37,211,102,.4); }
    }
  }
}

// ── Stat boxes ──────────────────────────────────────────────
.stat {
  background: $dm-surface;
  border: 1px solid $dm-border;
  border-radius: $r-lg;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 3px;

  &__label {
    font-size: 10.5px;
    font-weight: 600;
    color: $dm-muted;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  &__value {
    font-family: $font-display;
    font-size: 14px;
    font-weight: 700;
    color: $dm-text;
    line-height: 1.25;

    &--sched { font-size: 12px; }
  }
}
</style>

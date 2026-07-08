<template>
  <section v-if="place" class="featured">

    <div class="featured__header">
      <div class="featured__eyebrow">
        <span class="featured__pulse"></span>
        Recomendado del día
      </div>
      <span class="featured__date">{{ dateLabel }}</span>
    </div>

    <div class="featured__card" :style="cardBorder" @click="$emit('select', place)">

      <div class="featured__visual" :style="visualBg">
        <img
          v-if="place.imageUrl"
          :src="place.imageUrl"
          :alt="place.name"
          class="featured__photo"
          loading="lazy"
        />
        <span v-else class="featured__emoji">{{ place.emoji }}</span>

        <div class="featured__badges">
          <span v-if="isOpenToday" class="featured__badge featured__badge--open">Abierto hoy</span>
          <span class="featured__badge" :class="place.price.free ? 'featured__badge--free' : 'featured__badge--paid'">
            {{ place.price.free ? 'Gratis' : place.price.label }}
          </span>
        </div>

        <div class="featured__stars">
          <span v-for="i in 5" :key="i" class="featured__star" :class="{ 'featured__star--on': i <= place.stars }">★</span>
        </div>
      </div>

      <div class="featured__info" :style="infoBg">

        <div class="featured__meta">
          <span class="featured__chip" :style="chipStyle">{{ cat.icon }} {{ cat.label }}</span>
          <span class="featured__zone">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            {{ place.zone }}
          </span>
        </div>

        <h3 class="featured__title" :style="titleStyle">{{ place.name }}</h3>

        <p class="featured__desc">{{ place.desc }}</p>

        <div v-if="place.tip" class="featured__tip" :style="tipStyle">
          💡 {{ place.tip }}
        </div>

        <div class="featured__footer" :style="footerBorder">
          <span class="featured__pill">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
            {{ place.age }} años
          </span>
          <span class="featured__pill">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            {{ place.sched }}
          </span>
          <button class="featured__cta" :style="ctaStyle" @click.stop="$emit('select', place)">
            Ver detalles
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>

      </div>
    </div>

  </section>
</template>

<script setup>
import { computed } from 'vue'
import { getCat, DAY_NAMES } from '@/data/categories'

const props = defineProps({
  place: { type: Object, default: null },
  today: { type: Number, required: true },
})

defineEmits(['select'])

const cat         = computed(() => getCat(props.place?.cat))
const isOpenToday = computed(() => props.place?.days.includes(props.today))

const dateLabel = computed(() => {
  const d = new Date()
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return `${DAY_NAMES[d.getDay()].toLowerCase()} ${d.getDate()} ${meses[d.getMonth()]}`
})

function darken(hex, amount = 0.25) {
  const h = hex.replace('#', '')
  const r = Math.max(0, Math.round(parseInt(h.slice(0,2), 16) * (1 - amount)))
  const g = Math.max(0, Math.round(parseInt(h.slice(2,4), 16) * (1 - amount)))
  const b = Math.max(0, Math.round(parseInt(h.slice(4,6), 16) * (1 - amount)))
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`
}

const color      = computed(() => cat.value.color)
const colorLight = computed(() => cat.value.light)
const colorDark  = computed(() => darken(cat.value.color, 0.3))

const visualBg = computed(() => ({
  background: `linear-gradient(150deg, ${color.value} 0%, ${colorDark.value} 100%)`,
}))

const infoBg = computed(() => ({
  background: `linear-gradient(135deg, ${colorLight.value} 0%, #ffffff 50%)`,
}))

const cardBorder = computed(() => ({ border: `2px solid ${color.value}` }))

const chipStyle = computed(() => ({
  background: `${color.value}22`,
  color:       color.value,
  border:      `1px solid ${color.value}55`,
}))

const titleStyle = computed(() => ({ color: colorDark.value }))

const tipStyle = computed(() => ({
  background:  colorLight.value,
  borderColor: color.value,
}))

const footerBorder = computed(() => ({ borderTop: `1.5px solid ${colorLight.value}` }))

const ctaStyle = computed(() => ({
  background: color.value,
  color:      '#ffffff',
  boxShadow:  `0 3px 12px ${color.value}55`,
}))
</script>

<style lang="scss" scoped>
.featured {
  margin-bottom: 28px;
  @media (max-width: $bp-md) { margin-bottom: 20px; }

  &__header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 12px;
  }

  &__eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 11px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase;
    color: $primary-container;
    background: $brand-light;
    border: 1px solid #{$primary-container}44;
    border-radius: $r-pill;
    padding: 5px 14px 5px 10px;
  }

  &__pulse {
    width: 7px; height: 7px; border-radius: 50%;
    background: $primary-container;
    flex-shrink: 0;
    animation: kg-pulse 2s ease-in-out infinite;
  }

  &__date { font-size: 12px; font-weight: 600; color: $subtle; letter-spacing: .03em; }

  &__card {
    display: grid; grid-template-columns: 200px 1fr;
    border-radius: $r-2xl;
    overflow: hidden;
    box-shadow: $shadow-hover;
    cursor: pointer;
    transition: $t-normal;

    &:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,.16); }
    @media (max-width: $bp-md) { grid-template-columns: 1fr; }
  }

  &__visual {
    position: relative;
    display: flex; align-items: center; justify-content: center;
    min-height: 210px;
    @media (max-width: $bp-md) { min-height: 160px; }
  }

  &__photo {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__emoji {
    font-size: 84px; line-height: 1;
    user-select: none;
    filter: drop-shadow(0 6px 22px rgba(0,0,0,.35));
    animation: kg-float 4s ease-in-out infinite;
    @media (max-width: $bp-md) { font-size: 64px; }
  }

  &__badges {
    position: absolute; top: 14px; right: 14px;
    display: flex; flex-direction: column; gap: 6px; align-items: flex-end;
  }

  &__badge {
    font-size: 11px; font-weight: 700;
    border-radius: $r-pill; padding: 4px 11px;
    font-family: $font-body;

    &--open { background: rgba(255,255,255,.92); color: #065f46; }
    &--free { background: #d1fae5; color: #065f46; }
    &--paid { background: #fef3c7; color: $on-secondary-container; }
  }

  &__stars { position: absolute; bottom: 14px; left: 14px; display: flex; gap: 2px; }

  &__star {
    font-size: 15px; color: rgba(255,255,255,.25);
    &--on { color: rgba(255,255,255,1); text-shadow: 0 1px 6px rgba(0,0,0,.25); }
  }

  &__info {
    padding: 22px 24px 20px;
    display: flex; flex-direction: column; gap: 10px;
    @media (max-width: $bp-md) { padding: 16px 18px 16px; }
  }

  &__meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

  &__chip { font-size: 11px; font-weight: 700; padding: 4px 11px; border-radius: $r-pill; }

  &__zone {
    display: flex; align-items: center; gap: 4px;
    font-size: 12px; font-weight: 600; color: $muted;
  }

  &__title {
    font-family: $font-display; font-size: 22px; font-weight: 700;
    line-height: 1.25; margin: 0;
    @media (max-width: $bp-md) { font-size: 18px; }
  }

  &__desc {
    font-size: 13.5px; color: $text; opacity: .78;
    line-height: 1.65; margin: 0;
    @media (max-width: $bp-md) { font-size: 13px; }
  }

  &__tip {
    font-size: 12.5px; color: $on-secondary-container;
    border-left: 3px solid;
    border-radius: 0 $r-lg $r-lg 0;
    padding: 10px 14px; line-height: 1.55;
  }

  &__footer {
    display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
    padding-top: 12px; margin-top: auto;
  }

  &__pill {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 12px; color: $muted; font-weight: 600;
    background: rgba(255,255,255,.7);
    border: 1px solid $surface-highest;
    border-radius: $r-pill; padding: 4px 10px;
    backdrop-filter: blur(4px);
  }

  &__cta {
    margin-left: auto;
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 13px; font-weight: 700;
    border: none; border-radius: $r-pill;
    padding: 9px 20px; cursor: pointer;
    font-family: $font-body;
    transition: $t-fast;

    &:hover { filter: brightness(1.1); transform: translateX(2px); }
  }
}

@keyframes kg-pulse {
  0%, 100% { opacity: 1;   transform: scale(1); }
  50%       { opacity: .4; transform: scale(1.5); }
}

@keyframes kg-float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-9px); }
}
</style>

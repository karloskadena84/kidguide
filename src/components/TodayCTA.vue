<template>
  <section class="today">

    <div class="today__header">
      <div class="today__header-left">
        <span class="today__pulse" aria-hidden="true"></span>
        <div>
          <p class="today__day">{{ DAY_NAMES[today].toUpperCase() }} · {{ places.length }} abiertos hoy</p>
          <h2 class="today__title">Planes para hoy</h2>
        </div>
      </div>
      <button class="today__see-all" @click="expanded = !expanded">
        {{ expanded ? 'Ver menos' : 'Ver todos' }}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
          :style="{ transform: expanded ? 'rotate(270deg)' : 'rotate(90deg)', transition: 'transform .25s' }"
          aria-hidden="true">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </button>
    </div>

    <div class="scroll-x today__scroll">

      <div
        v-for="p in preview"
        :key="p.id"
        class="today-card"
        @click="$emit('select', p)"
      >
        <div
          class="today-card__vis"
          :style="{ background: `linear-gradient(150deg, ${getCat(p.cat).color}DD, ${getCat(p.cat).color}88)` }"
        >
          <span class="today-card__emoji">{{ p.emoji }}</span>
          <span
            class="today-card__badge"
            :class="p.price.free ? 'today-card__badge--free' : 'today-card__badge--paid'"
          >{{ p.price.free ? 'Gratis' : p.price.label }}</span>
        </div>

        <div class="today-card__body">
          <p class="today-card__name">{{ p.name }}</p>
          <p class="today-card__zone">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            {{ p.zone }}
          </p>
        </div>
      </div>

      <div
        v-if="!expanded && places.length > PREVIEW"
        class="today-card today-card--more"
        @click="expanded = true"
      >
        <div class="today-card__more-count">+{{ places.length - PREVIEW }}</div>
        <p class="today-card__more-label">más hoy</p>
      </div>

    </div>

    <Transition name="slide">
      <div v-if="expanded" class="today__expanded">
        <div v-for="cat in CATEGORIES.slice(1)" :key="cat.id">
          <template v-if="byCat(cat.id).length">
            <h4 class="today__cat-label" :style="{ color: cat.color }">
              {{ cat.icon }} {{ cat.label }}
              <span>{{ byCat(cat.id).length }}</span>
            </h4>
            <div class="today__rows">
              <div
                v-for="p in byCat(cat.id)"
                :key="p.id"
                class="today-row"
                @click="$emit('select', p)"
              >
                <div
                  class="today-row__ico"
                  :style="{ background: `linear-gradient(135deg, ${cat.color}CC, ${cat.color}66)` }"
                >{{ p.emoji }}</div>
                <div class="today-row__info">
                  <p class="today-row__name">{{ p.name }}</p>
                  <p class="today-row__meta">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                    {{ p.zone }} ·
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    {{ p.sched }}
                  </p>
                </div>
                <span
                  class="today-row__price"
                  :class="p.price.free ? 'today-row__price--free' : 'today-row__price--paid'"
                >{{ p.price.free ? 'Gratis' : p.price.label }}</span>
              </div>
            </div>
          </template>
        </div>
        <button class="today__collapse" @click="expanded = false">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg>
          Cerrar
        </button>
      </div>
    </Transition>

  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { CATEGORIES, DAY_NAMES, getCat } from '@/data/categories'

const PREVIEW = 8

const props = defineProps({
  places: { type: Array,  required: true, default: () => [] },
  today:  { type: Number, required: true },
})
defineEmits(['select'])

const expanded = ref(false)
const preview  = computed(() => props.places.slice(0, PREVIEW))
const byCat    = (id) => props.places.filter(p => p.cat === id)
</script>

<style lang="scss" scoped>
.today {
  background: $white;
  border-radius: $r-2xl;
  padding: 20px 20px 0;
  margin-bottom: 28px;
  border: 1px solid $surface-highest;
  box-shadow: $shadow-card;
  overflow: hidden;

  @media (max-width: $bp-md) {
    border-radius: $r-xl;
    padding: 16px 16px 0;
    margin-bottom: 20px;
  }

  &__header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__header-left { display: flex; align-items: flex-start; gap: 10px; }

  &__pulse {
    width: 8px; height: 8px; border-radius: 50%;
    background: $primary-container;
    flex-shrink: 0;
    margin-top: 6px;
    animation: today-pulse 2s ease-in-out infinite;
  }

  &__day {
    font-size: 11px; font-weight: 700; color: $primary-container;
    letter-spacing: .06em; margin-bottom: 2px;
  }

  &__title {
    font-family: $font-display; font-size: 20px; font-weight: 700; color: $text;
  }

  &__see-all {
    display: flex; align-items: center; gap: 5px;
    font-size: 13px; font-weight: 700; color: $primary-container;
    background: none; border: none; cursor: pointer;
    padding: 4px 0; font-family: $font-body;
    transition: $t-fast; flex-shrink: 0;
    &:hover { opacity: .75; }
  }

  &__scroll {
    display: flex; gap: 10px;
    padding-bottom: 20px;
    padding-left: 20px; padding-right: 20px;
    margin-left: -20px; margin-right: -20px;

    @media (max-width: $bp-md) {
      padding-left: 16px; padding-right: 16px;
      margin-left: -16px; margin-right: -16px;
      gap: 8px;
    }
  }

  &__expanded { border-top: 1px solid $surface-highest; padding: 16px 0 20px; }

  &__cat-label {
    font-family: $font-display; font-size: 14px; font-weight: 700;
    margin: 14px 0 8px;
    display: flex; align-items: center; gap: 6px;

    span {
      font-family: $font-body; font-size: 11px; font-weight: 400;
      color: $subtle; background: $surface; border-radius: $r-pill; padding: 1px 8px;
    }
    &:first-child { margin-top: 0; }
  }

  &__rows { display: flex; flex-direction: column; gap: 6px; }

  &__collapse {
    width: 100%; margin-top: 16px; padding: 9px;
    border-radius: $r-lg; border: 1.5px solid $border;
    background: $surface-low; color: $muted;
    font-size: 13px; font-weight: 700; font-family: $font-body;
    cursor: pointer; transition: $t-fast;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    &:hover { background: $surface; color: $text; }
  }
}

.today-card {
  flex-shrink: 0; width: 130px;
  border-radius: $r-xl; overflow: hidden;
  border: 0.5px solid $surface-highest;
  cursor: pointer; transition: $t-normal;
  display: flex; flex-direction: column;
  background: $white;
  -webkit-tap-highlight-color: transparent;

  &:hover { transform: translateY(-3px); box-shadow: $shadow-hover; }
  @media (max-width: $bp-md) { width: 116px; }

  &__vis {
    position: relative; height: 80px;
    display: flex; align-items: center; justify-content: center;
    @media (max-width: $bp-md) { height: 70px; }
  }

  &__emoji {
    font-size: 36px; line-height: 1;
    filter: drop-shadow(0 3px 10px rgba(0,0,0,.22));
    user-select: none;
  }

  &__badge {
    position: absolute; top: 7px; right: 7px;
    font-size: 10px; font-weight: 700;
    border-radius: $r-pill; padding: 2px 7px;
    font-family: $font-body;

    &--free { background: #D1FAE5; color: #065F46; }
    &--paid { background: rgba(255,255,255,.88); color: $on-secondary-container; }
  }

  &__body {
    padding: 8px 10px 10px;
    display: flex; flex-direction: column; gap: 4px;
    background: $white; flex: 1;
  }

  &__name {
    font-family: $font-display; font-size: 12px; font-weight: 700;
    color: $text; line-height: 1.3;
    overflow: hidden; display: -webkit-box;
    -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  }

  &__zone {
    display: flex; align-items: center; gap: 3px;
    font-size: 11px; color: $subtle; font-weight: 500;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  &--more {
    background: $brand-light;
    border-color: #{$primary-container}44;
    align-items: center; justify-content: center; text-align: center;
    gap: 2px; min-height: 120px; padding: 16px 12px;
  }

  &__more-count {
    font-family: $font-display; font-size: 24px; font-weight: 700; color: $primary-container;
  }

  &__more-label { font-size: 11px; font-weight: 700; color: $primary-container; }
}

.today-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: $r-lg;
  border: 1px solid $surface-highest;
  background: $white;
  cursor: pointer; transition: $t-fast;
  -webkit-tap-highlight-color: transparent;

  &:hover { background: $surface-low; transform: translateX(4px); }

  @media (max-width: $bp-md) { padding: 12px; border-radius: $r-md; }

  &__ico {
    width: 42px; height: 42px; border-radius: $r-lg;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; flex-shrink: 0;
  }

  &__info { flex: 1; min-width: 0; }

  &__name {
    font-size: 13px; font-weight: 700; color: $text;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  &__meta {
    font-size: 11px; color: $muted; margin-top: 2px;
    display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
  }

  &__price {
    flex-shrink: 0; font-size: 11px; font-weight: 700;
    border-radius: $r-pill; padding: 3px 10px;

    &--free { background: #D1FAE5; color: #065F46; }
    &--paid { background: #FEF3C7; color: $on-secondary-container; }
  }
}

.slide-enter-active, .slide-leave-active { transition: all .3s ease; overflow: hidden; }
.slide-enter-from, .slide-leave-to       { opacity: 0; max-height: 0; }
.slide-enter-to,   .slide-leave-from     { opacity: 1; max-height: 2000px; }

@keyframes today-pulse {
  0%, 100% { opacity: 1;   transform: scale(1); }
  50%       { opacity: .4; transform: scale(1.5); }
}
</style>

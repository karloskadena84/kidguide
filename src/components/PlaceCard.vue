<template>
  <article class="card" @click="$emit('select', place)">
    <!-- ── Imagen / gradiente ── -->
    <div class="card__visual" :style="{ background: gradient }">
      <img
        v-if="place.imageUrl"
        :src="place.imageUrl"
        :alt="place.name"
        class="card__photo"
        loading="lazy"
      />
      <!-- Emoji centrado como respaldo mientras el lugar no tenga foto -->
      <span v-else class="card__emoji">{{ place.emoji }}</span>

      <!-- Badges sobre la imagen -->
      <div class="card__badges">
        <span v-if="isOpenToday" class="card__badge card__badge--open">
          Abierto hoy
        </span>
        <span :class="['card__badge', place.price.free ? 'card__badge--free' : 'card__badge--price']">
          {{ place.price.free ? 'Gratis' : place.price.label }}
        </span>
      </div>
    </div>

    <!-- ── Contenido ── -->
    <div class="card__body">
      <!-- Metadata -->
      <div class="card__meta">
        <span class="card__meta-item">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
          {{ place.zone }}
        </span>
        <span class="card__meta-dot">·</span>
        <span class="card__meta-item">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          {{ place.age }} años
        </span>
      </div>

      <!-- Título -->
      <h3 class="card__title">{{ place.name }}</h3>

      <!-- Descripción -->
      <p class="card__desc">{{ truncate(place.desc, 100) }}</p>

      <!-- Tags -->
      <div class="card__tags">
        <span
          v-for="tag in place.tags.slice(0, 3)"
          :key="tag"
          class="card__tag"
          :style="{ color: cat.color }"
        >#{{ tag }}</span>
      </div>

      <!-- Footer -->
      <div class="card__footer">
        <div class="card__stars">
          <span v-for="i in 5" :key="i" :class="['card__star', i <= place.stars ? 'card__star--on' : '']">★</span>
        </div>
        <span class="card__sched">{{ truncate(place.sched, 18) }}</span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { getCat }   from '@/data/categories'

const props = defineProps({
  place: { type: Object, required: true },
  today: { type: Number, required: true },
})
defineEmits(['select'])

const cat         = computed(() => getCat(props.place.cat))
const gradient    = computed(() => `linear-gradient(145deg, ${cat.value.color}DD, ${cat.value.color}88)`)
const isOpenToday = computed(() => props.place.days.includes(props.today))

const truncate = (str, n) => str?.length > n ? str.slice(0, n) + '…' : str
</script>

<style lang="scss" scoped>
.card {
  background: $white;
  border-radius: $r-2xl;
  overflow: hidden;
  box-shadow: $shadow-card;
  cursor: pointer;
  transition: $t-normal;
  border: 1px solid $surface-highest;

  &:hover {
    transform: translateY(-5px);
    box-shadow: $shadow-hover;
  }

  // ── Visual ────────────────────────────────────────────────
  &__visual {
    position: relative;
    height: 160px;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (max-width: $bp-md) { height: 140px; }
  }

  &__photo {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__emoji {
    font-size: 60px;
    line-height: 1;
    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.2));
    user-select: none;

    @media (max-width: $bp-md) { font-size: 52px; }
  }

  &__badges {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    align-items: flex-end;
  }

  &__badge {
    font-size: 11px;
    font-weight: 700;
    border-radius: $r-pill;
    padding: 4px 12px;
    font-family: $font-body;

    &--open  { background: $accent-green;   color: $white; }
    &--free  { background: rgba(16,185,129,.9); color: $white; }
    &--price { background: rgba(254,166,25,.95); color: $on-secondary-container; }
  }

  // ── Cuerpo ────────────────────────────────────────────
  &__body {
    padding: 16px 20px 14px;
    @media (max-width: $bp-md) { padding: 14px 16px 12px; }
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 8px;

    &-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
      color: $muted;
    }

    &-dot { color: $border; font-size: 12px; }
  }

  &__title {
    font-family: $font-display;
    font-size: 18px;
    font-weight: 700;
    color: $text;
    margin-bottom: 8px;
    line-height: 1.3;
    @media (max-width: $bp-md) { font-size: 16px; }
  }

  &__desc {
    font-size: 14px;
    color: $muted;
    line-height: 1.6;
    margin-bottom: 12px;
    @media (max-width: $bp-md) { font-size: 13px; }
  }

  &__tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 14px;
  }

  &__tag {
    font-size: 12px;
    font-weight: 700;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 12px;
    border-top: 1px solid $surface-highest;
  }

  &__stars {
    display: flex;
    gap: 2px;
  }

  &__star {
    font-size: 14px;
    color: $surface-highest;

    &--on { color: $secondary-container; }
  }

  &__sched {
    font-size: 12px;
    color: $subtle;
    font-weight: 500;
  }
}
</style>

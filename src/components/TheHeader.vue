<template>
  <div class="header-wrapper" ref="wrapperRef">
    <!-- ── Navbar ── -->
    <nav class="navbar">
      <div class="navbar__inner">
        <!-- Logo siempre visible -->
        <a class="navbar__logo" href="/">
          <span class="navbar__logo-icon">🗺️</span>
          <span class="navbar__logo-text">KidGuide <span>Colombia</span></span>
          <span class="navbar__logo-short">KG</span>
        </a>

        <!-- City tabs — solo desktop -->
        <div class="navbar__cities scroll-x">
          <button
            v-for="(city, key) in CITIES" :key="key"
            :class="['city-tab', { 'city-tab--active': activeCity === key }]"
            @click="$emit('city-change', key)"
          >{{ city.emoji }} {{ city.name }}</button>
        </div>

        <!-- Acciones derecha -->
        <div class="navbar__actions">
          <!-- City selector móvil -->
          <div class="city-mobile" v-click-outside="() => cityOpen = false">
            <button
              class="city-mobile__btn"
              :class="{ 'city-mobile__btn--open': cityOpen }"
              @click.stop="cityOpen = !cityOpen"
            >
              {{ CITIES[activeCity]?.emoji }}
              <span>{{ CITIES[activeCity]?.name }}</span>
              <svg class="city-mobile__arrow" width="12" height="12" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>

            <Transition name="dropdown">
              <div v-if="cityOpen" class="city-mobile__dropdown">
                <button
                  v-for="(city, key) in CITIES" :key="key"
                  :class="['city-mobile__option', { 'city-mobile__option--active': activeCity === key }]"
                  @click.stop="selectCity(key)"
                >
                  <span class="city-mobile__option-emoji">{{ city.emoji }}</span>
                  {{ city.name }}
                  <svg v-if="activeCity === key" class="city-mobile__check" width="14" height="14"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="m5 12 5 5L20 7"/>
                  </svg>
                </button>
              </div>
            </Transition>
          </div>

          <button class="navbar__icon-btn" title="Buscar" @click="focusSearch">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
        </div>
      </div>
    </nav>

    <!-- ── Hero ── -->
    <div class="hero">
      <div class="hero__circle hero__circle--1"/>
      <div class="hero__circle hero__circle--2"/>
      <div class="hero__content">
        <h1 class="hero__title">¿A dónde vamos hoy? ⭐</h1>
        <p class="hero__stats">
          {{ totalPlaces }} planes · {{ totalFree }} gratuitos ·
          Hoy: {{ todayCount }} abiertos
        </p>

        <div class="hero__search-wrap">
          <div class="hero__search-box">
            <svg class="hero__search-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              ref="searchInput"
              :value="search"
              @input="$emit('update:search', $event.target.value)"
              @keyup.enter="$emit('do-search')"
              class="hero__search-input"
              placeholder="Nombre, zona o actividad..."
              type="search"
            />
            <button class="hero__search-btn" @click="$emit('do-search')">Buscar</button>
          </div>

          <!-- Feedback inmediato: aparece apenas hay texto, sin tener que hacer scroll -->
          <Transition name="fade">
            <button v-if="search" class="hero__search-feedback" @click="$emit('do-search')">
              {{ resultCount }} resultado{{ resultCount === 1 ? '' : 's' }} para "{{ search }}"
              <span class="hero__search-feedback-arrow">Ver resultados ↓</span>
            </button>
          </Transition>
        </div>

        <div class="hero__tabs">
          <button
            v-for="tab in TABS" :key="tab.id"
            :class="['hero__tab', { 'hero__tab--active': activeTab === tab.id }]"
            @click="$emit('update:tab', tab.id)"
          >{{ tab.icon }} {{ tab.label }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { CITIES } from '@/data/categories'

defineProps({
  search:      { type: String,  default: '' },
  activeTab:   { type: String,  default: 'explorar' },
  activeCity:  { type: String,  default: 'medellin' },
  todayCount:  { type: Number,  default: 0 },
  totalFree:   { type: Number,  default: 0 },
  totalPlaces: { type: Number,  default: 0 },
  resultCount: { type: Number,  default: 0 },
  today:       { type: Number,  required: true },
})

const emit = defineEmits(['update:search', 'update:tab', 'city-change', 'do-search'])

const searchInput = ref(null)
const cityOpen    = ref(false)

const focusSearch = () => searchInput.value?.focus()

const selectCity = (key) => {
  emit('city-change', key)
  cityOpen.value = false
}

// Directiva click-outside inline
const vClickOutside = {
  mounted(el, binding) {
    el._clickOutside = (e) => {
      if (!el.contains(e.target)) binding.value(e)
    }
    document.addEventListener('click', el._clickOutside, true)
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside, true)
  },
}

const TABS = [
  { id: 'explorar', icon: '🔍', label: 'Explorar' },
  { id: 'mapa',     icon: '🗺️', label: 'Mapa'     },
]
</script>

<style lang="scss" scoped>
// ── Navbar ────────────────────────────────────────────────────
.navbar {
  background: $white;
  border-bottom: 1px solid $border;
  position: sticky;
  top: 0;
  z-index: 200;                    // ← más alto que el dropdown
  box-shadow: 0 1px 12px rgba($primary, 0.07);
  // NO overflow:hidden — el dropdown necesita salir del navbar

  &__inner {
    max-width: $container-max;
    margin: 0 auto;
    padding: 0 $gutter;
    height: 56px;
    display: flex;
    align-items: center;
    gap: 16px;

    @media (max-width: $bp-md) {
      padding: 0 16px;
      gap: 8px;
    }
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: 7px;
    flex-shrink: 0;
    text-decoration: none;

    &-icon { font-size: 20px; }

    &-text {
      font-family: $font-display;
      font-size: 15px;
      font-weight: 700;
      color: $text;
      white-space: nowrap;
      span { color: $primary-container; }

      @media (max-width: $bp-md) { display: none; }
    }

    &-short {
      display: none;
      font-family: $font-display;
      font-size: 15px;
      font-weight: 700;
      color: $primary-container;

      @media (max-width: $bp-md) { display: block; }
    }
  }

  // Desktop cities
  &__cities {
    display: flex;
    gap: 2px;
    flex: 1;

    @media (max-width: $bp-md) { display: none; }
  }

  &__actions {
    display: flex;
    gap: 4px;
    align-items: center;
    margin-left: auto;
    flex-shrink: 0;
  }

  &__icon-btn {
    width: 36px;
    height: 36px;
    border-radius: $r-md;
    border: none;
    background: transparent;
    color: $muted;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: $t-fast;
    -webkit-tap-highlight-color: transparent;

    &:hover, &:active { background: $surface-low; color: $primary-container; }
  }
}

.city-tab {
  padding: 6px 13px;
  border-radius: $r-pill;
  border: none;
  background: transparent;
  font-family: $font-body;
  font-size: 13px;
  font-weight: 600;
  color: $muted;
  cursor: pointer;
  transition: $t-fast;
  white-space: nowrap;

  &:hover { color: $primary-container; background: $surface-low; }

  &--active {
    color: $primary-container;
    background: $brand-light;
    font-weight: 700;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -9px;
      left: 50%;
      transform: translateX(-50%);
      width: 18px; height: 2.5px;
      background: $primary-container;
      border-radius: $r-pill;
    }
  }
}

// ── City selector móvil ────────────────────────────────────────
.city-mobile {
  position: relative;
  display: none;
  z-index: 300;                   // ← por encima de todo

  @media (max-width: $bp-md) { display: block; }

  &__btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 7px 12px;
    border-radius: $r-pill;
    border: 1.5px solid $border;
    background: $surface-low;
    color: $text;
    font-family: $font-body;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    transition: $t-fast;
    -webkit-tap-highlight-color: transparent;

    span { max-width: 80px; overflow: hidden; text-overflow: ellipsis; }

    &:hover, &:active { border-color: $primary-container; color: $primary-container; }

    &--open {
      border-color: $primary-container;
      background: $brand-light;
      color: $primary-container;
    }
  }

  &__arrow {
    flex-shrink: 0;
    transition: transform .2s ease;

    .city-mobile__btn--open & { transform: rotate(180deg); }
  }

  &__dropdown {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    background: $white;
    border: 1.5px solid $border;
    border-radius: $r-xl;
    box-shadow: 0 8px 32px rgba($primary, 0.18);
    overflow: hidden;
    min-width: 180px;
    z-index: 400;
  }

  &__option {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 13px 16px;
    text-align: left;
    border: none;
    border-bottom: 1px solid $surface-highest;
    background: transparent;
    font-family: $font-body;
    font-size: 14px;
    font-weight: 600;
    color: $muted;
    cursor: pointer;
    transition: $t-fast;
    -webkit-tap-highlight-color: transparent;

    &:last-child { border-bottom: none; }
    &:hover, &:active { background: $surface-low; color: $text; }

    &--active {
      color: $primary-container;
      background: $brand-light;
      font-weight: 700;
    }

    &-emoji { font-size: 16px; }
  }

  &__check { margin-left: auto; color: $primary-container; flex-shrink: 0; }
}

// ── Transición dropdown ────────────────────────────────────────
.dropdown-enter-active { animation: dropIn .18s ease; }
.dropdown-leave-active { animation: dropIn .15s ease reverse; }

@keyframes dropIn {
  from { opacity: 0; transform: translateY(-8px) scale(.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

// ── Hero ──────────────────────────────────────────────────────
.hero {
  background: linear-gradient(150deg, $primary 0%, $primary-container 60%, #A855F7 100%);
  padding: 40px $gutter 36px;
  position: relative;
  overflow: hidden;
  text-align: center;

  @media (max-width: $bp-md) { padding: 28px 16px 26px; }

  &__circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,0.06);
    pointer-events: none;
    &--1 { width: 260px; height: 260px; top: -90px; left: -70px; }
    &--2 { width: 200px; height: 200px; bottom: -70px; right: -50px; }
  }

  &__content {
    position: relative;
    z-index: 1;
    max-width: 560px;
    margin: 0 auto;
  }

  &__title {
    font-family: $font-display;
    font-size: clamp(20px, 5vw, 38px);
    font-weight: 700;
    color: $white;
    line-height: 1.2;
    margin-bottom: 8px;
    letter-spacing: -0.01em;
  }

  &__stats {
    color: rgba(255,255,255,0.8);
    font-size: 13px;
    margin-bottom: 20px;
    font-weight: 500;

    @media (max-width: $bp-md) { font-size: 12px; margin-bottom: 16px; }
  }

  &__search-wrap { margin-bottom: 18px; }

  &__search-box {
    display: flex;
    align-items: center;
    background: $white;
    border-radius: $r-pill;
    padding: 5px 5px 5px 14px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.18);
    max-width: 520px;
    margin: 0 auto;
  }

  &__search-icon { color: $subtle; flex-shrink: 0; margin-right: 8px; }

  &__search-input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 14px;
    font-family: $font-body;
    color: $text;
    background: transparent;
    min-width: 0;
    &::placeholder { color: $subtle; }
    @media (max-width: $bp-md) { font-size: 13px; }
  }

  &__search-btn {
    flex-shrink: 0;
    padding: 9px 18px;
    border-radius: $r-pill;
    background: $secondary-container;
    color: $on-secondary-container;
    font-family: $font-display;
    font-size: 14px;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: $t-fast;
    white-space: nowrap;
    &:hover { filter: brightness(1.08); }
    @media (max-width: $bp-md) { padding: 8px 14px; font-size: 13px; }
  }

  &__search-feedback {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 10px auto 0;
    padding: 7px 16px;
    max-width: fit-content;
    background: rgba(255,255,255,0.16);
    border: 1px solid rgba(255,255,255,0.35);
    border-radius: $r-pill;
    color: $white;
    font-size: 12.5px;
    font-family: $font-body;
    font-weight: 600;
    cursor: pointer;
    transition: $t-fast;
    &:hover { background: rgba(255,255,255,0.26); }
  }
  &__search-feedback-arrow {
    font-weight: 800;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
  .fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }

  &__tabs {
    display: flex;
    gap: 8px;
    justify-content: center;
  }

  &__tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 20px;
    border-radius: $r-pill;
    border: 1.5px solid rgba(255,255,255,0.3);
    background: rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.8);
    font-family: $font-body;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: $t-fast;
    -webkit-tap-highlight-color: transparent;

    &:hover, &:active { background: rgba(255,255,255,0.22); color: $white; }

    &--active {
      background: $white;
      color: $primary;
      border-color: $white;
      font-weight: 700;
      box-shadow: 0 2px 12px rgba(0,0,0,0.12);
    }

    @media (max-width: $bp-md) { padding: 8px 16px; font-size: 13px; }
  }
}
</style>

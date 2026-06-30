<template>
  <div id="app">
    <TheHeader
      v-model:search="search"
      v-model:tab="activeTab"
      :today-count="todayCount"
      :total-free="totalFree"
      :total-places="totalPlaces"
      :today="TODAY"
      :active-city="activeCity"
      @city-change="onCityChange"
    />

    <main class="main-content">

      <!-- ══ TAB: EXPLORAR ══ -->
      <template v-if="activeTab === 'explorar'">

        <!-- BANNER DE CLIMA -->
        <WeatherBanner
          :meta="weatherMeta()"
          :title="cityName ? weatherTitle() : ''"
          :subtext="cityName ? weatherSub() : ''"
          :temp="weatherTemp"
          :feels="weatherFeels"
        />

        <!-- DESTACADO DEL DÍA -->
        <FeaturedDailyCard
          :place="todayFeaturedCard"
          :today="TODAY"
          @select="openModal"
        />

        <!-- CTA HOY -->
        <TodayCTA :places="todayPlaces" :today="TODAY" @select="openModal" />

        <!-- VAKI SUPPORT -->
        <SupportBanner />

        <!-- Pills de categoría -->
        <div class="scroll-x cat-pills">
          <button
            v-for="c in CATEGORIES" :key="c.id"
            class="cat-pill"
            :class="{ 'cat-pill--active': activecat === c.id }"
            :style="activecat === c.id
              ? { background: c.color, borderColor: c.color, boxShadow: `0 4px 14px ${c.color}44` }
              : {}"
            @click="activecat = c.id"
          >{{ c.icon }} {{ c.label }}</button>
        </div>

        <!-- Section header + filtros inline -->
        <div class="section-header">
          <h2 class="section-header__title">
            Explora todos los planes
            <span class="section-header__count">{{ activeList.length }}</span>
          </h2>
          <div class="section-header__filters">
            <button
              class="filter-chip"
              :class="{ 'filter-chip--on': todayOnly }"
              @click="todayOnly = !todayOnly"
            >📅 Hoy</button>
            <button
              class="filter-chip filter-chip--green"
              :class="{ 'filter-chip--on filter-chip--green-on': freeOnly }"
              @click="freeOnly = !freeOnly"
            >💚 Gratis</button>
            <button v-if="hasFilters" class="filter-chip filter-chip--clear" @click="clearFilters">✕</button>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="activeList.length === 0" class="empty-state">
          <div class="empty-state__icon">🔍</div>
          <p class="empty-state__title">Sin resultados</p>
          <p class="empty-state__sub">Intenta con otra búsqueda o categoría</p>
          <button class="cat-pill cat-pill--reset" @click="clearFilters">Ver todos</button>
        </div>

        <!-- Grid -->
        <template v-else>
          <div class="cards-grid">
            <PlaceCard
              v-for="p in visiblePlaces" :key="p.id"
              :place="p" :today="TODAY"
              @select="openModal"
            />
          </div>

          <!-- Load more -->
          <div v-if="visibleCount < activeList.length" class="load-more">
            <button class="load-more__btn" @click="visibleCount += PAGE_SIZE">
              Cargar más aventuras 🎒
            </button>
          </div>
        </template>
      </template>

      <!-- ══ TAB: MAPA ══ -->
      <template v-else-if="activeTab === 'mapa'">
        <div class="tab-header">
          <h2 class="tab-header__title">🗺️ Mapa de lugares</h2>
          <p class="tab-header__sub">Todos los sitios geolocalizados. Toca un marcador para ver detalles.</p>
        </div>
        <div class="scroll-x cat-pills" style="margin-bottom:14px">
          <button
            v-for="c in CATEGORIES"
            :key="c.id"
            class="cat-pill"
            :class="{ 'cat-pill--active': activecat === c.id }"
            :style="activecat === c.id ? { background: c.color, borderColor: c.color } : {}"
            @click="activecat = c.id"
          >
            {{ c.icon }} {{ c.label }}
          </button>
        </div>
        <MapView :places="mapPlaces" :city="activeCity" />
      </template>

    </main>

    <TheFooter />

    <WeatherBackground :theme="weatherTheme" />

    <PlaceModal
      v-if="selectedPlace"
      :place="selectedPlace"
      :today="TODAY"
      @close="selectedPlace = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { CATEGORIES } from '@/data/categories'
import { getPlacesForCity } from '@/data/index'
import { usePlaces }  from '@/composables/usePlaces'
import { useWeather } from '@/composables/useWeather'

import TheHeader  from '@/components/TheHeader.vue'
import TheFooter  from '@/components/TheFooter.vue'
import PlaceCard  from '@/components/PlaceCard.vue'
import PlaceModal from '@/components/PlaceModal.vue'
import MapView    from '@/components/MapView.vue'
import TodayCTA   from '@/components/TodayCTA.vue'
import SupportBanner      from '@/components/SupportBanner.vue'
import FeaturedDailyCard  from '@/components/FeaturedDailyCard.vue'
import WeatherBackground  from '@/components/WeatherBackground.vue'
import WeatherBanner      from '@/components/WeatherBanner.vue'

const activeTab     = ref('explorar')
const selectedPlace = ref(null)
const activeCity    = ref('medellin')
const PAGE_SIZE     = 9
const visibleCount  = ref(PAGE_SIZE)

const {
  search, activecat, todayOnly, freeOnly,
  filtered, todayPlaces, totalFree, todayCount, totalPlaces,
  clearFilters, hasFilters, TODAY,
  dailyShuffled, todayFeaturedCard,
} = usePlaces(activeCity)

const {
  theme: weatherTheme,
  temp:  weatherTemp,
  feels: weatherFeels,
  cityName,
  meta:  weatherMeta,
  title: weatherTitle,
  subtext: weatherSub,
} = useWeather(activeCity)

// Sin filtros activos → orden mezclado del día (cambia cada día)
// Con filtros activos → orden normal para no confundir al usuario
const activeList    = computed(() => hasFilters.value ? filtered.value : dailyShuffled.value)
const visiblePlaces = computed(() => activeList.value.slice(0, visibleCount.value))

// Reset paginación al cambiar filtros o ciudad
watch([() => activeCity.value, () => activeList.value], () => {
  visibleCount.value = PAGE_SIZE
})

const mapPlaces = computed(() => {
  const all = getPlacesForCity(activeCity.value)
  return activecat.value === 'all' ? all : all.filter(p => p.cat === activecat.value)
})

const openModal = (place) => { selectedPlace.value = place }

// Al cambiar ciudad, resetear filtros y volver a explorar
const onCityChange = (city) => {
  activeCity.value = city
  activeTab.value  = 'explorar'
  clearFilters()
  selectedPlace.value = null
}
</script>

<style lang="scss">
.cat-pills {
  display: flex;
  gap: 8px;
  padding-bottom: 4px;
  margin-bottom: 12px;
}

.cat-pill {
  padding: 7px 16px;
  border-radius: $r-pill;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  font-family: $font-body;
  transition: $t-fast;
  border: 2px solid $border;
  background: $white;
  color: #444;

  &:hover { transform: scale(1.03); }
  &--active { color: $white; }

  &--reset {
    margin-top: 14px;
    background: $brand;
    color: $white;
    border-color: $brand;
  }
}

.quick-filters {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: center;

  &__count {
    margin-left: auto;
    font-size: 13px;
    color: $subtle;
  }
}

.filter-chip {
  padding: 6px 14px;
  border-radius: $r-pill;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: $font-body;
  border: 2px solid $border;
  background: $white;
  color: #444;
  transition: $t-fast;

  &:hover { transform: scale(1.03); }
  &--on       { background: $brand;       color: $white; border-color: $brand; }
  &--green-on { background: $cat-parques; color: $white; border-color: $cat-parques; }
  &--clear    { background: #FEE2E2; color: $cat-restaurantes; border-color: #FCA5A5; }
}

.tab-header {
  margin-bottom: 16px;
  &__title { font-family: $font-display; font-size: 24px; color: $text; margin-bottom: 4px; }
  &__sub   { color: $muted; font-size: 13px; }
}
</style>

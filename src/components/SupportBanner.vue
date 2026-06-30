<template>
  <div class="support" :class="{ 'support--open': open }">
    <!-- Trigger — siempre visible -->
    <button class="support__trigger" @click="open = !open" :aria-expanded="open">
      <div class="support__trigger-left">
        <span class="support__trigger-icon">💜</span>
        <div>
          <p class="support__trigger-title">¿Quieres impulsar este proyecto?</p>
          <p class="support__trigger-sub">Apóyanos y ayuda a crecer KidGuide Colombia</p>
        </div>
      </div>
      <div class="support__trigger-right">
        <span class="support__vaki-badge">Vaki</span>
        <svg
          class="support__chevron"
          :class="{ 'support__chevron--up': open }"
          width="18" height="18"
          viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5"
        ><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </button>

    <!-- Panel expandible -->
    <Transition name="support-expand">
      <div v-if="open" class="support__panel">
        <div class="support__panel-inner">

          <!-- Descripción -->
          <p class="support__desc">
            KidGuide es un proyecto independiente, hecho por una familia colombiana
            para todas las familias colombianas. Mantenerlo actualizado, ampliarlo a
            más ciudades y mejorarlo tiene costos reales.
          </p>

          <!-- Qué se financia -->
          <div class="support__items">
            <div class="support__item" v-for="item in ITEMS" :key="item.label">
              <span class="support__item-icon">{{ item.icon }}</span>
              <div>
                <p class="support__item-label">{{ item.label }}</p>
                <p class="support__item-desc">{{ item.desc }}</p>
              </div>
            </div>
          </div>

          <!-- CTA principal -->
          <a
            class="support__cta"
            href="https://vaki.co/vaki/impulsa-kidguide"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>💜 Apoyar en Vaki</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>

          <p class="support__note">
            Cada aporte, grande o pequeño, nos ayuda a seguir. Gracias por confiar en KidGuide 🙏
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const open = ref(false)

const ITEMS = [
  {
    icon: '🗺️',
    label: 'Más ciudades',
    desc: 'Ampliar el directorio a Barranquilla, Bucaramanga y más municipios.',
  },
  {
    icon: '🔄',
    label: 'Datos actualizados',
    desc: 'Verificar horarios y precios regularmente para que siempre sean confiables.',
  },
  {
    icon: '📱',
    label: 'App móvil nativa',
    desc: 'Convertir KidGuide en una app instalable con notificaciones y modo offline.',
  },
  {
    icon: '🤝',
    label: 'Comunidad',
    desc: 'Construir un sistema de reseñas verificadas por familias reales.',
  },
]
</script>

<style lang="scss" scoped>
.support {
  border-radius: $r-2xl;
  border: 2px solid $brand-light;
  background: $white;
  overflow: hidden;
  margin-bottom: 28px;
  box-shadow: 0 2px 16px rgba($primary, 0.07);
  transition: border-color $t-normal;

  &--open {
    border-color: rgba($primary-container, 0.4);
    box-shadow: 0 4px 24px rgba($primary, 0.12);
  }

  @media (max-width: $bp-md) {
    border-radius: $r-xl;
    margin-bottom: 20px;
  }

  // ── Trigger ────────────────────────────────────────────────
  &__trigger {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 18px 20px;
    background: linear-gradient(135deg, $brand-light 0%, #fdf4ff 100%);
    border: none;
    cursor: pointer;
    text-align: left;
    transition: $t-fast;
    -webkit-tap-highlight-color: transparent;

    &:hover { filter: brightness(.98); }
    &:active { filter: brightness(.96); }

    @media (max-width: $bp-md) { padding: 14px 16px; gap: 10px; }

    &-left {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      min-width: 0;

      @media (max-width: $bp-md) { gap: 10px; }
    }

    &-right {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
  }

  &__trigger-icon {
    font-size: 28px;
    flex-shrink: 0;
    line-height: 1;

    @media (max-width: $bp-md) { font-size: 24px; }
  }

  &__trigger-title {
    font-family: $font-display;
    font-size: 16px;
    font-weight: 700;
    color: $primary;
    margin-bottom: 2px;
    line-height: 1.3;

    @media (max-width: $bp-md) { font-size: 14px; }
  }

  &__trigger-sub {
    font-size: 12px;
    color: $muted;
    font-weight: 500;

    @media (max-width: $bp-md) { font-size: 11px; }
  }

  &__vaki-badge {
    font-size: 11px;
    font-weight: 800;
    background: #8DC63F;
    color: $white;
    border-radius: $r-pill;
    padding: 3px 10px;
    letter-spacing: .03em;
    flex-shrink: 0;
  }

  &__chevron {
    color: $primary-container;
    flex-shrink: 0;
    transition: transform .25s ease;

    &--up { transform: rotate(180deg); }
  }

  // ── Panel ──────────────────────────────────────────────────
  &__panel {
    border-top: 1px solid $brand-light;
  }

  &__panel-inner {
    padding: 20px 20px 18px;

    @media (max-width: $bp-md) { padding: 16px; }
  }

  &__desc {
    font-size: 14px;
    color: $muted;
    line-height: 1.75;
    margin-bottom: 18px;

    @media (max-width: $bp-md) { font-size: 13px; margin-bottom: 14px; }
  }

  // ── Items de financiación ──────────────────────────────────
  &__items {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 20px;

    @media (max-width: $bp-md) {
      grid-template-columns: 1fr;
      gap: 8px;
      margin-bottom: 16px;
    }
  }

  &__item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    background: $surface-low;
    border-radius: $r-lg;
    border: 1px solid $surface-highest;

    @media (max-width: $bp-md) { padding: 10px 12px; }
  }

  &__item-icon {
    font-size: 20px;
    line-height: 1;
    flex-shrink: 0;
    margin-top: 1px;
  }

  &__item-label {
    font-family: $font-display;
    font-size: 13px;
    font-weight: 700;
    color: $text;
    margin-bottom: 2px;
  }

  &__item-desc {
    font-size: 12px;
    color: $muted;
    line-height: 1.5;
  }

  // ── CTA principal ──────────────────────────────────────────
  &__cta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 14px;
    border-radius: $r-pill;
    background: linear-gradient(135deg, $primary 0%, $primary-container 100%);
    color: $white;
    font-family: $font-display;
    font-size: 16px;
    font-weight: 700;
    text-decoration: none;
    transition: $t-normal;
    box-shadow: 0 4px 20px rgba($primary, 0.35);
    -webkit-tap-highlight-color: transparent;
    margin-bottom: 12px;

    &:hover {
      filter: brightness(1.08);
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba($primary, 0.45);
    }

    &:active { transform: translateY(0); filter: brightness(.96); }

    @media (max-width: $bp-md) { font-size: 15px; padding: 13px; }
  }

  &__note {
    text-align: center;
    font-size: 12px;
    color: $subtle;
    line-height: 1.5;
  }
}

// ── Transición acordeón ────────────────────────────────────────
.support-expand-enter-active {
  animation: expandDown .28s ease;
}
.support-expand-leave-active {
  animation: expandDown .22s ease reverse;
}

@keyframes expandDown {
  from { opacity: 0; max-height: 0; }
  to   { opacity: 1; max-height: 600px; }
}
</style>

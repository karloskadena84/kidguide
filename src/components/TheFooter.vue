<template>
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__brand">
        <p class="footer__logo">🗺️ KidGuide Colombia</p>
        <p class="footer__tagline">Hecho con amor para familias locales.</p>
        <p class="footer__copy">© 2025 KidGuide Colombia</p>
      </div>
      <nav class="footer__links">
        <a href="#">Sobre nosotros</a>
        <a href="#">Guía de Seguridad</a>
        <a href="#">Contáctanos</a>
        <a href="#">Términos</a>
      </nav>
      <div class="footer__actions">
        <button class="footer__icon-btn footer__icon-btn--whatsapp" title="Compartir por WhatsApp" @click="share">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.86 9.86 0 0 0 12.04 2zm0 1.67c2.2 0 4.26.86 5.82 2.42a8.2 8.2 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.25 8.24a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.18 8.18 0 0 1-1.26-4.37c0-4.55 3.7-8.24 8.26-8.24zm-3.1 4.3c-.15 0-.4.06-.6.29-.21.24-.8.78-.8 1.9s.82 2.21.93 2.36c.12.15 1.6 2.44 3.87 3.42 1.92.83 2.31.66 2.72.62.42-.04 1.36-.55 1.55-1.09.19-.53.19-.98.14-1.08-.06-.1-.21-.16-.44-.28-.24-.12-1.36-.67-1.57-.75-.21-.08-.36-.12-.52.12-.15.24-.6.75-.73.9-.14.15-.27.17-.5.06-.24-.12-1-.37-1.9-1.17-.7-.63-1.18-1.4-1.31-1.64-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.43.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.52-1.27-.72-1.73-.19-.46-.38-.4-.52-.4z"/></svg>
        </button>
        <button class="footer__icon-btn" title="Favoritos">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
      </div>
    </div>
    <p class="footer__disclaimer">
      Precios en COP aproximados y sujetos a cambio. Verifica horarios directamente con cada lugar antes de visitar.
    </p>
  </footer>
</template>

<script setup>
import { shareOnWhatsApp, buildSiteShareText } from '@/utils/share'

const share = () => shareOnWhatsApp(buildSiteShareText())
</script>

<style lang="scss" scoped>
.footer {
  background: $primary;
  padding: 32px $gutter 20px;

  &__inner {
    max-width: $container-max;
    margin: 0 auto;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(255,255,255,.15);
    margin-bottom: 14px;

    @media (max-width: $bp-md) {
      flex-direction: column;
      gap: 16px;
    }
  }

  &__brand {}

  &__logo {
    font-family: $font-display;
    font-size: 18px;
    font-weight: 700;
    color: $white;
    margin-bottom: 4px;
  }

  &__tagline {
    color: rgba(255,255,255,.7);
    font-size: 13px;
    margin-bottom: 4px;
  }

  &__copy { color: rgba(255,255,255,.5); font-size: 12px; }

  &__links {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 20px;
    align-items: center;

    a {
      color: rgba(255,255,255,.75);
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      transition: $t-fast;
      &:hover { color: $white; }
    }
  }

  &__actions {
    display: flex;
    gap: 8px;
  }

  &__icon-btn {
    width: 36px; height: 36px;
    border-radius: $r-md;
    background: rgba(255,255,255,.15);
    border: 1px solid rgba(255,255,255,.2);
    color: rgba(255,255,255,.8);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: $t-fast;
    &:hover { background: rgba(255,255,255,.25); color: $white; }
  }

  &__icon-btn--whatsapp:hover {
    background: #25D366;
    border-color: #25D366;
    color: $white;
  }

  &__disclaimer {
    max-width: $container-max;
    margin: 0 auto;
    color: rgba(255,255,255,.45);
    font-size: 11px;
    text-align: center;
    line-height: 1.5;
  }
}
</style>

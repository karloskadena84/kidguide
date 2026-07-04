<template>
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__brand">
        <p class="footer__logo">🗺️ KidGuide Colombia</p>
        <p class="footer__tagline">Hecho con amor para familias locales.</p>
        <p class="footer__copy">© 2025 KidGuide Colombia</p>
      </div>
      <div class="footer__actions">
        <button class="footer__icon-btn" title="Compartir">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>
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

<script setup></script>

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

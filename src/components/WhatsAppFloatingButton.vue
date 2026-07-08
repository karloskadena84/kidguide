<template>
  <button class="wa-float" title="Compartir KidGuide por WhatsApp" @click="share">
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.86 9.86 0 0 0 12.04 2zm0 1.67c2.2 0 4.26.86 5.82 2.42a8.2 8.2 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.25 8.24a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.18 8.18 0 0 1-1.26-4.37c0-4.55 3.7-8.24 8.26-8.24zm-3.1 4.3c-.15 0-.4.06-.6.29-.21.24-.8.78-.8 1.9s.82 2.21.93 2.36c.12.15 1.6 2.44 3.87 3.42 1.92.83 2.31.66 2.72.62.42-.04 1.36-.55 1.55-1.09.19-.53.19-.98.14-1.08-.06-.1-.21-.16-.44-.28-.24-.12-1.36-.67-1.57-.75-.21-.08-.36-.12-.52.12-.15.24-.6.75-.73.9-.14.15-.27.17-.5.06-.24-.12-1-.37-1.9-1.17-.7-.63-1.18-1.4-1.31-1.64-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.43.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.52-1.27-.72-1.73-.19-.46-.38-.4-.52-.4z"/></svg>
  </button>
</template>

<script setup>
import { shareOnWhatsApp, buildSiteShareText } from '@/utils/share'

const share = () => shareOnWhatsApp(buildSiteShareText())
</script>

<style lang="scss" scoped>
.wa-float {
  display: none; // solo aparece en móvil, ver media query abajo

  @media (max-width: $bp-md) {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    right: 16px;
    bottom: 16px;
    z-index: 40;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #25D366;
    color: white;
    border: none;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(37, 211, 102, 0.45);
    transition: transform 0.15s ease;

    // Respeta el "notch"/home indicator en iPhones
    margin-bottom: env(safe-area-inset-bottom, 0);

    &:active { transform: scale(0.92); }
  }
}
</style>

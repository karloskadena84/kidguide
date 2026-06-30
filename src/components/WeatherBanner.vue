<template>
  <div
    v-if="title"
    class="wx-banner"
    :style="{ background: meta.bg, borderColor: meta.border }"
    role="status"
    aria-live="polite"
  >
    <div class="wx-banner__ico-wrap" :style="{ background: meta.border + '55' }">
      <span class="wx-banner__ico" aria-hidden="true">{{ meta.ico }}</span>
    </div>

    <div class="wx-banner__body">
      <strong class="wx-banner__title" :style="{ color: meta.accent }">{{ title }}</strong>
      <span  class="wx-banner__sub"   :style="{ color: meta.accent }">{{ subtext }}</span>
    </div>

    <div v-if="temp !== null" class="wx-banner__right" :style="{ color: meta.accent }">
      <span class="wx-banner__temp">{{ temp }}°</span>
      <span class="wx-banner__feels">Sensación {{ feels }}°</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  meta:    { type: Object,  required: true },
  title:   { type: String,  default: '' },
  subtext: { type: String,  default: '' },
  temp:    { type: Number,  default: null },
  feels:   { type: Number,  default: null },
})
</script>

<style lang="scss" scoped>
.wx-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: $r-xl;
  border: 1px solid;
  margin-bottom: 16px;
  transition: background .5s ease, border-color .5s ease;

  @media (max-width: $bp-md) { gap: 10px; padding: 10px 12px; }

  &__ico-wrap {
    width: 44px; height: 44px; border-radius: $r-lg;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: background .5s ease;
    @media (max-width: $bp-md) { width: 38px; height: 38px; }
  }

  &__ico { font-size: 22px; line-height: 1; }

  &__body {
    flex: 1; min-width: 0;
    display: flex; flex-direction: column; gap: 2px;
  }

  &__title {
    font-size: 13px; font-weight: 700; line-height: 1.3;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  &__sub { font-size: 12px; opacity: .8; line-height: 1.4; }

  &__right {
    display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0;
  }

  &__temp { font-size: 22px; font-weight: 700; line-height: 1; }
  &__feels { font-size: 11px; opacity: .65; margin-top: 2px; white-space: nowrap; }
}
</style>

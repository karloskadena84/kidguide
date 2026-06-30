<template>
  <div v-if="show" class="wx-bg" :class="`wx-bg--${theme}`" aria-hidden="true">

    <template v-if="theme === 'sunny'">
      <div
        v-for="i in 12" :key="i"
        class="wx-ray"
        :style="{ transform: `rotate(${(i-1)*30}deg)`, animationDelay: `${(i-1)*0.25}s` }"
      />
    </template>

    <template v-if="theme === 'cloudy'">
      <svg v-for="c in clouds" :key="c.id" class="wx-cloud" :style="c.style" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="36" rx="46" ry="18" fill="#8BAFC8"/>
        <ellipse cx="28" cy="26" rx="22" ry="16" fill="#8BAFC8"/>
        <ellipse cx="68" cy="24" rx="18" ry="14" fill="#8BAFC8"/>
      </svg>
    </template>

    <template v-if="theme === 'rainy'">
      <div v-for="d in drops" :key="d.id" class="wx-drop" :style="d.style" />
    </template>

    <template v-if="theme === 'stormy'">
      <div class="wx-lightning" />
      <div v-for="d in heavyDrops" :key="d.id" class="wx-drop wx-drop--heavy" :style="d.style" />
    </template>

    <template v-if="theme === 'foggy'">
      <div v-for="f in fogBands" :key="f.id" class="wx-fog" :style="f.style" />
    </template>

    <template v-if="theme === 'snow'">
      <div v-for="s in flakes" :key="s.id" class="wx-flake" :style="s.style" />
    </template>

  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  theme: { type: String, default: 'sunny' },
  show:  { type: Boolean, default: true },
})

const clouds = computed(() => [
  { id:1, style: `width:220px;height:110px;top:10px;animation-duration:28s;animation-delay:0s` },
  { id:2, style: `width:180px;height:90px;top:50px;animation-duration:22s;animation-delay:-8s` },
  { id:3, style: `width:260px;height:130px;top:20px;animation-duration:35s;animation-delay:-14s` },
  { id:4, style: `width:150px;height:75px;top:80px;animation-duration:19s;animation-delay:-5s` },
  { id:5, style: `width:200px;height:100px;top:5px;animation-duration:30s;animation-delay:-20s` },
])

function makeDrops(count, heavy = false) {
  const arr = []
  for (let i = 0; i < count; i++) {
    const x   = (i * 2.5) % 100
    const dur = heavy ? 0.45 + (i % 7) * 0.06 : 0.65 + (i % 9) * 0.07
    const del = (i * 0.053) % 2.2
    const h   = heavy ? 12 + (i % 5) * 3 : 9 + (i % 6) * 2.5
    const op  = heavy ? 0.55 + (i % 4) * 0.06 : 0.42 + (i % 5) * 0.06
    arr.push({ id: i, style: `left:${x}%;height:${h}px;opacity:${op};animation-duration:${dur}s;animation-delay:-${del}s` })
  }
  return arr
}

const drops      = computed(() => makeDrops(42, false))
const heavyDrops = computed(() => makeDrops(55, true))

const fogBands = computed(() => [
  { id:1, style: `top:8%;animation-duration:18s;animation-delay:0s;height:50px` },
  { id:2, style: `top:22%;animation-duration:24s;animation-delay:-6s;height:40px` },
  { id:3, style: `top:42%;animation-duration:20s;animation-delay:-11s;height:55px` },
  { id:4, style: `top:62%;animation-duration:28s;animation-delay:-4s;height:45px` },
  { id:5, style: `top:80%;animation-duration:16s;animation-delay:-9s;height:50px` },
])

const flakes = computed(() => {
  const arr = []
  for (let i = 0; i < 28; i++) {
    const x    = (i * 3.7) % 100
    const size = 4 + (i % 4) * 1.5
    const dur  = 3.5 + (i % 6) * 0.6
    const del  = (i * 0.14) % 4
    arr.push({ id: i, style: `left:${x}%;width:${size}px;height:${size}px;animation-duration:${dur}s;animation-delay:-${del}s` })
  }
  return arr
})
</script>

<style lang="scss" scoped>
.wx-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  @media (prefers-reduced-motion: reduce) { display: none; }
}

.wx-bg--sunny   { background: rgba(255, 245, 180, 0.18); }
.wx-bg--cloudy  { background: rgba(180, 210, 235, 0.18); }
.wx-bg--rainy   { background: rgba(180, 210, 255, 0.18); }
.wx-bg--stormy  { background: rgba(180, 175, 230, 0.18); }
.wx-bg--foggy   { background: rgba(210, 210, 205, 0.18); }
.wx-bg--snow    { background: rgba(210, 230, 250, 0.18); }

@keyframes wx-rain      { from { transform: translateY(-20px) rotate(6deg) }  to { transform: translateY(110vh) rotate(6deg) } }
@keyframes wx-rain-h    { from { transform: translateY(-20px) rotate(14deg) } to { transform: translateY(110vh) rotate(14deg) } }
@keyframes wx-drift     { from { transform: translateX(-280px) } to { transform: translateX(110vw) } }
@keyframes wx-snow      { from { transform: translateY(-10px) translateX(0px) } to { transform: translateY(110vh) translateX(18px) } }
@keyframes wx-rays      { 0%,100% { opacity: 0.22 } 50% { opacity: 0.36 } }
@keyframes wx-lightning { 0%,87%,93%,100% { opacity: 0 } 90% { opacity: 0.22 } }

.wx-ray {
  position: absolute; top: -60px; left: 50%; width: 1px; height: 200px;
  background: rgba(255, 200, 40, 0.28);
  transform-origin: 0 100%;
  animation: wx-rays 4s ease-in-out infinite;
}

.wx-cloud { position: absolute; top: 0; left: -280px; opacity: 0.14; animation: wx-drift linear infinite; }

.wx-drop {
  position: absolute; top: -20px; width: 1.5px; border-radius: 2px;
  background: rgba(140, 180, 240, 0.65);
  animation: wx-rain linear infinite;

  &--heavy {
    width: 2px;
    background: rgba(120, 150, 220, 0.60);
    animation-name: wx-rain-h;
  }
}

.wx-lightning { position: absolute; inset: 0; background: rgba(200, 200, 255, 0.22); animation: wx-lightning 6s ease infinite; }

.wx-fog {
  position: absolute; left: -320px; width: 320px; border-radius: 50%;
  background: rgba(195, 195, 188, 0.26);
  filter: blur(18px);
  animation: wx-drift linear infinite;
}

.wx-flake {
  position: absolute; top: -10px; border-radius: 50%;
  background: rgba(180, 215, 255, 0.55);
  animation: wx-snow linear infinite;
}
</style>

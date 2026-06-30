import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: `@use "/src/styles/variables" as *;`
      }
    }
  },
  resolve: {
    alias: { '@': '/src' }
  }
})

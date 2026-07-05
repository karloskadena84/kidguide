<template>
  <div class="login-wrap">
    <form class="login-card" @submit.prevent="submit">
      <div class="logo">🧭</div>
      <h1>KidGuide</h1>
      <p class="subtitle">Panel de administración</p>

      <label>
        Correo
        <input v-model="email" type="email" required autocomplete="username" />
      </label>

      <label>
        Contraseña
        <input v-model="password" type="password" required autocomplete="current-password" />
      </label>

      <p v-if="error" class="error">{{ error }}</p>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Ingresando…' : 'Ingresar' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { login } from '@/services/placesApi'

const emit = defineEmits(['logged-in'])

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  try {
    const { token } = await login(email.value, password.value)
    emit('logged-in', { token, email: email.value })
  } catch (err) {
    error.value = 'Correo o contraseña incorrectos.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-wrap {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #630ED4 0%, #9B4DFF 100%);
}

.login-wrap { padding: 16px; }

.login-card {
  background: white;
  border-radius: 20px;
  padding: 40px 36px;
  width: 320px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 20px 60px rgba(26, 18, 51, 0.3);
}

@media (max-width: 380px) {
  .login-card { padding: 28px 22px; }
}

.logo { font-size: 40px; text-align: center; }
h1 { margin: 0; text-align: center; font-size: 22px; font-weight: 800; }
.subtitle { margin: 0 0 12px; text-align: center; color: #6B6B85; font-size: 13px; }

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #333;
}

input {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #E3E3EF;
  font-size: 14px;
  font-family: inherit;
}
input:focus {
  outline: none;
  border-color: #630ED4;
  box-shadow: 0 0 0 3px #F3ECFC;
}

button {
  margin-top: 8px;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: #630ED4;
  color: white;
  font-weight: 700;
  font-size: 14px;
}
button:hover:not(:disabled) { background: #4E0AA8; }
button:disabled { opacity: 0.6; }

.error {
  color: #DC2626;
  font-size: 13px;
  margin: 0;
}
</style>

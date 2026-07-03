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
  background: linear-gradient(160deg, #505ACD 0%, #7C7FE0 100%);
}

.login-card {
  background: white;
  border-radius: 20px;
  padding: 40px 36px;
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

.logo { font-size: 40px; text-align: center; }
h1 { margin: 0; text-align: center; font-size: 22px; }
.subtitle { margin: 0 0 12px; text-align: center; color: #6B6B85; font-size: 13px; }

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

input {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #E3E3EF;
  font-size: 14px;
  font-family: inherit;
}

button {
  margin-top: 8px;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: #505ACD;
  color: white;
  font-weight: 700;
  font-size: 14px;
}

button:disabled { opacity: 0.6; }

.error {
  color: #DC2626;
  font-size: 13px;
  margin: 0;
}
</style>

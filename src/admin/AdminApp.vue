<template>
  <div class="admin-shell">
    <LoginView v-if="!isAuthenticated" @logged-in="handleLoggedIn" />

    <template v-else>
      <aside class="sidebar">
        <div class="brand">
          <span class="brand-emoji">🧭</span>
          <span class="brand-name">KidGuide<br /><small>Panel de administración</small></span>
        </div>

        <nav>
          <button :class="{ active: tab === 'places' }" @click="tab = 'places'">
            📍 Lugares
          </button>
          <button :class="{ active: tab === 'reports' }" @click="tab = 'reports'">
            📨 Reportes
          </button>
        </nav>

        <div class="sidebar-footer">
          <span>{{ userEmail }}</span>
          <button class="logout" @click="handleLogout">Cerrar sesión</button>
        </div>
      </aside>

      <main class="content">
        <PlacesView v-if="tab === 'places'" />
        <ReportsView v-else-if="tab === 'reports'" />
      </main>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LoginView from './views/LoginView.vue'
import PlacesView from './views/PlacesView.vue'
import ReportsView from './views/ReportsView.vue'

const TOKEN_KEY = 'kidguide_admin_token'
const EMAIL_KEY = 'kidguide_admin_email'

const isAuthenticated = ref(false)
const userEmail = ref('')
const tab = ref('places')

onMounted(() => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    isAuthenticated.value = true
    userEmail.value = localStorage.getItem(EMAIL_KEY) || ''
  }
})

function handleLoggedIn({ token, email }) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(EMAIL_KEY, email)
  isAuthenticated.value = true
  userEmail.value = email
}

function handleLogout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EMAIL_KEY)
  isAuthenticated.value = false
}
</script>

<style>
/* Paleta de marca real de KidGuide (la misma del sitio público) */
:root {
  --primary: #630ED4;
  --primary-dark: #4E0AA8;
  --primary-tint: #F3ECFC;
  --accent: #FEA619;
  --accent-tint: #FFF3E0;
  --bg: #FAF9FC;
  --surface: #FFFFFF;
  --border: #EAE6F5;
  --text: #1A1233;
  --text-muted: #6B6B85;
  --danger: #DC2626;
  --danger-tint: #FDECEA;
  --success: #16A34A;
  --success-tint: #ECFDF3;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: 'Manrope', system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
}

button {
  font-family: inherit;
  cursor: pointer;
}

.admin-shell {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 240px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 8px 24px;
  font-weight: 800;
}
.brand-emoji { font-size: 28px; }
.brand-name small { font-weight: 500; color: var(--text-muted); font-size: 12px; }

.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.sidebar nav button {
  text-align: left;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
}

.sidebar nav button.active {
  background: var(--primary);
  color: white;
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
  font-size: 13px;
  color: var(--text-muted);
}

.logout {
  border: 1px solid var(--border);
  background: white;
  border-radius: 8px;
  padding: 8px;
  font-weight: 600;
  color: var(--danger);
}

.content {
  flex: 1;
  padding: 32px 40px;
  max-width: 1200px;
}
</style>

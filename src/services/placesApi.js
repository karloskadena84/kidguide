import { API_BASE_URL } from '@/config/api'

const cache = new Map() // evita re-fetch al cambiar de ciudad y volver

export async function fetchPlacesForCity(cityId) {
  if (cache.has(cityId)) return cache.get(cityId)

  const res = await fetch(`${API_BASE_URL}/api/places?city=${cityId}`)
  if (!res.ok) throw new Error(`No se pudieron cargar los lugares de ${cityId}`)

  const data = await res.json()
  cache.set(cityId, data)
  return data
}

export function clearPlacesCache() {
  cache.clear()
}

// Envía un reporte desde el sitio público (no requiere sesión de admin)
export async function submitReport(report) {
  const res = await fetch(`${API_BASE_URL}/api/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
  })
  if (!res.ok) throw new Error('No se pudo enviar el reporte')
  return res.json()
}

// --- Dashboard admin (requieren token) ---

function authHeaders() {
  const token = localStorage.getItem('kidguide_admin_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error('Credenciales inválidas')
  return res.json()
}

export async function fetchAllPlacesAdmin() {
  const res = await fetch(`${API_BASE_URL}/api/places/admin/all`, { headers: authHeaders() })
  if (!res.ok) throw new Error('No autorizado')
  return res.json()
}

export async function createPlace(place) {
  const res = await fetch(`${API_BASE_URL}/api/places`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(place),
  })
  if (!res.ok) throw new Error('No se pudo crear el lugar')
  return res.json()
}

export async function updatePlace(id, place) {
  const res = await fetch(`${API_BASE_URL}/api/places/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(place),
  })
  if (!res.ok) throw new Error('No se pudo actualizar el lugar')
  return res.json()
}

export async function deletePlace(id) {
  const res = await fetch(`${API_BASE_URL}/api/places/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('No se pudo eliminar el lugar')
  return res.json()
}

export async function fetchReports() {
  const res = await fetch(`${API_BASE_URL}/api/reports`, { headers: authHeaders() })
  if (!res.ok) throw new Error('No se pudieron cargar los reportes')
  return res.json()
}

// Cambia el estado de un reporte: 'pending' | 'reviewed' | 'resolved'
export async function updateReportStatus(id, status) {
  const res = await fetch(`${API_BASE_URL}/api/reports/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error('No se pudo actualizar el reporte')
  return res.json()
}

// --- Destacado del día / Planes de hoy (Automático vs Manual) ---

const settingsCache = new Map()

// Público — lo consume el sitio para saber si debe usar el algoritmo
// automático o mostrar lo que el admin eligió a mano.
export async function fetchCitySettings(city) {
  if (settingsCache.has(city)) return settingsCache.get(city)
  const res = await fetch(`${API_BASE_URL}/api/settings/${city}`)
  if (!res.ok) throw new Error(`No se pudo cargar la configuración de ${city}`)
  const data = await res.json()
  settingsCache.set(city, data)
  return data
}

export function clearCitySettingsCache() {
  settingsCache.clear()
}

// Protegido — solo el dashboard admin puede guardar cambios
export async function updateCitySettings(city, settings) {
  const res = await fetch(`${API_BASE_URL}/api/settings/${city}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(settings),
  })
  if (!res.ok) throw new Error('No se pudo guardar la configuración')
  return res.json()
}

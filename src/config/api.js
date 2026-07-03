// URL del backend en Railway. Configúrala como variable de entorno en
// Cloudflare Pages: VITE_API_URL = https://tu-proyecto.up.railway.app
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

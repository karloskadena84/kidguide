// Cuenta de Cloudinary donde se guardan las fotos reales de los lugares.
// Configura estas dos como variables de entorno en Cloudflare Pages:
//   VITE_CLOUDINARY_CLOUD_NAME = el "Cloud name" que ves en tu dashboard de Cloudinary
//   VITE_CLOUDINARY_UPLOAD_PRESET = el nombre del upload preset "unsigned" que crees
export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ''
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || ''

export function isCloudinaryConfigured() {
  return Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET)
}

/**
 * Sube un archivo de imagen directamente desde el navegador a Cloudinary
 * (sin pasar por nuestro backend) usando un upload preset "unsigned".
 * Devuelve { url, publicId } listos para guardar en el lugar.
 */
export async function uploadImageToCloudinary(file) {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary no está configurado (faltan las variables VITE_CLOUDINARY_*).')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  formData.append('folder', 'kidguide-places')

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.error?.message || 'No se pudo subir la imagen a Cloudinary.')
  }

  const data = await res.json()

  // URL con transformaciones automáticas: recorte 800x600, calidad y formato óptimos
  const optimizedUrl = data.secure_url.replace(
    '/upload/',
    '/upload/w_800,h_600,c_fill,g_auto,q_auto,f_auto/'
  )

  return { url: optimizedUrl, publicId: data.public_id }
}

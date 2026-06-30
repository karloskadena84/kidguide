/**
 * KidGuide – Cloudflare Worker v3
 *
 * VARIABLES DE ENTORNO (Settings → Variables and Secrets):
 *   ANTHROPIC_API_KEY     → console.anthropic.com              (Secret)
 *   HF_API_KEY            → huggingface.co/settings/tokens     (Secret, opcional)
 *   DISCORD_WEBHOOK_URL   → discord.com/api/webhooks/...       (Secret)
 *
 * CÓMO CREAR EL DISCORD WEBHOOK:
 *   1. Abre Discord → tu servidor → canal de notificaciones
 *   2. Configuración del canal → Integraciones → Webhooks → Crear Webhook
 *   3. Copia la URL → pégala como DISCORD_WEBHOOK_URL en Worker → Settings → Variables
 *
 * RUTAS:
 *   POST /           → proxy Anthropic API
 *   POST /anthropic  → proxy Anthropic API
 *   POST /hf         → proxy HuggingFace Inference API
 *   POST /extract    → extrae datos de un lugar con Claude (URL o texto) — usa admin.html
 *   POST /report     → reporte de info incorrecta → Discord
 *   POST /suggest    → sugerencia de nuevo lugar  → Discord
 */

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age':       '86400',
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })

const REPORT_EMOJIS = {
  precio: '💰', horario: '🕐', direccion: '📌', edad: '👶', otro: '📝',
}

async function notifyDiscord(webhookUrl, embed) {
  if (!webhookUrl) return { ok: false, reason: 'No configurado' }
  try {
    const res = await fetch(webhookUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ embeds: [embed] }),
    })
    return { ok: res.ok, status: res.status }
  } catch (err) {
    return { ok: false, reason: err.message }
  }
}

function reportEmbed({ place, type, correct, source, hfCategory, confidence, priority }) {
  return {
    title:       `${REPORT_EMOJIS[type] || '📝'} Reporte de información incorrecta`,
    description: `**${place}**`,
    color:       0xDC2626,
    fields: [
      { name: 'Tipo de error',        value: type || '—',              inline: true  },
      { name: 'Información correcta', value: correct || '—',           inline: false },
      { name: 'Fuente del usuario',   value: source || 'No indicada',  inline: true  },
      { name: '🤗 Clasificación HF',  value: hfCategory || '—',        inline: true  },
      { name: '📊 Confianza HF',      value: `${confidence || 0}%`,    inline: true  },
      { name: '⚡ Prioridad',         value: priority || 'media',       inline: true  },
    ],
    footer:    { text: 'KidGuide · Reportes comunitarios' },
    timestamp: new Date().toISOString(),
  }
}

function suggestEmbed({ name, cat, zone, age, sched, free, price, desc, tip, hfFeedback, stars }) {
  const starsStr = '★'.repeat(stars || 3) + '☆'.repeat(5 - (stars || 3))
  return {
    title:       '💡 Nueva sugerencia de lugar',
    description: `**${name}**`,
    color:       0x059669,
    fields: [
      { name: '📂 Categoría',  value: cat  || '—',                     inline: true  },
      { name: '📍 Zona',       value: zone || '—',                     inline: true  },
      { name: '👶 Edad',       value: age  || '—',                     inline: true  },
      { name: '🕐 Horario',    value: sched || '—',                    inline: true  },
      { name: '💰 Precio',     value: free ? 'Gratis' : (price || '—'), inline: true },
      { name: '⭐ Estrellas',  value: starsStr,                        inline: true  },
      { name: '📝 Descripción',value: desc || '—',                     inline: false },
      { name: '💡 Tip',        value: tip  || '—',                     inline: false },
      { name: '🤖 Feedback IA',value: hfFeedback || '—',               inline: false },
    ],
    footer:    { text: 'KidGuide · Sugerencias comunitarias' },
    timestamp: new Date().toISOString(),
  }
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS })
    if (request.method !== 'POST')    return json({ error: 'Method not allowed' }, 405)

    const path = new URL(request.url).pathname

    try {

      // ── POST /extract ──────────────────────────────────────
      if (path === '/extract') {
        if (!env.ANTHROPIC_API_KEY)
          return json({ error: 'ANTHROPIC_API_KEY no configurada' }, 500)

        const { url, text, city = 'medellin', nextId = 9001 } = await request.json()

        if (!url && !text)
          return json({ error: 'Envía url o text' }, 400)

        let rawText = text || ''
        if (url) {
          try {
            const pageRes = await fetch(url, {
              headers: { 'User-Agent': 'Mozilla/5.0 (compatible; KidGuideBot/1.0)' },
              redirect: 'follow',
            })
            const html = await pageRes.text()
            rawText = html
              .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
              .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s+/g, ' ')
              .slice(0, 4000)
          } catch (err) {
            return json({ error: 'No se pudo obtener la URL: ' + err.message }, 400)
          }
        }

        const prompt = `Eres un asistente que extrae información de lugares para familias con niños en Colombia.

A partir del siguiente texto, extrae la información del lugar y devuelve ÚNICAMENTE un objeto JSON válido, sin texto adicional, sin markdown, sin explicaciones.

Texto:
${rawText.slice(0, 3000)}

Ciudad del lugar: ${city}
ID a asignar: ${nextId}

Devuelve exactamente este formato JSON (completa todos los campos, infiere los que no estén explícitos):
{
  "id": ${nextId},
  "name": "nombre del lugar",
  "cat": "parques | granjas | restaurantes | centros | actividades",
  "emoji": "un emoji que represente el lugar",
  "zone": "barrio o municipio",
  "age": "rango de edad ej: 2-12",
  "days": [0,1,2,3,4,5,6],
  "coords": [0, 0],
  "address": "dirección aproximada",
  "price": {
    "free": false,
    "label": "~$XX.000 o Gratis",
    "note": "nota adicional o vacío"
  },
  "tags": ["palabra1", "palabra2", "palabra3"],
  "sched": "horario legible ej: Mar-Dom · 9am-6pm",
  "desc": "descripción en máximo 15 palabras, amigable para padres",
  "tip": "consejo práctico en máximo 15 palabras",
  "stars": 4,
  "_needs_review": true
}

Reglas:
- cat solo puede ser: parques, granjas, restaurantes, centros, actividades
- days: array de números donde 0=Dom 1=Lun 2=Mar 3=Mié 4=Jue 5=Vie 6=Sáb
- coords siempre [0, 0]
- stars entre 1 y 5 según popularidad inferida
- desc y tip en español colombiano, sin mayúsculas innecesarias
- Devuelve SOLO el JSON, nada más`

        const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type':      'application/json',
            'x-api-key':         env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model:      'claude-sonnet-4-6',
            max_tokens: 1024,
            messages:   [{ role: 'user', content: prompt }],
          }),
        })

        const claudeData = await claudeRes.json()

        if (!claudeRes.ok || claudeData.type === 'error') {
          return json({
            ok:    false,
            error: 'Error de Claude API',
            detail: claudeData?.error?.message || JSON.stringify(claudeData),
          }, 500)
        }

        const rawOutput = claudeData?.content?.[0]?.text || ''

        try {
          // Claude a veces envuelve el JSON en ```json ... ``` — lo limpiamos
          const cleaned = rawOutput
            .trim()
            .replace(/^```(?:json)?[\s\r\n]*/i, '')
            .replace(/[\s\r\n]*```$/, '')
            .trim()
          const place = JSON.parse(cleaned)
          return json({
            ok:      true,
            city,
            place,
            message: '✅ Revisa coords, days, emoji y stars antes de agregar',
          })
        } catch {
          return json({
            ok:    false,
            error: 'Claude no devolvió JSON válido',
            raw:   rawOutput,
          }, 500)
        }
      }

      // ── POST /report ──────────────────────────────────────
      if (path === '/report') {
        const body = await request.json()
        const { place, type, correct, source, hfCategory, confidence, priority } = body

        if (!place || !type || !correct)
          return json({ error: 'Faltan campos: place, type, correct' }, 400)

        const dc = await notifyDiscord(env.DISCORD_WEBHOOK_URL,
          reportEmbed({ place, type, correct, source, hfCategory, confidence, priority }))

        if (!dc.ok) console.error('Discord /report failed:', dc)

        return json({
          ok:      true,
          saved:   dc.ok,
          message: dc.ok ? '✅ Reporte enviado al equipo' : '✅ Reporte recibido (notificación pendiente)',
        })
      }

      // ── POST /suggest ─────────────────────────────────────
      if (path === '/suggest') {
        const body = await request.json()
        const { name, cat, zone, age, sched, free, price, desc, tip, hfFeedback, stars } = body

        if (!name || !zone || !desc)
          return json({ error: 'Faltan campos: name, zone, desc' }, 400)

        const dc = await notifyDiscord(env.DISCORD_WEBHOOK_URL,
          suggestEmbed({ name, cat, zone, age, sched, free, price, desc, tip, hfFeedback, stars }))

        if (!dc.ok) console.error('Discord /suggest failed:', dc)

        return json({
          ok:      true,
          saved:   dc.ok,
          message: dc.ok ? '✅ Sugerencia enviada al equipo' : '✅ Sugerencia recibida (notificación pendiente)',
        })
      }

      // ── POST /hf ──────────────────────────────────────────
      if (path === '/hf') {
        const { model, inputs, parameters } = await request.json()

        if (!model || !inputs) return json({ error: 'model y inputs requeridos' }, 400)

        const hfHeaders = { 'Content-Type': 'application/json' }
        if (env.HF_API_KEY) hfHeaders['Authorization'] = `Bearer ${env.HF_API_KEY}`

        const hfRes = await fetch(
          `https://api-inference.huggingface.co/models/${model}`,
          { method: 'POST', headers: hfHeaders, body: JSON.stringify({ inputs, parameters }) }
        )

        if (hfRes.status === 503) {
          const err = await hfRes.json()
          return json({ error: 'model_loading', estimated_time: err.estimated_time || 20 }, 503)
        }

        return json(await hfRes.json(), hfRes.status)
      }

      // ── POST / o /anthropic ───────────────────────────────
      if (path === '/' || path === '/anthropic' || path === '') {
        if (!env.ANTHROPIC_API_KEY)
          return json({ error: 'ANTHROPIC_API_KEY no configurada' }, 500)

        const body = await request.json()
        const res  = await fetch('https://api.anthropic.com/v1/messages', {
          method:  'POST',
          headers: {
            'Content-Type':      'application/json',
            'x-api-key':         env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify(body),
        })

        return json(await res.json(), res.status)
      }

      return json({ error: 'Ruta no encontrada' }, 404)

    } catch (error) {
      console.error('Worker error:', error)
      return json({ error: 'Worker error', detail: error.message }, 500)
    }
  },
}

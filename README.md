# 🗺️ KidGuide Colombia

Directorio de planes y actividades para familias con niños en Colombia. **[guiame.pages.dev](https://guiame.pages.dev/)**

> Planes para niños, momentos que importan.

---

## ✨ Features

- 📍 **83 lugares** verificados en Medellín, Bogotá, Cali y Cartagena
- 🎲 **Aleatorización diaria** — el grid y los destacados cambian de orden cada día (mismo orden para todos los usuarios ese día)
- ⭐ **Recomendado del día** — un lugar destacado con gradiente de categoría
- 🌦️ **Clima en tiempo real** — Open-Meteo con sistema de 3 capas (fallback local → cache → API), 6 temas visuales con fondo animado sutil (18% opacidad)
- 🗺️ **Mapa interactivo** con marcadores por categoría
- 🔍 **Filtros combinados** — categoría, gratis, abierto hoy, búsqueda por texto
- 📝 **Reportes y sugerencias** → Discord + clasificación con Claude
- 🤖 **Extractor con IA** (`/admin.html`) — pega una URL o texto y Claude genera el bloque de datos del lugar
- 📱 **Compartible** — Open Graph optimizado para WhatsApp/redes

---

## 🏗️ Stack

- **Frontend**: Vue 3 (Composition API) + Vite
- **Estilos**: SCSS con sistema de diseño "Warm Companion"
- **Hosting**: Cloudflare Pages
- **Backend**: Cloudflare Worker (proxy de Anthropic + HuggingFace + Discord)
- **Clima**: Open-Meteo API (gratuita, sin key)
- **IA**: Claude (extracción de datos, moderación) + HuggingFace (clasificación)

---

## 📂 Estructura

```
src/
  App.vue                    # raíz: filtros, tabs, ciudad activa
  main.js
  components/
    TheHeader.vue            # logo, selector de ciudad, búsqueda
    PlaceCard.vue            # tarjeta de lugar en el grid
    PlaceModal.vue           # modal de detalle con mapa y "cómo llegar"
    TodayCTA.vue             # scroll horizontal "Planes para hoy" (8 cards)
    FeaturedDailyCard.vue    # recomendado del día
    WeatherBanner.vue        # banner de clima con temperatura
    WeatherBackground.vue    # fondo animado según clima
    MapView.vue              # vista de mapa con marcadores
    ReportForm.vue           # formulario de reporte → Discord + Claude
    SupportBanner.vue
    TheFooter.vue
  composables/
    usePlaces.js             # filtrado + shuffle diario (seed por fecha)
    useWeather.js             # clima con 3 capas de fallback
  data/
    categories.js            # 5 categorías, ciudades, días
    index.js                 # getPlacesForCity(cityId)
    places_medellin.js       # 41 lugares
    places_bogota.js         # 26 lugares
    places_cali.js           #  7 lugares
    places_cartagena.js      #  9 lugares
  styles/
    _variables.scss          # tokens de diseño
    _mixins.scss
    main.scss
public/
  admin.html                 # extractor de lugares con IA
  og-image.jpg                # imagen para compartir en redes
  _redirects                  # SPA fallback para Cloudflare Pages
worker.js                     # Cloudflare Worker (proxy de APIs)
```

---

## 🚀 Desarrollo local

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera /dist
```

---

## ☁️ Deploy

### Frontend (Cloudflare Pages)
```bash
npm run build
# Sube la carpeta /dist en Workers & Pages → guiame → Create deployment
```

### Backend (Cloudflare Worker)
```bash
# Workers & Pages → guiame-proxy → Edit code → pega worker.js → Deploy
```

### Variables de entorno requeridas

**Worker** (`Settings → Variables and Secrets`):
| Variable | Tipo | Origen |
|---|---|---|
| `ANTHROPIC_API_KEY` | Secret | console.anthropic.com |
| `HF_API_KEY` | Secret | huggingface.co/settings/tokens |
| `DISCORD_WEBHOOK_URL` | Secret | Discord → canal → Webhooks |

**Pages** (`Settings → Environment Variables`):
| Variable | Valor |
|---|---|
| `VITE_WORKER_URL` | `https://guiame-proxy.<tu-usuario>.workers.dev` |

---

## ➕ Agregar un lugar nuevo

**Opción A — manual**: edita `src/data/places_CIUDAD.js`, copia un bloque existente y completa los campos (ver estructura abajo).

**Opción B — con IA**: abre `https://guiame.pages.dev/admin.html`, pega una URL o texto del lugar, Claude completa los campos automáticamente. Revisa `coords`, `emoji`, `stars` y `tip` antes de pegar.

### Estructura de un lugar

```js
{
  id: 56,
  name: 'Nombre del lugar',
  cat: 'parques',              // parques | granjas | restaurantes | centros | actividades
  emoji: '🌳',
  zone: 'El Poblado',
  age: '2-12',
  days: [0,6],                 // 0=Dom 1=Lun 2=Mar 3=Mié 4=Jue 5=Vie 6=Sáb
  coords: [6.2100, -75.5700],  // lat, lng — verificado en Google Maps
  address: 'Cra. 43A #18-23',
  price: { free: false, label: '~$30.000', note: 'por persona' },
  tags: ['naturaleza', 'familia'],
  sched: 'Sáb–Dom · 9am–5pm',
  desc: 'Descripción corta de 1-2 frases.',
  tip: 'Consejo práctico para los papás.',
  stars: 4,
}
```

| Ciudad | Próximo ID disponible |
|---|---|
| Medellín | 56 |
| Bogotá | 1055 |
| Cali | 2008 |
| Cartagena | 3010 |

---

## 📜 Licencia

Proyecto privado — Carlos Cadena ([@karloskadena84](https://github.com/karloskadena84))

export const CATEGORIES = [
  { id: 'all',          label: 'Todos',              icon: '✨', color: '#7C3AED', light: '#EDE9FE' },
  { id: 'parques',      label: 'Parques & Museos',   icon: '🌳', color: '#059669', light: '#D1FAE5' },
  { id: 'granjas',      label: 'Granjas & Animales', icon: '🐄', color: '#D97706', light: '#FEF3C7' },
  { id: 'restaurantes', label: 'Restaurantes',       icon: '🍽️', color: '#DC2626', light: '#FEE2E2' },
  { id: 'centros',      label: 'Entretenimiento',    icon: '🎠', color: '#2563EB', light: '#DBEAFE' },
  { id: 'actividades',  label: 'Actividades',        icon: '🎭', color: '#DB2777', light: '#FCE7F3' },
]

export const getCat = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[0]

export const CITIES = {
  medellin:   { name: 'Medellín',   emoji: '🏙️', active: true,  center: [6.2442, -75.5812], zoom: 12 },
  bogota:     { name: 'Bogotá',     emoji: '🌆', active: true,  center: [4.7110, -74.0721], zoom: 11 },
  cali:       { name: 'Cali',       emoji: '🌴', active: true,  center: [3.4516, -76.5320], zoom: 12 },
  cartagena:  { name: 'Cartagena',  emoji: '🏖️', active: true,  center: [10.3910,-75.4794], zoom: 12 },
}

export const DAY_NAMES = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']

// src/components/LangSelector.jsx
// Reusable language selector for admin content forms
export default function LangSelector({ value, onChange, className = '' }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Idioma / Language</span>
      <select
        value={value || 'all'}
        onChange={e => onChange(e.target.value)}
        className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7db8b3] bg-white"
      >
        <option value="all">🌐 Todos los idiomas</option>
        <option value="es">🇨🇴 Solo Español</option>
        <option value="en">🇺🇸 Solo Inglés</option>
      </select>
      <p className="text-xs text-gray-400">
        {value === 'es' && 'Este contenido solo aparecerá cuando el sitio esté en español.'}
        {value === 'en' && 'This content will only appear when the site is in English.'}
        {(!value || value === 'all') && 'Este contenido aparecerá en todos los idiomas.'}
      </p>
    </label>
  )
}

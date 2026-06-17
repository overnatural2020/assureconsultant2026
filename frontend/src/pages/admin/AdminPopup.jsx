// src/pages/admin/AdminPopup.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../lib/AuthContext.jsx'
import AccessDenied from '../../components/layout/AccessDenied.jsx'
import { entities } from '../../lib/api.js'
import { Settings, CheckCircle } from 'lucide-react'
import LangSelector from '../../components/LangSelector.jsx'
import TranslateDuplicateButton from '../../components/TranslateDuplicateButton.jsx'

const ALL_PAGES = [
  { key: 'inicio', label: 'Inicio' },
  { key: 'noticias', label: 'Noticias' },
  { key: 'recursos', label: 'Recursos' },
  { key: 'membresias', label: 'Membresías' },
  { key: 'comunidad', label: 'Comunidad' },
  { key: 'faqs', label: 'FAQs' },
  { key: 'ranking-consultores', label: 'Ranking' },
]

const FRECUENCIAS = [
  { value: 'always', label_es: 'Cada vez que carga la página', label_en: 'Every page load' },
  { value: 'session', label_es: 'Una vez por sesión', label_en: 'Once per session' },
  { value: 'once', label_es: 'Solo una vez (nunca más)', label_en: 'Only once (never again)' },
]

export default function AdminPopup() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const qc = useQueryClient()
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    activo: false,
    titulo: '',
    mensaje: '',
    boton_texto: 'Entrar',
    boton_url: '',
    lang: 'all',
    paginas: [],
    frecuencia: 'session',
    delay_ms: 1000,
  })

  const { data: config } = useQuery({ queryKey: ['config-popup'], queryFn: () => entities.config.getPopup() })

  useEffect(() => { if (config) setForm(f => ({ ...f, ...config, paginas: config.paginas || [] })) }, [config])

  const save = useMutation({
    mutationFn: (d) => entities.config.savePopup(d),
    onSuccess: () => { qc.invalidateQueries(['config-popup']); setSaved(true); setTimeout(() => setSaved(false), 3000) },
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const togglePagina = (key) => {
    setForm(f => ({
      ...f,
      paginas: f.paginas.includes(key) ? f.paginas.filter(p => p !== key) : [...f.paginas, key],
    }))
  }

  if (!user?.isAdmin) return <AccessDenied message={t('auth.admins_only')} />

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-7 h-7 text-[#00565f]" />
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.manage_popup')}</h1>
      </div>

      {saved && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-700 text-sm">
          <CheckCircle className="w-4 h-4" />{t('common.saved')}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        {/* Toggle activo */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800 text-sm">Popup Activo</p>
            <p className="text-gray-400 text-xs">Activar o desactivar el popup en todas las páginas</p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" checked={form.activo} onChange={e => set('activo', e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-[#00565f] transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Título</label>
          <input value={form.titulo} onChange={e => set('titulo', e.target.value)} placeholder="Título del popup" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7db8b3]" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Mensaje</label>
          <textarea rows={3} value={form.mensaje} onChange={e => set('mensaje', e.target.value)} placeholder="Escribe el mensaje que verán los consultores" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7db8b3] resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Texto del Botón</label>
            <input value={form.boton_texto} onChange={e => set('boton_texto', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7db8b3]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">URL de Destino</label>
            <input value={form.boton_url} onChange={e => set('boton_url', e.target.value)} placeholder="https://..." className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7db8b3]" />
          </div>
        </div>

        <div className="bg-white/10 border border-gray-100 rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Idioma en que aparece el popup</label>
          <LangSelector value={form.lang} onChange={v => set('lang', v)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Páginas donde mostrar el popup</label>
          <div className="flex flex-wrap gap-2">
            {ALL_PAGES.map(p => (
              <button
                key={p.key}
                onClick={() => togglePagina(p.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form.paginas.includes(p.key) ? 'bg-[#00565f] text-white border-[#00565f]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#7db8b3]'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Frecuencia de Aparición</label>
          <div className="space-y-2">
            {FRECUENCIAS.map(f => (
              <label key={f.value} className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="frecuencia" value={f.value} checked={form.frecuencia === f.value} onChange={() => set('frecuencia', f.value)} className="text-[#00565f]" />
                <span className="text-sm text-gray-700">{f.label_es}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Retraso antes de mostrar (ms)</label>
          <input type="number" value={form.delay_ms} onChange={e => set('delay_ms', parseInt(e.target.value))} min={0} max={10000} step={500} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7db8b3]" />
        </div>

        {config?.id && (
          <TranslateDuplicateButton
            entity="popup"
            id={config.id}
            currentLang={form.lang === 'all' ? 'es' : (form.lang || 'es')}
            onDone={() => qc.invalidateQueries(['config-popup'])}
          />
        )}

        <button
          onClick={() => save.mutate(form)}
          disabled={save.isPending}
          className="w-full py-2.5 rounded-lg font-semibold text-sm text-white hover:opacity-90 transition-all disabled:opacity-50"
          style={{ background: '#00565f' }}
        >
          {save.isPending ? t('common.loading') : t('common.save')}
        </button>
      </div>
    </div>
  )
}

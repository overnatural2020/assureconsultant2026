// src/pages/admin/AdminPrompt.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../lib/AuthContext.jsx'
import AccessDenied from '../../components/layout/AccessDenied.jsx'
import { entities } from '../../lib/api.js'
import { Zap, CheckCircle, AlertTriangle } from 'lucide-react'

const DEFAULT_INTRO = 'Eres el asistente virtual de Assure for Life, especializado en ayudar a consultores con información sobre productos, membresías, técnicas de venta y soporte general.'

const DEFAULT_INSTRUCTIONS = `### ROL
Eres el asistente virtual de Assure for Life, especializado en ayudar a consultores de ventas.

### COMPORTAMIENTO
- Responde siempre en el idioma en que te hablan (español o inglés)
- Sé conciso, claro y profesional
- Prioriza la información más reciente de la plataforma

### PRIORIZACIÓN DE INFORMACIÓN
1. PRIMERO: Usa información marcada como "INFORMACIÓN OFICIAL Y ACTUALIZADA DE LA PLATAFORMA"
2. LUEGO: Complementa con información adicional si es necesario
3. Si hay conflicto entre fuentes, SIEMPRE prioriza la información oficial

### LÍMITES
- Solo responde preguntas relacionadas con Assure for Life
- Si no sabes algo, dilo honestamente
- No inventes información sobre precios o coberturas`

export default function AdminPrompt() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const qc = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ introduccion: DEFAULT_INTRO, instrucciones: DEFAULT_INSTRUCTIONS })

  const { data: config } = useQuery({ queryKey: ['config-prompt'], queryFn: () => entities.config.getPrompt() })

  useEffect(() => {
    if (config?.introduccion) setForm({ introduccion: config.introduccion, instrucciones: config.instrucciones || DEFAULT_INSTRUCTIONS })
  }, [config])

  const save = useMutation({
    mutationFn: (d) => entities.config.savePrompt(d),
    onSuccess: () => { qc.invalidateQueries(['config-prompt']); setSaved(true); setEditing(false); setTimeout(() => setSaved(false), 3000) },
  })

  if (!user?.isAdmin) return <AccessDenied message={t('auth.admins_only')} />

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Zap className="w-7 h-7 text-[#00565f]" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.manage_prompt')}</h1>
          <p className="text-gray-400 text-sm">Personaliza el comportamiento y las instrucciones del asistente virtual.</p>
        </div>
      </div>

      {saved && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-700 text-sm">
          <CheckCircle className="w-4 h-4" />{t('common.saved')}
        </div>
      )}

      <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 text-amber-800 text-sm">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>Los cambios en el prompt pueden tardar hasta 15 minutos en aplicarse completamente.</p>
      </div>

      {!editing ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">Configuración Actual</h2>
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90"
              style={{ background: '#00565f' }}
            >
              Editar Configuración
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Introducción del Asistente</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{form.introduccion || DEFAULT_INTRO}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Instrucciones</p>
              <pre className="text-xs text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap font-mono overflow-auto max-h-64">{form.instrucciones || DEFAULT_INSTRUCTIONS}</pre>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="font-bold text-gray-800">Editar Configuración</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Introducción del Asistente</label>
            <p className="text-xs text-gray-400 mb-2">Define quién es el asistente y cuál es su objetivo principal</p>
            <textarea
              rows={3}
              value={form.introduccion}
              onChange={e => setForm(f => ({ ...f, introduccion: e.target.value }))}
              placeholder="Ej: Eres el asistente virtual de Assure for Life..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7db8b3] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Instrucciones del Asistente</label>
            <p className="text-xs text-gray-400 mb-2">Instrucciones detalladas sobre cómo debe comportarse. Puedes usar Markdown para formato.</p>
            <textarea
              rows={14}
              value={form.instrucciones}
              onChange={e => setForm(f => ({ ...f, instrucciones: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7db8b3] resize-none font-mono"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => save.mutate(form)}
              disabled={save.isPending}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 hover:opacity-90"
              style={{ background: '#00565f' }}
            >
              {save.isPending ? t('common.loading') : t('common.save')}
            </button>
            <button onClick={() => setEditing(false)} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50">
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

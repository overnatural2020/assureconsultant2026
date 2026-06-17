// src/pages/admin/AdminJWT.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../lib/AuthContext.jsx'
import AccessDenied from '../../components/layout/AccessDenied.jsx'
import { entities } from '../../lib/api.js'
import { Key, CheckCircle, AlertTriangle, Copy, Check, Eye, EyeOff } from 'lucide-react'

export default function AdminJWT() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const qc = useQueryClient()
  const [form, setForm] = useState({ activo: false, jwt_secret: '', web_pass: '', mensaje_acceso_denegado: t('auth.access_denied') })
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showSecret, setShowSecret] = useState(false)

  const { data: config, isLoading } = useQuery({
    queryKey: ['config-jwt'],
    queryFn: () => entities.config.getJWT(),
  })

  useEffect(() => {
    if (config) setForm(f => ({ ...f, ...config }))
  }, [config])

  const save = useMutation({
    mutationFn: (data) => entities.config.saveJWT(data),
    onSuccess: () => { qc.invalidateQueries(['config-jwt']); setSaved(true); setTimeout(() => setSaved(false), 3000) },
  })

  const copyExample = () => {
    const url = `${window.location.origin}/?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjb25zdWx0YW50V2ViUGF0aCI6Ii9hc3N1cmUtZm9yLWxpZmUtY29uc3VsdGFudCIsIm5vbWJyZSI6IkpvaG4gRG9lIiwidGVsZWZvbm8iOiIxMjM0NTY3ODkiLCJ1c2VybmFtZSI6ImpvaG5kb2UiLCJyZWFsRW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwibml2ZWwiOiJDb25zdWx0b3IgU2VuaW9yIn0.SIGNATURE`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!user?.isSuperAdmin) return <AccessDenied message={t('auth.admins_only')} />

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Key className="w-7 h-7 text-[#00565f]" />
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.manage_jwt')}</h1>
      </div>

      {saved && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-700 text-sm">
          <CheckCircle className="w-4 h-4" /> {t('common.saved')}
        </div>
      )}

      <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 text-amber-800 text-sm">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p><strong>Importante:</strong> La validación JWT se realiza en el servidor. Guarda el secret de forma segura.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800 text-sm">JWT Activo</p>
            <p className="text-gray-400 text-xs">{t('auth.access_denied')}</p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" checked={form.activo} onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-[#00565f] transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">JWT Secret *</label>
          <div className="relative">
            <input
              type={showSecret ? 'text' : 'password'}
              value={form.jwt_secret}
              onChange={e => setForm(f => ({ ...f, jwt_secret: e.target.value }))}
              placeholder="Ingresa el secret para validar JWT"
              className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7db8b3]"
            />
            <button type="button" onClick={() => setShowSecret(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Web Pass (Opcional)</label>
          <input
            type="text"
            value={form.web_pass}
            onChange={e => setForm(f => ({ ...f, web_pass: e.target.value }))}
            placeholder="Campo adicional de seguridad si es requerido"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7db8b3]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Mensaje de Acceso Denegado</label>
          <textarea
            rows={2}
            value={form.mensaje_acceso_denegado}
            onChange={e => setForm(f => ({ ...f, mensaje_acceso_denegado: e.target.value }))}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7db8b3] resize-none"
          />
        </div>

        <button
          onClick={() => save.mutate(form)}
          disabled={save.isPending}
          className="w-full py-2.5 rounded-lg font-semibold text-sm text-white hover:opacity-90 transition-all disabled:opacity-50"
          style={{ background: '#00565f' }}
        >
          {save.isPending ? t('common.loading') : t('common.save')}
        </button>
      </div>

      {/* JWT structure info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-bold text-gray-800 mb-4 text-sm">Estructura del JWT</h2>
        <p className="text-gray-500 text-xs mb-3">El JWT debe contener estas variables:</p>
        <div className="bg-gray-50 rounded-lg p-4 font-mono text-xs space-y-1 mb-4">
          <p><span className="text-[#00565f]">consultantWebPath</span>: "/assure-for-life-consultant"</p>
          <p><span className="text-[#00565f]">nombre</span>: "John Doe"</p>
          <p><span className="text-[#00565f]">telefono</span>: "1234567890"</p>
          <p><span className="text-[#00565f]">username</span>: "johndoe"</p>
          <p><span className="text-[#00565f]">realEmail</span>: "john@example.com"</p>
          <p><span className="text-[#00565f]">nivel</span>: "Consultor Senior"</p>
        </div>
        <p className="text-gray-500 text-xs mb-2">URL de Ejemplo:</p>
        <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between gap-2">
          <code className="text-xs text-gray-600 break-all">{window.location.origin}/?token=JWT_TOKEN_HERE</code>
          <button onClick={copyExample} className="flex-shrink-0 text-[#00565f] hover:text-[#7db8b3] transition-colors">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}

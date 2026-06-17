// src/pages/admin/AdminAnthropicKey.jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../lib/AuthContext.jsx'
import AccessDenied from '../../components/layout/AccessDenied.jsx'
import { entities } from '../../lib/api.js'
import { Key, Save, Eye, EyeOff, CheckCircle } from 'lucide-react'

export default function AdminAnthropicKey() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [newKey, setNewKey] = useState('')
  const [show, setShow] = useState(false)
  const [saved, setSaved] = useState(false)

  const { data } = useQuery({
    queryKey: ['anthropic-key'],
    queryFn: () => entities.config.getAnthropicKey(),
  })

  const save = useMutation({
    mutationFn: () => entities.config.saveAnthropicKey(newKey),
    onSuccess: () => {
      qc.invalidateQueries(['anthropic-key'])
      setNewKey('')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    },
  })

  if (!user?.isAdmin) return <AccessDenied />

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Key className="w-6 h-6 text-[#00565f]" />
          <h1 className="text-2xl font-bold text-[#00565f]" style={{ fontFamily: "'Arca Majora 3', sans-serif" }}>
            API Key de Anthropic
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Key actual (enmascarada)</p>
            <p className="font-mono text-sm bg-gray-50 rounded-lg px-4 py-3 text-gray-700 border border-gray-200">
              {data?.api_key || '— sin configurar —'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva API Key</label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={newKey}
                onChange={e => setNewKey(e.target.value)}
                placeholder="sk-ant-api03-..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#7db8b3]"
              />
              <button
                type="button"
                onClick={() => setShow(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Puedes obtener tu API key en <span className="font-mono">console.anthropic.com</span>
            </p>
          </div>

          <button
            onClick={() => save.mutate()}
            disabled={!newKey.trim() || save.isPending}
            className="flex items-center gap-2 bg-[#00565f] hover:bg-[#00565f]/90 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
          >
            {saved
              ? <><CheckCircle className="w-4 h-4" /> Guardada</>
              : <><Save className="w-4 h-4" /> Guardar API Key</>}
          </button>

          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
            <strong>Uso:</strong> Esta key se usa para traducir automáticamente el contenido gestionado (noticias, recursos, reconocimientos, ranking y popup) cuando haces clic en "Duplicar en otro idioma" desde el panel admin.
          </div>
        </div>
      </div>
    </div>
  )
}

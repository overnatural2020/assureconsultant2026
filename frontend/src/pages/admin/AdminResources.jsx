// src/pages/admin/AdminResources.jsx
import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../lib/AuthContext.jsx'
import AccessDenied from '../../components/layout/AccessDenied.jsx'
import { entities, uploadFile } from '../../lib/api.js'
import { Plus, Pencil, Trash2, X, CheckCircle, Upload, Loader2 } from 'lucide-react'
import LangSelector from '../../components/LangSelector.jsx'
import TranslateDuplicateButton from '../../components/TranslateDuplicateButton.jsx'

const TIPOS = [
  { value: 'material_ventas', label: 'Soy un Consultor nuevo' },
  { value: 'video_capacitacion', label: 'Quiero vender' },
  { value: 'plantilla_digital', label: 'Deseo crecer' },
]

const BOTONES = ['Descargar', 'Ver video', 'Abrir', 'Acceder']

const EMPTY = {
  titulo: '', descripcion: '', tipo: 'material_ventas', imagen_url: '',
  archivo_url: '', texto_boton: 'Descargar', seccion: 'consultores',
  fecha: new Date().toISOString().split('T')[0], lang: 'all',
}

function ResourceModal({ initial, onSave, onClose, loading }) {
  const [form, setForm] = useState(initial || EMPTY)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const fileInputRef = useRef(null)
  const imgInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)

  const handleFileUpload = async (file, field, setLoading) => {
    if (!file) return
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const r = await fetch('/api/upload', { method: 'POST', body: fd })
      const { url } = await r.json()
      set(field, url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-[#00565f] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-white">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-bold">{initial?.id ? 'Editar Recurso' : 'Nuevo Recurso'}</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título *</label>
            <input
              value={form.titulo}
              onChange={e => set('titulo', e.target.value)}
              placeholder="Nombre del recurso"
              className="w-full px-3 py-2.5 rounded-lg bg-[#00565f] border border-white/30 text-white placeholder-white/50 text-sm focus:outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              rows={2}
              value={form.descripcion}
              onChange={e => set('descripcion', e.target.value)}
              placeholder="Descripción breve"
              className="w-full px-3 py-2.5 rounded-lg bg-[#00565f] border border-white/30 text-white placeholder-white/50 text-sm focus:outline-none focus:border-white resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select
                value={form.tipo}
                onChange={e => set('tipo', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#00565f] border border-white/30 text-white text-sm focus:outline-none focus:border-white"
              >
                {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Texto del Botón</label>
              <select
                value={form.texto_boton}
                onChange={e => set('texto_boton', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#00565f] border border-white/30 text-white text-sm focus:outline-none focus:border-white"
              >
                {BOTONES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Fecha</label>
            <input
              type="date"
              value={form.fecha}
              onChange={e => set('fecha', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-[#00565f] border border-white/30 text-white text-sm focus:outline-none focus:border-white"
            />
          </div>

          {/* Archivo */}
          <div>
            <label className="block text-sm font-medium mb-1">URL del Archivo / Enlace</label>
            <div className="flex gap-2">
              <input
                value={form.archivo_url}
                onChange={e => set('archivo_url', e.target.value)}
                placeholder="https://... o sube un archivo"
                className="flex-1 px-3 py-2.5 rounded-lg bg-[#00565f] border border-white/30 text-white placeholder-white/50 text-sm focus:outline-none focus:border-white"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? 'Subiendo...' : 'Subir'}
              </button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={e => handleFileUpload(e.target.files?.[0], 'archivo_url', setUploading)} />
            </div>
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium mb-1">Imagen (miniatura)</label>
            <div className="flex gap-2">
              <input
                value={form.imagen_url}
                onChange={e => set('imagen_url', e.target.value)}
                placeholder="https://... o sube una imagen"
                className="flex-1 px-3 py-2.5 rounded-lg bg-[#00565f] border border-white/30 text-white placeholder-white/50 text-sm focus:outline-none focus:border-white"
              />
              <button
                type="button"
                onClick={() => imgInputRef.current?.click()}
                disabled={uploadingImg}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
              >
                {uploadingImg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploadingImg ? 'Subiendo...' : 'Subir'}
              </button>
              <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e.target.files?.[0], 'imagen_url', setUploadingImg)} />
            </div>
            {form.imagen_url && (
              <img src={form.imagen_url} alt="preview" className="h-24 rounded-lg object-cover mt-2 border border-white/20" />
            )}
          </div>

          <div className="bg-white/10 rounded-xl p-4">
            <LangSelector value={form.lang} onChange={v => set('lang', v)} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg text-sm font-medium border border-white/30 text-white hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSave(form)}
              disabled={loading || !form.titulo.trim()}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-white text-[#00565f] hover:bg-white/90 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminResources() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(null)
  const [success, setSuccess] = useState(false)

  if (!user?.isAdmin) return <AccessDenied />

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['recursos-admin'],
    queryFn: () => entities.resources.list({}),
  })

  const showSuccess = () => { setSuccess(true); setTimeout(() => setSuccess(false), 3000) }

  const create = useMutation({
    mutationFn: (d) => entities.resources.create(d),
    onSuccess: () => { qc.invalidateQueries(['recursos-admin']); setCreating(false); showSuccess() },
  })

  const update = useMutation({
    mutationFn: ({ id, ...d }) => entities.resources.update(id, d),
    onSuccess: () => { qc.invalidateQueries(['recursos-admin']); setEditing(null); showSuccess() },
  })

  const remove = useMutation({
    mutationFn: (id) => entities.resources.delete(id),
    onSuccess: () => { qc.invalidateQueries(['recursos-admin']); showSuccess() },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="w-10 h-10 bg-[#7db8b3]/20 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-[#7db8b3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#00565f]">Gestión de Recursos</h1>
            <p className="text-sm text-gray-500">{items.length} recursos</p>
          </div>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90"
            style={{ background: '#00565f' }}
          >
            <Plus className="w-4 h-4" /> Nuevo Recurso
          </button>
        </div>
      </div>

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-700 text-sm">
          <CheckCircle className="w-4 h-4" /> Guardado correctamente
        </div>
      )}

      {isLoading && <div className="flex justify-center py-10"><div className="w-7 h-7 border-2 border-[#00565f] border-t-transparent rounded-full animate-spin" /></div>}

      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            {(item.imagen || item.imagen_url)
              ? <img src={item.imagen || item.imagen_url} alt={item.titulo} className="w-16 h-14 object-cover rounded-lg flex-shrink-0" />
              : <div className="w-16 h-14 rounded-lg bg-[#7db8b3]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#7db8b3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
            }
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs px-2 py-0.5 rounded-full border border-[#00565f]/30 text-[#00565f]">
                  {TIPOS.find(t => t.value === item.tipo)?.label || item.tipo}
                </span>
                {item.lang && item.lang !== 'all' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                    {item.lang === 'es' ? '🇨🇴 ES' : '🇺🇸 EN'}
                  </span>
                )}
                {item.fecha && <span className="text-xs text-gray-400">{item.fecha.split('-').reverse().join('/')}</span>}
              </div>
              <p className="font-semibold text-gray-800 text-sm truncate">{item.titulo}</p>
              {item.descripcion && <p className="text-xs text-gray-400 truncate mt-0.5">{item.descripcion}</p>}
            </div>
            <div className="flex items-center gap-1">
              <TranslateDuplicateButton
                entity="resources"
                id={item.id}
                currentLang={item.lang === 'all' ? 'es' : (item.lang || 'es')}
                onDone={() => qc.invalidateQueries(['recursos-admin'])}
              />
              <button
                onClick={() => setEditing({ ...item, archivo_url: item.archivo_url || item.url || '', imagen_url: item.imagen || item.imagen_url || '' })}
                className="p-2 rounded-lg text-[#7db8b3] hover:bg-[#daedf0] transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => { if (confirm('¿Eliminar este recurso?')) remove.mutate(item.id) }}
                className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {!isLoading && items.length === 0 && (
          <p className="text-gray-400 text-center py-10">No hay recursos. Crea el primero.</p>
        )}
      </div>

      {creating && <ResourceModal onSave={(d) => create.mutate(d)} onClose={() => setCreating(false)} loading={create.isPending} />}
      {editing && <ResourceModal initial={editing} onSave={(d) => update.mutate({ id: editing.id, ...d })} onClose={() => setEditing(null)} loading={update.isPending} />}
    </div>
  )
}

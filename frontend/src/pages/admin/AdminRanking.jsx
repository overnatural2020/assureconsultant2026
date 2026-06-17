// src/pages/admin/AdminRanking.jsx
import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../lib/AuthContext.jsx'
import AccessDenied from '../../components/layout/AccessDenied.jsx'
import { entities, uploadFile } from '../../lib/api.js'
import { Plus, Pencil, Trash2, CheckCircle, Upload, Loader2, X } from 'lucide-react'
import LangSelector from '../../components/LangSelector.jsx'
import TranslateDuplicateButton from '../../components/TranslateDuplicateButton.jsx'

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function PhotoUpload({ value, onChange }) {
  const ref = useRef(null)
  const [uploading, setUploading] = useState(false)
  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try { const res = await uploadFile(file); onChange(res.url) }
    finally { setUploading(false) }
  }
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium mb-1">Foto</label>
      <div className="flex gap-2 items-center">
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="URL de foto"
          className="flex-1 px-3 py-2.5 rounded-lg bg-[#00565f] border border-white/30 text-white placeholder-white/50 text-sm focus:outline-none focus:border-white"
        />
        <button type="button" onClick={() => ref.current?.click()} disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-2.5 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex-shrink-0">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Subiendo...' : 'Subir'}
        </button>
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      {value && <img src={value} alt="preview" className="h-16 w-16 rounded-full object-cover border border-white/20 mt-1" />}
    </div>
  )
}

function RankingModal({ initial, onSave, onClose, loading }) {
  const [form, setForm] = useState(initial || {
    nombre: '', foto_url: '', nivel: '', ventas: '', posicion: '',
    mes: '', año: new Date().getFullYear(), lang: 'all',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-[#00565f] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto text-white">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-bold">{initial?.id ? 'Editar entrada de Ranking' : 'Nueva entrada de Ranking'}</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <input
                value={form.nombre}
                onChange={e => set('nombre', e.target.value)}
                placeholder="Ej: Margorlyn Henry"
                className="w-full px-3 py-2.5 rounded-lg bg-[#00565f] border border-white/30 text-white placeholder-white/50 text-sm focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nivel / título</label>
              <input
                value={form.nivel}
                onChange={e => set('nivel', e.target.value)}
                placeholder="Ej: Consultor Senior"
                className="w-full px-3 py-2.5 rounded-lg bg-[#00565f] border border-white/30 text-white placeholder-white/50 text-sm focus:outline-none focus:border-white"
              />
            </div>
          </div>

          <PhotoUpload value={form.foto_url} onChange={v => set('foto_url', v)} />

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Posición</label>
              <input
                value={form.posicion}
                onChange={e => set('posicion', e.target.value)}
                type="number"
                placeholder="1"
                className="w-full px-3 py-2.5 rounded-lg bg-[#00565f] border border-white/30 text-white placeholder-white/50 text-sm focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ventas</label>
              <input
                value={form.ventas}
                onChange={e => set('ventas', e.target.value)}
                type="number"
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-lg bg-[#00565f] border border-white/30 text-white placeholder-white/50 text-sm focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Año</label>
              <input
                value={form.año}
                onChange={e => set('año', e.target.value)}
                type="number"
                placeholder="2026"
                className="w-full px-3 py-2.5 rounded-lg bg-[#00565f] border border-white/30 text-white placeholder-white/50 text-sm focus:outline-none focus:border-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mes</label>
            <select
              value={form.mes}
              onChange={e => set('mes', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-[#00565f] border border-white/30 text-white text-sm focus:outline-none focus:border-white"
            >
              <option value="">Seleccionar mes</option>
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
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
              disabled={loading || !form.nombre}
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

function posIcon(pos) {
  if (pos === 1) return '🥇'
  if (pos === 2) return '🥈'
  if (pos === 3) return '🥉'
  return `#${pos}`
}

export default function AdminRanking() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!user?.isAdmin) return <AccessDenied message="Esta página es solo para administradores." />

  const { data: items = [], isLoading } = useQuery({ queryKey: ['ranking-admin'], queryFn: () => entities.ranking.list() })

  const showSuccess = () => { setSuccess(true); setTimeout(() => setSuccess(false), 3000) }
  const onSuccess = () => { qc.invalidateQueries(['ranking-admin']); qc.invalidateQueries(['ranking']); setEditing(null); setCreating(false); showSuccess() }
  const create = useMutation({ mutationFn: (d) => entities.ranking.create(d), onSuccess })
  const update = useMutation({ mutationFn: ({ id, ...d }) => entities.ranking.update(id, d), onSuccess })
  const del = useMutation({ mutationFn: (id) => entities.ranking.delete(id), onSuccess })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="w-10 h-10 bg-[#7db8b3]/20 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-[#7db8b3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#00565f]">Gestión de Ranking</h1>
            <p className="text-sm text-gray-500">{items.length} entradas</p>
          </div>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90"
            style={{ background: '#00565f' }}
          >
            <Plus className="w-4 h-4" /> Nueva entrada
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
            <span className="text-xl w-8 text-center flex-shrink-0">{posIcon(item.posicion)}</span>
            {item.foto_url
              ? <img src={item.foto_url} alt={item.nombre} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              : <div className="w-10 h-10 rounded-full bg-[#7db8b3]/20 flex items-center justify-center flex-shrink-0 text-[#7db8b3] font-bold">{item.nombre?.[0]}</div>
            }
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                {item.nivel && (
                  <span className="text-xs px-2 py-0.5 rounded-full border border-[#00565f]/30 text-[#00565f]">{item.nivel}</span>
                )}
                {item.lang && item.lang !== 'all' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                    {item.lang === 'es' ? '🇨🇴 ES' : '🇺🇸 EN'}
                  </span>
                )}
                {item.mes && <span className="text-xs text-gray-400">{item.mes} {item.año}</span>}
              </div>
              <p className="font-semibold text-gray-800 text-sm truncate">{item.nombre}</p>
              {item.ventas && <p className="text-xs text-gray-400">{item.ventas} ventas</p>}
            </div>
            <div className="flex items-center gap-1">
              <TranslateDuplicateButton
                entity="ranking"
                id={item.id}
                currentLang={item.lang === 'all' ? 'es' : (item.lang || 'es')}
                onDone={() => qc.invalidateQueries(['ranking-admin'])}
              />
              <button onClick={() => { setEditing(item); setCreating(false) }} className="p-2 rounded-lg text-[#7db8b3] hover:bg-[#daedf0] transition-colors"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => { if (confirm('¿Eliminar?')) del.mutate(item.id) }} className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {!isLoading && items.length === 0 && <p className="text-gray-400 text-center py-10">No hay entradas en el ranking aún.</p>}
      </div>

      {creating && <RankingModal onSave={(d) => create.mutate(d)} onClose={() => setCreating(false)} loading={create.isPending} />}
      {editing && <RankingModal initial={editing} onSave={(d) => update.mutate({ id: editing.id, ...d })} onClose={() => setEditing(null)} loading={update.isPending} />}
    </div>
  )
}

// src/pages/admin/AdminUsers.jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../lib/AuthContext.jsx'
import AccessDenied from '../../components/layout/AccessDenied.jsx'
import { entities } from '../../lib/api.js'
import { Plus, Pencil, Trash2, CheckCircle, ShieldCheck, Edit3 } from 'lucide-react'

const ROLE_LABELS = { super_admin: 'Super Admin', editor: 'Editor' }
const ROLE_COLORS = { super_admin: { bg: '#00565f20', text: '#00565f' }, editor: { bg: '#7db8b320', text: '#00565f' } }

function RoleBadge({ role }) {
  const c = ROLE_COLORS[role] || ROLE_COLORS.editor
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: c.bg, color: c.text }}>
      {role === 'super_admin' ? <ShieldCheck className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
      {ROLE_LABELS[role] || role}
    </span>
  )
}

function Form({ initial, onSave, onCancel, loading, isSelf }) {
  const [form, setForm] = useState(initial || { username: '', nombre: '', password: '', role: 'editor', activo: true })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const isEdit = !!initial?.id

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 space-y-4">
      <h2 className="font-bold text-gray-800">{isEdit ? 'Editar' : 'Crear'} usuario administrador</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Usuario *</label>
          <input
            value={form.username}
            onChange={e => set('username', e.target.value)}
            placeholder="Ej: maria.garcia"
            disabled={isEdit}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7db8b3] disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre completo *</label>
          <input
            value={form.nombre}
            onChange={e => set('nombre', e.target.value)}
            placeholder="Ej: María García"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7db8b3]"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {isEdit ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
          </label>
          <input
            type="password"
            value={form.password}
            onChange={e => set('password', e.target.value)}
            placeholder={isEdit ? 'Nueva contraseña...' : 'Contraseña segura'}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7db8b3]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rol *</label>
          <select
            value={form.role}
            onChange={e => set('role', e.target.value)}
            disabled={isSelf}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7db8b3] disabled:bg-gray-50"
          >
            <option value="editor">Editor — gestión de contenido</option>
            <option value="super_admin">Super Admin — acceso completo</option>
          </select>
          {isSelf && <p className="text-xs text-amber-600">No puedes cambiar tu propio rol</p>}
        </div>
      </div>
      {isEdit && (
        <div className="flex items-center gap-2">
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" checked={form.activo} onChange={e => set('activo', e.target.checked)} className="sr-only peer" disabled={isSelf} />
            <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-[#00565f] transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
          </label>
          <span className="text-sm text-gray-600">Usuario activo</span>
          {isSelf && <span className="text-xs text-amber-600">(no puedes desactivarte a ti mismo)</span>}
        </div>
      )}
      <div className="flex gap-3">
        <button
          onClick={() => onSave(form)}
          disabled={loading || !form.nombre || !form.username || (!isEdit && !form.password)}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: '#00565f' }}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
        <button onClick={onCancel} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200">
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default function AdminUsers() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [success, setSuccess] = useState('')

  if (!user?.isSuperAdmin) return <AccessDenied message="Esta sección es exclusiva para Super Administradores." />

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => entities.adminUsers.list(),
  })

  const onSuccess = (msg) => {
    qc.invalidateQueries(['admin-users'])
    setEditing(null)
    setCreating(false)
    setSuccess(msg)
    setTimeout(() => setSuccess(''), 3000)
  }

  const create = useMutation({ mutationFn: (d) => entities.adminUsers.create(d), onSuccess: () => onSuccess('Usuario creado correctamente') })
  const update = useMutation({ mutationFn: ({ id, ...d }) => entities.adminUsers.update(id, d), onSuccess: () => onSuccess('Usuario actualizado') })
  const del = useMutation({
    mutationFn: (id) => entities.adminUsers.delete(id),
    onSuccess: () => onSuccess('Usuario eliminado'),
    onError: (err) => setSuccess('Error: ' + (err.response?.data?.error || 'No se pudo eliminar')),
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-400 text-sm mt-0.5">Administradores con acceso al panel</p>
        </div>
        {!creating && !editing && (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: '#00565f' }}
          >
            <Plus className="w-4 h-4" /> Crear usuario
          </button>
        )}
      </div>

      {success && (
        <div className={`mb-4 rounded-lg p-3 flex items-center gap-2 text-sm border ${success.startsWith('Error') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
          <CheckCircle className="w-4 h-4" /> {success}
        </div>
      )}

      {/* Role descriptions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-[#00565f]" />
            <span className="font-semibold text-sm text-[#00565f]">Super Admin</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">Acceso completo: contenido, configuración, JWT, documentos del asistente y gestión de usuarios.</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Edit3 className="w-4 h-4 text-[#7db8b3]" />
            <span className="font-semibold text-sm text-[#7db8b3]">Editor</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">Gestión de contenido: noticias, recursos, reconocimientos, ranking y popup. Sin acceso a configuración ni usuarios.</p>
        </div>
      </div>

      {creating && (
        <Form
          onSave={(d) => create.mutate(d)}
          onCancel={() => setCreating(false)}
          loading={create.isPending}
        />
      )}
      {editing && (
        <Form
          initial={editing}
          onSave={(d) => update.mutate({ id: editing.id, ...d })}
          onCancel={() => setEditing(null)}
          loading={update.isPending}
          isSelf={editing.id === user?.userId}
        />
      )}

      {isLoading && (
        <div className="flex justify-center py-10">
          <div className="w-7 h-7 border-2 border-[#00565f] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className="space-y-3">
        {users.map(u => (
          <div key={u.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-sm" style={{ background: '#00565f' }}>
              {u.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-800 text-sm">{u.nombre}</p>
                <RoleBadge role={u.role} />
                {!u.activo && <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Inactivo</span>}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">@{u.username}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => { setEditing(u); setCreating(false) }}
                className="p-2 rounded-lg text-[#7db8b3] hover:bg-[#daedf0]"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => { if (confirm(`¿Eliminar a ${u.nombre}?`)) del.mutate(u.id) }}
                className="p-2 rounded-lg text-red-400 hover:bg-red-50"
                disabled={u.id === user?.userId}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {!isLoading && users.length === 0 && (
          <p className="text-gray-400 text-center py-10">No hay usuarios administradores.</p>
        )}
      </div>
    </div>
  )
}

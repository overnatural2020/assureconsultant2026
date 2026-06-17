// src/pages/admin/AdminLogin.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext.jsx'
import api from '../../lib/api.js'
import { Lock } from 'lucide-react'

const LOGO = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6907ccd9d7dc18fba4a28df9/4b3b99f35_LogoAssurefondoblanco.png'

export default function AdminLogin() {
  const { adminLogin } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/admin-login', form)
      adminLogin(res.token, res.user)
      navigate('/paneladmin', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] p-6">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-10">
        <div className="text-center mb-8">
          <img src={LOGO} alt="Assure For Life" className="h-12 w-auto mx-auto mb-4 opacity-80" />
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#00565f20' }}>
            <Lock className="w-7 h-7 text-[#00565f]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Arca Majora 3', sans-serif" }}>
            Panel de Administración
          </h1>
          <p className="text-gray-400 text-sm mt-1">Acceso exclusivo para administradores</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Usuario</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="Ingresa tu usuario"
              required
              autoFocus
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7db8b3]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Ingresa tu contraseña"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7db8b3]"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-semibold text-sm text-white transition-all disabled:opacity-50"
            style={{ background: '#00565f' }}
          >
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}

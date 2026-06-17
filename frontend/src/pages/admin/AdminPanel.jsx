// src/pages/admin/AdminPanel.jsx
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../lib/AuthContext.jsx'
import AccessDenied from '../../components/layout/AccessDenied.jsx'
import { Newspaper, BookOpen, Trophy, Settings, FileText, Key, Zap, Database, LayoutDashboard, BarChart2, Users, ShieldCheck, Edit3 } from 'lucide-react'

const LOGO = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6907ccd9d7dc18fba4a28df9/4b3b99f35_LogoAssurefondoblanco.png'

const CONTENT_CARDS = [
  { label: 'Gestión de Noticias', url: '/admin/noticias', icon: Newspaper, color: '#00565f' },
  { label: 'Gestión de Recursos', url: '/admin/recursos', icon: BookOpen, color: '#7db8b3' },
  { label: 'Gestión de Reconocimientos', url: '/admin/reconocimientos', icon: Trophy, color: '#fcc46a' },
  { label: 'Gestión de Ranking', url: '/admin/ranking', icon: BarChart2, color: '#7db8b3' },
  { label: 'Gestión de Popup', url: '/admin/popup', icon: Settings, color: '#7db8b3' },
]

const SUPER_ADMIN_CARDS = [
  { label: 'Configuración JWT', url: '/admin/jwt', icon: Key, color: '#eb6e54' },
  { label: 'API Key de Anthropic', url: '/admin/anthropic-key', icon: ShieldCheck, color: '#7db8b3' },
  { label: 'Configuración del Asistente', url: '/admin/prompt', icon: Zap, color: '#00565f' },
  { label: 'Documentos del Asistente', url: '/admin/documentos', icon: FileText, color: '#fcc46a' },
  { label: 'Base de Conocimiento', url: '/admin/ingesta', icon: Database, color: '#00565f' },
  { label: 'Gestión de Usuarios', url: '/admin/usuarios', icon: Users, color: '#00565f' },
]

export default function AdminPanel() {
  const { user } = useAuth()

  if (!user?.isAdmin) return <AccessDenied message="Esta página es exclusiva para administradores." />

  const cards = user.isSuperAdmin ? [...CONTENT_CARDS, ...SUPER_ADMIN_CARDS] : CONTENT_CARDS

  const RoleBadge = () => (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#00565f20', color: '#00565f' }}>
      {user.isSuperAdmin ? <ShieldCheck className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
      {user.isSuperAdmin ? 'Super Admin' : 'Editor'}
    </span>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <img src={LOGO} alt="Assure For Life" className="h-10 w-auto" />
          <div className="h-10 w-px bg-gray-200" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-[#00565f]" />
              Panel de Administración
            </h1>
            <p className="text-gray-400 text-sm">Assure For Life Consultant</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-700">{user.nombre}</p>
            <p className="text-xs text-gray-400">@{user.username}</p>
          </div>
          <RoleBadge />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map(card => {
          const Icon = card.icon
          return (
            <Link
              key={card.url}
              to={card.url}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md hover:border-[#7db8b3] transition-all duration-200 group"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: card.color + '20' }}
              >
                <Icon className="w-6 h-6" style={{ color: card.color }} />
              </div>
              <span className="font-semibold text-gray-700 text-sm group-hover:text-[#00565f] transition-colors">{card.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

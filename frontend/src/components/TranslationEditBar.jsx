// src/components/TranslationEditBar.jsx
// Floating bar visible only to admins when language !== 'es'
import { useTranslation } from 'react-i18next'
import { useTranslationEdit } from '../lib/TranslationEditContext.jsx'
import { useAuth } from '../lib/AuthContext.jsx'
import { Languages, Pencil, EyeOff, CheckCircle } from 'lucide-react'

export default function TranslationEditBar() {
  const { i18n } = useTranslation()
  const { user } = useAuth()
  const ctx = useTranslationEdit()

  // Only show for admins when not in Spanish
  if (!user?.isAdmin || i18n.language === 'es' || !ctx) return null

  const { editMode, toggleEditMode, editedCount, saving } = ctx

  return (
    <div
      className="fixed bottom-5 right-5 z-[9998] flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-xl border text-sm font-medium select-none"
      style={{
        background: editMode ? '#00565f' : '#fff',
        borderColor: editMode ? '#00565f' : '#d1d5db',
        color: editMode ? '#fff' : '#374151',
      }}
    >
      <Languages className="w-4 h-4 flex-shrink-0" style={{ color: editMode ? '#7db8b3' : '#6b7280' }} />
      <span className="hidden sm:inline" style={{ color: editMode ? '#fff' : '#6b7280' }}>
        {editMode ? 'Modo edición activo' : 'Editar traducciones EN'}
      </span>

      {editedCount > 0 && (
        <span
          className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold"
          style={{ background: editMode ? '#7db8b3' : '#00565f', color: '#fff' }}
        >
          <CheckCircle className="w-3 h-3" />
          {editedCount} editada{editedCount !== 1 ? 's' : ''}
        </span>
      )}

      {saving && (
        <span className="text-xs opacity-70">Guardando…</span>
      )}

      <button
        onClick={toggleEditMode}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
        style={{
          background: editMode ? 'rgba(255,255,255,0.15)' : '#00565f',
          color: '#fff',
        }}
        title={editMode ? 'Desactivar modo edición' : 'Activar modo edición'}
      >
        {editMode
          ? <><EyeOff className="w-3.5 h-3.5" /> Desactivar</>
          : <><Pencil className="w-3.5 h-3.5" /> Activar</>
        }
      </button>
    </div>
  )
}

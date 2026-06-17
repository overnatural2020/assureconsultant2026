// src/components/EditableT.jsx
// Usage: <EditableT k="nav.home" /> instead of {t('nav.home')}
// In edit mode (admin + non-ES), shows an inline edit popover on click.
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useTranslationEdit } from '../lib/TranslationEditContext.jsx'
import { Pencil, Check, X, RotateCcw } from 'lucide-react'

export default function EditableT({ k, className, style, tag: Tag = 'span' }) {
  const { t, i18n } = useTranslation()
  const ctx = useTranslationEdit()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)
  const wrapRef = useRef(null)

  const text = t(k)
  const canEdit = ctx?.editMode && ctx?.canEdit

  useEffect(() => {
    if (open) {
      setDraft(text)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open, text])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (!canEdit) return <Tag className={className} style={style}>{text}</Tag>

  const isOverridden = ctx.isOverridden(k)

  const handleSave = async () => {
    if (draft.trim() === '') return
    await ctx.saveTranslation(k, draft.trim())
    setOpen(false)
  }

  const handleRevert = async () => {
    const { en } = await import('../i18n/translations.js')
    const parts = k.split('.')
    let def = en
    for (const p of parts) def = def?.[p]
    await ctx.revertTranslation(k, def || text)
    setOpen(false)
  }

  return (
    <Tag
      ref={wrapRef}
      className={`relative inline-block group cursor-pointer ${className || ''}`}
      style={style}
    >
      {/* Text + pencil icon */}
      <span
        className={`inline-block rounded transition-all ${open ? 'ring-2 ring-[#eb6e54] bg-[#eb6e54]/10' : 'hover:ring-2 hover:ring-[#eb6e54]/60 hover:bg-[#eb6e54]/5'} px-0.5`}
        onClick={() => setOpen(true)}
      >
        {text}
        <Pencil
          className={`inline-block ml-1 mb-0.5 transition-opacity ${open ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`}
          style={{ width: '0.7em', height: '0.7em', color: '#eb6e54' }}
        />
        {isOverridden && !open && (
          <span className="inline-block ml-1 w-1.5 h-1.5 rounded-full bg-[#eb6e54] mb-1" title="Traducción editada" />
        )}
      </span>

      {/* Edit popover */}
      {open && (
        <div
          className="absolute z-[9999] top-full left-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 min-w-[280px] max-w-[380px]"
          style={{ fontSize: '14px', fontFamily: 'system-ui, sans-serif', fontWeight: 'normal', color: '#374151' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded flex-1 truncate">{k}</span>
            {isOverridden && (
              <button
                onClick={handleRevert}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                title="Revertir a la traducción por defecto"
              >
                <RotateCcw className="w-3 h-3" /> Revertir
              </button>
            )}
          </div>
          <textarea
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave() } if (e.key === 'Escape') setOpen(false) }}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#eb6e54]/50"
            rows={2}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setOpen(false)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <X className="w-3 h-3" /> Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={ctx.saving}
              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg text-white font-semibold transition-colors"
              style={{ background: '#eb6e54' }}
            >
              <Check className="w-3 h-3" /> Guardar
            </button>
          </div>
        </div>
      )}
    </Tag>
  )
}

// src/lib/TranslationEditContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from './AuthContext.jsx'
import api from './api.js'

const Ctx = createContext(null)

export function TranslationEditProvider({ children }) {
  const { i18n } = useTranslation()
  const { user } = useAuth()
  const [editMode, setEditMode] = useState(false)
  const [overrides, setOverrides] = useState({}) // { lang: { key: value } }
  const [saving, setSaving] = useState(false)

  const lang = i18n.language

  // Load overrides for a given language from backend and apply to i18n
  const loadOverrides = useCallback(async (language) => {
    try {
      const data = await api.get(`/translations/${language}`)
      if (Object.keys(data).length === 0) return
      // Merge overrides into i18n resource bundle
      const bundle = i18n.getResourceBundle(language, 'translation') || {}
      const merged = deepMergeKeys(bundle, data)
      i18n.addResourceBundle(language, 'translation', merged, true, true)
      setOverrides(prev => ({ ...prev, [language]: data }))
    } catch {
      // fail silently
    }
  }, [i18n])

  // Load on mount and on language change
  useEffect(() => {
    loadOverrides(lang)
  }, [lang, loadOverrides])

  // Only admins can enter edit mode, and only on non-Spanish languages
  const canEdit = user?.isAdmin && lang !== 'es'

  const toggleEditMode = useCallback(() => {
    if (!canEdit) return
    setEditMode(v => !v)
  }, [canEdit])

  const saveTranslation = useCallback(async (key, value) => {
    if (!canEdit) return
    setSaving(true)
    try {
      await api.put('/translations', { lang, key, value })
      // Apply immediately to i18n
      const bundle = i18n.getResourceBundle(lang, 'translation') || {}
      const merged = deepMergeKeys(bundle, { [key]: value })
      i18n.addResourceBundle(lang, 'translation', merged, true, true)
      setOverrides(prev => ({
        ...prev,
        [lang]: { ...(prev[lang] || {}), [key]: value },
      }))
      // Force i18n to re-render subscribers
      i18n.emit('languageChanged', lang)
    } finally {
      setSaving(false)
    }
  }, [canEdit, lang, i18n])

  const revertTranslation = useCallback(async (key, defaultValue) => {
    if (!canEdit) return
    try {
      await api.delete('/translations', { lang, key })
      const bundle = i18n.getResourceBundle(lang, 'translation') || {}
      const merged = deepMergeKeys(bundle, { [key]: defaultValue })
      i18n.addResourceBundle(lang, 'translation', merged, true, true)
      setOverrides(prev => {
        const copy = { ...(prev[lang] || {}) }
        delete copy[key]
        return { ...prev, [lang]: copy }
      })
      i18n.emit('languageChanged', lang)
    } catch {}
  }, [canEdit, lang, i18n])

  const isOverridden = useCallback((key) => {
    return !!(overrides[lang]?.[key] !== undefined)
  }, [overrides, lang])

  const editedCount = Object.keys(overrides[lang] || {}).length

  return (
    <Ctx.Provider value={{ editMode, toggleEditMode, canEdit, saveTranslation, revertTranslation, isOverridden, editedCount, saving }}>
      {children}
    </Ctx.Provider>
  )
}

export function useTranslationEdit() {
  return useContext(Ctx)
}

// Merge flat-key overrides (e.g. "nav.home" = "Home") into nested i18n bundle
function deepMergeKeys(bundle, flatOverrides) {
  const result = JSON.parse(JSON.stringify(bundle))
  Object.entries(flatOverrides).forEach(([flatKey, value]) => {
    const parts = flatKey.split('.')
    let obj = result
    for (let i = 0; i < parts.length - 1; i++) {
      if (!obj[parts[i]] || typeof obj[parts[i]] !== 'object') obj[parts[i]] = {}
      obj = obj[parts[i]]
    }
    obj[parts[parts.length - 1]] = value
  })
  return result
}

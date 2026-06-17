// src/components/TranslateDuplicateButton.jsx
import { useState } from 'react'
import { Languages, Loader2 } from 'lucide-react'
import { entities } from '../lib/api.js'

export default function TranslateDuplicateButton({ entity, id, currentLang, onDone }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const targetLang = currentLang === 'en' ? 'es' : 'en'
  const targetLabel = targetLang === 'en' ? 'inglés' : 'español'

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      const res = await entities.translateDuplicate(entity, id, targetLang)
      onDone?.(res.newId, targetLang)
    } catch (e) {
      setError(e?.response?.data?.error || 'Error al traducir')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-md border border-[#7db8b3] text-[#00565f] bg-white hover:bg-[#7db8b3]/10 font-medium text-sm transition-colors disabled:opacity-60"
      >
        {loading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <Languages className="w-4 h-4" />}
        {loading ? 'Traduciendo...' : `Duplicar en ${targetLabel}`}
      </button>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  )
}

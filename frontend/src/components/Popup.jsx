// src/components/Popup.jsx
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { entities } from '../lib/api.js'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const STORAGE_KEY = 'assure_popup_seen'

export default function Popup() {
  const [visible, setVisible] = useState(false)
  const location = useLocation()
  const { i18n } = useTranslation()
  const lang = i18n.language

  const { data: config } = useQuery({
    queryKey: ['config-popup-public', lang],
    queryFn: () => entities.config.getPublicPopup(lang),
    retry: false,
    onError: () => {},
  })

  useEffect(() => {
    if (!config?.activo) return

    const currentPage = location.pathname.replace('/', '') || 'inicio'
    const pages = config.paginas || []
    if (!pages.includes(currentPage)) return

    const frecuencia = config.frecuencia || 'session'

    // Check if should show based on frequency
    let shouldShow = false
    if (frecuencia === 'always') {
      shouldShow = true
    } else if (frecuencia === 'session') {
      shouldShow = !sessionStorage.getItem(STORAGE_KEY)
    } else if (frecuencia === 'once') {
      shouldShow = !localStorage.getItem(STORAGE_KEY)
    }

    if (!shouldShow) return

    const timer = setTimeout(() => setVisible(true), config.delay_ms || 1000)
    return () => clearTimeout(timer)
  }, [location.pathname, config])

  const close = () => {
    setVisible(false)
    const frecuencia = config?.frecuencia || 'session'
    if (frecuencia === 'session') sessionStorage.setItem(STORAGE_KEY, '1')
    if (frecuencia === 'once') localStorage.setItem(STORAGE_KEY, '1')
  }

  if (!visible || !config) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-300">
        <button
          onClick={close}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {config.titulo && (
          <h2 className="text-xl font-bold text-[#00565f] mb-3">{config.titulo}</h2>
        )}

        {config.mensaje && (
          <p className="text-gray-600 text-sm leading-relaxed mb-6">{config.mensaje}</p>
        )}

        <div className="flex gap-3">
          {config.boton_url ? (
            <a
              href={config.boton_url}
              onClick={close}
              className="flex-1 text-center py-2.5 rounded-xl font-semibold text-sm text-white hover:opacity-90 transition-all"
              style={{ background: '#00565f' }}
            >
              {config.boton_texto || 'Entrar'}
            </a>
          ) : (
            <button
              onClick={close}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white hover:opacity-90 transition-all"
              style={{ background: '#00565f' }}
            >
              {config.boton_texto || 'Entrar'}
            </button>
          )}
          <button
            onClick={close}
            className="px-4 py-2.5 rounded-xl font-semibold text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

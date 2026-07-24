// src/components/AccessibilityWidget.jsx
import { useState, useEffect, useRef } from 'react'
import {
  Accessibility, X, Plus, Minus, RotateCcw, Contrast, Droplet,
  Link2, Type, MousePointer2, Pause, AlignJustify,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const STORAGE_KEY = 'assure_a11y'
const FONT_STEPS = [100, 110, 125, 140]
// Each toggle maps to an `a11y-<key>` class applied on <html>; see index.css
const TOGGLES = [
  { key: 'contrast', icon: Contrast, labelKey: 'a11y.contrast' },
  { key: 'grayscale', icon: Droplet, labelKey: 'a11y.grayscale' },
  { key: 'links', icon: Link2, labelKey: 'a11y.links' },
  { key: 'readable', icon: Type, labelKey: 'a11y.readable' },
  { key: 'spacing', icon: AlignJustify, labelKey: 'a11y.spacing' },
  { key: 'bigcursor', icon: MousePointer2, labelKey: 'a11y.bigcursor' },
  { key: 'noanim', icon: Pause, labelKey: 'a11y.noanim' },
]

const DEFAULTS = { font: 0 }

export default function AccessibilityWidget() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)
  const [settings, setSettings] = useState(() => {
    try {
      return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
    } catch {
      return { ...DEFAULTS }
    }
  })

  // Apply settings to <html> and persist them
  useEffect(() => {
    const el = document.documentElement
    const step = FONT_STEPS[settings.font] ?? 100
    el.style.fontSize = step === 100 ? '' : `${step}%`
    TOGGLES.forEach(({ key }) => el.classList.toggle(`a11y-${key}`, !!settings[key]))
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch { /* storage may be unavailable */ }
  }, [settings])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const setFont = (dir) => setSettings(s => ({
    ...s,
    font: Math.min(FONT_STEPS.length - 1, Math.max(0, (s.font ?? 0) + dir)),
  }))
  const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }))
  const reset = () => setSettings({ ...DEFAULTS })

  const activeCount = TOGGLES.filter(({ key }) => settings[key]).length + (settings.font ? 1 : 0)
  const fontPct = FONT_STEPS[settings.font] ?? 100

  return (
    <div className="a11y-ui">
      {/* Floating launcher */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={t('a11y.open')}
        title={t('a11y.open')}
        className="fixed left-4 bottom-4 z-[9998] w-14 h-14 rounded-full bg-[#00565f] text-white shadow-lg
                   flex items-center justify-center hover:bg-[#7db8b3] focus:outline-none
                   focus:ring-4 focus:ring-[#eb6e54] transition-colors"
      >
        <Accessibility className="w-7 h-7" aria-hidden="true" />
        {activeCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full bg-[#eb6e54]
                       text-white text-xs font-bold flex items-center justify-center"
            aria-hidden="true"
          >
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label={t('a11y.title')}
          className="fixed left-4 bottom-20 z-[9999] w-[19rem] max-w-[calc(100vw-2rem)]
                     max-h-[75vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-gray-200"
        >
          <div className="flex items-center justify-between px-4 py-3 bg-[#00565f] text-white rounded-t-2xl sticky top-0">
            <h2 className="font-bold text-base flex items-center gap-2">
              <Accessibility className="w-5 h-5" aria-hidden="true" />
              {t('a11y.title')}
            </h2>
            <button
              onClick={() => setOpen(false)}
              aria-label={t('a11y.close')}
              className="p-1 rounded hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Text size */}
            <div>
              <p className="text-sm font-semibold text-[#00565f] mb-2">{t('a11y.font_size')}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFont(-1)}
                  disabled={settings.font === 0}
                  aria-label={t('a11y.decrease')}
                  className="flex-1 py-2 rounded-lg border border-[#00565f]/30 text-[#00565f] font-bold
                             hover:bg-[#00565f]/10 disabled:opacity-40 disabled:cursor-not-allowed
                             focus:outline-none focus:ring-2 focus:ring-[#eb6e54] flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" aria-hidden="true" />
                </button>
                <span
                  className="w-16 text-center text-sm font-bold text-[#00565f]"
                  aria-live="polite"
                >
                  {fontPct}%
                </span>
                <button
                  onClick={() => setFont(1)}
                  disabled={settings.font === FONT_STEPS.length - 1}
                  aria-label={t('a11y.increase')}
                  className="flex-1 py-2 rounded-lg border border-[#00565f]/30 text-[#00565f] font-bold
                             hover:bg-[#00565f]/10 disabled:opacity-40 disabled:cursor-not-allowed
                             focus:outline-none focus:ring-2 focus:ring-[#eb6e54] flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-2 gap-2">
              {TOGGLES.map(({ key, icon: Icon, labelKey }) => {
                const active = !!settings[key]
                return (
                  <button
                    key={key}
                    onClick={() => toggle(key)}
                    aria-pressed={active}
                    className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-lg border text-xs font-semibold
                                text-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#eb6e54] ${
                      active
                        ? 'bg-[#00565f] text-white border-[#00565f]'
                        : 'bg-white text-[#00565f] border-[#00565f]/30 hover:bg-[#00565f]/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    <span className="leading-tight">{t(labelKey)}</span>
                  </button>
                )
              })}
            </div>

            <button
              onClick={reset}
              className="w-full py-2.5 rounded-lg bg-[#eb6e54] text-white font-semibold text-sm
                         hover:bg-[#eb6e54]/90 focus:outline-none focus:ring-2 focus:ring-[#00565f]
                         flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              {t('a11y.reset')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

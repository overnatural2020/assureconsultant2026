// src/pages/Ranking.jsx
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { entities } from '../lib/api.js'
import { Trophy, Award, Medal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import EditableT from '../components/EditableT.jsx'

const RANK_CONFIG = [
  { bg: '#fcc46a', textColor: '#7a5a00', numBg: '#fff', numColor: '#7a5a00', Icon: Trophy },
  { bg: '#c8dfe0', textColor: '#00565f', numBg: '#fff', numColor: '#00565f', Icon: Medal },
  { bg: '#ede8e3', textColor: '#7a6a55', numBg: '#fff', numColor: '#7a6a55', Icon: Award },
]

function getConfig(pos) {
  return RANK_CONFIG[pos - 1] || { bg: '#f3f4f6', textColor: '#374151', numBg: '#e5e7eb', numColor: '#374151', Icon: Award }
}

const MONTHS_ORDER = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const MONTH_ES_TO_EN = {
  Enero: 'January', Febrero: 'February', Marzo: 'March', Abril: 'April',
  Mayo: 'May', Junio: 'June', Julio: 'July', Agosto: 'August',
  Septiembre: 'September', Octubre: 'October', Noviembre: 'November', Diciembre: 'December',
}

function groupByMonthYear(items) {
  const groups = {}
  items.forEach(r => {
    const key = `${r.año || ''}-${r.mes || ''}`
    if (!groups[key]) groups[key] = { mes: r.mes, año: r.año, items: [] }
    groups[key].items.push(r)
  })
  return Object.values(groups).sort((a, b) => {
    if (b.año !== a.año) return (b.año || 0) - (a.año || 0)
    return MONTHS_ORDER.indexOf(b.mes) - MONTHS_ORDER.indexOf(a.mes)
  })
}

export default function Ranking() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['ranking', lang],
    queryFn: () => entities.ranking.list({ lang }),
  })

  const groups = groupByMonthYear(items)

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="absolute top-[-2px] left-[-3px] w-[18px] h-[18px] bg-[#eb6e54] rounded-full z-0" />
            <h1 className="relative z-10 text-4xl md:text-5xl font-bold text-[#7db8b3]" style={{ fontFamily: "'Arca Majora 3', sans-serif" }}>
              <EditableT k="ranking.title" />
            </h1>
          </div>
          <span className="inline-block bg-[#fcc46a] text-[#00565f] font-bold px-6 py-2 text-base" style={{ borderRadius: '0.375rem' }}>
            <EditableT k="ranking.subtitle" />
          </span>
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#00565f] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <p className="text-center text-gray-400 py-20">{t('ranking.no_data')}</p>
        )}

        <div className="space-y-10">
          {groups.map(group => {
            const maxVentas = Math.max(...group.items.map(i => i.ventas || 0), 1)
            return (
              <div key={`${group.año}-${group.mes}`}>
                {(group.mes || group.año) && (
                  <p className="text-center text-gray-400 text-sm mb-6 font-medium">
                    {[(lang === 'en' && group.mes ? (MONTH_ES_TO_EN[group.mes] || group.mes) : group.mes), group.año].filter(Boolean).join(' ')}
                  </p>
                )}

                <div className="space-y-4">
                  {group.items.map(item => {
                    const pos = item.posicion || 1
                    const cfg = getConfig(pos)
                    const pct = maxVentas > 0 ? Math.round((item.ventas / maxVentas) * 100) : 0
                    const IconComp = cfg.Icon
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 px-5 py-4 rounded-2xl"
                        style={{ background: cfg.bg }}
                      >
                        {/* Position badge */}
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0"
                          style={{ background: cfg.numBg, color: cfg.numColor }}
                        >
                          #{pos}
                        </div>

                        {/* Icon */}
                        <div className="flex-shrink-0">
                          <IconComp className="w-8 h-8" style={{ color: cfg.textColor, opacity: 0.7 }} />
                        </div>

                        {/* Photo if available */}
                        {item.foto_url && (
                          <img src={item.foto_url} alt={item.nombre} className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-white/50" />
                        )}

                        {/* Name & ventas */}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-base leading-tight" style={{ color: cfg.textColor, fontFamily: "'Arca Majora 3', sans-serif" }}>
                            {item.nombre.toUpperCase()}
                          </p>
                          <p className="text-sm mt-0.5" style={{ color: cfg.textColor, opacity: 0.8 }}>
                            {item.ventas} {t('ranking.sales')}
                          </p>
                        </div>

                        {/* Progress bar */}
                        <div className="w-28 flex-shrink-0 text-right">
                          <div className="h-2 rounded-full bg-white/40 overflow-hidden mb-1">
                            <div
                              className="h-full rounded-full bg-[#eb6e54] transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold" style={{ color: cfg.textColor }}>{pct}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {!isLoading && items.length > 0 && (
          <>
            {/* Footer note */}
            <div className="mt-8 bg-[#daedf0] rounded-2xl px-6 py-4 text-center">
              <p className="text-[#00565f] font-medium" style={{ fontSize: '0.9375rem' }}>
                {t('ranking.footer_note')}
              </p>
            </div>

            {/* Back link */}
            <div className="text-center mt-6">
              <Link to="/comunidad" className="text-[#00565f] text-sm hover:underline">
                {t('ranking.back')}
              </Link>
            </div>
          </>
        )}

        {/* Logo */}
        <div className="flex justify-center mt-10">
          <img src="/logo.png" alt="Assure For Life" style={{ width: '120px', height: 'auto', opacity: 0.7 }} />
        </div>
      </div>
    </div>
  )
}

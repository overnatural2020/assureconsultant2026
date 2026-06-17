// src/pages/Reconocimientos.jsx
import { useQuery } from '@tanstack/react-query'
import { entities } from '../lib/api.js'
import { Award } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import EditableT from '../components/EditableT.jsx'

const MONTHS_ORDER = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function groupByMonthYear(recs) {
  const groups = {}
  recs.forEach(r => {
    const key = `${r.año || ''}-${r.mes || ''}`
    if (!groups[key]) groups[key] = { mes: r.mes, año: r.año, items: [] }
    groups[key].items.push(r)
  })
  return Object.values(groups).sort((a, b) => {
    if (b.año !== a.año) return (b.año || 0) - (a.año || 0)
    return MONTHS_ORDER.indexOf(b.mes) - MONTHS_ORDER.indexOf(a.mes)
  })
}

export default function Reconocimientos() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const { data: recs = [], isLoading } = useQuery({
    queryKey: ['recognitions', lang],
    queryFn: () => entities.recognitions.list({ lang }),
  })

  const groups = groupByMonthYear(recs)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 pt-8">
          <div className="block mb-4">
            <div className="relative inline-block">
              <div className="absolute top-[-2px] left-[-1px] w-[18px] h-[18px] bg-[#eb6e54] rounded-full z-0" />
              <h1
                className="relative z-10 text-5xl md:text-6xl font-bold text-[#7db8b3]"
                style={{ fontFamily: "'Arca Majora 3', sans-serif" }}
              >
                <EditableT k="recognitions.title" />
              </h1>
            </div>
          </div>
          <div className="block">
            <span className="inline-block bg-[#fcc46a] text-[#00565f] px-6 py-2 font-bold text-2xl rounded-md">
              <EditableT k="recognitions.subtitle" />
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10">
        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#00565f] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && recs.length === 0 && (
          <p className="text-center text-gray-400 py-20">No hay reconocimientos aún.</p>
        )}

        <div className="space-y-12">
          {groups.map(group => (
            <div key={`${group.año}-${group.mes}`}>
              {/* Month/Year header */}
              {(group.mes || group.año) && (
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-[#fcc46a] flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 text-[#00565f]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#00565f]" style={{ fontFamily: "'Arca Majora 3', sans-serif" }}>
                    {[group.mes, group.año].filter(Boolean).join(' ')}
                  </h2>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
              )}

              {/* Recognition cards */}
              <div className="space-y-5">
                {group.items.map(rec => (
                  <div
                    key={rec.id}
                    className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row"
                  >
                    {/* Left: card image */}
                    <div className="md:w-[280px] flex-shrink-0 bg-[#7db8b3] self-stretch">
                      {rec.imagen_card_url ? (
                        <img
                          src={rec.imagen_card_url}
                          alt={`Reconocimiento ${rec.nombre}`}
                          className="w-full h-full object-cover block"
                          style={{ minHeight: '300px' }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-white text-center" style={{ minHeight: '240px' }}>
                          {rec.foto_url && (
                            <img src={rec.foto_url} alt={rec.nombre} className="w-20 h-20 rounded-full object-cover border-4 border-white/40 mb-4" />
                          )}
                          <div className="relative inline-block mb-1">
                            <div className="absolute top-[-2px] left-[-3px] w-2.5 h-2.5 bg-[#eb6e54] rounded-full z-0" />
                            <p className="relative z-10 font-bold text-lg" style={{ fontFamily: "'Arca Majora 3', sans-serif" }}>Felicitaciones</p>
                          </div>
                          <p className="font-bold text-xl bg-[#00565f]/60 px-3 py-1 rounded" style={{ fontFamily: "'Arca Majora 3', sans-serif" }}>{rec.nombre}</p>
                        </div>
                      )}
                    </div>

                    {/* Right: text content */}
                    <div className="flex-1 p-6 flex flex-col justify-center">
                      <h3 className="text-xl font-bold text-[#00565f] mb-3" style={{ fontFamily: "'Arca Majora 3', sans-serif" }}>
                        ¡Felicitaciones, {rec.nombre}! 🎉
                      </h3>
                      {rec.nivel && (
                        <span className="inline-block bg-[#daedf0] text-[#00565f] text-xs font-semibold px-3 py-1 rounded-full w-fit mb-3">
                          {rec.nivel}
                        </span>
                      )}
                      {rec.descripcion && (
                        <div
                          className="text-gray-600 leading-relaxed mb-4 rich-content"
                          dangerouslySetInnerHTML={{ __html: rec.descripcion }}
                        />
                      )}
                      {rec.link_url && (
                        <p className="text-gray-700 text-sm">
                          👉 Conoce aquí el material compartido por {rec.nombre.split(' ')[0]}:{' '}
                          <a
                            href={rec.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#00565f] underline font-medium break-all hover:text-[#7db8b3] transition-colors"
                          >
                            {rec.link_url}
                          </a>
                        </p>
                      )}
                      {rec.ventas && (
                        <p className="mt-3 text-[#eb6e54] font-bold text-sm">{rec.ventas} ventas</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

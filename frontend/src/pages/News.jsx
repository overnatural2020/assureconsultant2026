// src/pages/News.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Newspaper } from 'lucide-react'
import api from '../lib/api.js'
import { useTranslation } from 'react-i18next'
import EditableT from '../components/EditableT.jsx'

const TABS = [
  { id: 'todas', key: 'news.tab_all' },
  { id: 'comunicado', key: 'news.tab_comunicado' },
  { id: 'campana', key: 'news.tab_campana' },
  { id: 'historia_exito', key: 'news.tab_historia' },
  { id: 'evento', key: 'news.tab_evento' },
  { id: 'motivacion', key: 'news.tab_motivacion' },
]

const TIPO_KEY = {
  comunicado: 'news.label_comunicado',
  campana: 'news.label_campana',
  historia_exito: 'news.label_historia',
  evento: 'news.label_evento',
  motivacion: 'news.label_motivacion',
}

const TIPO_COLOR = {
  comunicado: 'bg-[#00565f]/10 text-[#00565f]',
  campana: 'bg-[#eb6e54]/10 text-[#eb6e54]',
  historia_exito: 'bg-[#00565f]/20 text-[#00565f]',
  evento: 'bg-[#eb6e54]/20 text-[#eb6e54]',
  motivacion: 'bg-[#00565f]/15 text-[#00565f]',
}

export default function News() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [tab, setTab] = useState('todas')

  const { data: news = [], isLoading } = useQuery({
    queryKey: ['noticias', lang],
    queryFn: () => api.get('/news', { params: { lang } }),
  })

  const filtered = tab === 'todas' ? news : news.filter(n => n.tipo === tab)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-4">
            <div className="absolute top-[-2px] left-[7px] w-[18px] h-[18px] bg-[#eb6e54] rounded-full z-0" />
            <h1
              className="relative z-10 text-5xl md:text-6xl font-bold"
              style={{ fontFamily: "'Arca Majora 3', sans-serif" }}
            >
              <span className="text-[#7db8b3]"><EditableT k="news.header_prefix" /> </span><span className="text-[#00565f]"><EditableT k="news.title" /></span>
            </h1>
          </div>
          <div className="block">
            <span className="inline-block bg-[#fcc46a] text-[#00565f] px-6 py-2 font-bold text-2xl rounded-md">
              <EditableT k="news.subtitle" />
            </span>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          {TABS.map(tabItem => (
            <button
              key={tabItem.id}
              onClick={() => setTab(tabItem.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tab === tabItem.id
                  ? 'bg-[#00565f] text-white'
                  : 'border border-[#00565f]/30 text-[#00565f] bg-white hover:bg-[#00565f]/10'
              }`}
            >
              {t(tabItem.key)}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00565f]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Newspaper className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-[#00565f] mb-2">{t('news.empty_title')}</h3>
            <p className="text-gray-500">{t('news.empty_sub')}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(item => (
              <Link key={item.id} to={`/detalle-noticia/${item.id}`}>
                <div className="group overflow-hidden rounded-xl bg-white shadow hover:shadow-xl transition-all duration-300 h-full flex flex-col cursor-pointer">
                  {item.imagen_url && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.imagen_url}
                        alt={item.titulo}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      {item.tipo && (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${TIPO_COLOR[item.tipo] || 'bg-gray-100 text-gray-600'}`}>
                          {item.tipo in TIPO_KEY ? t(TIPO_KEY[item.tipo]) : item.tipo}
                        </span>
                      )}
                      {item.fecha && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.fecha).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-[#00565f] group-hover:text-[#00565f]/80 transition-colors line-clamp-2">
                      {item.titulo}
                    </h3>
                    {item.resumen && (
                      <p className="text-gray-600 text-sm line-clamp-3">{item.resumen}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

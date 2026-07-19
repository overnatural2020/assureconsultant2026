// src/pages/Resources.jsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, Play, Layout, BookOpen, Users, Download, ExternalLink, Video, X } from 'lucide-react'
import api from '../lib/api.js'
import { useTranslation } from 'react-i18next'
import EditableT from '../components/EditableT.jsx'

const BASE = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6907ccd9d7dc18fba4a28df9'
const LOGO = `${BASE}/19d163759_Disenopaginadelconsultorinicio-25.png`

const TIPO_ICON = {
  material_ventas: FileText,
  video_capacitacion: Play,
  plantilla_digital: Layout,
  manual_guia: BookOpen,
  equipo: Users,
}

const TIPO_COLOR = {
  material_ventas: 'bg-[#00565f] text-white',
  video_capacitacion: 'bg-[#eb6e54] text-white',
  plantilla_digital: 'bg-[#7db8b3] text-white',
  manual_guia: 'bg-[#fcc46a] text-[#7a5a00]',
  equipo: 'bg-purple-600 text-white',
}

const BOTON_ICON = {
  'Ver video': Play,
  'Descargar': Download,
  'Abrir': ExternalLink,
  'Acceder': ExternalLink,
}

const TABS = [
  { id: 'todos', labelKey: 'resources.tab_all', icon: FileText },
  { id: 'material_ventas', labelKey: 'resources.tab_sales', icon: FileText },
  { id: 'video_capacitacion', labelKey: 'resources.tab_training', icon: Video },
  { id: 'plantilla_digital', labelKey: 'resources.tab_templates', icon: Layout },
]

function ResourceCard({ recurso, onVerVideo }) {
  const { t } = useTranslation()
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const FallbackIcon = TIPO_ICON[recurso.tipo] || FileText
  const BtnIcon = BOTON_ICON[recurso.texto_boton] || Download
  const hasFile = recurso.archivo_url && recurso.archivo_url.trim() !== '' && recurso.archivo_url.trim() !== '#!'

  const tipoLabel = {
    material_ventas: t('resources.tab_sales'),
    video_capacitacion: t('resources.tab_training'),
    plantilla_digital: t('resources.tab_templates'),
    manual_guia: t('resources.tab_manuals'),
    equipo: t('resources.tab_team'),
  }

  return (
    <div className="group overflow-hidden rounded-2xl bg-white border border-gray-200 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      <div className="relative h-48 overflow-hidden bg-[#00565f] flex-shrink-0">
        {recurso.imagen && !imgError ? (
          <img
            src={recurso.imagen}
            alt={recurso.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            style={{ opacity: imgLoaded ? 1 : 0 }}
            onError={() => setImgError(true)}
            onLoad={() => setImgLoaded(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FallbackIcon className="w-16 h-16 text-white/30" />
          </div>
        )}
        {recurso.tipo && (
          <div className="absolute top-3 left-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TIPO_COLOR[recurso.tipo] || 'bg-gray-100 text-gray-600'}`}>
              {tipoLabel[recurso.tipo] || recurso.tipo}
            </span>
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-lg mb-2 text-[#00565f]">{recurso.titulo}</h3>
        {recurso.descripcion && (
          <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-2">{recurso.descripcion}</p>
        )}
        {recurso.texto_boton && recurso.texto_boton.trim() !== '' && (
          hasFile ? (
            recurso.texto_boton === 'Ver video' ? (
              <button
                className="w-full flex items-center justify-center gap-2 mt-auto bg-[#eb6e54] hover:bg-[#eb6e54]/90 text-white font-semibold py-2 rounded-md transition-colors"
                onClick={() => onVerVideo(recurso.archivo_url)}
              >
                <BtnIcon className="w-4 h-4" />
                {recurso.texto_boton}
              </button>
            ) : (
              <a href={recurso.archivo_url} target="_blank" rel="noopener noreferrer" className="mt-auto">
                <button className="w-full flex items-center justify-center gap-2 bg-[#eb6e54] hover:bg-[#eb6e54]/90 text-white font-semibold py-2 rounded-md transition-colors">
                  <BtnIcon className="w-4 h-4" />
                  {recurso.texto_boton}
                </button>
              </a>
            )
          ) : (
            <button disabled className="w-full flex items-center justify-center gap-2 mt-auto bg-gray-300 text-gray-500 font-semibold py-2 rounded-md cursor-not-allowed">
              <BtnIcon className="w-4 h-4" />
              {recurso.texto_boton}
            </button>
          )
        )}
      </div>
    </div>
  )
}

export default function Resources() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [activeTab, setActiveTab] = useState('todos')
  const [videoUrl, setVideoUrl] = useState(null)

  const { data: recursos = [], isLoading } = useQuery({
    queryKey: ['recursos', lang],
    queryFn: () => api.get('/resources', { params: { lang } }),
  })

  const consultorResources = recursos.filter(r => r.seccion === 'consultores' || r.seccion === 'ambos' || !r.seccion)
  const equipoResources = recursos.filter(r => r.seccion === 'equipo' || r.seccion === 'ambos')
  const filtered = activeTab === 'equipo'
    ? equipoResources
    : activeTab === 'todos'
      ? consultorResources
      : consultorResources.filter(r => r.tipo === activeTab)

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <div className="absolute top-[-2px] left-[52px] md:left-[7px] w-[18px] h-[18px] bg-[#eb6e54] rounded-full z-0" />
            <h1 className="relative z-10 text-5xl md:text-6xl font-bold" style={{ fontFamily: "'Arca Majora 3', sans-serif" }}>
              <span className="text-[#7db8b3]"><EditableT k="resources.header_prefix" /> </span><span className="text-[#00565f]"><EditableT k="resources.title" /></span>
            </h1>
          </div>
          <div className="block">
            <span className="inline-block bg-[#fcc46a] text-[#00565f] px-8 py-3 font-bold text-xl md:text-2xl rounded-2xl">
              <EditableT k="resources.subtitle" />
            </span>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="mb-8 flex flex-wrap gap-3">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const isEquipo = tab.id === 'equipo'
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md border font-medium text-sm transition-colors ${
                  isActive
                    ? isEquipo
                      ? 'bg-[#eb6e54] text-white border-[#eb6e54]'
                      : 'bg-[#00565f] text-white border-[#00565f]'
                    : 'bg-white text-[#00565f] border-[#00565f]/30 hover:bg-[#00565f]/10'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? '' : 'text-[#00565f]'}`} />
                <span>{t(tab.labelKey)}</span>
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="animate-in fade-in duration-300">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00565f]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-[#00565f]/30 mb-4" />
              <h3 className="text-lg font-semibold text-[#00565f] mb-2">{t('resources.empty_title')}</h3>
              <p className="text-gray-500">{t('resources.empty_sub')}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(r => (
                <ResourceCard key={r.id} recurso={r} onVerVideo={setVideoUrl} />
              ))}
            </div>
          )}
        </div>

        {/* Footer logo */}
        <div className="flex justify-center mt-16 pt-8 border-t border-gray-200">
          <img src={LOGO} alt="Assure for Life" className="h-16 w-auto" />
        </div>
      </div>

      {/* Video modal */}
      {videoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setVideoUrl(null)}>
          <div className="relative max-w-4xl w-full mx-4" onClick={e => e.stopPropagation()}>
            <button onClick={() => setVideoUrl(null)} className="absolute -top-10 right-0 text-white hover:text-gray-300">
              <X className="w-8 h-8" />
            </button>
            {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
              <iframe
                src={(() => {
                  try {
                    const u = new URL(videoUrl)
                    const id = u.searchParams.get('v') || u.pathname.split('/').filter(Boolean)[0]
                    return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`
                  } catch { return videoUrl }
                })()}
                className="w-full aspect-video rounded-lg"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <video src={videoUrl} controls autoPlay className="w-full rounded-lg" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

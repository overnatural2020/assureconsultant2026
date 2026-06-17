// src/pages/NewsDetail.jsx
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Calendar } from 'lucide-react'
import api from '../lib/api.js'

const TIPO_LABEL = {
  comunicado: 'Comunicado', campana: 'Campaña', historia_exito: 'Historia de Éxito', evento: 'Evento', motivacion: 'Motivación',
}

const YT_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^"&?\s<]+)/

function YoutubeEmbed({ url }) {
  const match = url.match(YT_REGEX)
  if (!match) return null
  const id = match[1]
  return (
    <div className="my-4 rounded-xl overflow-hidden aspect-video">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${id}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  )
}

const IFRAME_YT_RE = /<iframe[^>]*src="([^"]*(?:youtube\.com\/embed|youtu\.be)[^"]*)"[^>]*>.*?<\/iframe>/gi
const ANCHOR_YT_RE = /<a[^>]*href="([^"]*(?:youtube\.com|youtu\.be)[^"]*)"[^>]*>.*?<\/a>/gi

function extractYtId(url) {
  const m = url.match(YT_REGEX)
  return m?.[1] ?? null
}

function ContentRenderer({ html }) {
  if (!html) return null
  const parts = []
  const seenYt = new Set()

  // Build a unified list of matches (iframes + anchor links) sorted by position
  const matches = []
  let m
  const re1 = new RegExp(IFRAME_YT_RE.source, 'gi')
  const re2 = new RegExp(ANCHOR_YT_RE.source, 'gi')
  while ((m = re1.exec(html)) !== null) matches.push({ index: m.index, end: m.index + m[0].length, url: m[1] })
  while ((m = re2.exec(html)) !== null) matches.push({ index: m.index, end: m.index + m[0].length, url: m[1] })
  matches.sort((a, b) => a.index - b.index)

  let last = 0
  for (const match of matches) {
    if (match.index < last) continue // overlapping, skip
    if (match.index > last) parts.push({ type: 'html', content: html.slice(last, match.index) })
    const id = extractYtId(match.url)
    if (id && !seenYt.has(id)) {
      seenYt.add(id)
      parts.push({ type: 'yt', url: match.url })
    }
    last = match.end
  }
  if (last < html.length) parts.push({ type: 'html', content: html.slice(last) })

  return (
    <>
      {parts.map((p, i) =>
        p.type === 'yt'
          ? <YoutubeEmbed key={i} url={p.url} />
          : <div key={i} className="prose prose-slate max-w-none text-gray-700 leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: p.content }} />
      )}
    </>
  )
}

export default function NewsDetail() {
  const { id } = useParams()

  const { data: item, isLoading } = useQuery({
    queryKey: ['news', id],
    queryFn: () => api.get(`/news/${id}`),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#00565f] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-400 text-lg">Noticia no encontrada</p>
        <Link to="/noticias" className="mt-4 inline-block text-[#00565f] underline">Volver a Noticias</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link
        to="/noticias"
        className="inline-flex items-center gap-1.5 text-[#00565f] border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium mb-6 hover:bg-gray-50 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Noticias
      </Link>

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        {item.imagen_url && (
          <img src={item.imagen_url} alt={item.titulo} className="w-full h-64 sm:h-80 object-cover" />
        )}

        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            {item.tipo && (
              <span className="text-xs px-3 py-1 rounded-full border border-gray-200 text-gray-600 font-medium">
                {TIPO_LABEL[item.tipo] || item.tipo}
              </span>
            )}
            {item.fecha && (
              <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(item.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#00565f] mb-4 leading-snug">{item.titulo}</h1>

          {item.resumen && (
            <p className="text-gray-600 text-base mb-6 leading-relaxed">{item.resumen}</p>
          )}

          {item.contenido && <ContentRenderer html={item.contenido} />}

          {item.youtube_url && !item.contenido?.match(YT_REGEX) && <YoutubeEmbed url={item.youtube_url} />}
        </div>
      </div>
    </div>
  )
}

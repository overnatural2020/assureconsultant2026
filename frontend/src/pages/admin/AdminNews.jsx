// src/pages/admin/AdminNews.jsx
import { useState, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../lib/AuthContext.jsx'
import AccessDenied from '../../components/layout/AccessDenied.jsx'
import { entities } from '../../lib/api.js'
import { Plus, Pencil, Trash2, Star, X, CheckCircle, Upload, Bold, Italic, Underline, Strikethrough, Quote, List, ListOrdered, Link, Image, RemoveFormatting, IndentDecrease, IndentIncrease } from 'lucide-react'
import LangSelector from '../../components/LangSelector.jsx'
import TranslateDuplicateButton from '../../components/TranslateDuplicateButton.jsx'
import { useEditor, EditorContent, Node } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import UnderlineExt from '@tiptap/extension-underline'
import StrikeExt from '@tiptap/extension-strike'
import LinkExt from '@tiptap/extension-link'
import ImageExt from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'

// Custom iframe extension
const IframeExt = Node.create({
  name: 'iframe',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      width: { default: '100%' },
      height: { default: '315' },
      allowfullscreen: { default: true },
    }
  },
  parseHTML() {
    return [{ tag: 'iframe' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['iframe', { ...HTMLAttributes, width: '100%', frameborder: '0', allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture', allowfullscreen: true }]
  },
  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div')
      dom.style.cssText = 'position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;margin:8px 0'
      const iframe = document.createElement('iframe')
      iframe.src = node.attrs.src
      iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:0'
      iframe.allowFullscreen = true
      dom.appendChild(iframe)
      return { dom }
    }
  },
})

const TIPOS = [
  { value: 'comunicado', label: 'Comunicado' },
  { value: 'campana', label: 'Campaña' },
  { value: 'historia_exito', label: 'Historia de Éxito' },
  { value: 'evento', label: 'Evento' },
  { value: 'motivacion', label: 'Motivación' },
]

const TIPO_LABEL = {
  comunicado: 'Comunicado', campana: 'Campaña', historia_exito: 'Historia de Éxito', evento: 'Evento', motivacion: 'Motivación',
}

function preprocessHtml(html) {
  if (!html) return html
  // Find paragraphs that contain an anchor with a YouTube embed URL — these are mangled iframes
  return html.replace(/<p[^>]*>[\s\S]*?<\/p>/gi, (match) => {
    const embedMatch = match.match(/href="(https?:\/\/(?:www\.)?youtube\.com\/embed\/([^"?&]+)[^"]*)"/)
    if (!embedMatch) return match
    const src = `https://www.youtube.com/embed/${embedMatch[2]}`
    return `<iframe src="${src}" width="100%" height="315" frameborder="0" allowfullscreen="true"></iframe>`
  })
}

function RichEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ strike: false, link: false, underline: false }),
      UnderlineExt,
      StrikeExt,
      LinkExt.configure({ openOnClick: false }),
      ImageExt,
      IframeExt,
      Placeholder.configure({ placeholder: 'Escribe el contenido completo aquí...' }),
    ],
    content: preprocessHtml(value) || '',
    onUpdate: ({ editor }) => { const html = editor.getHTML(); setTimeout(() => onChange(html), 0) },
  })

  const [linkInput, setLinkInput] = useState('')
  const [imgInput, setImgInput] = useState('')
  const [showLink, setShowLink] = useState(false)
  const [showImg, setShowImg] = useState(false)
  const [imgUploading, setImgUploading] = useState(false)
  const editorImgRef = useRef(null)

  const handleEditorImgUpload = async (file) => {
    if (!file) return
    setImgUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const r = await fetch('/api/upload', { method: 'POST', body: fd })
      const { url } = await r.json()
      editor.chain().focus().setImage({ src: url }).run()
      setShowImg(false)
    } finally {
      setImgUploading(false)
    }
  }

  const applyLink = () => {
    if (!linkInput) return
    if (editor.state.selection.empty) {
      editor.chain().focus().insertContent(`<a href="${linkInput}">${linkInput}</a>`).run()
    } else {
      editor.chain().focus().setLink({ href: linkInput }).run()
    }
    setLinkInput(''); setShowLink(false)
  }

  const applyImage = () => {
    if (imgInput) editor.chain().focus().setImage({ src: imgInput }).run()
    setImgInput(''); setShowImg(false)
  }

  if (!editor) return null

  const btn = (action, icon, title, isActive) => (
    <button
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); action() }}
      className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${isActive ? 'bg-gray-200 text-[#00565f]' : 'text-gray-600'}`}
    >
      {icon}
    </button>
  )

  return (
    <div className="border border-[#00565f]/40 rounded-lg overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-0.5 p-2 bg-gray-50 border-b border-gray-200">
        <select
          className="text-sm border-0 bg-transparent text-gray-700 focus:outline-none pr-1 mr-1"
          onMouseDown={e => e.stopPropagation()}
          onChange={e => {
            const v = e.target.value
            if (v === 'normal') editor.chain().focus().setParagraph().run()
            else editor.chain().focus().setHeading({ level: parseInt(v) }).run()
            editor.commands.focus()
          }}
          value={editor.isActive('heading', { level: 1 }) ? '1' : editor.isActive('heading', { level: 2 }) ? '2' : editor.isActive('heading', { level: 3 }) ? '3' : 'normal'}
        >
          <option value="normal">Normal</option>
          <option value="1">H1</option>
          <option value="2">H2</option>
          <option value="3">H3</option>
        </select>
        <div className="w-px h-5 bg-gray-300 mx-1" />
        {btn(() => editor.chain().focus().toggleBold().run(), <Bold className="w-4 h-4" />, 'Negrita', editor.isActive('bold'))}
        {btn(() => editor.chain().focus().toggleItalic().run(), <Italic className="w-4 h-4" />, 'Cursiva', editor.isActive('italic'))}
        {btn(() => editor.chain().focus().toggleUnderline().run(), <Underline className="w-4 h-4" />, 'Subrayado', editor.isActive('underline'))}
        {btn(() => editor.chain().focus().toggleStrike().run(), <Strikethrough className="w-4 h-4" />, 'Tachado', editor.isActive('strike'))}
        {btn(() => editor.chain().focus().toggleBlockquote().run(), <Quote className="w-4 h-4" />, 'Cita', editor.isActive('blockquote'))}
        <div className="w-px h-5 bg-gray-300 mx-1" />
        {btn(() => editor.chain().focus().toggleOrderedList().run(), <ListOrdered className="w-4 h-4" />, 'Lista ordenada', editor.isActive('orderedList'))}
        {btn(() => editor.chain().focus().toggleBulletList().run(), <List className="w-4 h-4" />, 'Lista', editor.isActive('bulletList'))}
        {btn(() => editor.chain().focus().sinkListItem('listItem').run(), <IndentIncrease className="w-4 h-4" />, 'Aumentar sangría', false)}
        {btn(() => editor.chain().focus().liftListItem('listItem').run(), <IndentDecrease className="w-4 h-4" />, 'Reducir sangría', false)}
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <button type="button" title="Insertar enlace"
          onMouseDown={e => { e.preventDefault(); setShowLink(v => !v); setShowImg(false) }}
          className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${editor.isActive('link') || showLink ? 'bg-gray-200 text-[#00565f]' : 'text-gray-600'}`}>
          <Link className="w-4 h-4" />
        </button>
        <button type="button" title="Insertar imagen"
          onMouseDown={e => { e.preventDefault(); setShowImg(v => !v); setShowLink(false) }}
          className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${showImg ? 'bg-gray-200 text-[#00565f]' : 'text-gray-600'}`}>
          <Image className="w-4 h-4" />
        </button>
        {btn(() => editor.chain().focus().unsetAllMarks().clearNodes().run(), <RemoveFormatting className="w-4 h-4" />, 'Limpiar formato', false)}
      </div>
      {showLink && (
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 border-b border-gray-200">
          <input autoFocus value={linkInput} onChange={e => setLinkInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') applyLink(); if (e.key === 'Escape') setShowLink(false) }}
            placeholder="https://..." className="flex-1 text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-[#00565f]" />
          <button type="button" onMouseDown={e => { e.preventDefault(); applyLink() }} className="text-xs px-3 py-1 bg-[#00565f] text-white rounded hover:opacity-90">Aplicar</button>
          <button type="button" onMouseDown={e => { e.preventDefault(); setShowLink(false) }} className="text-xs text-gray-500 hover:text-gray-700">✕</button>
        </div>
      )}
      {showImg && (
        <div className="flex flex-col gap-2 px-3 py-2 bg-gray-100 border-b border-gray-200">
          <input
            ref={editorImgRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => handleEditorImgUpload(e.target.files[0])}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onMouseDown={e => { e.preventDefault(); editorImgRef.current?.click() }}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#00565f] text-white rounded hover:opacity-90"
            >
              <Upload className="w-3 h-3" />
              {imgUploading ? 'Subiendo...' : 'Subir archivo'}
            </button>
            <span className="text-xs text-gray-400">o pega una URL:</span>
            <input
              value={imgInput}
              onChange={e => setImgInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') applyImage(); if (e.key === 'Escape') setShowImg(false) }}
              placeholder="https://url-de-imagen.jpg"
              className="flex-1 text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-[#00565f]"
            />
            <button type="button" onMouseDown={e => { e.preventDefault(); applyImage() }} className="text-xs px-3 py-1 bg-[#00565f] text-white rounded hover:opacity-90">OK</button>
            <button type="button" onMouseDown={e => { e.preventDefault(); setShowImg(false) }} className="text-xs text-gray-500 hover:text-gray-700">✕</button>
          </div>
        </div>
      )}
      <style>{`
        .ProseMirror { min-height: 200px; max-height: 400px; overflow-y: auto; padding: 12px; font-size: 14px; color: #1f2937; outline: none; }
        .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #9ca3af; pointer-events: none; float: left; height: 0; }
        .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
        .ProseMirror li { margin: 0.2rem 0; }
        .ProseMirror li > p { margin: 0; }
        .ProseMirror blockquote { border-left: 3px solid #d1d5db; padding-left: 1rem; margin: 0.75rem 0; color: #6b7280; font-style: italic; }
        .ProseMirror h1 { font-size: 1.6em; font-weight: 700; margin: 0.75rem 0 0.25rem; }
        .ProseMirror h2 { font-size: 1.35em; font-weight: 700; margin: 0.75rem 0 0.25rem; }
        .ProseMirror h3 { font-size: 1.15em; font-weight: 700; margin: 0.75rem 0 0.25rem; }
        .ProseMirror a { color: #00565f; text-decoration: underline; }
        .ProseMirror img { max-width: 100%; border-radius: 6px; margin: 0.5rem 0; }
        .ProseMirror code { background: #f3f4f6; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85em; }
      `}</style>
      <EditorContent editor={editor} className="prose prose-sm max-w-none" />
    </div>
  )
}

function NewsModal({ initial, onSave, onClose, loading }) {
  const [form, setForm] = useState(initial || {
    titulo: '', tipo: 'comunicado', fecha: new Date().toISOString().split('T')[0],
    resumen: '', contenido: '', imagen_url: '', destacada: false, lang: 'all',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const r = await fetch('/api/upload', { method: 'POST', body: fd })
      const { url } = await r.json()
      set('imagen_url', url)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-[#00565f] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-white">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-bold">{initial?.id ? 'Editar Noticia' : 'Nueva Noticia'}</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título *</label>
            <input
              value={form.titulo}
              onChange={e => set('titulo', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-[#00565f] border border-white/30 text-white placeholder-white/50 text-sm focus:outline-none focus:border-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo *</label>
              <select
                value={form.tipo}
                onChange={e => set('tipo', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#00565f] border border-white/30 text-white text-sm focus:outline-none focus:border-white"
              >
                {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha *</label>
              <input
                type="date"
                value={form.fecha}
                onChange={e => set('fecha', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#00565f] border border-white/30 text-white text-sm focus:outline-none focus:border-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Resumen (vista previa)</label>
            <textarea
              rows={2}
              value={form.resumen}
              onChange={e => set('resumen', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-[#00565f] border border-white/30 text-white placeholder-white/50 text-sm focus:outline-none focus:border-white resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Contenido completo *</label>
            <div className="rounded-lg overflow-hidden">
              <RichEditor value={form.contenido} onChange={v => set('contenido', v)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Imagen de portada</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => handleUpload(e.target.files[0])}
            />
            <div
              className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center mb-2 cursor-pointer hover:border-white/60 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); e.stopPropagation() }}
              onDragEnter={e => { e.preventDefault(); e.stopPropagation() }}
              onDrop={e => { e.preventDefault(); e.stopPropagation(); handleUpload(e.dataTransfer.files[0]) }}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  <p className="text-xs text-white/50">Subiendo...</p>
                </div>
              ) : form.imagen_url ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={form.imagen_url} alt="preview" className="h-24 rounded-lg object-cover" />
                  <div className="flex items-center gap-1.5 text-xs text-green-300">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Imagen lista — haz clic para cambiarla
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 mx-auto mb-1 text-white/50" />
                  <p className="text-xs text-white/50">Haz clic o arrastra una imagen aquí</p>
                </>
              )}
            </div>
            <input
              value={form.imagen_url}
              onChange={e => set('imagen_url', e.target.value)}
              placeholder="O pega una URL de imagen"
              className="w-full px-3 py-2.5 rounded-lg bg-[#00565f] border border-white/30 text-white placeholder-white/40 text-sm focus:outline-none focus:border-white"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.destacada}
              onChange={e => set('destacada', e.target.checked)}
              className="rounded w-4 h-4"
            />
            <span className="text-sm">Destacada en el inicio</span>
          </label>

          <div className="bg-white/10 rounded-xl p-4">
            <LangSelector value={form.lang} onChange={v => set('lang', v)} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg text-sm font-medium border border-white/30 text-white hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSave(form)}
              disabled={loading || !form.titulo}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-white text-[#00565f] hover:bg-white/90 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminNews() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!user?.isAdmin) return <AccessDenied message="Solo administradores" />

  const { data: news = [], isLoading } = useQuery({ queryKey: ['news-admin'], queryFn: () => entities.news.list() })

  const showSuccess = () => { setSuccess(true); setTimeout(() => setSuccess(false), 3000) }
  const onSuccess = () => { qc.invalidateQueries(['news-admin']); qc.invalidateQueries(['news']); setEditing(null); setCreating(false); showSuccess() }

  const create = useMutation({ mutationFn: (d) => entities.news.create(d), onSuccess })
  const update = useMutation({ mutationFn: ({ id, ...d }) => entities.news.update(id, d), onSuccess })
  const del = useMutation({ mutationFn: (id) => entities.news.delete(id), onSuccess })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="w-10 h-10 bg-[#eb6e54]/20 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-[#eb6e54]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-8H7v8" /></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#00565f]">Gestión de Noticias</h1>
            <p className="text-sm text-gray-500">{news.length} noticias publicadas</p>
          </div>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90"
            style={{ background: '#00565f' }}
          >
            <Plus className="w-4 h-4" /> Nueva Noticia
          </button>
        </div>
      </div>

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-700 text-sm">
          <CheckCircle className="w-4 h-4" /> Guardado correctamente
        </div>
      )}

      {isLoading && <div className="flex justify-center py-10"><div className="w-7 h-7 border-2 border-[#00565f] border-t-transparent rounded-full animate-spin" /></div>}

      <div className="space-y-3">
        {news.map(item => (
          <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            {item.imagen_url && <img src={item.imagen_url} alt={item.titulo} className="w-20 h-16 rounded-lg object-cover flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {item.tipo && (
                  <span className="text-xs px-2 py-0.5 rounded-full border border-[#00565f]/30 text-[#00565f]">
                    {TIPO_LABEL[item.tipo] || item.tipo}
                  </span>
                )}
                {item.destacada && <span className="text-xs px-2 py-0.5 rounded-full bg-[#fcc46a]/20 text-[#a07800] border border-[#fcc46a]/40">Destacada</span>}
                {item.lang && item.lang !== 'all' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                    {item.lang === 'es' ? '🇨🇴 ES' : '🇺🇸 EN'}
                  </span>
                )}
                {item.fecha && <span className="text-xs text-gray-400">{item.fecha.split('-').reverse().join('/')}</span>}
              </div>
              <p className="font-semibold text-gray-800 text-sm truncate">{item.titulo}</p>
              {item.resumen && <p className="text-xs text-gray-400 truncate mt-0.5">{item.resumen}</p>}
            </div>
            <div className="flex items-center gap-1">
              <TranslateDuplicateButton
                entity="news"
                id={item.id}
                currentLang={item.lang === 'all' ? 'es' : (item.lang || 'es')}
                onDone={() => qc.invalidateQueries(['news-admin'])}
              />
              <button onClick={() => { if (item.destacada) update.mutate({ id: item.id, destacada: false }); else update.mutate({ id: item.id, destacada: true }) }} className={`p-2 rounded-lg transition-colors ${item.destacada ? 'text-[#fcc46a]' : 'text-gray-300 hover:text-[#fcc46a]'}`}>
                <Star className={`w-4 h-4 ${item.destacada ? 'fill-[#fcc46a]' : ''}`} />
              </button>
              <button onClick={() => { setEditing(item); setCreating(false) }} className="p-2 rounded-lg text-[#7db8b3] hover:bg-[#daedf0] transition-colors"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => { if (confirm('¿Eliminar esta noticia?')) del.mutate(item.id) }} className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {creating && <NewsModal onSave={(d) => create.mutate(d)} onClose={() => setCreating(false)} loading={create.isPending} />}
      {editing && <NewsModal initial={editing} onSave={(d) => update.mutate({ id: editing.id, ...d })} onClose={() => setEditing(null)} loading={update.isPending} />}
    </div>
  )
}

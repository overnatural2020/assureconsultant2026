// src/components/RichEditor.jsx
import { useState, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import UnderlineExt from '@tiptap/extension-underline'
import StrikeExt from '@tiptap/extension-strike'
import LinkExt from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, Underline, Strikethrough, Quote, List, ListOrdered, Link, RemoveFormatting, IndentDecrease, IndentIncrease } from 'lucide-react'

export default function RichEditor({ value, onChange, placeholder = 'Escribe aquí...' }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ strike: false, link: false, underline: false }),
      UnderlineExt,
      StrikeExt,
      LinkExt.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => { const html = editor.getHTML(); setTimeout(() => onChange(html), 0) },
  })

  const [linkInput, setLinkInput] = useState('')
  const [showLink, setShowLink] = useState(false)

  const applyLink = () => {
    if (!linkInput) return
    if (editor.state.selection.empty) {
      editor.chain().focus().insertContent(`<a href="${linkInput}">${linkInput}</a>`).run()
    } else {
      editor.chain().focus().setLink({ href: linkInput }).run()
    }
    setLinkInput(''); setShowLink(false)
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
        {btn(() => editor.chain().focus().toggleBold().run(), <Bold className="w-4 h-4" />, 'Negrita', editor.isActive('bold'))}
        {btn(() => editor.chain().focus().toggleItalic().run(), <Italic className="w-4 h-4" />, 'Cursiva', editor.isActive('italic'))}
        {btn(() => editor.chain().focus().toggleUnderline().run(), <Underline className="w-4 h-4" />, 'Subrayado', editor.isActive('underline'))}
        {btn(() => editor.chain().focus().toggleStrike().run(), <Strikethrough className="w-4 h-4" />, 'Tachado', editor.isActive('strike'))}
        <div className="w-px h-5 bg-gray-300 mx-1" />
        {btn(() => editor.chain().focus().toggleBulletList().run(), <List className="w-4 h-4" />, 'Lista', editor.isActive('bulletList'))}
        {btn(() => editor.chain().focus().toggleOrderedList().run(), <ListOrdered className="w-4 h-4" />, 'Lista ordenada', editor.isActive('orderedList'))}
        {btn(() => editor.chain().focus().sinkListItem('listItem').run(), <IndentIncrease className="w-4 h-4" />, 'Sangría', false)}
        {btn(() => editor.chain().focus().liftListItem('listItem').run(), <IndentDecrease className="w-4 h-4" />, 'Reducir sangría', false)}
        {btn(() => editor.chain().focus().toggleBlockquote().run(), <Quote className="w-4 h-4" />, 'Cita', editor.isActive('blockquote'))}
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <button type="button" title="Insertar enlace"
          onMouseDown={e => { e.preventDefault(); setShowLink(v => !v) }}
          className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${editor.isActive('link') || showLink ? 'bg-gray-200 text-[#00565f]' : 'text-gray-600'}`}>
          <Link className="w-4 h-4" />
        </button>
        {btn(() => editor.chain().focus().unsetAllMarks().clearNodes().run(), <RemoveFormatting className="w-4 h-4" />, 'Limpiar formato', false)}
      </div>
      {showLink && (
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 border-b border-gray-200">
          <input autoFocus value={linkInput} onChange={e => setLinkInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') applyLink(); if (e.key === 'Escape') setShowLink(false) }}
            placeholder="https://..." className="flex-1 text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-[#00565f]" />
          <button type="button" onMouseDown={e => { e.preventDefault(); applyLink() }} className="text-xs px-3 py-1 bg-[#00565f] text-white rounded hover:opacity-90">Aplicar</button>
          <button type="button" onMouseDown={e => { e.preventDefault(); setShowLink(false) }} className="text-xs text-gray-500">✕</button>
        </div>
      )}
      <style>{`
        .ProseMirror { min-height: 150px; max-height: 350px; overflow-y: auto; padding: 12px; font-size: 14px; color: #1f2937; outline: none; }
        .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #9ca3af; pointer-events: none; float: left; height: 0; }
        .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
        .ProseMirror li { margin: 0.2rem 0; }
        .ProseMirror li > p { margin: 0; }
        .ProseMirror blockquote { border-left: 3px solid #d1d5db; padding-left: 1rem; margin: 0.75rem 0; color: #6b7280; font-style: italic; }
        .ProseMirror a { color: #00565f; text-decoration: underline; cursor: pointer; }
        .ProseMirror strong { font-weight: 700; }
      `}</style>
      <EditorContent editor={editor} className="prose prose-sm max-w-none" />
    </div>
  )
}

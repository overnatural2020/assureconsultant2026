// src/pages/admin/AdminDocuments.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../lib/AuthContext.jsx'
import AccessDenied from '../../components/layout/AccessDenied.jsx'
import { entities } from '../../lib/api.js'
import { FileText, Upload, Trash2, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

const CATEGORIES = [
  { value: 'membresias', label: 'Membresías' },
  { value: 'ventas', label: 'Técnicas de Ventas' },
  { value: 'procedimientos', label: 'Procedimientos' },
  { value: 'politicas', label: 'Políticas' },
  { value: 'capacitacion', label: 'Capacitación' },
  { value: 'otro', label: 'Otro' },
]

export default function AdminDocuments() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const qc = useQueryClient()
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [success, setSuccess] = useState('')
  const [dragOver, setDragOver] = useState(false)

  if (!user?.isAdmin) return <AccessDenied message={t('auth.admins_only')} />

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => entities.documents.list(),
  })

  const toggleActive = useMutation({
    mutationFn: ({ id, activo }) => entities.documents.toggleActive(id, activo),
    onSuccess: () => qc.invalidateQueries(['documents']),
  })

  const deleteDoc = useMutation({
    mutationFn: (id) => entities.documents.delete(id),
    onSuccess: () => { qc.invalidateQueries(['documents']); setSuccess('Documento eliminado.'); setTimeout(() => setSuccess(''), 3000) },
  })

  const handleFile = async (file) => {
    if (!file) return
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) { setUploadError('El archivo excede el límite de 10MB'); return }

    setUploading(true)
    setUploadError('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      await entities.documents.upload(formData)
      qc.invalidateQueries(['documents'])
      setSuccess('Documento incorporado correctamente al asistente virtual.')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setUploadError('Error al subir el archivo. Por favor intenta de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-2">
        <FileText className="w-7 h-7 text-[#00565f]" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.agent_documents')}</h1>
          <p className="text-gray-400 text-sm">Sube documentos y la IA los analizará automáticamente</p>
        </div>
      </div>

      {success && <div className="mt-4 mb-2 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-700 text-sm"><CheckCircle className="w-4 h-4" />{success}</div>}
      {uploadError && <div className="mt-4 mb-2 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 text-sm"><AlertCircle className="w-4 h-4" />{uploadError}</div>}

      {/* Upload zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
        className={`mt-6 border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${dragOver ? 'border-[#00565f] bg-[#daedf0]/30' : 'border-gray-200 hover:border-[#7db8b3]'}`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-[#00565f] animate-spin" />
            <p className="text-[#00565f] font-medium text-sm">La IA está extrayendo información clave del documento. Esto puede tomar unos segundos.</p>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-700 mb-1">Sube un documento</p>
            <p className="text-gray-400 text-xs mb-4">La IA analizará el contenido, categorizará el documento y te mostrará un resumen antes de incorporarlo</p>
            <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all" style={{ background: '#00565f' }}>
              <Upload className="w-4 h-4" />
              Seleccionar Archivo
              <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={e => handleFile(e.target.files?.[0])} />
            </label>
            <p className="text-xs text-gray-400 mt-3">Soporta: PDF, DOC, DOCX, TXT (máx. 10MB)</p>
          </>
        )}
      </div>

      {/* How it works */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { n: '1', text: 'Sube el documento y la IA lo analiza automáticamente' },
          { n: '2', text: 'Revisa el resumen, categoría y puntos clave extraídos' },
          { n: '3', text: 'La IA te recomienda si el documento es útil para el asistente' },
          { n: '4', text: 'Confirma para incorporar o cancela si no es relevante' },
        ].map(step => (
          <div key={step.n} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <div className="w-7 h-7 bg-[#00565f] text-white rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-2">{step.n}</div>
            <p className="text-xs text-gray-500 leading-relaxed">{step.text}</p>
          </div>
        ))}
      </div>

      {/* Documents list */}
      <div className="mt-8">
        <h2 className="font-bold text-gray-800 mb-4">
          Documentos en el Asistente ({docs.length})
        </h2>

        {isLoading && <div className="flex justify-center py-10"><div className="w-7 h-7 border-2 border-[#00565f] border-t-transparent rounded-full animate-spin" /></div>}
        {!isLoading && docs.length === 0 && (
          <p className="text-center text-gray-400 py-10 text-sm">Sube tu primer documento para que el asistente aprenda sobre tu empresa</p>
        )}

        <div className="space-y-3">
          {docs.map(doc => (
            <div key={doc.id} className={`bg-white rounded-xl border p-4 flex items-start gap-4 ${doc.activo ? 'border-gray-100' : 'border-gray-100 opacity-60'}`}>
              <FileText className="w-8 h-8 text-[#00565f] flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-800 text-sm">{doc.titulo || 'Documento'}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${doc.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {doc.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                {doc.categoria && (
                  <span className="text-xs bg-[#daedf0] text-[#00565f] px-2 py-0.5 rounded-full mt-1 inline-block">
                    {CATEGORIES.find(c => c.value === doc.categoria)?.label || doc.categoria}
                  </span>
                )}
                {doc.resumen && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{doc.resumen}</p>}
                {doc.puntos_clave?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {doc.puntos_clave.slice(0, 3).map((p, i) => (
                      <span key={i} className="text-xs bg-gray-50 border border-gray-200 text-gray-600 px-2 py-0.5 rounded">{p}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleActive.mutate({ id: doc.id, activo: !doc.activo })}
                  className={`p-2 rounded-lg transition-colors ${doc.activo ? 'text-[#7db8b3] hover:bg-[#daedf0]' : 'text-gray-400 hover:bg-gray-100'}`}
                  title={doc.activo ? 'Desactivar' : 'Activar'}
                >
                  {doc.activo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => { if (confirm('¿Eliminar este documento?')) deleteDoc.mutate(doc.id) }}
                  className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

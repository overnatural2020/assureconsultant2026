import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ShieldX } from 'lucide-react'

const LOGO = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6907ccd9d7dc18fba4a28df9/4b3b99f35_LogoAssurefondoblanco.png'

export default function AccessDenied({ message }) {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF9] p-6">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-10 text-center">
        <img src={LOGO} alt="Assure For Life" className="h-14 w-auto mx-auto mb-6 opacity-60" />
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldX className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('auth.restricted')}</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          {message || t('auth.access_denied')}
        </p>
        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-gray-400 text-xs mb-3">¿Eres administrador?</p>
          <Link
            to="/admin/login"
            className="inline-block px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: '#00565f' }}
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  )
}

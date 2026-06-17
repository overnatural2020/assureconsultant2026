// src/pages/Community.jsx
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import EditableT from '../components/EditableT.jsx'

const BASE = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6907ccd9d7dc18fba4a28df9'
const MEDIA = 'https://media.base44.com/images/public/6907ccd9d7dc18fba4a28df9'

const LOGO = `${BASE}/b2a1ef2c6_Disenopaginadelconsultorinicio-14.png`

export default function Community() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <div className="block mb-4">
            <div className="relative inline-block">
              <div className="absolute top-[-2px] left-[-1px] w-[18px] h-[18px] bg-[#eb6e54] rounded-full z-0" />
              <h1
                className="relative z-10 text-5xl md:text-6xl font-bold text-[#7db8b3]"
                style={{ fontFamily: "'Arca Majora 3', sans-serif" }}
              >
                <EditableT k="community.title" />
              </h1>
            </div>
          </div>
          <div className="block">
            <span className="inline-block bg-[#fcc46a] text-[#00565f] px-6 py-2 font-bold text-2xl rounded-md">
              <EditableT k="community.subtitle" />
            </span>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">

          {/* Reconocimientos */}
          <Link to="/reconocimientos" className="flex">
            <div className="bg-[#d0e8eb] rounded-3xl p-8 flex flex-col h-full w-full hover:shadow-xl transition-all duration-300">
              <div className="flex justify-center mb-6">
                <img
                  src={`${MEDIA}/c2d81d6d5_DisenopaginadelconsultorComunidad-37.png`}
                  alt="Reconocimientos"
                  className="w-20 h-20"
                />
              </div>
              <div className="flex justify-center mb-3">
                <div className="relative inline-block">
                  <div className="absolute top-[-1px] left-[-3px] w-[12px] h-[12px] bg-[#eb6e54] rounded-full z-0" />
                  <h3 className="relative z-10 text-2xl font-bold text-[#00565f]"
                      style={{ fontFamily: "'Arca Majora 3', sans-serif" }}>
                    <EditableT k="recognitions.title" />
                  </h3>
                </div>
              </div>
              <p className="text-[#00565f] text-center mb-6 flex-grow text-sm">
                {t('community.recognitions_subtitle')}
              </p>
              <div className="text-center">
                <button className="bg-[#eb6e54] hover:bg-[#eb6e54]/90 text-white px-6 py-2 text-base rounded-md transition-colors">
                  {t('home.go_now')}
                </button>
              </div>
            </div>
          </Link>

          {/* Ranking */}
          <Link to="/ranking-consultores" className="flex">
            <div className="bg-[#f0ece8] rounded-3xl p-8 flex flex-col h-full w-full hover:shadow-xl transition-all duration-300">
              <div className="flex justify-center mb-6">
                <img
                  src={`${MEDIA}/4a37d1a57_DisenopaginadelconsultorComunidad-40.png`}
                  alt="Ranking"
                  className="w-20 h-20"
                />
              </div>
              <div className="flex justify-center mb-3">
                <div className="relative inline-block">
                  <div className="absolute top-[-1px] left-[-3px] w-[12px] h-[12px] bg-[#eb6e54] rounded-full z-0" />
                  <h3 className="relative z-10 text-2xl font-bold text-[#00565f]"
                      style={{ fontFamily: "'Arca Majora 3', sans-serif" }}>
                    <EditableT k="ranking.title" />
                  </h3>
                </div>
              </div>
              <p className="text-[#00565f] text-center mb-6 flex-grow text-sm">
                {t('community.recognitions_desc')}
              </p>
              <div className="text-center">
                <button className="bg-[#eb6e54] hover:bg-[#eb6e54]/90 text-white px-6 py-2 text-base rounded-md transition-colors">
                  {t('home.go_now')}
                </button>
              </div>
            </div>
          </Link>
        </div>

        {/* Facebook section */}
        <div className="bg-[#00565f] rounded-3xl p-8 md:p-10 mb-6 flex flex-col md:flex-row gap-6 items-end">
          <div className="flex justify-center md:w-1/3 shrink-0 -mb-8 md:-mb-10">
            <img
              src={`${BASE}/88b25db31_DisenopaginadelconsultorComunidad-39.png`}
              alt="Únete"
              className="w-56 h-auto object-contain"
            />
          </div>
          <div className="text-white md:w-2/3">
            <h2 className="text-white mb-4 text-2xl md:text-3xl font-bold">
              {t('community.join_facebook')}
            </h2>
            <p className="text-base mb-6 text-white/90">
              {t('community.facebook_desc')}
            </p>
            <a href="https://www.facebook.com/groups/" target="_blank" rel="noopener noreferrer">
              <button className="bg-[#eb6e54] hover:bg-[#eb6e54]/90 text-white px-8 py-3 text-base font-semibold rounded-md transition-colors">
                {t('community.join_group')}
              </button>
            </a>
          </div>
        </div>

        {/* Footer logo */}
        <div className="flex justify-center py-8">
          <img src={LOGO} alt="Assure for Life" className="h-12 w-auto" />
        </div>

      </div>
    </div>
  )
}

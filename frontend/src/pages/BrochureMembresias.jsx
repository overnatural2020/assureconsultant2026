// src/pages/BrochureMembresias.jsx
import { Link } from 'react-router-dom'
import { Award, Users, Heart, Globe, Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MEDIA = 'https://media.base44.com/images/public/6907ccd9d7dc18fba4a28df9'

const BROCHURE_URL = 'https://drive.google.com/file/d/1WN7O-mY4QpRcuQDgXT2fHn3tRUMMSMsr/view?usp=drive_link'

export default function BrochureMembresias() {
  const { t } = useTranslation()

  const FEATURES = [
    { icon: <Award className="w-8 h-8 text-[#7db8b3]" />, title: t('brochure.feature_1_title'), desc: t('brochure.feature_1_desc') },
    { icon: <Users className="w-8 h-8 text-[#7db8b3]" />, title: t('brochure.feature_2_title'), desc: t('brochure.feature_2_desc') },
    { icon: <Heart className="w-8 h-8 text-[#7db8b3]" />, title: t('brochure.feature_3_title'), desc: t('brochure.feature_3_desc') },
    { icon: <Globe className="w-8 h-8 text-[#7db8b3]" />, title: t('brochure.feature_4_title'), desc: t('brochure.feature_4_desc') },
  ]

  return (
    <div className="min-h-screen bg-white">

      {/* Title — same style as Resources "Centro de recursos" */}
      <div className="text-center pt-12 mb-8 px-4">
        <div className="relative inline-block">
          <div className="absolute top-[-2px] left-[-3px] w-[18px] h-[18px] bg-[#eb6e54] rounded-full z-0" />
          <h1 className="relative z-10 text-5xl md:text-6xl font-bold" style={{ fontFamily: "'Arca Majora 3', sans-serif" }}>
            <span className="text-[#7db8b3]">{t('brochure.title')} </span>
            <span className="text-[#00565f]">{t('brochure.title_accent')}</span>
          </h1>
        </div>
      </div>

      {/* Flipbook — full width, aspect-ratio adapts to viewport so there is
          no empty space (cross-origin iframe can't auto-size to its content) */}
      <section className="w-full">
        <iframe
          allowFullScreen
          scrolling="no"
          title={`${t('brochure.title')} ${t('brochure.title_accent')}`}
          className="fp-iframe block w-full aspect-video"
          src="https://heyzine.com/flip-book/5101d9d017.html"
          style={{ border: '1px solid lightgray' }}
        />
      </section>

      {/* Info card */}
      <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="bg-[#f5f0eb] rounded-3xl overflow-hidden flex flex-col md:flex-row">
          <div className="w-full md:w-[38%] min-h-[260px] overflow-hidden">
            <img
              src={`${MEDIA}/4613365ce_Imagenfamiliaenplaya.jpg`}
              alt="Familia en playa"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
            <div className="relative inline-block mb-4">
              <div className="absolute top-[-2px] left-[-3px] w-3 h-3 bg-[#eb6e54] rounded-full z-0" />
              <h2 className="relative z-10 text-[#00565f] mb-6 leading-snug" style={{ fontFamily: "'Arca Majora 3', sans-serif", fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
                {t('brochure.life_changes')}<br /><span className="text-[#7db8b3]">{t('brochure.life_changes_accent')}</span>
              </h2>
            </div>

            <div className="border border-[#7db8b3] rounded-2xl p-5 flex items-start gap-4 mb-8 bg-white">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1 bg-[#7db8b3]/10">
                <Heart className="w-5 h-5 text-[#00565f]" />
              </div>
              <p className="leading-relaxed text-gray-700 text-lg">
                {t('brochure.assure_desc')}
              </p>
            </div>

            <p className="text-[#00565f] font-semibold mb-4 text-xl">
              {t('resources.brochure_desc')}
            </p>
            <a
              href={BROCHURE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#eb6e54] hover:bg-[#eb6e54]/90 text-white font-semibold px-6 py-3 transition-colors w-fit rounded-md text-lg"
            >
              <Download className="w-5 h-5" />
              {t('resources.download_brochure')}
            </a>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex justify-center mb-10">
          <div className="relative inline-block">
            <div className="absolute top-[3px] left-[19px] w-[16px] h-[16px] bg-[#eb6e54] rounded-full z-0" />
            <h2 className="relative z-10 text-center text-[#00565f]" style={{ fontFamily: "'Arca Majora 3', sans-serif", fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
              {t('brochure.what_offers')} <span className="text-[#7db8b3]">{t('brochure.what_offers_accent')}</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-full bg-[#7db8b3]/10 flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="text-[#00565f] font-bold text-base mb-2 leading-snug" style={{ fontFamily: "'Arca Majora 3', sans-serif" }}>
                {f.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA dark — planes */}
      <section className="py-10 px-6 md:px-12 max-w-7xl mx-auto mb-8">
        <div className="bg-[#00565f] rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h3 className="text-white text-2xl md:text-3xl font-bold mb-2 leading-snug" style={{ fontFamily: "'Arca Majora 3', sans-serif" }}>
              <span className="text-[#fcc46a]">{t('brochure.coverages_title')}</span>
            </h3>
            <p className="text-white/70 text-sm mt-2">
              {t('brochure.explore_plans')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
            <Link
              to="/membresias"
              className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl px-6 py-5 flex items-center gap-4 transition-colors min-w-[180px]"
            >
              <div className="w-10 h-10 rounded-full bg-[#7db8b3]/30 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-[#7db8b3]" />
              </div>
              <div>
                <p className="text-white font-bold text-base">{t('memberships.family_plan')}</p>
                <p className="text-[#eb6e54] text-sm font-semibold mt-1">{t('resources.view_details')}</p>
              </div>
            </Link>

            <Link
              to="/membresias"
              className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl px-6 py-5 flex items-center gap-4 transition-colors min-w-[180px]"
            >
              <div className="w-10 h-10 rounded-full bg-[#7db8b3]/30 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-[#7db8b3]" />
              </div>
              <div>
                <p className="text-white font-bold text-base">{t('memberships.silver_plan')}</p>
                <p className="text-[#eb6e54] text-sm font-semibold mt-1">{t('resources.view_details')}</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}

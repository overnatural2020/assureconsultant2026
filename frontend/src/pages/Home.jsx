// src/pages/Home.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { useAuth } from '../lib/AuthContext.jsx'
import { useTranslation } from 'react-i18next'
import api from '../lib/api.js'

const BASE = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6907ccd9d7dc18fba4a28df9'
const MEDIA = 'https://media.base44.com/images/public/6907ccd9d7dc18fba4a28df9'

const LOGO = `${BASE}/4b3b99f35_LogoAssurefondoblanco.png`

// Motivational quotes (shown in slide 1) — keys resolved at render time
const FRASES = [
  { fraseKey: 'home.quote1', autor: 'Theodore Roosevelt' },
  { fraseKey: 'home.quote2', autor: 'Albert Schweitzer' },
  { fraseKey: 'home.quote3', autor: 'Steve Jobs' },
]

// Category colors for news badges
const BADGE_COLORS = {
  comunicado: 'bg-[#005761]',
  campana: 'bg-[#eb6f56]',
  historia_exito: 'bg-[#7fb8b5]',
  evento: 'bg-[#fcc469]',
  motivacion: 'bg-[#eb6f56]',
}
const BADGE_TIPO_KEY = {
  comunicado: 'news.label_comunicado',
  campana: 'news.label_campana',
  historia_exito: 'news.label_historia',
  evento: 'news.label_evento',
  motivacion: 'news.label_motivacion',
}

// ── Slide 1: Bienvenida ──────────────────────────────────────────────────────
function SlideWelcome({ isCurrent, displayName, frase }) {
  const { t } = useTranslation()
  return (
    <div
      className={`${isCurrent ? 'block md:absolute md:inset-0' : 'hidden md:absolute md:inset-0'}`}
      style={{ zIndex: isCurrent ? 1 : 0, opacity: isCurrent ? 1 : 0, transition: 'opacity 0.7s', backgroundColor: '#7db8b3' }}
    >
      {/* Mobile */}
      <div className="flex flex-col md:hidden min-h-[500px]">
        <div className="w-full" style={{ height: '260px' }}>
          <img src={`${MEDIA}/3240fe6e7_banner3web.jpg`} alt="Bienvenida" className="w-full h-full object-cover object-top" />
        </div>
        <div className="flex flex-col items-center px-6 py-8 gap-3">
          <h1 className="font-bold text-white mb-3 leading-tight text-center" style={{ fontSize: 'clamp(1.8rem, 7vw, 2.4rem)', fontFamily: "'Arca Majora 3', sans-serif" }}>
            {displayName ? `${t('home.welcome')} ${displayName}!` : t('home.welcome_consultant')}
          </h1>
          <div className="mb-3 inline-block">
            <p className="text-center bg-[#f5c97a] inline-block px-3 py-1 rounded" style={{ fontSize: 'clamp(1rem, 4vw, 1.3rem)', color: '#00565f' }}>
              <span className="font-bold">{t('home.welcome_back')}</span><span className="font-normal"> {t('home.back')}</span>
            </p>
          </div>
          <div className="w-48 h-[1px] mb-4" style={{ backgroundColor: '#00565f' }} />
          <p className="text-center mb-4 leading-snug" style={{ fontSize: 'clamp(1rem, 3.5vw, 1.2rem)', color: '#00565f' }}>
            <span className="font-bold">{t('home.find_here')}</span> {t('home.find_here_sub')}
          </p>
          {frase && (
            <div className="text-white/90 text-center">
              <p className="italic text-base mb-1">"{t(frase.fraseKey)}"</p>
              {frase.autor && <p className="not-italic text-white text-base">{frase.autor}</p>}
            </div>
          )}
        </div>
      </div>
      {/* Desktop */}
      <div className="hidden md:flex w-full h-full items-stretch overflow-hidden">
        <div className="flex items-end justify-center flex-shrink-0" style={{ width: '40%' }}>
          <img src={`${MEDIA}/3240fe6e7_banner3web.jpg`} alt="Bienvenida" className="h-full w-full object-cover object-center" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-16 py-12">
          <h1 className="font-bold text-white mb-4 leading-tight text-center" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontFamily: "'Arca Majora 3', sans-serif" }}>
            {displayName ? `${t('home.welcome')} ${displayName}!` : t('home.welcome_consultant')}
          </h1>
          <div className="mb-4 inline-block">
            <p className="text-center bg-[#f5c97a] inline-block px-3 py-1 rounded" style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', color: '#00565f' }}>
              <span className="font-bold">{t('home.welcome_back')}</span><span className="font-normal"> {t('home.back')}</span>
            </p>
          </div>
          <div className="w-64 h-[1px] mb-8" style={{ backgroundColor: '#00565f' }} />
          <p className="text-center mb-6 leading-snug" style={{ fontSize: 'clamp(1.3rem, 2vw, 1.6rem)', color: '#00565f' }}>
            <span className="font-bold">{t('home.find_here')}</span> {t('home.find_here_sub')}
          </p>
          {frase && (
            <div className="text-white/90 text-center">
              <p className="italic text-lg mb-1">"{t(frase.fraseKey)}"</p>
              {frase.autor && <p className="not-italic text-white text-lg">{frase.autor}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Slide 2: WhatsApp QR ─────────────────────────────────────────────────────
function SlideWhatsApp({ isCurrent }) {
  const { t } = useTranslation()
  return (
    <div
      className={`${isCurrent ? 'block md:absolute md:inset-0' : 'hidden md:absolute md:inset-0'}`}
      style={{ zIndex: isCurrent ? 1 : 0, opacity: isCurrent ? 1 : 0, transition: 'opacity 0.7s', backgroundColor: '#e8ddc8' }}
    >
      {/* Mobile */}
      <div className="flex flex-col md:hidden min-h-[500px]">
        <div className="w-full" style={{ height: '260px', backgroundColor: '#f5c97a' }}>
          <img src={`${MEDIA}/17a710263_mujer2header.png`} alt="Consultora" className="w-full h-full object-cover object-top" />
        </div>
        <div className="flex flex-col px-6 py-8 gap-5" style={{ backgroundColor: '#fde9c0' }}>
          <div className="relative inline-block">
            <div className="absolute top-[-2px] left-[-2px] w-3 h-3 bg-[#eb6e54] rounded-full z-0" />
            <h1 className="relative z-10 text-[#00565f] font-bold leading-snug" style={{ fontSize: 'clamp(1.5rem, 6vw, 1.9rem)', fontFamily: "'Arca Majora 3', sans-serif" }}>
              {t('home.scan_qr')}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="border-2 border-[#f5c97a] rounded-xl p-2 bg-white flex-shrink-0">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://whatsapp.com/channel/0029VbAUPGvKmCPOv5duci1A&color=000000&bgcolor=ffffff" alt="QR WhatsApp" className="w-28 h-28 block" />
            </div>
            <p className="text-[#00565f] text-sm leading-relaxed">
              {t('home.subtitle')}
            </p>
          </div>
        </div>
      </div>
      {/* Desktop */}
      <div className="hidden md:flex w-full h-full items-stretch overflow-hidden">
        <div className="flex flex-col justify-center px-12 py-10 z-10 flex-1" style={{ backgroundColor: '#f2dcb7' }}>
          <div className="relative inline-block mb-6">
            <div className="absolute top-[-2px] left-[-2px] w-4 h-4 bg-[#eb6e54] rounded-full z-0" />
            <h1 className="relative z-10 text-[#00565f] font-bold leading-snug" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontFamily: "'Arca Majora 3', sans-serif" }}>
              {t('home.scan_qr')}
            </h1>
          </div>
          <div className="flex items-center gap-6 bg-[#fde9c0] rounded-2xl p-6">
            <div className="border-2 border-[#f5c97a] rounded-xl p-3 bg-white flex-shrink-0">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://whatsapp.com/channel/0029VbAUPGvKmCPOv5duci1A&color=000000&bgcolor=ffffff" alt="QR WhatsApp" className="w-36 h-36 block" />
            </div>
            <p className="text-[#00565f] text-base leading-relaxed">
              {t('home.subtitle')}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0 flex items-end justify-center" style={{ width: '40%', backgroundColor: '#f5c97a' }}>
          <img src={`${MEDIA}/17a710263_mujer2header.png`} alt="Consultora" className="h-[90%] w-auto object-cover object-top" style={{ maxHeight: '460px' }} />
        </div>
      </div>
    </div>
  )
}

// ── Slide 3: Facebook ────────────────────────────────────────────────────────
function SlideFacebook({ isCurrent }) {
  const { t } = useTranslation()
  return (
    <div
      className={`${isCurrent ? 'block md:absolute md:inset-0' : 'hidden md:absolute md:inset-0'}`}
      style={{ zIndex: isCurrent ? 1 : 0, opacity: isCurrent ? 1 : 0, transition: 'opacity 0.7s', backgroundColor: '#f5c5b0' }}
    >
      {/* Mobile */}
      <div className="flex flex-col md:hidden min-h-[500px]">
        <div className="w-full" style={{ height: '260px', backgroundColor: '#f6a983' }}>
          <img src={`${MEDIA}/45d8ab75b_banner2web.jpg`} alt="Consultora" className="w-full h-full object-cover object-top" />
        </div>
        <div className="flex flex-col items-center px-6 py-8 gap-4" style={{ backgroundColor: '#f5c5b0' }}>
          <h1 className="text-center text-[#00565f] leading-tight" style={{ fontSize: 'clamp(1.6rem, 6vw, 2rem)', fontFamily: "'Arca Majora 3', sans-serif" }}>
            {t('home.join_facebook')}
          </h1>
          <div className="w-full h-[1px] bg-[#00565f]/30" />
          <p className="text-center text-[#00565f]/80 text-base leading-relaxed">
            {t('home.facebook_desc')}
          </p>
          <a href="https://www.facebook.com/groups/" target="_blank" rel="noopener noreferrer" className="inline-block bg-[#eb6e54] hover:bg-[#eb6e54]/90 text-white font-semibold px-10 py-3 text-base transition-colors rounded">
            {t('home.join_group')}
          </a>
        </div>
      </div>
      {/* Desktop */}
      <div className="hidden md:flex relative h-full items-center justify-center px-16 overflow-hidden">
        <div className="hidden md:flex items-end justify-center absolute left-0 bottom-0 h-full" style={{ width: '38%', backgroundColor: '#f6a983' }}>
          <img src={`${MEDIA}/45d8ab75b_banner2web.jpg`} alt="Consultora" className="h-[90%] w-auto object-cover object-top" style={{ maxHeight: '460px' }} />
        </div>
        <div className="md:ml-[40%] max-w-xl text-left">
          <h1 className="text-[#00565f] leading-tight mb-4" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontFamily: "'Arca Majora 3', sans-serif" }}>
            {t('home.join_facebook')}
          </h1>
          <div className="w-full h-[1px] bg-[#00565f]/30 mb-6" />
          <p className="text-[#00565f]/80 text-lg leading-relaxed mb-8">
            {t('home.facebook_desc')}
          </p>
          <a href="https://www.facebook.com/groups/" target="_blank" rel="noopener noreferrer" className="inline-block bg-[#eb6e54] hover:bg-[#eb6e54]/90 text-white font-semibold px-10 py-3 text-base transition-colors rounded">
            {t('home.join_group')}
          </a>
        </div>
      </div>
    </div>
  )
}

// ── Carousel wrapper ──────────────────────────────────────────────────────────
const SLIDES = [
  { type: 'welcome' },
  { type: 'whatsapp' },
  { type: 'facebook' },
]

function Carousel({ displayName, frase }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 5000)
    return () => clearInterval(t)
  }, [])

  const prev = () => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length)
  const next = () => setCurrent(c => (c + 1) % SLIDES.length)

  return (
    <div className="relative w-full overflow-hidden md:h-[500px]">
      <SlideWelcome isCurrent={current === 0} displayName={displayName} frase={frase} />
      <SlideWhatsApp isCurrent={current === 1} />
      <SlideFacebook isCurrent={current === 2} />

      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors">
        <ChevronRight className="w-6 h-6" />
      </button>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`w-3 h-3 rounded-full transition-all ${i === current ? 'bg-white scale-125' : 'bg-white/50'}`} />
        ))}
      </div>
    </div>
  )
}

// ── Quick access cards ────────────────────────────────────────────────────────
const CARDS = [
  { titleKey: 'home.card_resources_title', subtitleKey: 'home.card_resources_sub', url: '/recursos', image: `${BASE}/84b686653_Disenopaginadelconsultorinicio-21.jpg` },
  { titleKey: 'home.card_plans_title', subtitleKey: 'home.card_plans_sub', url: '/membresias', image: `${BASE}/aceddb078_Disenopaginadelconsultorinicio-22.jpg` },
  { titleKey: 'home.card_community_title', subtitleKey: 'home.card_community_sub', url: '/comunidad', image: `${BASE}/cf39c0345_Disenopaginadelconsultorinicio-23.jpg` },
]

// ── Main component ────────────────────────────────────────────────────────────
export default function Home() {
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const displayName = user?.nombre || ''
  const frase = FRASES[Math.floor(Math.random() * FRASES.length)]

  const { data: featuredNews = [] } = useQuery({
    queryKey: ['noticias-destacadas', lang],
    queryFn: async () => {
      const all = await api.get('/news', { params: { lang } })
      return all.filter(n => n.destacada).slice(0, 3)
    },
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Carousel */}
      <Carousel displayName={displayName} frase={frase} />

      {/* Quick access cards */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {CARDS.map((card) => (
              <Link key={card.titleKey} to={card.url}>
                <div className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 h-[420px] relative rounded-3xl">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${card.image})` }} />
                  <div className="relative h-full flex flex-col justify-between items-center p-8 text-center">
                    <div className="mt-auto mb-3">
                      <h3 className="text-3xl font-bold mb-3 text-[#00565f]" style={{ fontFamily: "'Arca Majora 3', sans-serif" }}>
                        {t(card.titleKey)}
                      </h3>
                      <div className="w-full h-[1px] bg-[#00565f] mb-3" />
                      <p className="text-[#00565f] text-lg font-medium">{t(card.subtitleKey)}</p>
                    </div>
                    <button className="bg-[#eb6e54] hover:bg-[#eb6e54]/90 text-white px-8 py-2 font-semibold rounded text-base transition-colors">
                      {t('home.go_now')}
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Teal banner — Potencia tu camino */}
      <div className="bg-[#7db8b3] py-8 md:py-16 mb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="absolute left-4 bottom-0 z-20 hidden md:block">
            <img src={`${BASE}/48ab16933_Disenopaginadelconsultorinicio-26.png`} alt="Consultor" className="w-80 h-auto" />
          </div>
          <div className="relative bg-[#7db8b3] border border-[#00565f] rounded-3xl">
            <div className="md:pl-96 text-center p-8 md:p-12">
              <div className="inline-block mb-3">
                <h2 className="text-[#00565f] text-2xl font-bold md:text-3xl" style={{ fontFamily: "'Arca Majora 3', sans-serif" }}>
                  {t('home.potencia_title')}
                </h2>
              </div>
              <div className="w-full h-[1px] bg-[#00565f] mb-6" />
              <p className="text-[#00565f] mb-6 text-xl md:text-2xl font-medium">{t('home.potencia_sub')}</p>
              <Link to="/brochure-membresias">
                <button className="inline-flex items-center gap-2 bg-[#eb6e54] hover:bg-[#eb6e54]/90 text-white font-semibold px-6 py-3 text-base rounded transition-colors">
                  <img src={`${BASE}/14e4db14e_Disenopaginadelconsultorinicio-24.png`} alt="" className="w-5 h-5" />
                  {t('home.see_brochure')}
                </button>
              </Link>
              <p className="text-[#00565f] mt-3 text-base">{t('home.available_download')}</p>
            </div>
          </div>
          {/* Mobile woman image */}
          <div className="md:hidden flex justify-center mt-8 mb-8">
            <img src={`${BASE}/48ab16933_Disenopaginadelconsultorinicio-26.png`} alt="Consultor" className="w-48 h-auto" />
          </div>
        </div>
      </div>

      {/* Presentation video */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
        <h2 className="text-3xl font-bold text-[#00565f] mb-8" style={{ fontFamily: "'Arca Majora 3', sans-serif" }}>
          {lang === 'en' ? 'Meet Assure For Life' : 'Conoce Assure For Life'}
        </h2>
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full rounded-2xl shadow-lg"
            src={lang === 'en'
              ? 'https://www.youtube.com/embed/ha8RTtWQuf0'
              : 'https://www.youtube.com/embed/UUerSoATn_8'}
            title="Assure For Life"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      {/* Featured news */}
      {featuredNews.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-[#00565f]" style={{ fontFamily: "'Arca Majora 3', sans-serif" }}>{t('home.featured_news')}</h2>
            <Link to="/noticias">
              <button className="flex items-center gap-2 border border-[#00565f] text-[#00565f] rounded px-4 py-2 text-sm font-medium hover:bg-[#00565f]/5 transition-colors">
                {t('home.see_all')} <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredNews.map(news => (
              <Link key={news.id} to={`/noticias/${news.id}`}>
                <div className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full rounded-xl border border-gray-100">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={news.imagen_url || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80'}
                      alt={news.titulo}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`${BADGE_COLORS[news.tipo] || 'bg-[#005761]'} text-white text-xs font-bold px-3 py-1 rounded`}>
                        {news.tipo in BADGE_TIPO_KEY ? t(BADGE_TIPO_KEY[news.tipo]) : (news.tipo || '').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 bg-white">
                    <h3 className="font-bold text-lg mb-2 text-[#00565f] group-hover:text-[#00565f]/80 transition-colors line-clamp-2" style={{ fontFamily: "'Arca Majora 3', sans-serif" }}>{news.titulo}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">{news.resumen}</p>
                    <div className="flex items-center gap-2 text-[#00565f] font-medium text-sm">
                      {t('news.read_more')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mission footer */}
      <div className="bg-white py-16 mb-8">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#00565f] mb-3" style={{ fontFamily: "'Arca Majora 3', sans-serif" }}>{t('home.mission_title')}</h2>
          <p className="text-2xl md:text-4xl mb-1">
            <span className="text-[#7db8b3] font-bold" style={{ fontFamily: "'Arca Majora 3', sans-serif" }}>{t('home.mission_sub1')}</span>
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#00565f] mb-6" style={{ fontFamily: "'Arca Majora 3', sans-serif" }}>{t('home.mission_sub2')}</h2>
          <span className="inline-block bg-[#fcc46a] text-[#00565f] font-semibold px-8 py-3 text-base" style={{ borderRadius: '0.375rem' }}>
            {t('home.mission_cta')}
          </span>
        </div>
      </div>

      {/* Logo footer */}
      <div className="flex justify-center pb-8">
        <img src={LOGO} alt="Assure for Life" className="h-16 w-auto" />
      </div>
    </div>
  )
}

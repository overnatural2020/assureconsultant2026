// src/components/layout/Layout.jsx
import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../lib/AuthContext.jsx'
import { Menu, X, Shield, Globe, ChevronDown } from 'lucide-react'
import EditableT from '../EditableT.jsx'
import AccessibilityWidget from '../AccessibilityWidget.jsx'

const LOGO = '/logo2.png'

const NAV_ICONS = {
  home: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6907ccd9d7dc18fba4a28df9/7e3a0ee99_Disenopaginadelconsultorinicio-15.png',
  resources: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6907ccd9d7dc18fba4a28df9/de7a8f026_Disenopaginadelconsultorinicio-16.png',
  advisory: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6907ccd9d7dc18fba4a28df9/34088c6df_Disenopaginadelconsultorinicio-17.png',
  news: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6907ccd9d7dc18fba4a28df9/77704e35b_Disenopaginadelconsultorinicio-18.png',
  community: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6907ccd9d7dc18fba4a28df9/c02c3bb1d_Disenopaginadelconsultorinicio-19.png',
}

function LanguageToggle() {
  const { i18n } = useTranslation()
  const lang = i18n.language
  const toggle = () => {
    const next = lang === 'es' ? 'en' : 'es'
    i18n.changeLanguage(next)
    localStorage.setItem('lang', next)
  }
  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
      title="Change language"
    >
      <Globe className="w-4 h-4" />
      <span>{lang === 'es' ? 'EN' : 'ES'}</span>
    </button>
  )
}

const ADVISORY_ITEMS = [
  { label: 'Brochure de membresías', url: '/brochure-membresias' },
  { label: 'Planes', url: '/membresias' },
  { label: "FAQ's", url: '/faqs' },
]

export default function Layout({ children }) {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [advisoryOpen, setAdvisoryOpen] = useState(false)
  const advisoryRef = useRef(null)
  const mobileMenuRef = useRef(null)

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false)
    setAdvisoryOpen(false)
  }, [location.pathname])

  // Close advisory dropdown when clicking outside both desktop dropdown and mobile menu
  useEffect(() => {
    function handleClick(e) {
      const inDesktop = advisoryRef.current?.contains(e.target)
      const inMobile = mobileMenuRef.current?.contains(e.target)
      if (!inDesktop && !inMobile) setAdvisoryOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const isAdmin = user?.isAdmin

  const navItems = [
    { key: 'home', tKey: 'nav.home', url: '/inicio', icon: NAV_ICONS.home },
    { key: 'resources', tKey: 'nav.resources', url: '/recursos', icon: NAV_ICONS.resources },
    { key: 'advisory', tKey: 'nav.advisory', url: '/membresias', icon: NAV_ICONS.advisory, dropdown: true },
    { key: 'news', tKey: 'nav.news', url: '/noticias', icon: NAV_ICONS.news },
    { key: 'community', tKey: 'nav.community', url: '/comunidad', icon: NAV_ICONS.community },
  ]

  function isActive(url) {
    const path = location.pathname.toLowerCase()
    const u = url.toLowerCase()
    if (u === '/inicio') return path === '/' || path === '/inicio'
    return path === u || path.startsWith(u)
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Top navbar */}
      <nav
        className="sticky top-0 z-40 w-full"
        style={{ background: 'linear-gradient(90deg, #00565f 0%, #007a85 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/inicio" className="flex-shrink-0">
              <img src={LOGO} alt="Assure For Life" style={{ width: '180px', height: 'auto' }} />
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map(item => item.dropdown ? (
                <div key={item.key} className="relative" ref={advisoryRef}>
                  <button
                    onClick={() => setAdvisoryOpen(o => !o)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive(item.url) ? 'bg-[#7db8b3] text-white' : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <img src={item.icon} alt={t(item.tKey)} className="w-4 h-4" style={{ filter: 'brightness(0) saturate(100%) invert(100%)' }} />
                    <EditableT k={item.tKey} />
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${advisoryOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {advisoryOpen && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl py-2 z-50">
                      {ADVISORY_ITEMS.map(sub => (
                        <Link key={sub.url} to={sub.url}
                          className="block px-5 py-3 text-[#00565f] text-sm hover:bg-gray-50 transition-colors">
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link key={item.key} to={item.url}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive(item.url) ? 'bg-[#7db8b3] text-white' : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <img src={item.icon} alt={t(item.tKey)} className="w-4 h-4" style={{ filter: 'brightness(0) saturate(100%) invert(100%)' }} />
                  <EditableT k={item.tKey} />
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/paneladmin"
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ml-1 transition-all ${
                    isActive('/paneladmin') ? 'bg-[#7db8b3] text-white' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <EditableT k="nav.admin" />
                </Link>
              )}
            </div>

            {/* Right: language + user */}
            <div className="hidden lg:flex items-center gap-3">
              <LanguageToggle />
              {user && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-white text-sm font-medium leading-tight">{user.nombre}</p>
                    {user.nivel && (
                      <p className="text-white/60 text-xs">{user.nivel}</p>
                    )}
                  </div>
                  <button
                    onClick={logout}
                    className="text-white/70 hover:text-white text-xs underline transition-colors"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <div className="lg:hidden flex items-center gap-2">
              <LanguageToggle />
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-md text-white hover:bg-white/20 transition-colors"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/20 bg-[#00565f]">
            <div ref={mobileMenuRef} className="px-4 py-4 space-y-1">
              {navItems.map(item => item.dropdown ? (
                <div key={item.key}>
                  <button onClick={() => setAdvisoryOpen(o => !o)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${
                      isActive(item.url) ? 'bg-[#7db8b3] text-white' : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <img src={item.icon} alt={t(item.tKey)} className="w-5 h-5" style={{ filter: 'brightness(0) saturate(100%) invert(100%)' }} />
                    <EditableT k={item.tKey} />
                    <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${advisoryOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {advisoryOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                      {ADVISORY_ITEMS.map(sub => (
                        <Link key={sub.url} to={sub.url}
                          className="block px-4 py-2 text-white/70 hover:text-white text-sm rounded-md hover:bg-white/10 transition-colors">
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link key={item.key} to={item.url}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${
                    isActive(item.url) ? 'bg-[#7db8b3] text-white' : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <img src={item.icon} alt={t(item.tKey)} className="w-5 h-5" style={{ filter: 'brightness(0) saturate(100%) invert(100%)' }} />
                  <EditableT k={item.tKey} />
                </Link>
              ))}
              {isAdmin && (
                <Link to="/paneladmin"
                  className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium bg-white/10 text-white"
                >
                  <Shield className="w-5 h-5" />
                  <span>{t('nav.admin')}</span>
                </Link>
              )}
              {user && (
                <div className="pt-2 border-t border-white/20 mt-2">
                  <p className="text-white text-sm font-medium px-4">{user.nombre}</p>
                  {user.nivel && <p className="text-white/60 text-xs px-4">{user.nivel}</p>}
                  <button
                    onClick={logout}
                    className="mt-2 ml-4 text-white/70 text-sm underline"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Page content */}
      <main>{children}</main>

      <AccessibilityWidget />
    </div>
  )
}

// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './lib/AuthContext.jsx'
import { TranslationEditProvider } from './lib/TranslationEditContext.jsx'
import TranslationEditBar from './components/TranslationEditBar.jsx'
import Layout from './components/layout/Layout.jsx'
import AccessDenied from './components/layout/AccessDenied.jsx'
import './i18n/index.js'

// Pages
import Home from './pages/Home.jsx'
import News from './pages/News.jsx'
import NewsDetail from './pages/NewsDetail.jsx'
import Resources from './pages/Resources.jsx'
import Memberships from './pages/Memberships.jsx'
import BrochureMembresias from './pages/BrochureMembresias.jsx'
import Community from './pages/Community.jsx'
import FAQs from './pages/FAQs.jsx'
import Ranking from './pages/Ranking.jsx'
import Reconocimientos from './pages/Reconocimientos.jsx'

// Admin pages
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminPanel from './pages/admin/AdminPanel.jsx'
import AdminNews from './pages/admin/AdminNews.jsx'
import AdminRecognitions from './pages/admin/AdminRecognitions.jsx'
import AdminJWT from './pages/admin/AdminJWT.jsx'
import AdminPopup from './pages/admin/AdminPopup.jsx'
import AdminPrompt from './pages/admin/AdminPrompt.jsx'
import AdminDocuments from './pages/admin/AdminDocuments.jsx'
import AdminRanking from './pages/admin/AdminRanking.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'
import AdminResources from './pages/admin/AdminResources.jsx'
import AdminAnthropicKey from './pages/admin/AdminAnthropicKey.jsx'
import Popup from './components/Popup.jsx'

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

function AppContent() {
  const { loading, accessDenied, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
        <div className="flex flex-col items-center gap-4">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6907ccd9d7dc18fba4a28df9/4b3b99f35_LogoAssurefondoblanco.png"
            alt="Assure For Life"
            className="h-14 w-auto opacity-60"
          />
          <div className="w-7 h-7 border-2 border-[#00565f] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  // Admin login page is always accessible (even without a consultant token)
  if (location.pathname === '/admin/login') {
    return <AdminLogin />
  }

  if (accessDenied) return <AccessDenied />

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/inicio" replace />} />
        <Route path="/inicio" element={<Home />} />
        <Route path="/noticias" element={<News />} />
        <Route path="/noticias/:id" element={<NewsDetail />} />
        <Route path="/detalle-noticia/:id" element={<NewsDetail />} />
        <Route path="/recursos" element={<Resources />} />
        <Route path="/membresias" element={<Memberships />} />
        <Route path="/brochure-membresias" element={<BrochureMembresias />} />
        <Route path="/comunidad" element={<Community />} />
        <Route path="/reconocimientos" element={<Reconocimientos />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/ranking-consultores" element={<Ranking />} />

        {/* Admin routes */}
        <Route path="/paneladmin" element={<AdminPanel />} />
        <Route path="/admin/noticias" element={<AdminNews />} />
        <Route path="/admin/reconocimientos" element={<AdminRecognitions />} />
        <Route path="/admin/jwt" element={<AdminJWT />} />
        <Route path="/admin/popup" element={<AdminPopup />} />
        <Route path="/admin/prompt" element={<AdminPrompt />} />
        <Route path="/admin/documentos" element={<AdminDocuments />} />
        <Route path="/admin/ranking" element={<AdminRanking />} />
        <Route path="/admin/usuarios" element={<AdminUsers />} />
        <Route path="/admin/recursos" element={<AdminResources />} />
        <Route path="/admin/anthropic-key" element={<AdminAnthropicKey />} />

        {/* Legacy base44 routes */}
        <Route path="/GestionJWT" element={<AdminJWT />} />
        <Route path="/gestion-noticias" element={<AdminNews />} />
        <Route path="/gestion-reconocimientos" element={<AdminRecognitions />} />
        <Route path="/GestionPopup" element={<AdminPopup />} />
        <Route path="/GestionPrompt" element={<AdminPrompt />} />
        <Route path="/AdminDocumentos" element={<AdminDocuments />} />
        <Route path="/PanelAdmin" element={<AdminPanel />} />

        <Route path="*" element={<Navigate to="/inicio" replace />} />
      </Routes>
      <Popup />
    </Layout>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <AuthProvider>
          <TranslationEditProvider>
            <AppContent />
            <TranslationEditBar />
          </TranslationEditProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

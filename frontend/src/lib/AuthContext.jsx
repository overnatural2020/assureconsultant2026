// src/lib/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { getToken, saveToken, validateToken, decodeToken, removeToken, getAdminToken, saveAdminToken, removeAdminToken } from './auth.js'

const AuthContext = createContext(null)

function decodeJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
  } catch { return null }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    async function init() {
      // 1. Check admin session first
      const adminToken = getAdminToken()
      if (adminToken) {
        const payload = decodeJwt(adminToken)
        if (payload && payload.authMethod === 'admin' && payload.exp * 1000 > Date.now()) {
          setUser({
            token: adminToken,
            nombre: payload.nombre || payload.username,
            username: payload.username,
            role: payload.role,
            authMethod: 'admin',
            isAdmin: true,
            isSuperAdmin: payload.role === 'super_admin',
          })
          setLoading(false)
          return
        } else {
          removeAdminToken()
        }
      }

      // 2. Fall back to consultant token (or open access if JWT is disabled)
      const token = getToken()
      const result = await validateToken(token || '')
      if (result.valid) {
        if (token) saveToken(token)
        const payload = token ? decodeToken(token) : null
        setUser({
          token: token || null,
          nombre: payload?.user?.nombre || payload?.nombre || result.nombre || 'Consultor',
          username: payload?.user?.username || payload?.username || '',
          nivel: payload?.user?.nivel || payload?.nivel || payload?.level || '',
          telefono: payload?.user?.telefono || payload?.telefono || payload?.phone || '',
          realEmail: payload?.user?.realEmail || payload?.user?.email || payload?.realEmail || payload?.email || '',
          role: 'consultant',
          authMethod: 'token',
          isAdmin: false,
          isSuperAdmin: false,
        })
        if (token) {
          const url = new URL(window.location.href)
          url.searchParams.delete('token')
          window.history.replaceState({}, '', url.toString())
        }
      } else {
        setAccessDenied(true)
      }
      setLoading(false)
    }
    init()
  }, [])

  const adminLogin = (token, userData) => {
    saveAdminToken(token)
    setUser({
      token,
      nombre: userData.nombre,
      username: userData.username,
      role: userData.role,
      authMethod: 'admin',
      isAdmin: true,
      isSuperAdmin: userData.role === 'super_admin',
    })
    setAccessDenied(false)
  }

  const logout = () => {
    if (user?.authMethod === 'admin') {
      removeAdminToken()
    } else {
      removeToken()
    }
    setUser(null)
    setAccessDenied(true)
  }

  return (
    <AuthContext.Provider value={{ user, loading, accessDenied, adminLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

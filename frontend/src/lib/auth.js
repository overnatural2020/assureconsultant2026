// src/lib/auth.js
const TOKEN_KEY = 'assure_jwt'
const ADMIN_TOKEN_KEY = 'assure_admin_token'

// ─── Admin session ──────────────────────────────────────────────────────────
export function getAdminToken() { return sessionStorage.getItem(ADMIN_TOKEN_KEY) }
export function saveAdminToken(token) { sessionStorage.setItem(ADMIN_TOKEN_KEY, token) }
export function removeAdminToken() { sessionStorage.removeItem(ADMIN_TOKEN_KEY) }

export function getTokenFromUrl() {
  const params = new URLSearchParams(window.location.search)
  return params.get('token')
}

export function saveToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token)
}

export function getStoredToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function removeToken() {
  sessionStorage.removeItem(TOKEN_KEY)
}

export function getToken() {
  return getTokenFromUrl() || getStoredToken()
}

// Decode JWT payload without verifying (verification happens on the server)
export function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

// Validate token with our backend
export async function validateToken(token) {
  try {
    const res = await fetch('/api/auth/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    if (!res.ok) return { valid: false }
    return await res.json()
  } catch {
    return { valid: false }
  }
}

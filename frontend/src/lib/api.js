// src/lib/api.js
import axios from 'axios'
import { getStoredToken, getAdminToken } from './auth.js'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(config => {
  // Admin token takes priority over consultant token
  const token = getAdminToken() || getStoredToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res.data,
  err => {
    if (err.response?.status === 401) {
      const url = err.config?.url || ''
      // Only redirect on 401 for admin-specific routes, not public content routes
      const isAdminRoute = url.includes('/admin') || url.includes('/config') || url.includes('/auth/admin')
      if (isAdminRoute) {
        sessionStorage.removeItem('assure_jwt')
        sessionStorage.removeItem('assure_admin_token')
        window.location.href = '/'
      }
    }
    return Promise.reject(err)
  }
)

export default api

export const uploadFile = (file) => {
  const fd = new FormData()
  fd.append('file', file)
  return api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
}

// Entity helpers
export const entities = {
  news: {
    list: (params) => api.get('/news', { params }),
    get: (id) => api.get(`/news/${id}`),
    create: (data) => api.post('/news', data),
    update: (id, data) => api.put(`/news/${id}`, data),
    delete: (id) => api.delete(`/news/${id}`),
  },
  resources: {
    list: (params) => api.get('/resources', { params }),
    create: (data) => api.post('/resources', data),
    update: (id, data) => api.put(`/resources/${id}`, data),
    delete: (id) => api.delete(`/resources/${id}`),
  },
  recognitions: {
    list: (params) => api.get('/recognitions', { params }),
    create: (data) => api.post('/recognitions', data),
    update: (id, data) => api.put(`/recognitions/${id}`, data),
    delete: (id) => api.delete(`/recognitions/${id}`),
  },
  ranking: {
    list: (params) => api.get('/ranking', { params }),
    create: (data) => api.post('/ranking', data),
    update: (id, data) => api.put(`/ranking/${id}`, data),
    delete: (id) => api.delete(`/ranking/${id}`),
  },
  faqs: {
    list: () => api.get('/faqs'),
    create: (data) => api.post('/faqs', data),
    update: (id, data) => api.put(`/faqs/${id}`, data),
    delete: (id) => api.delete(`/faqs/${id}`),
  },
  config: {
    getJWT: () => api.get('/config/jwt'),
    saveJWT: (data) => api.post('/config/jwt', data),
    getPopup: () => api.get('/config/popup'),
    getPublicPopup: (lang) => api.get('/config/popup/public', { params: { lang } }),
    savePopup: (data) => api.post('/config/popup', data),
    getPrompt: () => api.get('/config/prompt'),
    savePrompt: (data) => api.post('/config/prompt', data),
    getAnthropicKey: () => api.get('/config/anthropic-key'),
    saveAnthropicKey: (api_key) => api.post('/config/anthropic-key', { api_key }),
  },
  translateDuplicate: (entity, id, targetLang) =>
    api.post('/admin/translate-duplicate', { entity, id, targetLang }),
  adminUsers: {
    list: () => api.get('/admin/users'),
    create: (data) => api.post('/admin/users', data),
    update: (id, data) => api.put(`/admin/users/${id}`, data),
    delete: (id) => api.delete(`/admin/users/${id}`),
  },
  documents: {
    list: () => api.get('/documents'),
    upload: (formData) => api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/documents/${id}`),
    toggleActive: (id, activo) => api.patch(`/documents/${id}/active`, { activo }),
  },
}

import axios from 'axios'

/**
 * Instance Axios centralisée — VERSION 2
 * Nouveaux helpers : attachments, notifications, auditLogs, broadcasts
 */
const api = axios.create({
  baseURL: '/api',
  timeout: 30000, // 30s pour les uploads
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rwa_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('rwa_token')
      localStorage.removeItem('rwa_user')
      localStorage.removeItem('rwa_mailbox')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

// ── Auth ───────────────────────────────────────────
export const authApi = {
  login:            (data)  => api.post('/auth/login', data),
  forgotPassword:   (data)  => api.post('/auth/forgot-password', data),
  resetPassword:    (data)  => api.post('/auth/reset-password', data),
  updateFirstLogin: (data)  => api.patch('/auth/update-first-login', data),
}

// ── Mailbox / Messages ─────────────────────────────
export const mailboxApi = {
  me:         ()  => api.get('/mailbox/me'),
  recipients: (q) => api.get('/mailboxes/recipients', { params: { q } }),
}

export const messagesApi = {
  inbox:      ()           => api.get('/messages/inbox'),
  sent:       ()           => api.get('/messages/sent'),
  drafts:     ()           => api.get('/messages/drafts'),
  trash:      ()           => api.get('/messages/trash'),
  starred:    ()           => api.get('/messages/starred'),
  search:     (q)          => api.get('/messages/search', { params: { q } }),
  show:       (id)         => api.get(`/messages/${id}`),
  send:       (data)       => api.post('/messages/send', data),
  saveDraft:  (data)       => api.post('/messages/draft', data),
  markRead:   (id, isRead) => api.patch(`/messages/${id}/read`, { isRead }),
  toggleStar: (id)         => api.patch(`/messages/${id}/star`),
  delete:     (id)         => api.delete(`/messages/${id}`),
}

export const userApi = {
  changePassword: (data) => api.patch('/user/password', data),
}

// ── Pièces jointes ─────────────────────────────────
export const attachmentsApi = {
  /**
   * Upload de fichiers — multipart/form-data
   * onUploadProgress : callback(percent) pour la barre de progression
   */
  upload: (formData, onProgress) =>
    api.post('/attachments/upload', formData, {
      headers:          { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total))
        }
      },
    }),

  download:  (id)     => api.get(`/attachments/${id}/download`),
  delete:    (id)     => api.delete(`/attachments/${id}`),

  // Fichiers reçus — avec pagination + filtre MIME
  received:  (params) => api.get('/files/received', { params }),
}

// ── Notifications ──────────────────────────────────
export const notificationsApi = {
  list:       ()   => api.get('/notifications'),
  markRead:   (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: ()  => api.patch('/notifications/read-all'),
  clear:      ()   => api.delete('/notifications/clear'),
}

// ── Admin ──────────────────────────────────────────
export const adminApi = {
  stats:           ()         => api.get('/admin/stats'),

  users:           ()         => api.get('/admin/users'),
  user:            (id)       => api.get(`/admin/users/${id}`),
  createUser:      (data)     => api.post('/admin/users', data),
  updateUser:      (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser:      (id)       => api.delete(`/admin/users/${id}`),

  mailboxes:       ()         => api.get('/admin/mailboxes'),
  createMailbox:   (data)     => api.post('/admin/mailboxes', data),
  updateMailbox:   (id, data) => api.put(`/admin/mailboxes/${id}`, data),
  deleteMailbox:   (id)       => api.delete(`/admin/mailboxes/${id}`),

  archives:        (params)   => api.get('/admin/archives', { params }),
  exportArchives:  (params)   => api.get('/admin/archives/export', { params, responseType: 'blob' }),

  // Audit Log
  auditLogs:       (params)   => api.get('/admin/audit-logs', { params }),
  auditActions:    ()         => api.get('/admin/audit-logs/actions'),
  exportAuditLogs: (params)   => api.get('/admin/audit-logs/export', { params, responseType: 'blob' }),

  // Diffusion
  broadcasts:      ()         => api.get('/admin/broadcasts'),
  broadcastPreview:(data)     => api.post('/admin/broadcasts/preview', data),
  sendBroadcast:   (data)     => api.post('/admin/broadcasts', data),
  broadcastDetail: (id)       => api.get(`/admin/broadcasts/${id}`),
}

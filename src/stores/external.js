import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api.js'

export const useExternalStore = defineStore('external', () => {
  // ── State ──────────────────────────────────────────────────────
  const inboxMessages  = ref([])
  const sentMessages   = ref([])
  const threads        = ref([])
  const activeThread   = ref(null)     // fil de discussion actif
  const threadMessages = ref([])
  const unreadCount    = ref(0)
  const loading        = ref(false)
  const error          = ref(null)

  // ── Getters ────────────────────────────────────────────────────
  const hasUnread = computed(() => unreadCount.value > 0)

  // ── Actions ────────────────────────────────────────────────────

  async function fetchInbox(page = 1) {
    loading.value = true
    try {
      const { data } = await api.get('/messages/external-inbox', { params: { page, perPage: 30 } })
      inboxMessages.value = data.data
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur chargement'
    } finally {
      loading.value = false
    }
  }

  async function fetchSent(page = 1) {
    loading.value = true
    try {
      const { data } = await api.get('/messages/external-sent', { params: { page, perPage: 30 } })
      sentMessages.value = data.data
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur chargement'
    } finally {
      loading.value = false
    }
  }

  async function fetchThreads() {
    loading.value = true
    try {
      const { data } = await api.get('/external/threads')
      threads.value = data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur chargement fils'
    } finally {
      loading.value = false
    }
  }

  async function fetchThreadMessages(email) {
    loading.value = true
    try {
      const { data } = await api.get(`/external/threads/${encodeURIComponent(email)}`)
      threadMessages.value = data

      // Mettre à jour le badge de non-lus
      const thread = threads.value.find((t) => t.externalEmail === email)
      if (thread) thread.hasUnread = false

      refreshUnreadCount()
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur chargement conversation'
    } finally {
      loading.value = false
    }
  }

  async function sendEmail(payload) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await api.post('/external/send', payload)
      // Ajouter le message envoyé dans la conversation active
      await fetchThreadMessages(payload.toEmail)
      return { success: true, data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur envoi'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  async function refreshUnreadCount() {
    try {
      const { data } = await api.get('/external/unread-count')
      unreadCount.value = data.count
    } catch { /* silencieux */ }
  }

  function setActiveThread(thread) {
    activeThread.value = thread
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    inboxMessages, sentMessages, threads, activeThread,
    threadMessages, unreadCount, loading, error,
    // Getters
    hasUnread,
    // Actions
    fetchInbox, fetchSent, fetchThreads, fetchThreadMessages,
    sendEmail, refreshUnreadCount, setActiveThread, clearError,
  }
})

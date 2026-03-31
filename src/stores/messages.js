import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { messagesApi, mailboxApi } from '@/services/api.js'

export const useMessagesStore = defineStore('messages', () => {
  // ── State ──────────────────────────────────────────
  const messages      = ref([])
  const currentMessage = ref(null)
  const loading       = ref(false)
  const error         = ref(null)
  const folder        = ref('inbox')   // inbox | sent | drafts | trash | starred
  const searchQuery   = ref('')
  const searchResults = ref([])
  const unreadCount   = ref(0)

  // Polling interval handle
  let pollingInterval = null

  // ── Getters ────────────────────────────────────────
  const unreadMessages = computed(() =>
    messages.value.filter((m) => !m.isRead)
  )

  // ── Actions ────────────────────────────────────────

  async function fetchFolder(folderName) {
    loading.value = true
    error.value   = null
    folder.value  = folderName

    try {
      const map = {
        inbox:   () => messagesApi.inbox(),
        sent:    () => messagesApi.sent(),
        drafts:  () => messagesApi.drafts(),
        trash:   () => messagesApi.trash(),
        starred: () => messagesApi.starred(),
      }
      const fetcher = map[folderName]
      if (!fetcher) return

      const { data } = await fetcher()
      messages.value = data

      // Compter non-lus pour l'inbox
      if (folderName === 'inbox') {
        unreadCount.value = data.filter((m) => !m.isRead).length
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur de chargement'
    } finally {
      loading.value = false
    }
  }

  async function fetchMessage(id) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await messagesApi.show(id)
      currentMessage.value = data

      // Mettre à jour le statut lu dans la liste locale
      const idx = messages.value.findIndex((m) => m.id === id)
      if (idx !== -1) {
        messages.value[idx].isRead = true
        // Décrémenter le compteur non-lus
        if (unreadCount.value > 0) unreadCount.value--
      }

      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Message introuvable'
      return null
    } finally {
      loading.value = false
    }
  }

  async function sendMessage(payload) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await messagesApi.send(payload)
      return { success: true, data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'envoi'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  async function saveDraft(payload) {
    try {
      const { data } = await messagesApi.saveDraft(payload)
      return { success: true, data }
    } catch (err) {
      return { success: false, message: err.response?.data?.message }
    }
  }

  async function toggleStar(id) {
    try {
      const { data } = await messagesApi.toggleStar(id)
      // Mettre à jour localement
      const msg = messages.value.find((m) => m.id === id)
      if (msg) msg.isStarred = data.isStarred
      if (currentMessage.value?.id === id) {
        currentMessage.value.isStarred = data.isStarred
      }
      return data.isStarred
    } catch (err) {
      console.error('Erreur toggleStar:', err)
    }
  }

  async function deleteMessage(id) {
    try {
      await messagesApi.delete(id)
      // Retirer de la liste locale
      messages.value = messages.value.filter((m) => m.id !== id)
      if (currentMessage.value?.id === id) {
        currentMessage.value = null
      }
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message }
    }
  }

  async function markRead(id, isRead = true) {
    try {
      await messagesApi.markRead(id, isRead)
      const msg = messages.value.find((m) => m.id === id)
      if (msg) {
        const wasUnread = !msg.isRead
        msg.isRead = isRead
        if (wasUnread && isRead && unreadCount.value > 0) unreadCount.value--
        if (!wasUnread && !isRead) unreadCount.value++
      }
    } catch (err) {
      console.error('Erreur markRead:', err)
    }
  }

  async function search(q) {
    if (!q || q.length < 2) {
      searchResults.value = []
      return
    }
    try {
      const { data } = await messagesApi.search(q)
      searchResults.value = data
    } catch (err) {
      searchResults.value = []
    }
  }

  async function fetchRecipients(q = '') {
    try {
      const { data } = await mailboxApi.recipients(q)
      return data
    } catch {
      return []
    }
  }

  /**
   * Polling toutes les 10s pour détecter les nouveaux messages
   */
  function startPolling() {
    stopPolling()
    pollingInterval = setInterval(async () => {
      try {
        const { data } = await messagesApi.inbox()
        const newUnread = data.filter((m) => !m.isRead).length

        // Si on est dans l'inbox, mettre à jour silencieusement
        if (folder.value === 'inbox') {
          messages.value = data
        }
        unreadCount.value = newUnread
      } catch {
        // Silencieux — ne pas déranger l'utilisateur
      }
    }, 10000)
  }

  function stopPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
  }

  function clearCurrent() {
    currentMessage.value = null
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    messages, currentMessage, loading, error,
    folder, searchQuery, searchResults, unreadCount,
    // Getters
    unreadMessages,
    // Actions
    fetchFolder, fetchMessage, sendMessage, saveDraft,
    toggleStar, deleteMessage, markRead, search,
    fetchRecipients, startPolling, stopPolling,
    clearCurrent, clearError,
  }
})

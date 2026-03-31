import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminApi } from '@/services/api.js'

export const useAdminStore = defineStore('admin', () => {
  // ── State ──────────────────────────────────────────
  const users     = ref([])
  const mailboxes = ref([])
  const archives  = ref([])
  const archivesMeta = ref(null)
  const stats     = ref(null)
  const loading   = ref(false)
  const error     = ref(null)

  // ── STATISTIQUES ───────────────────────────────────
  async function fetchStats() {
    loading.value = true
    try {
      const { data } = await adminApi.stats()
      stats.value = data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur chargement stats'
    } finally {
      loading.value = false
    }
  }

  // ── UTILISATEURS ───────────────────────────────────
  async function fetchUsers() {
    loading.value = true
    try {
      const { data } = await adminApi.users()
      users.value = data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur chargement utilisateurs'
    } finally {
      loading.value = false
    }
  }

  async function createUser(payload) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await adminApi.createUser(payload)
      await fetchUsers()
      return { success: true, data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur création utilisateur'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  async function updateUser(id, payload) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await adminApi.updateUser(id, payload)
      const idx = users.value.findIndex((u) => u.id === id)
      if (idx !== -1) users.value[idx] = { ...users.value[idx], ...data.data }
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur mise à jour utilisateur'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  async function deleteUser(id) {
    loading.value = true
    error.value   = null
    try {
      await adminApi.deleteUser(id)
      // Marquer comme supprimé localement (soft delete)
      const user = users.value.find((u) => u.id === id)
      if (user) {
        user.isDeleted = true
        user.isActive  = false
      }
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur suppression utilisateur'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  // ── BOÎTES MAIL ────────────────────────────────────
  async function fetchMailboxes() {
    loading.value = true
    try {
      const { data } = await adminApi.mailboxes()
      mailboxes.value = data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur chargement boîtes mail'
    } finally {
      loading.value = false
    }
  }

  async function createMailbox(payload) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await adminApi.createMailbox(payload)
      await fetchMailboxes()
      return { success: true, data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur création boîte mail'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  async function updateMailbox(id, payload) {
    loading.value = true
    error.value   = null
    try {
      await adminApi.updateMailbox(id, payload)
      await fetchMailboxes()
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur mise à jour boîte mail'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  async function deleteMailbox(id) {
    loading.value = true
    error.value   = null
    try {
      await adminApi.deleteMailbox(id)
      const mb = mailboxes.value.find((m) => m.id === id)
      if (mb) mb.isActive = false
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur désactivation boîte mail'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  // ── ARCHIVES ───────────────────────────────────────
  async function fetchArchives(params = {}) {
    loading.value = true
    try {
      const { data } = await adminApi.archives(params)
      archives.value     = data.data
      archivesMeta.value = data.meta
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur chargement archives'
    } finally {
      loading.value = false
    }
  }

  async function exportArchives(params = {}) {
    try {
      const { data } = await adminApi.exportArchives(params)
      // Déclencher le téléchargement du CSV
      const url  = URL.createObjectURL(new Blob([data], { type: 'text/csv;charset=utf-8;' }))
      const link = document.createElement('a')
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      link.href     = url
      link.download = `archives_rwa_${date}.csv`
      link.click()
      URL.revokeObjectURL(url)
      return { success: true }
    } catch (err) {
      return { success: false, message: 'Erreur export CSV' }
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    users, mailboxes, archives, archivesMeta, stats, loading, error,
    // Actions
    fetchStats,
    fetchUsers, createUser, updateUser, deleteUser,
    fetchMailboxes, createMailbox, updateMailbox, deleteMailbox,
    fetchArchives, exportArchives,
    clearError,
  }
})

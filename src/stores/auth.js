import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/services/api.js'
import router from '@/router/index.js'

export const useAuthStore = defineStore('auth', () => {
  // ── State ──────────────────────────────────────────
  const token   = ref(localStorage.getItem('rwa_token') || null)
  const user    = ref(JSON.parse(localStorage.getItem('rwa_user')    || 'null'))
  const mailbox = ref(JSON.parse(localStorage.getItem('rwa_mailbox') || 'null'))
  const loading = ref(false)
  const error   = ref(null)

  // ── Getters ────────────────────────────────────────
  const isAuthenticated = computed(() => !!token.value)
  const isSuperAdmin    = computed(() => user.value?.role === 'SUPERADMIN')
  const isFirstLogin    = computed(() => user.value?.isFirstLogin === true)
  const currentRole     = computed(() => user.value?.role || null)

  // ── Actions ────────────────────────────────────────

  /**
   * Connexion : stocke JWT + user + mailbox en localStorage
   */
  async function login(email, password) {
    loading.value = true
    error.value   = null

    try {
      const { data } = await authApi.login({ email, password })

      // Persister en localStorage
      token.value   = data.token
      user.value    = data.user
      mailbox.value = data.mailbox

      localStorage.setItem('rwa_token',   data.token)
      localStorage.setItem('rwa_user',    JSON.stringify(data.user))
      localStorage.setItem('rwa_mailbox', JSON.stringify(data.mailbox))

      // Redirection selon l'état
      if (data.user.isFirstLogin) {
        await router.push('/first-login')
      } else if (data.user.role === 'SUPERADMIN') {
        await router.push('/admin/dashboard')
      } else {
        await router.push('/webmail/inbox')
      }

      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur de connexion'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Première connexion : définir le nouveau mot de passe
   */
  async function updateFirstLogin(newPassword) {
    loading.value = true
    error.value   = null
    try {
      await authApi.updateFirstLogin({ newPassword })

      // Mettre à jour le flag en local
      if (user.value) {
        user.value.isFirstLogin = false
        localStorage.setItem('rwa_user', JSON.stringify(user.value))
      }

      await router.push('/webmail/inbox')
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du changement de mot de passe'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Déconnexion : nettoyer tout et rediriger
   */
  function logout() {
    token.value   = null
    user.value    = null
    mailbox.value = null
    error.value   = null

    localStorage.removeItem('rwa_token')
    localStorage.removeItem('rwa_user')
    localStorage.removeItem('rwa_mailbox')

    router.push('/login')
  }

  /**
   * Mettre à jour les infos mailbox (ex: après changement de type)
   */
  function updateMailbox(newMailbox) {
    mailbox.value = newMailbox
    localStorage.setItem('rwa_mailbox', JSON.stringify(newMailbox))
  }

  return {
    // State
    token, user, mailbox, loading, error,
    // Getters
    isAuthenticated, isSuperAdmin, isFirstLogin, currentRole,
    // Actions
    login, logout, updateFirstLogin, updateMailbox,
  }
})

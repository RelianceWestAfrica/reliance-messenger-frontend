import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api.js'

export const useNotificationsStore = defineStore('notifications', () => {
  // ── State ──────────────────────────────────────────
  const notifications = ref([])
  const unreadCount   = ref(0)
  const soundEnabled  = ref(
    localStorage.getItem('rwa_notif_sound') !== 'false'
  )

  // Dernier ID connu pour détecter les nouvelles notifs
  let lastKnownIds = new Set()

  // ── Getters ────────────────────────────────────────
  const hasUnread = computed(() => unreadCount.value > 0)
  const unreadNotifications = computed(() =>
    notifications.value.filter((n) => !n.isRead)
  )

  // ── Actions ────────────────────────────────────────
  async function fetch() {
    try {
      const { data } = await api.get('/notifications')
      const incoming  = data.notifications

      // Détecter les nouvelles notifications
      const newOnes = incoming.filter((n) => !lastKnownIds.has(n.id) && !n.isRead)

      if (newOnes.length > 0 && lastKnownIds.size > 0) {
        // Émettre un événement custom pour le toast
        newOnes.forEach((n) => {
          window.dispatchEvent(new CustomEvent('rwa:new-notification', { detail: n }))
        })

        // Son de notification
        if (soundEnabled.value) {
          playNotificationSound()
        }

        // Badge sur l'onglet navigateur
        updateTabTitle(data.unreadCount)
      }

      // Mettre à jour le Set des IDs connus
      lastKnownIds = new Set(incoming.map((n) => n.id))

      notifications.value = incoming
      unreadCount.value   = data.unreadCount
    } catch {
      // Silencieux
    }
  }

  async function markRead(id) {
    try {
      await api.patch(`/notifications/${id}/read`)
      const notif = notifications.value.find((n) => n.id === id)
      if (notif && !notif.isRead) {
        notif.isRead = true
        if (unreadCount.value > 0) unreadCount.value--
      }
    } catch { /* silencieux */ }
  }

  async function markAllRead() {
    try {
      await api.patch('/notifications/read-all')
      notifications.value.forEach((n) => { n.isRead = true })
      unreadCount.value = 0
      restoreTabTitle()
    } catch { /* silencieux */ }
  }

  async function clear() {
    try {
      await api.delete('/notifications/clear')
      notifications.value = notifications.value.filter((n) => !n.isRead)
    } catch { /* silencieux */ }
  }

  function toggleSound() {
    soundEnabled.value = !soundEnabled.value
    localStorage.setItem('rwa_notif_sound', String(soundEnabled.value))
  }

  // ── Helpers privés ────────────────────────────────

  let audioCtx = null;
  
  function playNotificationSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Navigateur sans AudioContext');
    }
  }

  const originalTitle = document.title

  function updateTabTitle(count) {
    if (count > 0) {
      document.title = `(${count > 99 ? '99+' : count}) ${originalTitle.replace(/^\(\d+\+?\) /, '')}`
    } else {
      restoreTabTitle()
    }
  }

  function restoreTabTitle() {
    document.title = originalTitle.replace(/^\(\d+\+?\) /, '')
  }

  return {
    // State
    notifications, unreadCount, soundEnabled,
    // Getters
    hasUnread, unreadNotifications,
    // Actions
    fetch, markRead, markAllRead, clear, toggleSound,
  }
})

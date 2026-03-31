import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminApi } from '@/services/api.js'

export const useBroadcastStore = defineStore('broadcasts', () => {
  const broadcasts = ref([])
  const loading    = ref(false)
  const error      = ref(null)

  async function fetchBroadcasts() {
    loading.value = true
    try {
      const { data } = await adminApi.broadcasts()
      broadcasts.value = data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur chargement diffusions'
    } finally {
      loading.value = false
    }
  }

  async function preview(payload) {
    try {
      const { data } = await adminApi.broadcastPreview(payload)
      return { success: true, data }
    } catch (err) {
      return { success: false, message: err.response?.data?.message }
    }
  }

  async function send(payload) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await adminApi.sendBroadcast(payload)
      await fetchBroadcasts()
      return { success: true, data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur envoi diffusion'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  return { broadcasts, loading, error, fetchBroadcasts, preview, send }
})

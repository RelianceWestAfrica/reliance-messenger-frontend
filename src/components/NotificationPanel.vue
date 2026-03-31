<template>
  <!-- Bouton cloche + badge -->
  <div class="relative">
    <button
      @click="open = !open"
      :class="['relative p-2 rounded-xl transition-colors', open ? 'bg-white/20 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white']"
      title="Notifications"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
      </svg>
      <!-- Badge non-lus -->
      <span
        v-if="store.unreadCount > 0"
        class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent rounded-full flex items-center justify-center text-white text-[10px] font-bold"
      >
        {{ store.unreadCount > 9 ? '9+' : store.unreadCount }}
      </span>
    </button>

    <!-- Panneau déroulant -->
    <Transition name="slide-down">
      <div
        v-if="open"
        class="absolute bottom-full left-0 mb-2 w-80 bg-white rounded-2xl shadow-modal border border-gray-100 overflow-hidden z-50"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 class="text-sm font-semibold text-gray-900">
            Notifications
            <span v-if="store.unreadCount" class="ml-1.5 text-xs bg-accent text-white px-1.5 py-0.5 rounded-full">
              {{ store.unreadCount }}
            </span>
          </h3>
          <div class="flex items-center gap-2">
            <!-- Toggle son -->
            <button
              @click="store.toggleSound()"
              :title="store.soundEnabled ? 'Désactiver le son' : 'Activer le son'"
              :class="['p-1 rounded-lg text-xs transition-colors', store.soundEnabled ? 'text-primary' : 'text-gray-400']"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="store.soundEnabled" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0 0l-3-3m3 3l3-3M9 12H3"/>
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
              </svg>
            </button>
            <!-- Tout lire -->
            <button
              v-if="store.unreadCount > 0"
              @click="store.markAllRead()"
              class="text-xs text-primary hover:text-accent transition-colors"
            >
              Tout lire
            </button>
            <!-- Vider lues -->
            <button
              @click="store.clear()"
              class="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Vider
            </button>
          </div>
        </div>

        <!-- Liste -->
        <div class="max-h-72 overflow-y-auto">
          <div v-if="!store.notifications.length" class="px-4 py-8 text-center">
            <p class="text-sm text-gray-400">Aucune notification</p>
          </div>

          <div
            v-for="notif in store.notifications"
            :key="notif.id"
            :class="[
              'flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-50 last:border-0',
              notif.isRead ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/50 hover:bg-blue-50',
            ]"
            @click="handleClick(notif)"
          >
            <!-- Icône -->
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5', iconBg(notif.type)]">
              <span class="text-xs">{{ iconEmoji(notif.type) }}</span>
            </div>

            <div class="flex-1 min-w-0">
              <p :class="['text-sm truncate', notif.isRead ? 'text-gray-700' : 'text-gray-900 font-medium']">
                {{ notif.title }}
              </p>
              <p v-if="notif.body" class="text-xs text-gray-400 truncate mt-0.5">{{ notif.body }}</p>
              <p class="text-xs text-gray-300 mt-0.5">{{ timeAgo(notif.createdAt) }}</p>
            </div>

            <!-- Point non-lu -->
            <div v-if="!notif.isRead" class="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationsStore } from '@/stores/notifications.js'

const store  = useNotificationsStore()
const router = useRouter()
const open   = ref(false)

async function handleClick(notif) {
  if (!notif.isRead) await store.markRead(notif.id)
  if (notif.messageId) {
    open.value = false
    router.push(`/webmail/message/${notif.messageId}`)
  }
}

function iconBg(type) {
  return { new_message: 'bg-blue-100', broadcast: 'bg-purple-100', system: 'bg-gray-100' }[type] || 'bg-gray-100'
}
function iconEmoji(type) {
  return { new_message: '✉️', broadcast: '📣', system: '🔔' }[type] || '🔔'
}

function timeAgo(date) {
  if (!date) return ''
  const diff = Math.floor((Date.now() - new Date(date)) / 1000)
  if (diff < 60)   return 'à l\'instant'
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}
</script>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from, .slide-down-leave-to       { opacity: 0; transform: translateY(8px); }
</style>

<template>
  <div class="flex h-screen bg-bg overflow-hidden">

    <!-- SIDEBAR -->
    <aside :class="['flex-shrink-0 flex flex-col bg-primary text-white transition-all duration-300 relative', sidebarOpen ? 'w-60' : 'w-16']">

      <!-- Logo -->
      <div class="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div class="w-8 h-8 flex-shrink-0 rounded-lg bg-white/15 flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
        </div>
        <Transition name="fade">
          <div v-if="sidebarOpen" class="min-w-0">
            <p class="text-sm font-bold truncate leading-tight">RELIANCE MESSENGER</p>
            <p class="text-xs text-blue-300 truncate">{{ authStore.mailbox?.emailAddress }}</p>
          </div>
        </Transition>
      </div>

      <!-- Bouton Nouveau message interne -->
      <div class="px-3 py-4">
        <button
          @click="showCompose = true"
          :class="['w-full flex items-center gap-2.5 bg-accent hover:bg-opacity-90 text-white rounded-xl font-medium text-sm transition-all', sidebarOpen ? 'px-4 py-2.5' : 'px-0 py-2.5 justify-center']"
        >
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <span v-if="sidebarOpen">Nouveau message</span>
        </button>
      </div>

      <!-- Navigation scrollable -->
      <nav class="flex-1 px-2 overflow-y-auto space-y-0.5">

        <!-- ── Section INTERNE ─────────────────────────────────── -->
        <div v-if="sidebarOpen" class="px-3 pt-1 pb-1">
          <p class="text-[10px] font-semibold text-blue-300/70 uppercase tracking-widest">Messagerie interne</p>
        </div>
        <div v-else class="border-t border-white/10 my-1" />

        <RouterLink v-for="item in internalNavItems" :key="item.name" :to="item.to" custom v-slot="{ isActive, navigate }">
          <button
            @click="navigate"
            :class="['w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all', isActive ? 'bg-white/15 text-white font-medium' : 'text-blue-200 hover:bg-white/10 hover:text-white', !sidebarOpen ? 'justify-center' : '']"
          >
            <span class="text-base flex-shrink-0">{{ item.emoji }}</span>
            <span v-if="sidebarOpen" class="truncate flex-1 text-left">{{ item.label }}</span>
            <!-- Badge non-lus inbox interne -->
            <span
              v-if="sidebarOpen && item.name === 'inbox' && messagesStore.unreadCount > 0"
              class="ml-auto bg-accent text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
            >
              {{ messagesStore.unreadCount > 99 ? '99+' : messagesStore.unreadCount }}
            </span>
          </button>
        </RouterLink>

        <!-- ── Séparateur + Section EXTERNE ───────────────────── -->
        <div class="pt-2 pb-1">
          <div v-if="sidebarOpen" class="px-3">
            <p class="text-[10px] font-semibold text-orange-200/80 uppercase tracking-widest flex items-center gap-1.5">
              <span></span> Externe
            </p>
          </div>
          <div v-else class="border-t border-white/10 my-1" />
        </div>

        <!-- Lien Externes unique -->
        <RouterLink to="/webmail/external" custom v-slot="{ isActive, navigate }">
          <button
            @click="navigate"
            :class="['w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all', isActive ? 'bg-orange-500/20 text-orange-200 font-medium border border-orange-400/20' : 'text-orange-200/70 hover:bg-white/10 hover:text-orange-200', !sidebarOpen ? 'justify-center' : '']"
          >
            <span class="text-base flex-shrink-0">📧</span>
            <span v-if="sidebarOpen" class="truncate flex-1 text-left">Emails externes</span>
            <!-- Badge non-lus externes -->
            <span
              v-if="sidebarOpen && externalStore.unreadCount > 0"
              class="ml-auto bg-orange-400 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
            >
              {{ externalStore.unreadCount > 99 ? '99+' : externalStore.unreadCount }}
            </span>
            <!-- Badge condensé si sidebar fermée -->
            <span
              v-if="!sidebarOpen && externalStore.unreadCount > 0"
              class="absolute right-1 top-1 w-2 h-2 bg-orange-400 rounded-full"
            />
          </button>
        </RouterLink>

      </nav>

      <!-- Bas de sidebar -->
      <div class="border-t border-white/10 p-3 space-y-2">
        <!-- Notifications -->
        <div :class="['flex', sidebarOpen ? 'justify-start' : 'justify-center']">
          <NotificationPanel />
          <span v-if="sidebarOpen" class="ml-2 text-sm text-blue-200 self-center">Notifications</span>
        </div>

        <!-- Admin link -->
        <div v-if="authStore.isSuperAdmin" :class="sidebarOpen ? '' : 'flex justify-center'">
          <RouterLink to="/admin/dashboard" custom v-slot="{ navigate }">
            <button
              @click="navigate"
              :class="['flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-blue-200 hover:bg-white/10 hover:text-white transition-all', !sidebarOpen ? 'justify-center' : 'w-full']"
            >
              <span class="text-base">⚙️</span>
              <span v-if="sidebarOpen">Administration</span>
            </button>
          </RouterLink>
        </div>

        <!-- Profil + logout -->
        <div :class="['flex items-center gap-3', !sidebarOpen ? 'justify-center' : '']">
          <div class="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {{ authStore.user?.fullName?.charAt(0).toUpperCase() }}
          </div>
          <div v-if="sidebarOpen" class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white truncate">{{ authStore.user?.fullName }}</p>
            <p class="text-xs text-blue-300 truncate">{{ authStore.user?.role }}</p>
          </div>
          <button v-if="sidebarOpen" @click="handleLogout" class="p-1.5 rounded-lg text-blue-300 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Toggle sidebar -->
      <button @click="sidebarOpen = !sidebarOpen" class="absolute left-full top-1/2 -translate-y-1/2 w-5 h-10 bg-primary rounded-r-lg flex items-center justify-center text-blue-300 hover:text-white transition-colors z-10">
        <svg class="w-3 h-3 transition-transform" :class="sidebarOpen ? '' : 'rotate-180'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
    </aside>

    <!-- CONTENU PRINCIPAL -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Topbar -->
      <header class="flex-shrink-0 bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4">
        <h1 class="text-base font-semibold text-gray-900 flex-shrink-0">{{ currentSectionTitle }}</h1>

        <!-- Badge "Externe" si on est dans la section externe -->
        <span v-if="isExternalSection" class="bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
          🌐 Email externe
        </span>

        <div class="flex-1 max-w-md relative" v-if="!isExternalSection">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input v-model="searchQuery" type="text" placeholder="Rechercher…" class="input pl-9 text-sm py-1.5" @input="onSearch" />
        </div>

        <div class="flex items-center gap-2 ml-auto">
          <button @click="refresh" :class="['p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors', refreshing ? 'animate-spin' : '']">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
          <RouterLink to="/webmail/settings" class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </RouterLink>
        </div>
      </header>

      <main class="flex-1 overflow-hidden">
        <RouterView />
      </main>
    </div>

    <!-- Modals -->
    <ComposeModal v-model="showCompose" @sent="onMessageSent" />
    <NotificationToast />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useAuthStore }          from '@/stores/auth.js'
import { useMessagesStore }      from '@/stores/messages.js'
import { useNotificationsStore } from '@/stores/notifications.js'
import { useExternalStore }      from '@/stores/external.js'
import ComposeModal      from '@/components/ComposeModal.vue'
import NotificationPanel from '@/components/NotificationPanel.vue'
import NotificationToast from '@/components/NotificationToast.vue'

const authStore          = useAuthStore()
const messagesStore      = useMessagesStore()
const notificationsStore = useNotificationsStore()
const externalStore      = useExternalStore()
const route              = useRoute()

const sidebarOpen = ref(true)
const showCompose = ref(false)
const searchQuery = ref('')
const refreshing  = ref(false)

// ── Navigation interne (sans "Externes") ─────────────────────────
const internalNavItems = [
  { name: 'inbox',   emoji: '📥', label: 'Boîte de réception', to: '/webmail/inbox'   },
  { name: 'sent',    emoji: '📤', label: 'Messages envoyés',    to: '/webmail/sent'    },
  { name: 'drafts',  emoji: '📝', label: 'Brouillons',          to: '/webmail/drafts'  },
  { name: 'files',   emoji: '📎', label: 'Fichiers reçus',      to: '/webmail/files'   },
  { name: 'starred', emoji: '⭐', label: 'Favoris',             to: '/webmail/starred' },
  { name: 'trash',   emoji: '🗑️', label: 'Corbeille',           to: '/webmail/trash'   },
]

const sectionTitles = {
  '/webmail/inbox':    'Boîte de réception',
  '/webmail/sent':     'Messages envoyés',
  '/webmail/drafts':   'Brouillons',
  '/webmail/files':    'Fichiers reçus',
  '/webmail/starred':  'Favoris',
  '/webmail/trash':    'Corbeille',
  '/webmail/external': 'Emails externes',
  '/webmail/settings': 'Paramètres',
}

const currentSectionTitle = computed(() => sectionTitles[route.path] || 'Messagerie')
const isExternalSection   = computed(() => route.path.startsWith('/webmail/external'))

// Polling messages + notifications + externes
let pollingInterval = null

onMounted(() => {
  messagesStore.startPolling()
  notificationsStore.fetch()
  externalStore.refreshUnreadCount()

  pollingInterval = setInterval(() => {
    notificationsStore.fetch()
    externalStore.refreshUnreadCount()
  }, 10000)
})

onUnmounted(() => {
  messagesStore.stopPolling()
  clearInterval(pollingInterval)
})

let searchTimer = null
function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (searchQuery.value.length >= 2) messagesStore.search(searchQuery.value)
  }, 400)
}

async function refresh() {
  refreshing.value = true
  const folder = route.path.split('/').pop()
  if (folder === 'external') {
    await externalStore.fetchThreads()
    await externalStore.refreshUnreadCount()
  } else {
    await messagesStore.fetchFolder(folder)
    await notificationsStore.fetch()
  }
  setTimeout(() => { refreshing.value = false }, 600)
}

function onMessageSent() {
  if (route.path === '/webmail/sent') messagesStore.fetchFolder('sent')
}

function handleLogout() {
  messagesStore.stopPolling()
  clearInterval(pollingInterval)
  authStore.logout()
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>

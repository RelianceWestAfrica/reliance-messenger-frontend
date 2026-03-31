<template>
  <div class="flex h-full overflow-hidden">

    <!-- ── Colonne gauche : liste des fils ──────────────────────── -->
    <div :class="['flex flex-col border-r border-gray-100 overflow-hidden transition-all', activeThread ? 'w-72 flex-shrink-0' : 'flex-1']">

      <!-- Tabs : Reçus / Envoyés -->
      <div class="flex border-b border-gray-100 bg-white flex-shrink-0">
        <button
          v-for="tab in tabs" :key="tab.key"
          @click="activeTab = tab.key; loadTab()"
          :class="['flex-1 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px', activeTab === tab.key ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-gray-700']"
        >
          {{ tab.label }}
          <span v-if="tab.key === 'inbox' && externalStore.unreadCount > 0"
            class="ml-1.5 bg-accent text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            {{ externalStore.unreadCount }}
          </span>
        </button>
      </div>

      <!-- Bouton composer vers externe -->
      <div class="px-3 py-2.5 border-b border-gray-50 flex-shrink-0">
        <button
          @click="showCompose = true"
          class="w-full flex items-center gap-2 bg-accent text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-opacity-90 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nouveau message externe
        </button>
      </div>

      <!-- Chargement -->
      <div v-if="externalStore.loading && !displayList.length" class="flex-1 flex items-center justify-center">
        <svg class="animate-spin w-7 h-7 text-primary/30" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
      </div>

      <!-- Vide -->
      <div v-else-if="!displayList.length" class="flex-1 flex items-center justify-center p-8">
        <div class="text-center">
          <div class="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span class="text-2xl">🌐</span>
          </div>
          <p class="text-sm font-medium text-gray-500">Aucun email externe</p>
          <p class="text-xs text-gray-400 mt-1">
            {{ activeTab === 'inbox' ? 'Les emails de vos contacts apparaîtront ici' : 'Vos emails envoyés apparaîtront ici' }}
          </p>
        </div>
      </div>

      <!-- Liste des messages/fils -->
      <div v-else class="flex-1 overflow-y-auto">

        <!-- Onglet Reçus : vue par fil de discussion -->
        <template v-if="activeTab === 'inbox'">
          <div
            v-for="thread in externalStore.threads" :key="thread.id"
            @click="openThread(thread)"
            :class="['flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 transition-colors', activeThread?.id === thread.id ? 'bg-primary/5 border-l-2 border-l-primary' : thread.hasUnread ? 'bg-orange-50/40 hover:bg-orange-50/60' : 'bg-white hover:bg-gray-50']"
          >
            <!-- Avatar externe -->
            <div class="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-semibold text-sm flex-shrink-0 mt-0.5">
              {{ thread.externalName?.charAt(0).toUpperCase() || '?' }}
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <span :class="['text-sm truncate', thread.hasUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700']">
                  {{ thread.externalName || thread.externalEmail }}
                </span>
                <span class="text-xs text-gray-400 flex-shrink-0">{{ formatDate(thread.lastMessageAt) }}</span>
              </div>
              <p class="text-xs text-gray-500 truncate mt-0.5">{{ thread.subject }}</p>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-xs text-gray-400">{{ thread.externalEmail }}</span>
                <span class="text-xs text-gray-300">·</span>
                <span class="text-xs text-gray-400">{{ thread.messageCount }} message(s)</span>
                <div v-if="thread.hasUnread" class="ml-auto w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
              </div>
            </div>
          </div>
        </template>

        <!-- Onglet Envoyés : liste simple -->
        <template v-else>
          <div
            v-for="msg in externalStore.sentMessages" :key="msg.id"
            @click="selectedSentMsg = msg"
            :class="['flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 transition-colors', selectedSentMsg?.id === msg.id ? 'bg-primary/5 border-l-2 border-l-primary' : 'bg-white hover:bg-gray-50']"
          >
            <div class="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0 mt-0.5">
              {{ msg.externalSender?.name?.charAt(0).toUpperCase() || '?' }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <span class="text-sm font-medium text-gray-700 truncate">
                  → {{ msg.externalSender?.name || msg.externalSender?.email }}
                </span>
                <span class="text-xs text-gray-400 flex-shrink-0">{{ formatDate(msg.sentAt) }}</span>
              </div>
              <p class="text-sm text-gray-600 truncate">{{ msg.subject }}</p>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- ── Panneau de droite : conversation ────────────────────── -->
    <div v-if="activeThread" class="flex-1 flex flex-col bg-white overflow-hidden">

      <!-- Header conversation -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <div class="flex items-center gap-3">
          <button @click="activeThread = null" class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 lg:hidden">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div class="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-semibold text-sm">
            {{ activeThread.externalName?.charAt(0).toUpperCase() || '?' }}
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-900">{{ activeThread.externalName || activeThread.externalEmail }}</p>
            <p class="text-xs text-gray-400">{{ activeThread.externalEmail }}</p>
          </div>
        </div>
        <!-- Bouton répondre -->
        <button
          @click="openReply"
          class="btn-accent text-sm flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
          </svg>
          Répondre
        </button>
      </div>

      <!-- Fil de messages -->
      <div class="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <div
          v-for="msg in externalStore.threadMessages" :key="msg.id"
          :class="['flex gap-3', msg.externalSender?.email === activeThread?.externalEmail ? 'flex-row' : 'flex-row-reverse']"
        >
          <!-- Bulle message -->
          <div :class="['max-w-[75%]', msg.externalSender?.email === activeThread?.externalEmail ? '' : 'items-end']">
            <div
              :class="[
                'rounded-2xl px-4 py-3 text-sm',
                msg.externalSender?.email === activeThread?.externalEmail
                  ? 'bg-gray-100 text-gray-800 rounded-tl-sm'
                  : 'bg-primary text-white rounded-tr-sm',
              ]"
            >
              <div v-if="msg.bodyHtml" v-html="sanitizeHtml(msg.bodyHtml)" class="prose prose-sm max-w-none" />
              <div v-else class="whitespace-pre-wrap">{{ msg.body }}</div>
            </div>
            <p :class="['text-xs mt-1', msg.externalSender?.email === activeThread?.externalEmail ? 'text-gray-400' : 'text-gray-400 text-right']">
              {{ formatFullDate(msg.sentAt) }}
            </p>
          </div>
        </div>

        <!-- Skeleton chargement -->
        <div v-if="externalStore.loading" class="space-y-3">
          <div v-for="i in 3" :key="i" class="h-12 bg-gray-100 rounded-2xl animate-pulse w-2/3" />
        </div>
      </div>
    </div>

    <!-- Placeholder si rien de sélectionné -->
    <div v-else class="hidden lg:flex flex-1 items-center justify-center bg-gray-50/50">
      <div class="text-center">
        <span class="text-5xl">🌐</span>
        <p class="text-sm text-gray-400 mt-3">Sélectionnez une conversation</p>
        <p class="text-xs text-gray-300 mt-1">ou composez un nouveau message externe</p>
      </div>
    </div>

    <!-- Modal Composer / Répondre -->
    <ExternalComposeModal
      v-model="showCompose"
      :replyTo="replyTarget"
      @sent="onSent"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useExternalStore } from '@/stores/external.js'
import ExternalComposeModal from '@/components/ExternalComposeModal.vue'

const externalStore = useExternalStore()

const activeTab      = ref('inbox')
const activeThread   = ref(null)
const selectedSentMsg = ref(null)
const showCompose    = ref(false)
const replyTarget    = ref(null)

const tabs = [
  { key: 'inbox', label: 'Reçus'   },
  { key: 'sent',  label: 'Envoyés' },
]

const displayList = computed(() =>
  activeTab.value === 'inbox' ? externalStore.threads : externalStore.sentMessages
)

onMounted(async () => {
  await externalStore.fetchThreads()
  await externalStore.fetchSent()
  await externalStore.refreshUnreadCount()
})

async function loadTab() {
  activeThread.value = null
  if (activeTab.value === 'inbox') {
    await externalStore.fetchThreads()
  } else {
    await externalStore.fetchSent()
  }
}

async function openThread(thread) {
  activeThread.value = thread
  externalStore.setActiveThread(thread)
  await externalStore.fetchThreadMessages(thread.externalEmail)
}

function openReply() {
  if (!activeThread.value) return
  replyTarget.value = {
    email:   activeThread.value.externalEmail,
    name:    activeThread.value.externalName,
    subject: `Re: ${activeThread.value.subject}`,
  }
  showCompose.value = true
}

async function onSent() {
  showCompose.value  = false
  replyTarget.value  = null
  if (activeThread.value) {
    await externalStore.fetchThreadMessages(activeThread.value.externalEmail)
  }
  await externalStore.fetchThreads()
}

function sanitizeHtml(html) {
  // Suppression des scripts et iframes pour sécurité XSS basique
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
}

function formatDate(date) {
  if (!date) return ''
  const d   = new Date(date)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7)  return d.toLocaleDateString('fr-FR', { weekday: 'short' })
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

function formatFullDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
</script>

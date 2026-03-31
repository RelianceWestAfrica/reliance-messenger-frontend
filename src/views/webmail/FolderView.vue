<template>
  <div class="flex h-full overflow-hidden">

    <!-- Liste -->
    <div :class="['flex flex-col border-r border-gray-100 overflow-hidden', selectedMessage ? 'w-80 flex-shrink-0' : 'flex-1']">
      <div class="px-4 py-2 border-b border-gray-100 bg-white">
        <span class="text-xs text-gray-500">{{ messagesStore.messages.length }} message(s)</span>
      </div>

      <!-- Chargement -->
      <div v-if="messagesStore.loading && !messagesStore.messages.length" class="flex-1 flex items-center justify-center">
        <svg class="animate-spin w-8 h-8 text-primary/30" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
      </div>

      <!-- Vide -->
      <div v-else-if="!messagesStore.messages.length" class="flex-1 flex items-center justify-center p-8">
        <div class="text-center">
          <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
            </svg>
          </div>
          <p class="text-sm font-medium text-gray-500">{{ emptyLabel }}</p>
        </div>
      </div>

      <!-- Messages -->
      <div v-else class="flex-1 overflow-y-auto">
        <MessageItem
          v-for="msg in messagesStore.messages"
          :key="msg.id"
          :message="msg"
          :folder="folder"
          :isSelected="selectedMessage?.id === msg.id"
          @select="openMessage"
          @star="(m) => messagesStore.toggleStar(m.id)"
        />
      </div>
    </div>

    <!-- Panneau lecture -->
    <div v-if="selectedMessage" class="flex-1 flex flex-col bg-white overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h2 class="text-base font-semibold text-gray-900">{{ selectedMessage.subject || '(sans objet)' }}</h2>
          <div class="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
            <span v-if="folder !== 'sent' && folder !== 'drafts'">
              De : <span :class="selectedMessage.from?.isDeleted ? 'text-red-500' : ''">{{ selectedMessage.from?.name }}</span>
            </span>
            <span v-else>
              À : <span :class="selectedMessage.to?.isDeleted ? 'text-red-500' : ''">{{ selectedMessage.to?.name }}</span>
            </span>
            <span class="text-gray-300">·</span>
            <span>{{ formatDate(selectedMessage.sentAt || selectedMessage.createdAt) }}</span>
          </div>
        </div>

        <div class="flex items-center gap-1.5">
          <!-- Étoile -->
          <button @click="messagesStore.toggleStar(selectedMessage.id)" :class="['p-2 rounded-lg transition-colors', selectedMessage.isStarred ? 'text-yellow-400 bg-yellow-50' : 'text-gray-400 hover:text-yellow-400 hover:bg-gray-100']">
            <svg class="w-4 h-4" :fill="selectedMessage.isStarred ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
          </button>
          <!-- Supprimer -->
          <button @click="showDeleteConfirm = true" class="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Corps -->
      <div class="flex-1 overflow-y-auto px-6 py-5">
        <div class="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">{{ selectedMessage.body }}</div>
      </div>
    </div>

    <!-- Placeholder -->
    <div v-else class="hidden lg:flex flex-1 items-center justify-center bg-gray-50/50">
      <p class="text-sm text-gray-400">Sélectionnez un message pour le lire</p>
    </div>

    <ConfirmDialog
      v-model="showDeleteConfirm"
      title="Supprimer ce message"
      message="Ce message sera déplacé dans la corbeille."
      confirmLabel="Supprimer"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMessagesStore } from '@/stores/messages.js'
import MessageItem from '@/components/MessageItem.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const props = defineProps({
  folder:     { type: String, required: true },
  emptyLabel: { type: String, default: 'Aucun message' },
})

const messagesStore     = useMessagesStore()
const selectedMessage   = ref(null)
const showDeleteConfirm = ref(false)

onMounted(() => messagesStore.fetchFolder(props.folder))

async function openMessage(msg) {
  selectedMessage.value = await messagesStore.fetchMessage(msg.id)
}

async function confirmDelete(resolve) {
  await messagesStore.deleteMessage(selectedMessage.value.id)
  selectedMessage.value = null
  resolve()
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

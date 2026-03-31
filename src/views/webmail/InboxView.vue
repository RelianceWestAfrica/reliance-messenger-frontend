<template>
  <div class="flex h-full overflow-hidden">

    <!-- ── Liste des messages ─────────────────────── -->
    <div :class="['flex flex-col border-r border-gray-100 overflow-hidden transition-all duration-200', selectedMessage ? 'w-80 flex-shrink-0' : 'flex-1']">

      <!-- Barre d'actions de liste -->
      <div class="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-white">
        <span class="text-xs text-gray-500">{{ messagesStore.messages.length }} message(s)</span>
        <div class="flex items-center gap-1">
          <button
            v-if="messagesStore.messages.some(m => !m.isRead)"
            @click="markAllRead"
            class="text-xs text-primary hover:text-accent px-2 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            Tout marquer lu
          </button>
        </div>
      </div>

      <!-- État de chargement -->
      <div v-if="messagesStore.loading && !messagesStore.messages.length" class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <svg class="animate-spin w-8 h-8 text-primary/30 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          <p class="text-sm text-gray-400">Chargement…</p>
        </div>
      </div>

      <!-- Boîte vide -->
      <div v-else-if="!messagesStore.messages.length" class="flex-1 flex items-center justify-center p-8">
        <div class="text-center">
          <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
            </svg>
          </div>
          <p class="text-sm font-medium text-gray-500">Boîte de réception vide</p>
          <p class="text-xs text-gray-400 mt-1">Aucun message pour le moment</p>
        </div>
      </div>

      <!-- Liste messages -->
      <div v-else class="flex-1 overflow-y-auto">
        <MessageItem
          v-for="msg in messagesStore.messages"
          :key="msg.id"
          :message="msg"
          folder="inbox"
          :isSelected="selectedMessage?.id === msg.id"
          @select="openMessage"
          @star="toggleStar"
        />
      </div>
    </div>

    <!-- ── Panneau de lecture ──────────────────────── -->
    <div v-if="selectedMessage" class="flex-1 flex flex-col bg-white overflow-hidden">

      <!-- Header message -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <button @click="closeMessage" class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors lg:hidden">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h2 class="text-base font-semibold text-gray-900 leading-tight">{{ selectedMessage.subject || '(sans objet)' }}</h2>
            <div class="flex items-center gap-2 mt-0.5">
              <span :class="['text-xs', selectedMessage.from?.isDeleted ? 'text-red-500 font-medium' : 'text-gray-500']">
                De : {{ selectedMessage.from?.name || 'Inconnu' }}
              </span>
              <span class="text-gray-300">·</span>
              <span class="text-xs text-gray-400">{{ formatDate(selectedMessage.sentAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-1.5">
          <!-- Étoile -->
          <button
            @click="toggleStar(selectedMessage)"
            :class="['p-2 rounded-lg transition-colors', selectedMessage.isStarred ? 'text-yellow-400 bg-yellow-50' : 'text-gray-400 hover:text-yellow-400 hover:bg-gray-100']"
            title="Favori"
          >
            <svg class="w-4 h-4" :fill="selectedMessage.isStarred ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
          </button>

          <!-- Répondre -->
          <button
            @click="reply"
            class="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-gray-100 transition-colors"
            title="Répondre"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
            </svg>
          </button>

          <!-- Supprimer -->
          <button
            @click="deleteMessage"
            class="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Supprimer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Corps du message -->
      <div class="flex-1 overflow-y-auto px-6 py-5">
        <!-- Info destinataire/expéditeur -->
        <div class="flex items-start gap-3 mb-5">
          <div :class="avatarClass(selectedMessage.from?.type)" class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
            {{ selectedMessage.from?.name?.charAt(0).toUpperCase() || '?' }}
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span :class="['font-semibold text-sm', selectedMessage.from?.isDeleted ? 'text-red-500' : 'text-gray-900']">
                {{ selectedMessage.from?.name }}
              </span>
              <BadgeType v-if="selectedMessage.from?.type" :type="selectedMessage.from.type" size="xs" />
            </div>
            <p class="text-xs text-gray-400 mt-0.5">{{ selectedMessage.from?.email }}</p>
            <p class="text-xs text-gray-400">À : {{ selectedMessage.to?.name }} &lt;{{ selectedMessage.to?.email }}&gt;</p>
          </div>
        </div>

        <!-- Contenu -->
        <div class="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">{{ selectedMessage.body }}</div>

        <!-- Pièces jointes -->
        <div v-if="selectedMessage.attachments?.length" class="mt-6 border-t border-gray-100 pt-4">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Pièces jointes ({{ selectedMessage.attachments.length }})</p>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="att in selectedMessage.attachments"
              :key="att.id"
              class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
              </svg>
              <span class="text-gray-700">{{ att.filename }}</span>
              <span class="text-xs text-gray-400">({{ formatSize(att.size) }})</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Placeholder si aucun message sélectionné (grand écran) -->
    <div v-else class="hidden lg:flex flex-1 items-center justify-center bg-gray-50/50">
      <div class="text-center">
        <svg class="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
        <p class="text-sm text-gray-400">Sélectionnez un message pour le lire</p>
      </div>
    </div>

    <!-- Modal réponse -->
    <ComposeModal
      v-model="showReply"
      :initialTo="replyTo"
      :initialSubject="replySubject"
      @sent="onReplySent"
    />

    <!-- Confirm suppression -->
    <ConfirmDialog
      v-model="showDeleteConfirm"
      title="Supprimer ce message"
      message="Ce message sera déplacé dans la corbeille. Cette action est réversible."
      confirmLabel="Supprimer"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMessagesStore } from '@/stores/messages.js'
import MessageItem from '@/components/MessageItem.vue'
import BadgeType from '@/components/BadgeType.vue'
import ComposeModal from '@/components/ComposeModal.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const messagesStore = useMessagesStore()
const selectedMessage    = ref(null)
const showReply          = ref(false)
const showDeleteConfirm  = ref(false)
const replyTo            = ref(null)
const replySubject       = ref('')

onMounted(() => messagesStore.fetchFolder('inbox'))

async function openMessage(msg) {
  selectedMessage.value = await messagesStore.fetchMessage(msg.id)
}

function closeMessage() {
  selectedMessage.value = null
}

async function toggleStar(msg) {
  await messagesStore.toggleStar(msg.id)
  if (selectedMessage.value?.id === msg.id) {
    selectedMessage.value.isStarred = !selectedMessage.value.isStarred
  }
}

function reply() {
  if (!selectedMessage.value) return
  replyTo.value      = selectedMessage.value.from
  replySubject.value = `Re: ${selectedMessage.value.subject}`
  showReply.value    = true
}

function deleteMessage() {
  showDeleteConfirm.value = true
}

async function confirmDelete(resolve) {
  await messagesStore.deleteMessage(selectedMessage.value.id)
  selectedMessage.value = null
  resolve()
}

async function markAllRead() {
  const unread = messagesStore.messages.filter(m => !m.isRead)
  for (const msg of unread) {
    await messagesStore.markRead(msg.id, true)
  }
}

function onReplySent() {
  showReply.value = false
}

function avatarClass(type) {
  const map = {
    ADMINISTRATION: 'bg-red-100 text-red-700',
    DIRECTEUR:      'bg-blue-100 text-blue-700',
    EMPLOYE:        'bg-gray-100 text-gray-700',
    AUTRES:         'bg-green-100 text-green-700',
  }
  return map[type] || 'bg-gray-100 text-gray-600'
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}
</script>

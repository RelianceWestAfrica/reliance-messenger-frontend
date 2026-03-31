<template>
  <div
    :class="[
      'flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 transition-colors',
      !message.isRead && folder === 'inbox' ? 'bg-blue-50/40' : 'bg-white hover:bg-gray-50',
      isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : '',
    ]"
    @click="$emit('select', message)"
  >
    <!-- Avatar / initiales -->
    <div
      :class="avatarClass"
      class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5"
    >
      {{ initial }}
    </div>

    <!-- Contenu -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between gap-2">
        <!-- Nom expéditeur/destinataire -->
        <span
          :class="[
            'text-sm truncate',
            !message.isRead && folder === 'inbox' ? 'font-semibold text-gray-900' : 'font-medium text-gray-700',
            (message.from?.isDeleted || message.to?.isDeleted) ? 'text-red-500' : '',
          ]"
        >
          {{ displayName }}
        </span>

        <!-- Date -->
        <span class="text-xs text-gray-400 flex-shrink-0">{{ formattedDate }}</span>
      </div>

      <!-- Objet -->
      <div class="flex items-center gap-2 mt-0.5">
        <span
          :class="[
            'text-sm truncate flex-1',
            !message.isRead && folder === 'inbox' ? 'font-medium text-gray-900' : 'text-gray-600',
          ]"
        >
          {{ message.subject || '(sans objet)' }}
        </span>

        <!-- Indicateurs -->
        <div class="flex items-center gap-1.5 flex-shrink-0">
          <!-- Étoile -->
          <button
            class="text-yellow-400 hover:text-yellow-500 transition-colors"
            :class="message.isStarred ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
            @click.stop="$emit('star', message)"
            title="Marquer comme favori"
          >
            <svg class="w-3.5 h-3.5" :fill="message.isStarred ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
          </button>

          <!-- Pièce jointe -->
          <svg v-if="message.hasAttachment" class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
          </svg>

          <!-- Point non-lu -->
          <div v-if="!message.isRead && folder === 'inbox'" class="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
        </div>
      </div>

      <!-- Extrait du corps -->
      <p class="text-xs text-gray-400 truncate mt-0.5">{{ excerpt }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  message:    { type: Object, required: true },
  folder:     { type: String, default: 'inbox' },
  isSelected: { type: Boolean, default: false },
})

defineEmits(['select', 'star'])

const displayName = computed(() => {
  if (props.folder === 'sent' || props.folder === 'drafts') {
    return props.message.to?.name || props.message.to?.email || 'Destinataire inconnu'
  }
  return props.message.from?.name || props.message.from?.email || 'Expéditeur inconnu'
})

const initial = computed(() => {
  const name = displayName.value
  if (name === '[COMPTE SUPPRIMÉ]') return '✕'
  return name.charAt(0).toUpperCase()
})

const avatarClass = computed(() => {
  const type = props.folder === 'sent'
    ? props.message.to?.type
    : props.message.from?.type

  const map = {
    ADMINISTRATION: 'bg-red-100 text-red-700',
    DIRECTEUR:      'bg-blue-100 text-blue-700',
    EMPLOYE:        'bg-gray-100 text-gray-700',
    AUTRES:         'bg-green-100 text-green-700',
  }
  return map[type] || 'bg-gray-100 text-gray-600'
})

const formattedDate = computed(() => {
  const date = props.message.sentAt || props.message.createdAt
  if (!date) return ''
  const d   = new Date(date)
  const now = new Date()
  const diffDays = Math.floor((now - d) / 86400000)

  if (diffDays === 0) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7)  return d.toLocaleDateString('fr-FR', { weekday: 'short' })
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
})

const excerpt = computed(() => {
  const body = props.message.body || ''
  return body.replace(/<[^>]+>/g, '').slice(0, 80) + (body.length > 80 ? '…' : '')
})
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">

    <!-- Barre de filtres -->
    <div class="flex-shrink-0 flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 bg-white flex-wrap">
      <!-- Filtre type MIME -->
      <div class="flex items-center gap-1">
        <button
          v-for="f in mimeFilters" :key="f.value"
          @click="activeMime = activeMime === f.value ? '' : f.value"
          :class="['text-xs px-3 py-1.5 rounded-full font-medium transition-colors', activeMime === f.value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
        >
          {{ f.emoji }} {{ f.label }}
        </button>
      </div>
      <span class="text-xs text-gray-400 ml-auto">{{ total }} fichier(s)</span>
    </div>

    <!-- Chargement -->
    <div v-if="loading && !files.length" class="flex-1 flex items-center justify-center">
      <svg class="animate-spin w-8 h-8 text-primary/30" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
      </svg>
    </div>

    <!-- Vide -->
    <div v-else-if="!files.length" class="flex-1 flex items-center justify-center p-8">
      <div class="text-center">
        <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
          </svg>
        </div>
        <p class="text-sm font-medium text-gray-500">Aucun fichier reçu</p>
        <p class="text-xs text-gray-400 mt-1">Les pièces jointes de vos messages apparaîtront ici</p>
      </div>
    </div>

    <!-- Grille de fichiers -->
    <div v-else class="flex-1 overflow-y-auto p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <div
          v-for="file in files"
          :key="file.id"
          class="card p-4 flex flex-col gap-3 hover:shadow-md transition-shadow group"
        >
          <!-- Icône + nom -->
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 bg-gray-50">
              {{ fileIcon(file.mimeType) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate" :title="file.filename">{{ file.filename }}</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ formatSize(file.size) }}</p>
            </div>
          </div>

          <!-- Expéditeur + date -->
          <div class="text-xs text-gray-500 border-t border-gray-50 pt-2">
            <p class="truncate">
              <span :class="file.message.from.name === '[COMPTE SUPPRIMÉ]' ? 'text-red-500' : ''">
                {{ file.message.from.name }}
              </span>
            </p>
            <p class="text-gray-400 mt-0.5 truncate">{{ file.message.subject }}</p>
            <p class="text-gray-300 mt-0.5">{{ formatDate(file.message.sentAt) }}</p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <button
              @click="downloadFile(file)"
              :disabled="downloading === file.id"
              class="flex-1 flex items-center justify-center gap-1.5 text-xs bg-primary text-white rounded-lg px-3 py-1.5 hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              <svg v-if="downloading !== file.id" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <svg v-else class="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              {{ downloading === file.id ? 'Préparation…' : 'Télécharger' }}
            </button>

            <RouterLink
              :to="`/webmail/message/${file.message.id}`"
              class="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-gray-100 transition-colors"
              title="Voir le message"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="meta && meta.lastPage > 1" class="flex items-center justify-center gap-3 mt-6">
        <button :disabled="currentPage <= 1" @click="loadPage(currentPage - 1)" class="btn-outline text-sm px-3 py-1.5 disabled:opacity-40">← Préc.</button>
        <span class="text-sm text-gray-500">{{ currentPage }} / {{ meta.lastPage }}</span>
        <button :disabled="currentPage >= meta.lastPage" @click="loadPage(currentPage + 1)" class="btn-outline text-sm px-3 py-1.5 disabled:opacity-40">Suiv. →</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { attachmentsApi } from '@/services/api.js'

const files       = ref([])
const loading     = ref(false)
const downloading = ref(null)
const activeMime  = ref('')
const currentPage = ref(1)
const meta        = ref(null)
const total       = ref(0)

const mimeFilters = [
  { value: '',           emoji: '📁', label: 'Tous'    },
  { value: 'application/pdf',     emoji: '📄', label: 'PDF'    },
  { value: 'image',               emoji: '🖼️', label: 'Images' },
  { value: 'application/vnd.ms-excel', emoji: '📊', label: 'Excel' },
  { value: 'application/vnd.openxmlformats-officedocument.wordprocessingml', emoji: '📝', label: 'Word' },
]

watch(activeMime, () => { currentPage.value = 1; loadFiles() })
onMounted(() => loadFiles())

async function loadFiles() {
  loading.value = true
  try {
    const { data } = await attachmentsApi.received({
      page:     currentPage.value,
      perPage:  24,
      mimeType: activeMime.value || undefined,
    })
    files.value = data.data
    meta.value  = data.meta
    total.value = data.meta?.total ?? files.value.length
  } catch (err) {
    console.error('Erreur chargement fichiers:', err)
  } finally {
    loading.value = false
  }
}

function loadPage(page) { currentPage.value = page; loadFiles() }

async function downloadFile(file) {
  downloading.value = file.id
  try {
    const { data } = await attachmentsApi.download(file.id)
    // Déclencher le téléchargement via URL signée
    const link       = document.createElement('a')
    link.href        = data.url
    link.download    = data.filename
    link.target      = '_blank'
    link.click()
  } catch (err) {
    alert('Impossible de télécharger ce fichier.')
  } finally {
    downloading.value = null
  }
}

function fileIcon(mimeType) {
  if (!mimeType) return '📎'
  if (mimeType.includes('pdf'))        return '📄'
  if (mimeType.includes('image'))      return '🖼️'
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
  if (mimeType.includes('excel') || mimeType.includes('sheet'))   return '📊'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📋'
  if (mimeType.includes('zip') || mimeType.includes('rar'))       return '🗜️'
  if (mimeType.includes('text'))       return '📃'
  return '📎'
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024)        return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

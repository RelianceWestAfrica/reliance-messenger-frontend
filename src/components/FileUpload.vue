<template>
  <div class="space-y-3">
    <!-- Zone de drop -->
    <div
      :class="[
        'relative border-2 border-dashed rounded-xl p-4 text-center transition-all duration-150 cursor-pointer',
        isDragging  ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
        disabled    ? 'opacity-50 cursor-not-allowed' : '',
      ]"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
      @click="!disabled && $refs.fileInput.click()"
    >
      <input
        ref="fileInput"
        type="file"
        multiple
        class="hidden"
        :accept="acceptTypes"
        @change="onFileSelect"
        :disabled="disabled"
      />

      <div class="flex flex-col items-center gap-2">
        <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
        </svg>
        <p class="text-sm text-gray-400">
          <span class="text-primary font-medium">Cliquez pour ajouter</span>
          ou glissez-déposez vos fichiers
        </p>
        <p class="text-xs text-gray-300">PDF, Word, Excel, Images… max 10 Mo par fichier</p>
      </div>
    </div>

    <!-- Liste des fichiers en attente / uploadés -->
    <div v-if="files.length" class="space-y-2">
      <div
        v-for="file in files"
        :key="file.uid"
        class="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2"
      >
        <!-- Icône type -->
        <span class="text-lg flex-shrink-0">{{ fileIcon(file.name) }}</span>

        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-800 truncate">{{ file.name }}</p>
          <div class="flex items-center gap-2 mt-0.5">
            <p class="text-xs text-gray-400">{{ formatSize(file.size) }}</p>

            <!-- Barre de progression -->
            <div v-if="file.status === 'uploading'" class="flex-1 bg-gray-200 rounded-full h-1">
              <div
                class="bg-primary h-1 rounded-full transition-all duration-300"
                :style="{ width: file.progress + '%' }"
              />
            </div>

            <!-- Statut -->
            <span v-if="file.status === 'done'" class="text-xs text-green-600 flex items-center gap-1">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
              </svg>
              Uploadé
            </span>
            <span v-if="file.status === 'error'" class="text-xs text-red-500">{{ file.error }}</span>
          </div>
        </div>

        <!-- Supprimer -->
        <button
          @click="removeFile(file.uid)"
          class="p-1 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
          :disabled="file.status === 'uploading'"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { attachmentsApi } from '@/services/api.js'

const props = defineProps({
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:attachmentIds'])

const isDragging = ref(false)
const files      = ref([])
let   uidCounter = 0

// IDs des fichiers uploadés avec succès → envoyés au parent
const uploadedIds = computed(() =>
  files.value.filter((f) => f.status === 'done' && f.serverId).map((f) => f.serverId)
)

const acceptTypes = [
  '.pdf','.doc','.docx','.xls','.xlsx','.ppt','.pptx',
  '.txt','.csv','.jpg','.jpeg','.png','.gif','.webp','.zip','.rar',
].join(',')

function onDrop(e) {
  isDragging.value = false
  const dropped = Array.from(e.dataTransfer.files)
  addFiles(dropped)
}

function onFileSelect(e) {
  const selected = Array.from(e.target.files)
  addFiles(selected)
  e.target.value = ''
}

function addFiles(newFiles) {
  for (const f of newFiles) {
    if (f.size > 10 * 1024 * 1024) {
      files.value.push({
        uid:      ++uidCounter, name: f.name, size: f.size,
        status:   'error', error: 'Fichier trop lourd (max 10 Mo)', progress: 0, serverId: null,
      })
      continue
    }

    const uid = ++uidCounter
    files.value.push({ uid, name: f.name, size: f.size, status: 'uploading', progress: 0, error: null, serverId: null })
    uploadFile(uid, f)
  }
}

async function uploadFile(uid, file) {
  const formData = new FormData()
  formData.append('files', file)

  try {
    const { data } = await attachmentsApi.upload(formData, (pct) => {
      const entry = files.value.find((f) => f.uid === uid)
      if (entry) entry.progress = pct
    })

    const entry = files.value.find((f) => f.uid === uid)
    if (entry && data.uploaded?.length) {
      entry.status   = 'done'
      entry.progress = 100
      entry.serverId = data.uploaded[0].id
    } else if (entry) {
      entry.status = 'error'
      entry.error  = data.errors?.[0] || 'Erreur upload'
    }

    // Notifier le parent des IDs disponibles
    emit('update:attachmentIds', uploadedIds.value)
  } catch (err) {
    const entry = files.value.find((f) => f.uid === uid)
    if (entry) {
      entry.status = 'error'
      entry.error  = err.response?.data?.message || 'Erreur réseau'
    }
  }
}

async function removeFile(uid) {
  const entry = files.value.find((f) => f.uid === uid)
  if (entry?.serverId) {
    try { await attachmentsApi.delete(entry.serverId) } catch { /* silencieux */ }
  }
  files.value = files.value.filter((f) => f.uid !== uid)
  emit('update:attachmentIds', uploadedIds.value)
}

function fileIcon(name) {
  const ext = name.split('.').pop()?.toLowerCase()
  const map = { pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊',
    ppt: '📋', pptx: '📋', jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️',
    zip: '🗜️', rar: '🗜️', txt: '📃', csv: '📊' }
  return map[ext] || '📎'
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024)        return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}
</script>

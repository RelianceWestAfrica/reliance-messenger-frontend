<template>
  <div class="space-y-4">

    <!-- Bandeau "immuable" -->
    <div class="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
      <svg class="w-5 h-5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
      </svg>
      <p class="text-sm text-amber-800">
        <strong>Archives immuables</strong> — Aucune suppression possible. Chaque message envoyé est archivé définitivement.
      </p>
    </div>

    <!-- Filtres -->
    <div class="card p-4">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Date début</label>
          <input v-model="filters.dateFrom" type="date" class="input text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Date fin</label>
          <input v-model="filters.dateTo" type="date" class="input text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Email expéditeur</label>
          <input v-model="filters.senderEmail" type="text" class="input text-sm" placeholder="exp@rwa.com" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Email destinataire</label>
          <input v-model="filters.receiverEmail" type="text" class="input text-sm" placeholder="dest@rwa.com" />
        </div>
      </div>
      <div class="flex items-center gap-3 mt-3">
        <button @click="applyFilters" class="btn-primary text-sm">Filtrer</button>
        <button @click="resetFilters" class="btn-outline text-sm">Réinitialiser</button>
        <div class="flex-1" />
        <button @click="exportCsv" class="btn-outline text-sm flex items-center gap-2" :disabled="exporting">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          {{ exporting ? 'Export…' : 'Exporter CSV' }}
        </button>
      </div>
    </div>

    <!-- Tableau archives -->
    <div class="card overflow-hidden">
      <div v-if="adminStore.loading && !adminStore.archives.length" class="p-8 text-center">
        <svg class="animate-spin w-8 h-8 text-primary/30 mx-auto" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50">
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Expéditeur</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Destinataire</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Objet</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Détail</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="archive in adminStore.archives"
              :key="archive.id"
              class="hover:bg-gray-50/50 transition-colors"
            >
              <td class="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{{ formatDate(archive.sentAt) }}</td>
              <td class="px-4 py-3">
                <p :class="['text-sm font-medium', archive.senderDeleted ? 'text-red-500' : 'text-gray-900']">
                  {{ archive.senderName }}
                  <span v-if="archive.senderDeleted" class="text-xs font-normal ml-1">(supprimé)</span>
                </p>
                <p class="text-xs text-gray-400">{{ archive.senderEmail }}</p>
              </td>
              <td class="px-4 py-3">
                <p :class="['text-sm font-medium', archive.receiverDeleted ? 'text-red-500' : 'text-gray-900']">
                  {{ archive.receiverName }}
                  <span v-if="archive.receiverDeleted" class="text-xs font-normal ml-1">(supprimé)</span>
                </p>
                <p class="text-xs text-gray-400">{{ archive.receiverEmail }}</p>
              </td>
              <td class="px-4 py-3 text-gray-700 max-w-xs truncate">{{ archive.subject }}</td>
              <td class="px-4 py-3">
                <button @click="openDetail(archive)" class="text-xs text-primary hover:text-accent transition-colors">Voir</button>
              </td>
            </tr>
            <tr v-if="!adminStore.archives.length">
              <td colspan="5" class="px-4 py-8 text-center text-sm text-gray-400">Aucune archive trouvée</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="adminStore.archivesMeta" class="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <p class="text-xs text-gray-500">
          {{ adminStore.archivesMeta.total }} archive(s) — Page {{ adminStore.archivesMeta.currentPage }} / {{ adminStore.archivesMeta.lastPage }}
        </p>
        <div class="flex items-center gap-2">
          <button
            :disabled="currentPage <= 1"
            @click="changePage(currentPage - 1)"
            class="btn-outline text-xs px-3 py-1 disabled:opacity-40"
          >← Précédent</button>
          <button
            :disabled="currentPage >= adminStore.archivesMeta.lastPage"
            @click="changePage(currentPage + 1)"
            class="btn-outline text-xs px-3 py-1 disabled:opacity-40"
          >Suivant →</button>
        </div>
      </div>
    </div>

    <!-- Modal détail archive -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="detailArchive" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="detailArchive = null" />
          <div class="relative bg-white rounded-2xl shadow-modal w-full max-w-lg z-10">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 class="text-base font-semibold text-gray-900 truncate flex-1">{{ detailArchive.subject }}</h3>
              <button @click="detailArchive = null" class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 flex-shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div class="px-6 py-5 space-y-3">
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="text-xs text-gray-400 uppercase tracking-wide">De</p>
                  <p :class="['font-medium mt-0.5', detailArchive.senderDeleted ? 'text-red-500' : 'text-gray-900']">{{ detailArchive.senderName }}</p>
                  <p class="text-xs text-gray-500">{{ detailArchive.senderEmail }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400 uppercase tracking-wide">À</p>
                  <p :class="['font-medium mt-0.5', detailArchive.receiverDeleted ? 'text-red-500' : 'text-gray-900']">{{ detailArchive.receiverName }}</p>
                  <p class="text-xs text-gray-500">{{ detailArchive.receiverEmail }}</p>
                </div>
              </div>
              <div>
                <p class="text-xs text-gray-400 uppercase tracking-wide">Date</p>
                <p class="text-sm text-gray-700 mt-0.5">{{ formatDate(detailArchive.sentAt) }}</p>
              </div>
              <div class="border-t border-gray-100 pt-3">
                <p class="text-xs text-gray-400 uppercase tracking-wide mb-2">Corps du message</p>
                <div class="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto">{{ detailArchive.body }}</div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin.js'

const adminStore   = useAdminStore()
const currentPage  = ref(1)
const exporting    = ref(false)
const detailArchive = ref(null)

const filters = reactive({ dateFrom: '', dateTo: '', senderEmail: '', receiverEmail: '' })

onMounted(() => loadArchives())

function loadArchives() {
  adminStore.fetchArchives({ ...filters, page: currentPage.value, perPage: 50 })
}

function applyFilters() {
  currentPage.value = 1
  loadArchives()
}

function resetFilters() {
  filters.dateFrom = filters.dateTo = filters.senderEmail = filters.receiverEmail = ''
  currentPage.value = 1
  loadArchives()
}

function changePage(page) {
  currentPage.value = page
  loadArchives()
}

async function exportCsv() {
  exporting.value = true
  await adminStore.exportArchives({ ...filters, format: 'csv' })
  exporting.value = false
}

function openDetail(archive) {
  detailArchive.value = archive
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>

<template>
  <div class="space-y-4">

    <!-- Bandeau immuable -->
    <div class="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3">
      <svg class="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
      </svg>
      <p class="text-sm text-blue-800">
        <strong>Journal d'audit immuable</strong> — Toutes les actions admin sont tracées. Aucune suppression possible.
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
          <label class="block text-xs font-medium text-gray-500 mb-1">Type d'action</label>
          <select v-model="filters.action" class="input text-sm">
            <option value="">Toutes les actions</option>
            <option v-for="a in availableActions" :key="a.value" :value="a.value">{{ a.label }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Email acteur</label>
          <input v-model="filters.actorEmail" type="text" class="input text-sm" placeholder="nom@rwa.com" />
        </div>
      </div>
      <div class="flex items-center gap-3 mt-3">
        <button @click="applyFilters" class="btn-primary text-sm">Filtrer</button>
        <button @click="resetFilters" class="btn-outline text-sm">Réinitialiser</button>
        <div class="flex-1" />
        <button @click="exportCsv" :disabled="exporting" class="btn-outline text-sm flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          {{ exporting ? 'Export…' : 'Exporter CSV' }}
        </button>
      </div>
    </div>

    <!-- Tableau -->
    <div class="card overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
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
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acteur</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cible</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">IP</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{{ formatDate(log.createdAt) }}</td>
              <td class="px-4 py-3">
                <p class="text-sm font-medium text-gray-900">{{ log.actorName }}</p>
                <p class="text-xs text-gray-400">{{ log.actorEmail }}</p>
              </td>
              <td class="px-4 py-3">
                <span :class="['badge text-xs', actionBadgeClass(log.action)]">
                  {{ actionLabel(log.action) }}
                </span>
              </td>
              <td class="px-4 py-3 text-xs text-gray-600 max-w-xs truncate">{{ log.targetLabel || '—' }}</td>
              <td class="px-4 py-3 text-xs text-gray-400 font-mono">{{ log.ipAddress || '—' }}</td>
            </tr>
            <tr v-if="!logs.length">
              <td colspan="5" class="px-4 py-8 text-center text-sm text-gray-400">Aucune entrée trouvée</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="meta" class="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <p class="text-xs text-gray-500">{{ meta.total }} entrée(s) — Page {{ currentPage }} / {{ meta.lastPage }}</p>
        <div class="flex gap-2">
          <button :disabled="currentPage <= 1" @click="changePage(currentPage - 1)" class="btn-outline text-xs px-3 py-1 disabled:opacity-40">← Préc.</button>
          <button :disabled="currentPage >= meta.lastPage" @click="changePage(currentPage + 1)" class="btn-outline text-xs px-3 py-1 disabled:opacity-40">Suiv. →</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { adminApi } from '@/services/api.js'

const logs             = ref([])
const loading          = ref(false)
const exporting        = ref(false)
const currentPage      = ref(1)
const meta             = ref(null)
const availableActions = ref([])

const filters = reactive({ dateFrom: '', dateTo: '', action: '', actorEmail: '' })

onMounted(async () => {
  loadLogs()
  const { data } = await adminApi.auditActions()
  availableActions.value = data
})

async function loadLogs() {
  loading.value = true
  try {
    const { data } = await adminApi.auditLogs({ ...filters, page: currentPage.value, perPage: 50 })
    logs.value = data.data
    meta.value = data.meta
  } finally {
    loading.value = false
  }
}

function applyFilters() { currentPage.value = 1; loadLogs() }
function resetFilters()  { Object.assign(filters, { dateFrom: '', dateTo: '', action: '', actorEmail: '' }); currentPage.value = 1; loadLogs() }
function changePage(p)   { currentPage.value = p; loadLogs() }

async function exportCsv() {
  exporting.value = true
  try {
    const { data } = await adminApi.exportAuditLogs({ ...filters })
    const url  = URL.createObjectURL(new Blob([data], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href     = url
    link.download = `audit_log_rwa_${new Date().toISOString().slice(0,10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  } finally {
    exporting.value = false
  }
}

function actionLabel(action) {
  const map = {
    login_success:              'Connexion réussie',
    login_failure:              'Échec connexion',
    password_reset_request:     'Reset MDP demandé',
    password_reset_success:     'Reset MDP réussi',
    first_login_password_change:'1ère connexion MDP',
    user_created:               'Utilisateur créé',
    user_updated:               'Utilisateur modifié',
    user_deleted:               'Utilisateur supprimé',
    mailbox_created:            'Boîte créée',
    mailbox_updated:            'Boîte modifiée',
    mailbox_deactivated:        'Boîte désactivée',
    message_sent:               'Message envoyé',
    message_deleted:            'Message supprimé',
    broadcast_sent:             'Diffusion envoyée',
    archive_export:             'Export archives',
    audit_log_export:           'Export journal',
  }
  return map[action] || action
}

function actionBadgeClass(action) {
  if (action.includes('failure') || action.includes('deleted')) return 'bg-red-50 text-red-700'
  if (action.includes('created') || action.includes('success')) return 'bg-green-50 text-green-700'
  if (action.includes('export'))                                 return 'bg-amber-50 text-amber-700'
  if (action.includes('login'))                                  return 'bg-blue-50 text-blue-700'
  if (action.includes('broadcast'))                              return 'bg-purple-50 text-purple-700'
  return 'bg-gray-100 text-gray-600'
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
</script>

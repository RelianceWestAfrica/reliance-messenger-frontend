<template>
  <div class="space-y-6">

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">

      <!-- Formulaire de diffusion (col large) -->
      <div class="lg:col-span-3 space-y-4">
        <div class="card p-5">
          <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            📣 Nouvelle diffusion
          </h3>

          <form @submit.prevent="handleSend" class="space-y-4">

            <!-- Ciblage -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Destinataires</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="t in targetTypes" :key="t.value"
                  type="button"
                  @click="form.targetType = t.value; form.targetValue = ''; previewData = null"
                  :class="['flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-sm font-medium transition-all', form.targetType === t.value ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-600 hover:border-gray-300']"
                >
                  <span class="text-xl">{{ t.emoji }}</span>
                  {{ t.label }}
                </button>
              </div>
            </div>

            <!-- Valeur du filtre -->
            <div v-if="form.targetType === 'role'">
              <label class="block text-sm font-medium text-gray-700 mb-1">Rôle cible</label>
              <select v-model="form.targetValue" class="input" @change="fetchPreview">
                <option value="">Sélectionner un rôle</option>
                <option v-for="r in roles" :key="r.value" :value="r.value">{{ r.label }}</option>
              </select>
            </div>

            <div v-if="form.targetType === 'mailbox_type'">
              <label class="block text-sm font-medium text-gray-700 mb-1">Type de boîte</label>
              <select v-model="form.targetValue" class="input" @change="fetchPreview">
                <option value="">Sélectionner un type</option>
                <option v-for="t in mailboxTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
              </select>
            </div>

            <!-- Aperçu destinataires -->
            <Transition name="fade">
              <div v-if="previewData" :class="['rounded-xl p-3 text-sm border', previewData.count > 0 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200']">
                <div v-if="previewData.count > 0">
                  <p :class="['font-semibold', previewData.count > 0 ? 'text-green-800' : 'text-amber-800']">
                    {{ previewData.count }} destinataire(s) seront contactés
                  </p>
                  <div v-if="previewData.sample?.length" class="mt-1.5 flex flex-wrap gap-1">
                    <span v-for="s in previewData.sample" :key="s.email" class="text-xs bg-white border border-green-200 text-green-700 px-2 py-0.5 rounded-full">
                      {{ s.name }}
                    </span>
                    <span v-if="previewData.count > previewData.sample.length" class="text-xs text-green-600">
                      +{{ previewData.count - previewData.sample.length }} autres
                    </span>
                  </div>
                </div>
                <p v-else class="text-amber-800 font-medium">Aucun destinataire trouvé pour ce critère</p>
              </div>
            </Transition>

            <!-- Bouton preview pour "tous" -->
            <button v-if="form.targetType === 'all' && !previewData" type="button" @click="fetchPreview" class="btn-outline text-sm">
              Vérifier le nombre de destinataires
            </button>

            <!-- Objet -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Objet *</label>
              <input v-model="form.subject" type="text" class="input" :class="{'input-error': errors.subject}" placeholder="Objet de la diffusion" />
              <p v-if="errors.subject" class="mt-1 text-xs text-red-500">{{ errors.subject }}</p>
            </div>

            <!-- Corps -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea v-model="form.body" rows="8" class="input resize-none" :class="{'input-error': errors.body}" placeholder="Rédigez votre message de diffusion…" />
              <p v-if="errors.body" class="mt-1 text-xs text-red-500">{{ errors.body }}</p>
            </div>

            <!-- Erreur -->
            <div v-if="formError" class="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{{ formError }}</div>

            <!-- Succès -->
            <Transition name="fade">
              <div v-if="successMsg" class="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700 flex items-center gap-2">
                <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
                </svg>
                {{ successMsg }}
              </div>
            </Transition>

            <div class="flex items-center gap-3">
              <button type="button" @click="resetForm" class="btn-outline">Effacer</button>
              <button
                type="submit"
                class="btn-accent flex items-center gap-2 flex-1 justify-center"
                :disabled="loading || (previewData && previewData.count === 0)"
              >
                <svg v-if="!loading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/>
                </svg>
                <svg v-else class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                {{ loading ? 'Envoi en cours…' : 'Envoyer la diffusion' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Historique (col étroite) -->
      <div class="lg:col-span-2">
        <div class="card overflow-hidden">
          <div class="px-4 py-3 border-b border-gray-100">
            <h3 class="text-sm font-semibold text-gray-900">Historique des diffusions</h3>
          </div>

          <div v-if="broadcastStore.loading && !broadcastStore.broadcasts.length" class="p-6 text-center">
            <svg class="animate-spin w-6 h-6 text-primary/30 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          </div>
          <div v-else-if="!broadcastStore.broadcasts.length" class="px-4 py-8 text-center text-sm text-gray-400">
            Aucune diffusion envoyée
          </div>
          <div v-else class="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
            <div v-for="b in broadcastStore.broadcasts" :key="b.id" class="px-4 py-3">
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ b.subject }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">
                    {{ targetLabel(b.targetType, b.targetValue) }}
                    · {{ b.sentCount }}/{{ b.totalRecipients }} envoyés
                  </p>
                  <p class="text-xs text-gray-300 mt-0.5">{{ formatDate(b.createdAt) }}</p>
                </div>
                <span :class="['badge text-xs flex-shrink-0', statusClass(b.status)]">
                  {{ statusLabel(b.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useBroadcastStore } from '@/stores/broadcasts.js'

const broadcastStore = useBroadcastStore()
onMounted(() => broadcastStore.fetchBroadcasts())

const loading     = ref(false)
const formError   = ref(null)
const successMsg  = ref(null)
const previewData = ref(null)

const form   = reactive({ targetType: 'all', targetValue: '', subject: '', body: '' })
const errors = reactive({ subject: '', body: '' })

const targetTypes = [
  { value: 'all',          emoji: '👥', label: 'Tous'       },
  { value: 'role',         emoji: '🎭', label: 'Par rôle'   },
  { value: 'mailbox_type', emoji: '📬', label: 'Par type'   },
]

const roles        = [
  { value: 'DIRECTEUR', label: 'Directeurs' },
  { value: 'EMPLOYE',   label: 'Employés'   },
  { value: 'INTERNE',   label: 'Internes'   },
]
const mailboxTypes = [
  { value: 'ADMINISTRATION', label: 'Administration' },
  { value: 'DIRECTEUR',      label: 'Directeur'      },
  { value: 'EMPLOYE',        label: 'Employé'        },
  { value: 'AUTRES',         label: 'Autres'         },
]

async function fetchPreview() {
  if (form.targetType !== 'all' && !form.targetValue) return
  const result = await broadcastStore.preview({ targetType: form.targetType, targetValue: form.targetValue })
  if (result.success) previewData.value = result.data
}

function validate() {
  errors.subject = errors.body = ''
  let ok = true
  if (!form.subject.trim()) { errors.subject = 'Objet requis'; ok = false }
  if (!form.body.trim())    { errors.body    = 'Message requis'; ok = false }
  return ok
}

async function handleSend() {
  if (!validate()) return
  if (form.targetType !== 'all' && !form.targetValue) {
    formError.value = 'Veuillez sélectionner un critère de ciblage'
    return
  }

  loading.value = true
  formError.value = successMsg.value = null

  const result = await broadcastStore.send({ ...form })
  loading.value = false

  if (result.success) {
    successMsg.value = result.data.message
    resetForm()
    setTimeout(() => { successMsg.value = null }, 6000)
  } else {
    formError.value = result.message
  }
}

function resetForm() {
  form.targetType = 'all'; form.targetValue = ''; form.subject = ''; form.body = ''
  errors.subject = errors.body = ''; previewData.value = null; formError.value = null
}

function targetLabel(type, value) {
  if (type === 'all')          return 'Tous les utilisateurs'
  if (type === 'role')         return `Rôle : ${value}`
  if (type === 'mailbox_type') return `Type : ${value}`
  return type
}

function statusClass(s) {
  return { done: 'bg-green-50 text-green-700', failed: 'bg-red-50 text-red-700', sending: 'bg-blue-50 text-blue-700', pending: 'bg-gray-100 text-gray-600' }[s] || 'bg-gray-100 text-gray-600'
}
function statusLabel(s) {
  return { done: 'Envoyé', failed: 'Partiel', sending: 'En cours', pending: 'En attente' }[s] || s
}
function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>

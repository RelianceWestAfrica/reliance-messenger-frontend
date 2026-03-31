<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="close" />

        <div class="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-modal w-full sm:max-w-2xl max-h-[92vh] flex flex-col z-10">

          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
            <h2 class="text-base font-semibold text-gray-900">Nouveau message</h2>
            <div class="flex items-center gap-3">
              <span v-if="draftSavedAt" class="text-xs text-gray-400">Sauvegardé à {{ draftSavedAt }}</span>
              <!-- Toggle pièces jointes -->
              <button
                @click="showAttachments = !showAttachments"
                :class="['p-1.5 rounded-lg transition-colors', showAttachments ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-gray-100']"
                title="Pièces jointes"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                </svg>
              </button>
              <button @click="close" class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Corps -->
          <div class="flex-1 overflow-y-auto px-5 py-4 space-y-4">

            <!-- Destinataire -->
            <div class="relative">
              <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">À</label>
              <div class="mt-1 flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
                <div v-if="selectedRecipient" class="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5 text-xs text-blue-800 flex-shrink-0">
                  {{ selectedRecipient.ownerName }}
                  <button @click="selectedRecipient = null" class="text-blue-400 hover:text-blue-600 ml-1">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/></svg>
                  </button>
                </div>
                <input
                  v-if="!selectedRecipient"
                  v-model="recipientQuery"
                  type="text"
                  placeholder="Rechercher un destinataire…"
                  class="flex-1 text-sm outline-none bg-transparent"
                  @input="onRecipientInput"
                  @keydown.escape="showSuggestions = false"
                />
              </div>

              <!-- Suggestions -->
              <div v-if="showSuggestions && suggestions.length" class="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-gray-200 rounded-xl shadow-modal overflow-hidden">
                <button
                  v-for="s in suggestions" :key="s.id"
                  class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors"
                  @click="selectRecipient(s)"
                >
                  <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {{ s.ownerName.charAt(0).toUpperCase() }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-900 truncate">{{ s.ownerName }}</div>
                    <div class="text-xs text-gray-400 truncate">{{ s.emailAddress }}</div>
                  </div>
                  <BadgeType :type="s.type" :mention="s.mention" size="xs" />
                </button>
              </div>
              <p v-if="errors.recipient" class="mt-1 text-xs text-red-500">{{ errors.recipient }}</p>
            </div>

            <!-- Objet -->
            <div>
              <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Objet</label>
              <input v-model="form.subject" type="text" placeholder="Objet du message" class="input mt-1" :class="{ 'input-error': errors.subject }" />
              <p v-if="errors.subject" class="mt-1 text-xs text-red-500">{{ errors.subject }}</p>
            </div>

            <!-- Corps -->
            <div>
              <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Message</label>
              <textarea v-model="form.body" rows="8" placeholder="Rédigez votre message…" class="input mt-1 resize-none" :class="{ 'input-error': errors.body }" />
              <p v-if="errors.body" class="mt-1 text-xs text-red-500">{{ errors.body }}</p>
            </div>

            <!-- Pièces jointes -->
            <Transition name="fade">
              <div v-if="showAttachments">
                <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Pièces jointes</label>
                <div class="mt-1">
                  <FileUpload v-model:attachmentIds="attachmentIds" :disabled="sending" />
                </div>
              </div>
            </Transition>
          </div>

          <!-- Footer -->
          <div class="px-5 py-4 border-t border-gray-100 flex items-center justify-between gap-3 flex-shrink-0">
            <button class="btn-outline text-sm" :disabled="sending" @click="saveDraftManual">
              Enregistrer brouillon
            </button>
            <div class="flex items-center gap-2">
              <button class="btn-outline" @click="close">Annuler</button>
              <button class="btn-accent flex items-center gap-2" :disabled="sending" @click="sendMessage">
                <svg v-if="!sending" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
                <svg v-else class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                {{ sending ? 'Envoi…' : 'Envoyer' }}
              </button>
            </div>
          </div>

          <!-- Erreur envoi -->
          <Transition name="fade">
            <div v-if="sendError" class="absolute bottom-20 left-5 right-5 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {{ sendError }}
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch, onUnmounted } from 'vue'
import BadgeType from './BadgeType.vue'
import FileUpload from './FileUpload.vue'
import { useMessagesStore } from '@/stores/messages.js'

const props = defineProps({
  modelValue:     { type: Boolean, default: false },
  initialTo:      { type: Object,  default: null  },
  initialSubject: { type: String,  default: ''    },
  initialBody:    { type: String,  default: ''    },
  draftId:        { type: String,  default: null  },
})

const emit = defineEmits(['update:modelValue', 'sent'])

const messagesStore     = useMessagesStore()
const form              = reactive({ subject: props.initialSubject || '', body: props.initialBody || '' })
const selectedRecipient = ref(props.initialTo || null)
const recipientQuery    = ref('')
const suggestions       = ref([])
const showSuggestions   = ref(false)
const showAttachments   = ref(false)
const attachmentIds     = ref([])
const sending           = ref(false)
const sendError         = ref(null)
const draftSavedAt      = ref(null)
const currentDraftId    = ref(props.draftId || null)
const errors            = reactive({ recipient: '', subject: '', body: '' })

// Auto-save brouillon toutes les 30s
let autoSaveTimer = null
watch(() => props.modelValue, (val) => {
  if (val) { autoSaveTimer = setInterval(saveDraftSilent, 30000) }
  else     { clearInterval(autoSaveTimer) }
}, { immediate: true })
onUnmounted(() => clearInterval(autoSaveTimer))

// Autocomplétion
let searchTimer = null
async function onRecipientInput() {
  clearTimeout(searchTimer)
  if (!recipientQuery.value) { suggestions.value = []; showSuggestions.value = false; return }
  searchTimer = setTimeout(async () => {
    suggestions.value     = await messagesStore.fetchRecipients(recipientQuery.value)
    showSuggestions.value = suggestions.value.length > 0
  }, 250)
}

function selectRecipient(r) {
  selectedRecipient.value = r
  recipientQuery.value    = ''
  suggestions.value       = []
  showSuggestions.value   = false
  errors.recipient        = ''
}

function validate() {
  errors.recipient = errors.subject = errors.body = ''
  let ok = true
  if (!selectedRecipient.value)  { errors.recipient = 'Destinataire requis'; ok = false }
  if (!form.subject.trim())      { errors.subject   = 'Objet requis';        ok = false }
  if (!form.body.trim())         { errors.body      = 'Message vide';        ok = false }
  return ok
}

async function sendMessage() {
  if (!validate()) return
  sending.value   = true
  sendError.value = null

  const result = await messagesStore.sendMessage({
    toMailboxId:   selectedRecipient.value.id,
    subject:       form.subject,
    body:          form.body,
    attachmentIds: attachmentIds.value,
  })

  sending.value = false
  if (result.success) {
    emit('sent')
    emit('update:modelValue', false)
    resetForm()
  } else {
    sendError.value = result.message
    setTimeout(() => { sendError.value = null }, 4000)
  }
}

async function saveDraftManual() {
  const r = await messagesStore.saveDraft({
    id: currentDraftId.value, toMailboxId: selectedRecipient.value?.id || null,
    subject: form.subject, body: form.body,
  })
  if (r.success) {
    currentDraftId.value = r.data?.id
    draftSavedAt.value   = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }
}

async function saveDraftSilent() {
  if (!form.subject && !form.body && !selectedRecipient.value) return
  await saveDraftManual()
}

function close() { emit('update:modelValue', false) }

function resetForm() {
  form.subject = ''; form.body = ''
  selectedRecipient.value = null; attachmentIds.value = []
  currentDraftId.value = null; draftSavedAt.value = null
  errors.recipient = errors.subject = errors.body = ''
  showAttachments.value = false
}
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.25s ease; }
.slide-up-enter-from, .slide-up-leave-to       { opacity: 0; transform: translateY(20px); }
.fade-enter-active, .fade-leave-active         { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to               { opacity: 0; }
</style>

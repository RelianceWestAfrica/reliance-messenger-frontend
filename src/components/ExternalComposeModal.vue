<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('update:modelValue', false)" />

        <div class="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-modal w-full sm:max-w-2xl max-h-[92vh] flex flex-col z-10">

          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
            <div class="flex items-center gap-2">
              <span class="text-lg">🌐</span>
              <h2 class="text-base font-semibold text-gray-900">
                {{ replyTo ? 'Répondre à ' + (replyTo.name || replyTo.email) : 'Nouveau message externe' }}
              </h2>
            </div>
            <button @click="$emit('update:modelValue', false)" class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Bandeau avertissement -->
          <div class="px-5 py-2 bg-orange-50 border-b border-orange-100 flex items-center gap-2 flex-shrink-0">
            <svg class="w-4 h-4 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
            </svg>
            <p class="text-xs text-orange-700">
              Ce message sera envoyé vers une <strong>adresse email externe</strong> (hors plateforme RWA) via Mailgun.
            </p>
          </div>

          <!-- Formulaire -->
          <div class="flex-1 overflow-y-auto px-5 py-4 space-y-4">

            <!-- Destinataire externe -->
            <div>
              <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Destinataire externe</label>
              <div class="mt-1 grid grid-cols-2 gap-3">
                <div>
                  <input
                    v-model="form.toEmail"
                    type="email"
                    placeholder="client@gmail.com"
                    class="input text-sm"
                    :class="{ 'input-error': errors.toEmail }"
                    :readonly="!!replyTo"
                  />
                  <p v-if="errors.toEmail" class="mt-1 text-xs text-red-500">{{ errors.toEmail }}</p>
                </div>
                <input
                  v-model="form.toName"
                  type="text"
                  placeholder="Nom du destinataire (optionnel)"
                  class="input text-sm"
                  :readonly="!!replyTo"
                />
              </div>
            </div>

            <!-- Objet -->
            <div>
              <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Objet</label>
              <input
                v-model="form.subject"
                type="text"
                placeholder="Objet du message"
                class="input mt-1"
                :class="{ 'input-error': errors.subject }"
              />
              <p v-if="errors.subject" class="mt-1 text-xs text-red-500">{{ errors.subject }}</p>
            </div>

            <!-- Corps -->
            <div>
              <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Message</label>
              <textarea
                v-model="form.body"
                rows="10"
                placeholder="Rédigez votre message..."
                class="input mt-1 resize-none"
                :class="{ 'input-error': errors.body }"
              />
              <p v-if="errors.body" class="mt-1 text-xs text-red-500">{{ errors.body }}</p>
            </div>

            <!-- Signature automatique -->
            <div class="bg-gray-50 rounded-xl p-3 text-xs text-gray-400 border border-gray-100">
              <p class="font-medium text-gray-500 mb-1">Signature automatique ajoutée :</p>
              <p>— Ce message a été envoyé depuis le système de messagerie interne de Reliance West Africa.</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-5 py-4 border-t border-gray-100 flex items-center justify-between gap-3 flex-shrink-0">
            <div class="text-xs text-gray-400 flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
              </svg>
              Envoi sécurisé via Mailgun
            </div>

            <div class="flex items-center gap-2">
              <button class="btn-outline" @click="$emit('update:modelValue', false)">Annuler</button>
              <button
                class="btn-accent flex items-center gap-2"
                :disabled="sending"
                @click="handleSend"
              >
                <svg v-if="!sending" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
                <svg v-else class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                {{ sending ? 'Envoi...' : 'Envoyer' }}
              </button>
            </div>
          </div>

          <!-- Toast erreur -->
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
import { ref, reactive, watch } from 'vue'
import { useExternalStore } from '@/stores/external.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  replyTo:    { type: Object,  default: null   },
})

const emit = defineEmits(['update:modelValue', 'sent'])

const externalStore = useExternalStore()
const sending       = ref(false)
const sendError     = ref(null)

const form   = reactive({ toEmail: '', toName: '', subject: '', body: '' })
const errors = reactive({ toEmail: '', subject: '', body: '' })

// Pré-remplir si réponse
watch(() => props.replyTo, (val) => {
  if (val) {
    form.toEmail  = val.email  || ''
    form.toName   = val.name   || ''
    form.subject  = val.subject || ''
  }
}, { immediate: true })

watch(() => props.modelValue, (val) => {
  if (!val) resetForm()
})

function validate() {
  errors.toEmail = errors.subject = errors.body = ''
  let ok = true
  if (!form.toEmail.trim())                              { errors.toEmail  = 'Email requis'; ok = false }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.toEmail)) { errors.toEmail  = 'Email invalide'; ok = false }
  if (!form.subject.trim())                              { errors.subject  = 'Objet requis'; ok = false }
  if (!form.body.trim())                                 { errors.body     = 'Message vide'; ok = false }
  return ok
}

async function handleSend() {
  if (!validate()) return
  sending.value   = true
  sendError.value = null

  const result = await externalStore.sendEmail({
    toEmail:          form.toEmail.trim(),
    toName:           form.toName.trim() || null,
    subject:          form.subject.trim(),
    body:             form.body.trim(),
    replyToMessageId: props.replyTo?.messageId || null,
  })

  sending.value = false

  if (result.success) {
    emit('sent')
    emit('update:modelValue', false)
  } else {
    sendError.value = result.message
    setTimeout(() => { sendError.value = null }, 5000)
  }
}

function resetForm() {
  form.toEmail = form.toName = form.subject = form.body = ''
  errors.toEmail = errors.subject = errors.body = ''
  sendError.value = null
}
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.25s ease; }
.slide-up-enter-from, .slide-up-leave-to       { opacity: 0; transform: translateY(20px); }
.fade-enter-active, .fade-leave-active         { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to               { opacity: 0; }
</style>

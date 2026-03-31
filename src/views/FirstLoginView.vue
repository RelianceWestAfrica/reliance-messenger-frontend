<template>
  <div class="min-h-screen bg-gradient-to-br from-primary via-[#1e4a7a] to-[#0f2540] flex items-center justify-center p-4">
    <div class="w-full max-w-md">

      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4 border border-white/20">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-white">Bienvenue sur Reliance Messenger</h1>
        <p class="text-blue-200 text-sm mt-1">Première connexion — Sécurisez votre compte</p>
      </div>

      <div class="bg-white rounded-2xl shadow-2xl p-8">

        <!-- Info bannière -->
        <div class="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-3 mb-6">
          <svg class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
          </svg>
          <div>
            <p class="text-sm font-medium text-amber-800">Changement de mot de passe requis</p>
            <p class="text-xs text-amber-700 mt-0.5">Pour votre sécurité, vous devez définir un mot de passe personnel avant d'accéder à votre messagerie.</p>
          </div>
        </div>

        <!-- Infos utilisateur -->
        <div v-if="authStore.user" class="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-xl">
          <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
            {{ authStore.user.fullName?.charAt(0).toUpperCase() }}
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-900">{{ authStore.user.fullName }}</p>
            <p class="text-xs text-gray-500">{{ authStore.mailbox?.emailAddress }}</p>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Nouveau MDP -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
            <div class="relative">
              <input
                v-model="form.newPassword"
                :type="show1 ? 'text' : 'password'"
                placeholder="Minimum 8 caractères"
                class="input pr-10"
                :class="{ 'input-error': errors.newPassword }"
                :disabled="loading"
                autofocus
              />
              <button type="button" @click="show1 = !show1" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
            </div>
            <p v-if="errors.newPassword" class="mt-1 text-xs text-red-500">{{ errors.newPassword }}</p>
          </div>

          <!-- Confirmer MDP -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
            <div class="relative">
              <input
                v-model="form.confirmPassword"
                :type="show2 ? 'text' : 'password'"
                placeholder="Répétez le mot de passe"
                class="input pr-10"
                :class="{ 'input-error': errors.confirmPassword }"
                :disabled="loading"
              />
              <button type="button" @click="show2 = !show2" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
            </div>
            <p v-if="errors.confirmPassword" class="mt-1 text-xs text-red-500">{{ errors.confirmPassword }}</p>
          </div>

          <!-- Indicateur de force -->
          <div v-if="form.newPassword" class="space-y-1">
            <div class="flex gap-1">
              <div v-for="i in 4" :key="i" :class="['h-1.5 flex-1 rounded-full transition-all duration-300', strengthColor(i)]" />
            </div>
            <p class="text-xs" :class="strengthTextColor">{{ strengthLabel }}</p>
          </div>

          <!-- Règles -->
          <ul class="text-xs text-gray-500 space-y-1">
            <li :class="form.newPassword.length >= 8 ? 'text-green-600' : ''" class="flex items-center gap-1.5">
              <svg class="w-3 h-3" :fill="form.newPassword.length >= 8 ? '#16a34a' : '#9CA3AF'" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
              </svg>
              Au moins 8 caractères
            </li>
            <li :class="/[A-Z]/.test(form.newPassword) ? 'text-green-600' : ''" class="flex items-center gap-1.5">
              <svg class="w-3 h-3" :fill="/[A-Z]/.test(form.newPassword) ? '#16a34a' : '#9CA3AF'" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
              </svg>
              Une majuscule
            </li>
            <li :class="/[0-9]/.test(form.newPassword) ? 'text-green-600' : ''" class="flex items-center gap-1.5">
              <svg class="w-3 h-3" :fill="/[0-9]/.test(form.newPassword) ? '#16a34a' : '#9CA3AF'" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
              </svg>
              Un chiffre
            </li>
          </ul>

          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{{ error }}</div>

          <button type="submit" class="btn-primary w-full py-2.5 mt-2" :disabled="loading">
            <span v-if="loading" class="inline-flex items-center gap-2">
              <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
              Enregistrement…
            </span>
            <span v-else>Accéder à ma messagerie →</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()
const loading   = ref(false)
const error     = ref(null)
const show1     = ref(false)
const show2     = ref(false)

const form   = reactive({ newPassword: '', confirmPassword: '' })
const errors = reactive({ newPassword: '', confirmPassword: '' })

const strength = computed(() => {
  const p = form.newPassword
  if (!p) return 0
  let s = 0
  if (p.length >= 8)           s++
  if (/[A-Z]/.test(p))         s++
  if (/[0-9]/.test(p))         s++
  if (/[^A-Za-z0-9]/.test(p))  s++
  return s
})

const strengthLabel     = computed(() => ['', 'Faible', 'Moyen', 'Bon', 'Fort'][strength.value])
const strengthTextColor = computed(() => ['', 'text-red-500', 'text-yellow-500', 'text-blue-500', 'text-green-600'][strength.value])

function strengthColor(i) {
  if (i > strength.value) return 'bg-gray-200'
  return ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'][strength.value]
}

function validate() {
  errors.newPassword = errors.confirmPassword = ''
  let ok = true
  if (form.newPassword.length < 8)                     { errors.newPassword = 'Minimum 8 caractères'; ok = false }
  if (form.newPassword !== form.confirmPassword)        { errors.confirmPassword = 'Les mots de passe ne correspondent pas'; ok = false }
  return ok
}

async function handleSubmit() {
  if (!validate()) return
  loading.value = true
  error.value   = null
  const result = await authStore.updateFirstLogin(form.newPassword)
  loading.value = false
  if (!result.success) error.value = result.message
}
</script>

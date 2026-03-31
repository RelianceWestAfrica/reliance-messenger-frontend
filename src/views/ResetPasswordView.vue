<template>
  <div class="min-h-screen bg-gradient-to-br from-primary via-[#1e4a7a] to-[#0f2540] flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-white">Reliance Messenger</h1>
        <p class="text-blue-200 text-sm mt-1">Nouveau mot de passe</p>
      </div>

      <div class="bg-white rounded-2xl shadow-2xl p-8">

        <!-- Succès -->
        <div v-if="success" class="text-center py-4">
          <div class="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h2 class="text-lg font-semibold text-gray-900 mb-3">Mot de passe modifié !</h2>
          <p class="text-sm text-gray-500 mb-6">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
          <RouterLink to="/login" class="btn-primary inline-block">Se connecter</RouterLink>
        </div>

        <!-- Token invalide / expiré -->
        <div v-else-if="tokenInvalid" class="text-center py-4">
          <div class="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h2 class="text-lg font-semibold text-gray-900 mb-3">Lien invalide ou expiré</h2>
          <p class="text-sm text-gray-500 mb-6">Ce lien de réinitialisation n'est plus valide. Soumettez une nouvelle demande.</p>
          <RouterLink to="/forgot-password" class="btn-primary inline-block">Nouvelle demande</RouterLink>
        </div>

        <!-- Formulaire -->
        <form v-else @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <h2 class="text-xl font-semibold text-gray-900 mb-1">Définir un nouveau mot de passe</h2>
            <p class="text-sm text-gray-500 mb-4">Choisissez un mot de passe sécurisé d'au moins 8 caractères.</p>
          </div>

          <!-- Nouveau MDP -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
            <div class="relative">
              <input
                v-model="form.newPassword"
                :type="show1 ? 'text' : 'password'"
                placeholder="••••••••"
                class="input pr-10"
                :class="{ 'input-error': errors.newPassword }"
                :disabled="loading"
              />
              <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" @click="show1 = !show1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path v-if="!show1" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
              </button>
            </div>
            <p v-if="errors.newPassword" class="mt-1 text-xs text-red-500">{{ errors.newPassword }}</p>
          </div>

          <!-- Confirmation MDP -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
            <div class="relative">
              <input
                v-model="form.confirmPassword"
                :type="show2 ? 'text' : 'password'"
                placeholder="••••••••"
                class="input pr-10"
                :class="{ 'input-error': errors.confirmPassword }"
                :disabled="loading"
              />
              <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" @click="show2 = !show2">
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
              <div v-for="i in 4" :key="i" :class="['h-1 flex-1 rounded-full transition-colors', strengthColor(i)]" />
            </div>
            <p class="text-xs" :class="strengthTextColor">{{ strengthLabel }}</p>
          </div>

          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{{ error }}</div>

          <button type="submit" class="btn-primary w-full py-2.5" :disabled="loading">
            <span v-if="loading" class="inline-flex items-center gap-2">
              <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
              Enregistrement…
            </span>
            <span v-else>Enregistrer le mot de passe</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { authApi } from '@/services/api.js'

const route        = useRoute()
const loading      = ref(false)
const success      = ref(false)
const tokenInvalid = ref(false)
const error        = ref(null)
const show1        = ref(false)
const show2        = ref(false)

const form   = reactive({ newPassword: '', confirmPassword: '' })
const errors = reactive({ newPassword: '', confirmPassword: '' })

// Indicateur de force du mot de passe
const strength = computed(() => {
  const p = form.newPassword
  if (!p) return 0
  let score = 0
  if (p.length >= 8)              score++
  if (/[A-Z]/.test(p))            score++
  if (/[0-9]/.test(p))            score++
  if (/[^A-Za-z0-9]/.test(p))     score++
  return score
})

const strengthLabel = computed(() => {
  return ['', 'Faible', 'Moyen', 'Bon', 'Fort'][strength.value] || ''
})

const strengthTextColor = computed(() => {
  return ['', 'text-red-500', 'text-yellow-500', 'text-blue-500', 'text-green-600'][strength.value]
})

function strengthColor(i) {
  if (i > strength.value) return 'bg-gray-200'
  const colors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500']
  return colors[strength.value]
}

function validate() {
  errors.newPassword     = ''
  errors.confirmPassword = ''
  let ok = true
  if (form.newPassword.length < 8) {
    errors.newPassword = 'Minimum 8 caractères requis'
    ok = false
  }
  if (form.newPassword !== form.confirmPassword) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas'
    ok = false
  }
  return ok
}

async function handleSubmit() {
  if (!validate()) return
  loading.value = true
  error.value   = null
  try {
    await authApi.resetPassword({
      token:       route.params.token,
      newPassword: form.newPassword,
    })
    success.value = true
  } catch (err) {
    const msg = err.response?.data?.message || ''
    if (msg.includes('invalide') || msg.includes('expiré')) {
      tokenInvalid.value = true
    } else {
      error.value = msg || 'Une erreur est survenue.'
    }
  } finally {
    loading.value = false
  }
}
</script>

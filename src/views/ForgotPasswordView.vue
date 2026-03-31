<template>
  <div class="min-h-screen bg-gradient-to-br from-primary via-[#1e4a7a] to-[#0f2540] flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-white">Reliance Messenger</h1>
        <p class="text-blue-200 text-sm mt-1">Réinitialisation du mot de passe</p>
      </div>

      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <!-- Succès -->
        <div v-if="sent" class="text-center py-4">
          <div class="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h2 class="text-lg font-semibold text-gray-900 mb-3">Email envoyé !</h2>
          <p class="text-sm text-gray-500 mb-6">Si ce compte existe, un lien de réinitialisation a été envoyé à votre adresse de récupération. Vérifiez vos spams.</p>
          <RouterLink to="/login" class="btn-primary inline-block">Retour à la connexion</RouterLink>
        </div>

        <!-- Formulaire -->
        <form v-else @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <h2 class="text-xl font-semibold text-gray-900 mb-3">Mot de passe oublié ?</h2>
            <p class="text-sm text-gray-500 mb-4">Entrez votre adresse de boîte mail. Un lien de réinitialisation sera envoyé à votre adresse de récupération.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Adresse mail interne</label>
            <input v-model="email" type="email" placeholder="votre@rwa.com" class="input" :disabled="loading" />
          </div>

          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{{ error }}</div>

          <button type="submit" class="btn-primary w-full py-2.5" :disabled="loading">
            <span v-if="loading" class="inline-flex items-center gap-2">
              <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
              Envoi…
            </span>
            <span v-else>Envoyer le lien</span>
          </button>

          <div class="text-center">
            <RouterLink to="/login" class="text-sm text-primary hover:text-accent">← Retour à la connexion</RouterLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { authApi } from '@/services/api.js'

const email   = ref('')
const loading = ref(false)
const sent    = ref(false)
const error   = ref(null)

async function handleSubmit() {
  if (!email.value) return
  loading.value = true
  error.value   = null
  try {
    await authApi.forgotPassword({ email: email.value })
    sent.value = true
  } catch {
    error.value = 'Une erreur est survenue. Veuillez réessayer.'
  } finally {
    loading.value = false
  }
}
</script>

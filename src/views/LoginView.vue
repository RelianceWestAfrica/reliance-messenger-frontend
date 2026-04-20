<template>
  <div class="min-h-screen bg-gradient-to-br from-primary via-[#1e4a7a] to-[#0f2540] flex items-center justify-center p-4">
    <div class="w-full max-w-md">

      <!-- Logo / Branding -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4 border border-white/20">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-white tracking-tight">Reliance Messenger Cc</h1>
        <p class="text-blue-200 text-sm mt-1">Système de messagerie interne</p>
      </div>

      <!-- Carte login -->
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-6" style="text-align: center;">Connexion</h2>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Email -->
          <div>
            <!-- <label class="block text-sm font-medium text-gray-700 mb-1">Adresse mail</label> -->
            <input
              v-model="form.email"
              type="email"
              autocomplete="email"
              placeholder="votre@rwa.com"
              class="input"
              :class="{ 'input-error': errors.email }"
              :disabled="loading"
            />
            <p v-if="errors.email" class="mt-1 text-xs text-red-500">{{ errors.email }}</p>
          </div>

          <!-- Mot de passe -->
          <div>
            <!-- <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label> -->
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="••••••••"
                class="input pr-10"
                :class="{ 'input-error': errors.password }"
                :disabled="loading"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                @click="showPassword = !showPassword"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path v-if="!showPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-xs text-red-500">{{ errors.password }}</p>
          </div>

          <!-- Erreur globale (rate limit, compte désactivé…) -->
          <Transition name="fade">
            <div v-if="authError" class="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 flex items-start gap-2">
              <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              {{ authError }}
            </div>
          </Transition>

          <!-- Submit -->
          <button
            type="submit"
            class="btn-primary w-full py-2.5 text-sm font-medium"
            :disabled="loading"
          >
            <span v-if="loading" class="inline-flex items-center gap-2">
              <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Connexion…
            </span>
            <span v-else>Se connecter</span>
          </button>
        </form>

        <!-- Lien mot de passe oublié -->
        <div class="mt-5 text-center">
          <RouterLink to="/forgot-password" class="text-sm text-primary hover:text-accent transition-colors">
            Mot de passe oublié ?
          </RouterLink>
        </div>
      </div>

      <!-- Footer -->
      <p class="text-center text-blue-300/60 text-xs mt-6">
        © {{ new Date().getFullYear() }} Reliance West Africa — Usage interne uniquement
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const authStore   = useAuthStore()
const loading     = ref(false)
const showPassword = ref(false)
const authError   = ref(null)

const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })

function validate() {
  errors.email    = ''
  errors.password = ''
  let ok = true
  if (!form.email)    { errors.email    = 'L\'email est requis'; ok = false }
  if (!form.password) { errors.password = 'Le mot de passe est requis'; ok = false }
  return ok
}

async function handleLogin() {
  if (!validate()) return
  authError.value = null
  loading.value   = true

  const result = await authStore.login(form.email, form.password)
  loading.value = false

  if (!result.success) {
    authError.value = result.message
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>

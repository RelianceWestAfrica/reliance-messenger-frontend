<template>
  <div class="flex-1 overflow-y-auto p-6">
    <div class="max-w-lg mx-auto space-y-6">

      <!-- Titre -->
      <div>
        <h2 class="text-lg font-semibold text-gray-900">Paramètres du compte</h2>
        <p class="text-sm text-gray-500 mt-1">Gérez votre compte et votre sécurité</p>
      </div>

      <!-- Carte : infos du compte -->
      <div class="card p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Informations du compte</h3>
        <div class="space-y-3">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-lg font-bold">
              {{ authStore.user?.fullName?.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="font-semibold text-gray-900">{{ authStore.user?.fullName }}</p>
              <p class="text-sm text-gray-500">{{ authStore.user?.position || 'Aucun poste défini' }}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wide">Adresse mail</p>
              <p class="text-sm font-medium text-gray-900 mt-0.5">{{ authStore.mailbox?.emailAddress }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wide">Rôle</p>
              <p class="text-sm font-medium text-gray-900 mt-0.5">{{ authStore.user?.role }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wide">Type de boîte</p>
              <BadgeType v-if="authStore.mailbox?.type" :type="authStore.mailbox.type" :mention="authStore.mailbox.mention" class="mt-0.5" />
            </div>
          </div>
        </div>
      </div>

      <!-- Carte : changement de mot de passe -->
      <div class="card p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Changer le mot de passe</h3>

        <form @submit.prevent="handleChangePassword" class="space-y-4">
          <!-- MDP actuel -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
            <div class="relative">
              <input
                v-model="form.currentPassword"
                :type="show.current ? 'text' : 'password'"
                class="input pr-10"
                :class="{ 'input-error': errors.currentPassword }"
                placeholder="••••••••"
                :disabled="loading"
              />
              <button type="button" @click="show.current = !show.current" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
            </div>
            <p v-if="errors.currentPassword" class="mt-1 text-xs text-red-500">{{ errors.currentPassword }}</p>
          </div>

          <!-- Nouveau MDP -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
            <div class="relative">
              <input
                v-model="form.newPassword"
                :type="show.new ? 'text' : 'password'"
                class="input pr-10"
                :class="{ 'input-error': errors.newPassword }"
                placeholder="Minimum 8 caractères"
                :disabled="loading"
              />
              <button type="button" @click="show.new = !show.new" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
            </div>
            <p v-if="errors.newPassword" class="mt-1 text-xs text-red-500">{{ errors.newPassword }}</p>
          </div>

          <!-- Confirmer MDP -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
            <input
              v-model="form.confirmPassword"
              :type="show.new ? 'text' : 'password'"
              class="input"
              :class="{ 'input-error': errors.confirmPassword }"
              placeholder="Répétez le mot de passe"
              :disabled="loading"
            />
            <p v-if="errors.confirmPassword" class="mt-1 text-xs text-red-500">{{ errors.confirmPassword }}</p>
          </div>

          <!-- Toast succès -->
          <Transition name="fade">
            <div v-if="successMsg" class="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
              <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
              </svg>
              {{ successMsg }}
            </div>
          </Transition>

          <!-- Toast erreur -->
          <Transition name="fade">
            <div v-if="errorMsg" class="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {{ errorMsg }}
            </div>
          </Transition>

          <button type="submit" class="btn-primary" :disabled="loading">
            <span v-if="loading" class="inline-flex items-center gap-2">
              <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
              Enregistrement…
            </span>
            <span v-else>Changer le mot de passe</span>
          </button>
        </form>
      </div>

      <!-- Déconnexion -->
      <div class="card p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-2">Session</h3>
        <p class="text-sm text-gray-500 mb-4">Déconnectez-vous de cette session RWA.</p>
        <button @click="authStore.logout()" class="btn-outline text-red-600 border-red-200 hover:bg-red-50">
          Se déconnecter
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { userApi } from '@/services/api.js'
import BadgeType from '@/components/BadgeType.vue'

const authStore  = useAuthStore()
const loading    = ref(false)
const successMsg = ref(null)
const errorMsg   = ref(null)

const form   = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })
const errors = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })
const show   = reactive({ current: false, new: false })

function validate() {
  errors.currentPassword = errors.newPassword = errors.confirmPassword = ''
  let ok = true
  if (!form.currentPassword)                             { errors.currentPassword = 'Requis'; ok = false }
  if (form.newPassword.length < 8)                       { errors.newPassword = 'Minimum 8 caractères'; ok = false }
  if (form.newPassword !== form.confirmPassword)          { errors.confirmPassword = 'Les mots de passe ne correspondent pas'; ok = false }
  return ok
}

async function handleChangePassword() {
  if (!validate()) return
  loading.value  = true
  successMsg.value = null
  errorMsg.value   = null

  try {
    await userApi.changePassword({
      currentPassword:  form.currentPassword,
      newPassword:      form.newPassword,
      confirmPassword:  form.confirmPassword,
    })
    successMsg.value = 'Mot de passe modifié avec succès !'
    form.currentPassword = form.newPassword = form.confirmPassword = ''
    setTimeout(() => { successMsg.value = null }, 4000)
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Une erreur est survenue'
    setTimeout(() => { errorMsg.value = null }, 4000)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>

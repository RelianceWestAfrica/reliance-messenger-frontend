<template>
  <div class="space-y-4">

    <!-- Barre d'actions -->
    <div class="flex items-center justify-between gap-4">
      <input v-model="search" type="text" placeholder="Rechercher un utilisateur…" class="input max-w-xs" />
      <button @click="openCreate" class="btn-primary flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Nouvel utilisateur
      </button>
    </div>

    <!-- Tableau -->
    <div class="card overflow-hidden">
      <div v-if="adminStore.loading && !adminStore.users.length" class="p-8 text-center">
        <svg class="animate-spin w-8 h-8 text-primary/30 mx-auto" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50">
              <th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nom complet</th>
              <th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Boîte mail</th>
              <th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
              <th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rôle</th>
              <th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
              <th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              :class="['hover:bg-gray-50/50 transition-colors', user.isDeleted ? 'opacity-50' : '']"
            >
              <td class="px-5 py-3">
                <div class="flex items-center gap-3">
                  <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0', user.isDeleted ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary']">
                    {{ user.isDeleted ? '✕' : user.fullName?.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <p :class="['font-medium', user.isDeleted ? 'text-red-500 line-through' : 'text-gray-900']">
                      {{ user.isDeleted ? '[COMPTE SUPPRIMÉ]' : user.fullName }}
                    </p>
                    <p class="text-xs text-gray-400">{{ user.position || '—' }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-3 text-gray-600">{{ user.mailbox?.emailAddress || '—' }}</td>
              <td class="px-5 py-3">
                <BadgeType v-if="user.mailbox?.type" :type="user.mailbox.type" :mention="user.mailbox.mention" />
                <span v-else class="text-gray-400">—</span>
              </td>
              <td class="px-5 py-3">
                <span :class="['badge', roleClass(user.role)]">{{ user.role }}</span>
              </td>
              <td class="px-5 py-3">
                <span v-if="user.isDeleted" class="badge bg-red-50 text-red-600">Supprimé</span>
                <span v-else-if="user.isFirstLogin" class="badge bg-amber-50 text-amber-700">1ère connexion</span>
                <span v-else-if="user.isActive" class="badge bg-green-50 text-green-700">Actif</span>
                <span v-else class="badge bg-gray-100 text-gray-500">Inactif</span>
              </td>
              <td class="px-5 py-3">
                <div v-if="!user.isDeleted" class="flex items-center gap-1">
                  <button @click="openEdit(user)" class="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors" title="Modifier">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button
                    v-if="user.role !== 'SUPERADMIN'"
                    @click="confirmDelete(user)"
                    class="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Supprimer"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredUsers.length">
              <td colspan="6" class="px-5 py-8 text-center text-sm text-gray-400">Aucun utilisateur trouvé</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal créer/modifier -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showModal = false" />
          <div class="relative bg-white rounded-2xl shadow-modal w-full max-w-lg z-10 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 class="text-base font-semibold text-gray-900">{{ editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur' }}</h3>
              <button @click="showModal = false" class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <form @submit.prevent="handleSubmit" class="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                  <input v-model="form.fullName" type="text" class="input" :class="{'input-error': errors.fullName}" placeholder="Prénom Nom" />
                  <p v-if="errors.fullName" class="mt-1 text-xs text-red-500">{{ errors.fullName }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Poste</label>
                  <input v-model="form.position" type="text" class="input" placeholder="Directeur commercial" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
                  <select v-model="form.role" class="input" :class="{'input-error': errors.role}">
                    <option value="">Sélectionner</option>
                    <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
                  </select>
                  <p v-if="errors.role" class="mt-1 text-xs text-red-500">{{ errors.role }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email de récupération *</label>
                  <input v-model="form.recoveryEmail" type="email" class="input" :class="{'input-error': errors.recoveryEmail}" placeholder="email@externe.com" :disabled="!!editingUser" />
                  <p v-if="errors.recoveryEmail" class="mt-1 text-xs text-red-500">{{ errors.recoveryEmail }}</p>
                </div>
              </div>

              <!-- Champs boîte mail — uniquement à la création -->
              <template v-if="!editingUser">
                <div class="pt-2 border-t border-gray-100">
                  <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Boîte mail</p>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Adresse mail *</label>
                      <input v-model="form.mailboxEmail" type="email" class="input" :class="{'input-error': errors.mailboxEmail}" placeholder="nom@rwa.com" />
                      <p v-if="errors.mailboxEmail" class="mt-1 text-xs text-red-500">{{ errors.mailboxEmail }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Type de boîte *</label>
                      <select v-model="form.mailboxType" class="input" :class="{'input-error': errors.mailboxType}">
                        <option value="">Sélectionner</option>
                        <option v-for="t in mailboxTypes" :key="t" :value="t">{{ t }}</option>
                      </select>
                      <p v-if="errors.mailboxType" class="mt-1 text-xs text-red-500">{{ errors.mailboxType }}</p>
                    </div>
                  </div>
                  <div v-if="form.mailboxType === 'AUTRES'" class="mt-3">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Mention * <span class="text-xs text-gray-400">(obligatoire pour type AUTRES)</span></label>
                    <input v-model="form.mailboxMention" type="text" class="input" :class="{'input-error': errors.mailboxMention}" placeholder="Ex: Partenaire, Prestataire…" />
                    <p v-if="errors.mailboxMention" class="mt-1 text-xs text-red-500">{{ errors.mailboxMention }}</p>
                  </div>
                </div>
              </template>

              <!-- Statut (modification) -->
              <div v-if="editingUser" class="flex items-center gap-3">
                <input v-model="form.isActive" type="checkbox" id="isActive" class="w-4 h-4 rounded border-gray-300 text-primary" />
                <label for="isActive" class="text-sm text-gray-700">Compte actif</label>
              </div>

              <!-- Erreur globale -->
              <div v-if="formError" class="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{{ formError }}</div>

              <div class="flex justify-end gap-3 pt-2">
                <button type="button" @click="showModal = false" class="btn-outline">Annuler</button>
                <button type="submit" class="btn-primary" :disabled="adminStore.loading">
                  <span v-if="adminStore.loading" class="inline-flex items-center gap-2">
                    <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                    Enregistrement…
                  </span>
                  <span v-else>{{ editingUser ? 'Enregistrer' : 'Créer l\'utilisateur' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Confirm suppression -->
    <ConfirmDialog
      v-model="showDeleteConfirm"
      title="Supprimer cet utilisateur"
      :message="`Supprimer ${deletingUser?.fullName} ? Ses messages seront masqués et son compte désactivé définitivement. Les archives restent intactes.`"
      confirmLabel="Supprimer définitivement"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin.js'
import BadgeType from '@/components/BadgeType.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const adminStore = useAdminStore()
onMounted(() => adminStore.fetchUsers())

const search          = ref('')
const showModal       = ref(false)
const showDeleteConfirm = ref(false)
const editingUser     = ref(null)
const deletingUser    = ref(null)
const formError       = ref(null)

const roles        = ['SUPERADMIN', 'DIRECTEUR', 'EMPLOYE', 'INTERNE']
const mailboxTypes = ['ADMINISTRATION', 'DIRECTEUR', 'EMPLOYE', 'AUTRES']

const form   = reactive({ fullName: '', position: '', role: '', recoveryEmail: '', mailboxEmail: '', mailboxType: '', mailboxMention: '', isActive: true })
const errors = reactive({ fullName: '', role: '', recoveryEmail: '', mailboxEmail: '', mailboxType: '', mailboxMention: '' })

const filteredUsers = computed(() => {
  const q = search.value.toLowerCase()
  return adminStore.users.filter(u =>
    !q || u.fullName?.toLowerCase().includes(q) || u.mailbox?.emailAddress?.toLowerCase().includes(q)
  )
})

function roleClass(role) {
  const map = { SUPERADMIN: 'bg-red-50 text-red-700', DIRECTEUR: 'bg-blue-50 text-blue-700', EMPLOYE: 'bg-gray-100 text-gray-700', INTERNE: 'bg-green-50 text-green-700' }
  return map[role] || 'bg-gray-100 text-gray-600'
}

function openCreate() {
  editingUser.value = null
  Object.assign(form, { fullName: '', position: '', role: '', recoveryEmail: '', mailboxEmail: '', mailboxType: '', mailboxMention: '', isActive: true })
  Object.keys(errors).forEach(k => { errors[k] = '' })
  formError.value = null
  showModal.value = true
}

function openEdit(user) {
  editingUser.value = user
  Object.assign(form, { fullName: user.fullName, position: user.position || '', role: user.role, recoveryEmail: user.recoveryEmail, isActive: user.isActive })
  Object.keys(errors).forEach(k => { errors[k] = '' })
  formError.value = null
  showModal.value = true
}

function validate() {
  Object.keys(errors).forEach(k => { errors[k] = '' })
  let ok = true
  if (!form.fullName.trim())     { errors.fullName = 'Requis'; ok = false }
  if (!form.role)                { errors.role = 'Requis'; ok = false }
  if (!form.recoveryEmail)       { errors.recoveryEmail = 'Requis'; ok = false }
  if (!editingUser.value) {
    if (!form.mailboxEmail)      { errors.mailboxEmail = 'Requis'; ok = false }
    if (!form.mailboxType)       { errors.mailboxType = 'Requis'; ok = false }
    if (form.mailboxType === 'AUTRES' && !form.mailboxMention.trim()) { errors.mailboxMention = 'Obligatoire pour le type AUTRES'; ok = false }
  }
  return ok
}

async function handleSubmit() {
  if (!validate()) return
  formError.value = null
  let result
  if (editingUser.value) {
    result = await adminStore.updateUser(editingUser.value.id, { fullName: form.fullName, position: form.position, role: form.role, isActive: form.isActive })
  } else {
    result = await adminStore.createUser({ ...form })
  }
  if (result.success) {
    showModal.value = false
  } else {
    formError.value = result.message
  }
}

function confirmDelete(user) {
  deletingUser.value = user
  showDeleteConfirm.value = true
}

async function handleDelete(resolve) {
  await adminStore.deleteUser(deletingUser.value.id)
  deletingUser.value = null
  resolve()
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>

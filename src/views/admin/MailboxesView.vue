<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-4">
      <input v-model="search" type="text" placeholder="Rechercher une boîte mail…" class="input max-w-xs" />
      <button @click="openCreate" class="btn-primary flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Nouvelle boîte
      </button>
    </div>

    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50">
              <th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Adresse mail</th>
              <th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
              <th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Propriétaire</th>
              <th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
              <th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="mb in filteredMailboxes" :key="mb.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-5 py-3 font-medium text-gray-900">{{ mb.emailAddress }}</td>
              <td class="px-5 py-3"><BadgeType :type="mb.type" :mention="mb.mention" /></td>
              <td class="px-5 py-3">
                <span v-if="mb.owner" :class="['text-sm', mb.owner.isDeleted ? 'text-red-500' : 'text-gray-700']">
                  {{ mb.owner.isDeleted ? '[COMPTE SUPPRIMÉ]' : mb.owner.fullName }}
                </span>
                <span v-else class="text-gray-400">—</span>
              </td>
              <td class="px-5 py-3">
                <span :class="['badge', mb.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500']">
                  {{ mb.isActive ? 'Active' : 'Désactivée' }}
                </span>
              </td>
              <td class="px-5 py-3">
                <div class="flex items-center gap-1">
                  <button @click="openEdit(mb)" class="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button v-if="mb.isActive" @click="confirmDeactivate(mb)" class="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredMailboxes.length">
              <td colspan="5" class="px-5 py-8 text-center text-sm text-gray-400">Aucune boîte mail trouvée</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showModal = false" />
          <div class="relative bg-white rounded-2xl shadow-modal w-full max-w-md z-10">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 class="text-base font-semibold text-gray-900">{{ editingMailbox ? 'Modifier la boîte' : 'Nouvelle boîte mail' }}</h3>
              <button @click="showModal = false" class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>
            <form @submit.prevent="handleSubmit" class="px-6 py-5 space-y-4">
              <div v-if="!editingMailbox">
                <label class="block text-sm font-medium text-gray-700 mb-1">Adresse mail *</label>
                <input v-model="form.emailAddress" type="email" class="input" :class="{'input-error': errors.emailAddress}" placeholder="nom@rwa.com" />
                <p v-if="errors.emailAddress" class="mt-1 text-xs text-red-500">{{ errors.emailAddress }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select v-model="form.type" class="input">
                  <option value="">Sélectionner</option>
                  <option v-for="t in ['ADMINISTRATION','DIRECTEUR','EMPLOYE','AUTRES']" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
              <div v-if="form.type === 'AUTRES'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Mention * <span class="text-xs text-gray-400">(obligatoire)</span></label>
                <input v-model="form.mention" type="text" class="input" :class="{'input-error': errors.mention}" placeholder="Ex: Partenaire…" />
                <p v-if="errors.mention" class="mt-1 text-xs text-red-500">{{ errors.mention }}</p>
              </div>
              <div v-if="!editingMailbox">
                <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe initial</label>
                <input v-model="form.password" type="text" class="input" placeholder="Laissez vide pour générer automatiquement" />
              </div>
              <div v-if="editingMailbox" class="flex items-center gap-2">
                <input v-model="form.isActive" type="checkbox" id="mbActive" class="w-4 h-4 rounded text-primary" />
                <label for="mbActive" class="text-sm text-gray-700">Boîte active</label>
              </div>
              <div v-if="formError" class="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{{ formError }}</div>
              <div class="flex justify-end gap-3">
                <button type="button" @click="showModal = false" class="btn-outline">Annuler</button>
                <button type="submit" class="btn-primary" :disabled="adminStore.loading">
                  {{ editingMailbox ? 'Enregistrer' : 'Créer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <ConfirmDialog
      v-model="showDeactivateConfirm"
      title="Désactiver la boîte mail"
      :message="`Désactiver ${deactivatingMailbox?.emailAddress} ? Les utilisateurs ne pourront plus s'y connecter.`"
      confirmLabel="Désactiver"
      @confirm="handleDeactivate"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin.js'
import BadgeType from '@/components/BadgeType.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const adminStore = useAdminStore()
onMounted(() => adminStore.fetchMailboxes())

const search               = ref('')
const showModal            = ref(false)
const showDeactivateConfirm = ref(false)
const editingMailbox       = ref(null)
const deactivatingMailbox  = ref(null)
const formError            = ref(null)

const form   = reactive({ emailAddress: '', type: '', mention: '', password: '', isActive: true })
const errors = reactive({ emailAddress: '', type: '', mention: '' })

const filteredMailboxes = computed(() => {
  const q = search.value.toLowerCase()
  return adminStore.mailboxes.filter(mb => !q || mb.emailAddress?.toLowerCase().includes(q) || mb.owner?.fullName?.toLowerCase().includes(q))
})

function openCreate() {
  editingMailbox.value = null
  Object.assign(form, { emailAddress: '', type: '', mention: '', password: '', isActive: true })
  Object.keys(errors).forEach(k => { errors[k] = '' })
  formError.value = null
  showModal.value = true
}

function openEdit(mb) {
  editingMailbox.value = mb
  Object.assign(form, { type: mb.type, mention: mb.mention || '', isActive: mb.isActive })
  formError.value = null
  showModal.value = true
}

async function handleSubmit() {
  formError.value = null
  if (form.type === 'AUTRES' && !form.mention.trim()) { errors.mention = 'Obligatoire pour le type AUTRES'; return }

  let result
  if (editingMailbox.value) {
    result = await adminStore.updateMailbox(editingMailbox.value.id, { type: form.type, mention: form.mention, isActive: form.isActive })
  } else {
    if (!form.emailAddress) { errors.emailAddress = 'Requis'; return }
    result = await adminStore.createMailbox({ ...form })
  }
  if (result.success) showModal.value = false
  else formError.value = result.message
}

function confirmDeactivate(mb) {
  deactivatingMailbox.value = mb
  showDeactivateConfirm.value = true
}

async function handleDeactivate(resolve) {
  await adminStore.deleteMailbox(deactivatingMailbox.value.id)
  deactivatingMailbox.value = null
  resolve()
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>

<template>
  <!-- Pile de toasts — max 3 visibles simultanément -->
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none" style="max-width: 360px;">
      <TransitionGroup name="toast">
        <div
          v-for="toast in visibleToasts"
          :key="toast.id"
          class="pointer-events-auto bg-white rounded-xl shadow-modal border border-gray-100 px-4 py-3 flex items-start gap-3"
        >
          <!-- Icône selon le type -->
          <div :class="['w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5', iconBg(toast.type)]">
            <span class="text-sm">{{ iconEmoji(toast.type) }}</span>
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 truncate">{{ toast.title }}</p>
            <p v-if="toast.body" class="text-xs text-gray-500 truncate mt-0.5">{{ toast.body }}</p>
          </div>

          <!-- Bouton fermer -->
          <button
            @click="dismiss(toast.id)"
            class="text-gray-300 hover:text-gray-500 flex-shrink-0 transition-colors"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router       = useRouter()
const visibleToasts = ref([])
let toastCounter   = 0

function addToast(notification) {
  const id = ++toastCounter
  visibleToasts.value.unshift({ ...notification, id })

  // Auto-dismiss après 5s
  setTimeout(() => dismiss(id), 5000)

  // Garder max 3 toasts
  if (visibleToasts.value.length > 3) {
    visibleToasts.value.pop()
  }
}

function dismiss(id) {
  visibleToasts.value = visibleToasts.value.filter((t) => t.id !== id)
}

function iconBg(type) {
  const map = {
    new_message: 'bg-blue-100',
    broadcast:   'bg-purple-100',
    system:      'bg-gray-100',
  }
  return map[type] || 'bg-gray-100'
}

function iconEmoji(type) {
  const map = { new_message: '✉️', broadcast: '📣', system: '🔔' }
  return map[type] || '🔔'
}

// Écouter l'événement global émis par le store notifications
function onNewNotification(event) {
  addToast(event.detail)
}

onMounted(() => {
  window.addEventListener('rwa:new-notification', onNewNotification)
})

onUnmounted(() => {
  window.removeEventListener('rwa:new-notification', onNewNotification)
})
</script>

<style scoped>
.toast-enter-active  { transition: all 0.3s ease; }
.toast-leave-active  { transition: all 0.25s ease; }
.toast-enter-from    { opacity: 0; transform: translateX(100%); }
.toast-leave-to      { opacity: 0; transform: translateX(100%); }
.toast-move          { transition: transform 0.3s ease; }
</style>

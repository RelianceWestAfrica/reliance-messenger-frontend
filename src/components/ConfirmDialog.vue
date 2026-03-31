<template>
  <!-- Overlay -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="$emit('update:modelValue', false)"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" />

        <!-- Dialog -->
        <div class="relative bg-white rounded-2xl shadow-modal w-full max-w-md p-6 z-10">
          <!-- Icône -->
          <div class="flex items-start gap-4">
            <div
              :class="iconWrapClass"
              class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
            >
              <svg v-if="variant === 'danger'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd"/>
              </svg>
            </div>

            <div class="flex-1">
              <h3 class="text-base font-semibold text-gray-900">{{ title }}</h3>
              <p class="mt-1 text-sm text-gray-500">{{ message }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-6 flex justify-end gap-3">
            <button
              class="btn-outline"
              @click="$emit('update:modelValue', false)"
            >
              {{ cancelLabel }}
            </button>
            <button
              :class="confirmClass"
              :disabled="loading"
              @click="confirm"
            >
              <span v-if="loading" class="inline-flex items-center gap-2">
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                En cours…
              </span>
              <span v-else>{{ confirmLabel }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue:   { type: Boolean, default: false },
  title:        { type: String,  default: 'Confirmer l\'action' },
  message:      { type: String,  default: 'Êtes-vous sûr de vouloir continuer ?' },
  confirmLabel: { type: String,  default: 'Confirmer' },
  cancelLabel:  { type: String,  default: 'Annuler' },
  variant:      { type: String,  default: 'danger' },  // danger | info
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const loading = ref(false)

const iconWrapClass = computed(() =>
  props.variant === 'danger'
    ? 'bg-red-100 text-red-600'
    : 'bg-blue-100 text-blue-600'
)

const confirmClass = computed(() =>
  props.variant === 'danger'
    ? 'btn-accent'
    : 'btn-primary'
)

async function confirm() {
  loading.value = true
  try {
    await new Promise((resolve) => {
      emit('confirm', resolve)
    })
  } finally {
    loading.value = false
    emit('update:modelValue', false)
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>

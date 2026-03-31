<!-- Vue standalone pour /webmail/message/:id (accès direct par URL) -->
<template>
  <div class="flex-1 flex flex-col bg-white h-full overflow-hidden">
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <svg class="animate-spin w-8 h-8 text-primary/30" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
      </svg>
    </div>
    <div v-else-if="message" class="flex-1 overflow-y-auto px-6 py-5">
      <div class="flex items-center gap-3 mb-4">
        <RouterLink to="/webmail/inbox" class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </RouterLink>
        <h2 class="text-base font-semibold text-gray-900">{{ message.subject }}</h2>
      </div>
      <div class="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">{{ message.body }}</div>
    </div>
    <div v-else class="flex-1 flex items-center justify-center">
      <p class="text-sm text-gray-400">Message introuvable</p>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useMessagesStore } from '@/stores/messages.js'
const route = useRoute()
const messagesStore = useMessagesStore()
const message = ref(null)
const loading = ref(true)
onMounted(async () => {
  message.value = await messagesStore.fetchMessage(route.params.id)
  loading.value = false
})
</script>

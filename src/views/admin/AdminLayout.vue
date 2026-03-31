<template>
  <div class="flex h-screen bg-bg overflow-hidden">

    <aside class="w-56 flex-shrink-0 flex flex-col bg-gray-900 text-white">
      <div class="px-4 py-5 border-b border-white/10">
        <div class="flex items-center gap-2 mb-1">
          <div class="w-7 h-7 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            <svg class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
          </div>
          <span class="text-sm font-bold">Administration</span>
        </div>
        <p class="text-xs text-gray-400 truncate">{{ authStore.mailbox?.emailAddress }}</p>
      </div>

      <nav class="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        <RouterLink v-for="item in adminNavItems" :key="item.to" :to="item.to" custom v-slot="{ isActive, navigate }">
          <button
            @click="navigate"
            :class="['w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all text-left', isActive ? 'bg-white/15 text-white font-medium' : 'text-gray-400 hover:bg-white/8 hover:text-white']"
          >
            <span class="text-base">{{ item.icon }}</span>
            {{ item.label }}
          </button>
        </RouterLink>
      </nav>

      <div class="border-t border-white/10 p-3 space-y-1">
        <RouterLink to="/webmail/inbox" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/8 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          Ma messagerie
        </RouterLink>
        <button @click="authStore.logout()" class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-white/8 transition-colors text-left">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Déconnexion
        </button>
      </div>
    </aside>

    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <header class="flex-shrink-0 bg-white border-b border-gray-100 px-6 py-3.5 flex items-center justify-between">
        <div>
          <h1 class="text-base font-semibold text-gray-900">{{ currentTitle }}</h1>
          <p class="text-xs text-gray-400">Reliance West Africa — Panneau d'administration</p>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold">
            {{ authStore.user?.fullName?.charAt(0).toUpperCase() }}
          </div>
          <div class="hidden sm:block">
            <p class="text-sm font-medium text-gray-900 leading-tight">{{ authStore.user?.fullName }}</p>
            <p class="text-xs text-gray-400">SUPERADMIN</p>
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-auto p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()
const route     = useRoute()

const adminNavItems = [
  { to: '/admin/dashboard',  icon: '📊', label: 'Tableau de bord'    },
  { to: '/admin/users',      icon: '👥', label: 'Utilisateurs'       },
  { to: '/admin/mailboxes',  icon: '📬', label: 'Boîtes mail'        },
  { to: '/admin/archives',   icon: '🗄️', label: 'Archives'           },
  { to: '/admin/broadcast',  icon: '📣', label: 'Diffusion'          },
  { to: '/admin/audit-log',  icon: '🔍', label: 'Journal d\'audit'   },
]

const titles = {
  '/admin/dashboard': 'Tableau de bord',
  '/admin/users':     'Gestion des utilisateurs',
  '/admin/mailboxes': 'Gestion des boîtes mail',
  '/admin/archives':  'Archives des messages',
  '/admin/broadcast': 'Diffusion de masse',
  '/admin/audit-log': 'Journal d\'audit',
}

const currentTitle = computed(() => titles[route.path] || 'Administration')
</script>

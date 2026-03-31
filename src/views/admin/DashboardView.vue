<template>
  <div class="space-y-6">

    <!-- Cartes stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="stat in statCards" :key="stat.key" class="card p-5">
        <div class="flex items-center justify-between mb-3">
          <span class="text-2xl">{{ stat.icon }}</span>
          <span :class="['text-xs font-medium px-2 py-0.5 rounded-full', stat.badgeClass]">
            {{ stat.badge }}
          </span>
        </div>
        <p class="text-2xl font-bold text-gray-900">
          <span v-if="adminStore.loading">—</span>
          <span v-else>{{ adminStore.stats?.stats?.[stat.key] ?? 0 }}</span>
        </p>
        <p class="text-xs text-gray-500 mt-0.5">{{ stat.label }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Graphique messages / jour -->
      <div class="card p-5 lg:col-span-2">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Messages envoyés — 7 derniers jours</h3>
        <div v-if="adminStore.loading" class="h-40 flex items-center justify-center">
          <svg class="animate-spin w-6 h-6 text-primary/30" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
        </div>
        <div v-else class="h-40 flex items-end gap-2 px-2">
          <div
            v-for="(d, i) in chartData"
            :key="i"
            class="flex-1 flex flex-col items-center gap-1"
          >
            <span class="text-xs text-gray-500 font-medium">{{ d.count }}</span>
            <div
              :style="{ height: barHeight(d.count) }"
              class="w-full bg-primary rounded-t-md transition-all duration-500 min-h-[4px]"
              :class="d.count === 0 ? 'opacity-20' : 'opacity-90'"
            />
            <span class="text-xs text-gray-400">{{ d.date }}</span>
          </div>
        </div>
      </div>

      <!-- Répartition types de boîtes -->
      <div class="card p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Boîtes par type</h3>
        <div v-if="adminStore.loading" class="space-y-2">
          <div v-for="i in 4" :key="i" class="h-8 bg-gray-100 rounded-lg animate-pulse" />
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="t in mailboxTypes"
            :key="t.type"
            class="flex items-center gap-3"
          >
            <BadgeType :type="t.type" size="xs" class="flex-shrink-0 w-24" />
            <div class="flex-1 bg-gray-100 rounded-full h-2">
              <div
                :class="['h-2 rounded-full transition-all duration-700', t.barClass]"
                :style="{ width: t.percent + '%' }"
              />
            </div>
            <span class="text-xs text-gray-500 w-5 text-right">{{ t.count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Dernières activités -->
    <div class="card">
      <div class="px-5 py-4 border-b border-gray-100">
        <h3 class="text-sm font-semibold text-gray-900">5 dernières activités</h3>
      </div>
      <div v-if="adminStore.loading" class="p-4 space-y-3">
        <div v-for="i in 5" :key="i" class="h-10 bg-gray-100 rounded-lg animate-pulse" />
      </div>
      <div v-else-if="!recentActivities.length" class="px-5 py-8 text-center text-sm text-gray-400">
        Aucune activité récente
      </div>
      <div v-else class="divide-y divide-gray-50">
        <div
          v-for="activity in recentActivities"
          :key="activity.id"
          class="flex items-center gap-4 px-5 py-3"
        >
          <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-900 truncate">
              <span class="font-medium">{{ activity.from }}</span>
              <span class="text-gray-400 mx-1">→</span>
              <span class="font-medium">{{ activity.to }}</span>
            </p>
            <p class="text-xs text-gray-400 truncate">{{ activity.subject }}</p>
          </div>
          <span class="text-xs text-gray-400 flex-shrink-0">{{ formatDate(activity.sentAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin.js'
import BadgeType from '@/components/BadgeType.vue'

const adminStore = useAdminStore()

onMounted(() => adminStore.fetchStats())

const statCards = [
  { key: 'totalUsers',     icon: '👥', label: 'Utilisateurs actifs', badge: 'Total',    badgeClass: 'bg-blue-50 text-blue-600'  },
  { key: 'totalMailboxes', icon: '📬', label: 'Boîtes mail actives', badge: 'Actives',  badgeClass: 'bg-green-50 text-green-600' },
  { key: 'totalMessages',  icon: '✉️',  label: 'Messages envoyés',   badge: 'Envoyés',  badgeClass: 'bg-purple-50 text-purple-600' },
  { key: 'totalArchives',  icon: '🗄️', label: 'Archives totales',    badge: 'Immuables', badgeClass: 'bg-amber-50 text-amber-600' },
]

const chartData = computed(() => adminStore.stats?.chartData || [])

const maxCount = computed(() => Math.max(...chartData.value.map(d => d.count), 1))

function barHeight(count) {
  const pct = (count / maxCount.value) * 100
  return `${Math.max(pct, 4)}%`
}

const recentActivities = computed(() => adminStore.stats?.recentActivities || [])

const mailboxTypes = computed(() => {
  const types = adminStore.stats?.mailboxTypes || []
  const total = types.reduce((s, t) => s + t.count, 0) || 1
  const barClasses = {
    ADMINISTRATION: 'bg-red-400',
    DIRECTEUR:      'bg-blue-500',
    EMPLOYE:        'bg-gray-400',
    AUTRES:         'bg-green-500',
  }
  return types.map(t => ({
    ...t,
    percent:  Math.round((t.count / total) * 100),
    barClass: barClasses[t.type] || 'bg-gray-400',
  }))
})

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>

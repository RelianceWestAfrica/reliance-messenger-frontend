<template>
  <span :class="badgeClass" class="badge">
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type:    { type: String, required: true },   // ADMINISTRATION | DIRECTEUR | EMPLOYE | AUTRES
  mention: { type: String, default: null },    // texte libre si AUTRES
  size:    { type: String, default: 'sm' },    // sm | xs
})

const config = {
  ADMINISTRATION: {
    label: 'Administration',
    class: 'bg-red-100 text-red-800 border border-red-200',
  },
  DIRECTEUR: {
    label: 'Directeur',
    class: 'bg-blue-100 text-blue-800 border border-blue-200',
  },
  EMPLOYE: {
    label: 'Employé',
    class: 'bg-gray-100 text-gray-700 border border-gray-200',
  },
  AUTRES: {
    label: 'Autre',
    class: 'bg-green-100 text-green-800 border border-green-200',
  },
}

const badgeClass = computed(() => {
  const base = config[props.type]?.class || 'bg-gray-100 text-gray-700'
  const size = props.size === 'xs' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
  return `${base} ${size}`
})

const label = computed(() => {
  if (props.type === 'AUTRES' && props.mention) return props.mention
  return config[props.type]?.label || props.type
})
</script>

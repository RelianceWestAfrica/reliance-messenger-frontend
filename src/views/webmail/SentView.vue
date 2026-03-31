<!-- ═══════════════════════════════════════════════════════
     SentView.vue — Messages envoyés
══════════════════════════════════════════════════════════ -->
<template>
  <FolderView folder="sent" emptyLabel="Aucun message envoyé" emptyIcon="send" />
</template>
<script setup>
import FolderView from './FolderView.vue'
</script>

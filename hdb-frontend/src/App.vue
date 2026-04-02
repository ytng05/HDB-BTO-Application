<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import { useAuth } from '@/stores/auth'
import { useApplicationStore } from '@/stores/application'

const { applicantNric, restoreSession } = useAuth()
const applicationStore = useApplicationStore()

onMounted(() => {
  restoreSession()

  if (applicantNric.value) {
    void applicationStore.loadLinkedApplications(applicantNric.value)
  }
})
</script>

<template>
  <div class="app-shell">
    <NavBar />
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

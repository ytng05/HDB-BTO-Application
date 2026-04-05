<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import { useAuth } from '@/stores/auth'
import { useApplicationStore } from '@/stores/application'
import { validateSession } from '@/services/myinfo'

const { applicantNric, isLoggedIn, logout, restoreSession } = useAuth()
const applicationStore = useApplicationStore()

async function initialiseSession() {
  restoreSession()

  if (isLoggedIn.value) {
    const sessionValid = await validateSession()
    if (!sessionValid) {
      applicationStore.resetApplication()
      logout()
      return
    }
  }

  if (applicantNric.value) {
    applicationStore.syncSessionApplications(applicantNric.value)
  }
}

onMounted(() => {
  void initialiseSession()
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

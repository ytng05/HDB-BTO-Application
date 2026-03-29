<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import ApplicationProgress from '@/components/ApplicationProgress.vue'

const route = useRoute()

const steps = ['Details', 'Documents', 'Payment']
const activeIndex = computed(() => Number(route.meta.applyStepIndex ?? 0))
</script>

<template>
  <section class="apply-shell">
    <div class="container">
      <header class="apply-header">
        <p class="eyebrow">Flat Application</p>
        <h1 class="page-title">Apply for Flat</h1>
        <p class="page-subtitle">Complete your application in three guided steps.</p>
      </header>

      <ApplicationProgress :steps="steps" :active-index="activeIndex" />

      <div class="apply-content">
        <RouterView />
      </div>
    </div>
  </section>
</template>

<style scoped>
.apply-shell {
  min-height: calc(100vh - var(--nav-height));
  padding: 36px 0 72px;
  background: var(--color-grey-bg);
}

.apply-header {
  margin-bottom: 28px;
}

.apply-content {
  margin-top: 24px;
}
</style>

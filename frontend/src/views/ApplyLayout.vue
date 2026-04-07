<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import ApplicationProgress from '@/components/ApplicationProgress.vue'

const route = useRoute()

const steps = ['Application Details', 'Payment']
const activeIndex = computed(() =>
  typeof route.meta.applyStepIndex === 'number' ? Number(route.meta.applyStepIndex) : -1,
)
const showProgress = computed(() => activeIndex.value >= 0)
const pageSubtitle = computed(() =>
  route.name === 'apply-review'
    ? 'View the details currently tied to your application.'
    : 'Complete your household application details and supporting documents before payment.',
)
</script>

<template>
  <section class="apply-shell">
    <div class="container">
      <header class="apply-header">
        <p class="eyebrow">Flat Application</p>
        <h1 class="page-title">Apply for Flat</h1>
        <p class="page-subtitle">{{ pageSubtitle }}</p>
      </header>

      <ApplicationProgress v-if="showProgress" :steps="steps" :active-index="activeIndex" />

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

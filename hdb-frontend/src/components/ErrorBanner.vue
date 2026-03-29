<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import { AlertCircle, X } from 'lucide-vue-next'

const props = defineProps<{
  message: string
}>()

const emit = defineEmits<{
  close: []
}>()

let timeoutId: ReturnType<typeof window.setTimeout> | null = null

function clearBannerTimer() {
  if (timeoutId !== null) {
    window.clearTimeout(timeoutId)
    timeoutId = null
  }
}

function startBannerTimer() {
  clearBannerTimer()

  if (!props.message) {
    return
  }

  timeoutId = window.setTimeout(() => {
    emit('close')
  }, 5000)
}

watch(
  () => props.message,
  () => {
    startBannerTimer()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  clearBannerTimer()
})
</script>

<template>
  <div class="error-banner" role="alert">
    <div class="error-banner__content">
      <AlertCircle :size="18" />
      <span>{{ message }}</span>
    </div>

    <button class="error-banner__close" type="button" aria-label="Dismiss error" @click="emit('close')">
      <X :size="16" />
    </button>
  </div>
</template>

<style scoped>
.error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid rgba(200, 16, 46, 0.18);
  border-radius: var(--radius-sm);
  background: var(--color-red-light);
  color: var(--color-red);
}

.error-banner__content {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.94rem;
  font-weight: 600;
}

.error-banner__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  border-radius: var(--radius-sm);
  color: currentColor;
  background: transparent;
}

.error-banner__close:hover {
  background: rgba(200, 16, 46, 0.08);
}
</style>

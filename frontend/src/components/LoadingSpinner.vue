<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    size?: number
    label?: string
    inline?: boolean
  }>(),
  {
    size: 24,
    label: '',
    inline: false,
  },
)

const spinnerStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
}))
</script>

<template>
  <div :class="['spinner-wrap', { 'spinner-wrap--inline': inline }]">
    <span class="spinner" :style="spinnerStyle" aria-hidden="true" />
    <span v-if="label" class="spinner-label">{{ label }}</span>
  </div>
</template>

<style scoped>
.spinner-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.spinner-wrap--inline {
  justify-content: flex-start;
}

.spinner {
  display: inline-block;
  border: 3px solid rgba(200, 16, 46, 0.18);
  border-top-color: var(--color-red);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner-label {
  font-size: 0.94rem;
  color: rgba(29, 29, 31, 0.72);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

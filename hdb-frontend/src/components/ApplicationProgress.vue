<script setup lang="ts">
defineProps<{
  steps: string[]
  activeIndex: number
}>()
</script>

<template>
  <div class="progress-shell">
    <div
      v-for="(step, index) in steps"
      :key="step"
      :class="[
        'progress-step',
        {
          'progress-step--active': index === activeIndex,
          'progress-step--complete': index < activeIndex,
        },
      ]"
    >
      <div class="progress-step__marker">{{ index + 1 }}</div>
      <div class="progress-step__copy">
        <span>{{ step }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.progress-shell {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.progress-step {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-white);
}

.progress-step::after {
  content: '';
  position: absolute;
  top: 50%;
  left: calc(100% + 6px);
  width: calc(100% - 12px);
  height: 1px;
  background: var(--color-border);
  transform: translateY(-50%);
}

.progress-step:last-child::after {
  display: none;
}

.progress-step__marker {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  font-size: 0.92rem;
  font-weight: 700;
}

.progress-step__copy {
  font-size: 0.94rem;
  font-weight: 600;
}

.progress-step--active {
  border-color: var(--color-red);
}

.progress-step--active .progress-step__marker,
.progress-step--complete .progress-step__marker {
  color: var(--color-white);
  border-color: var(--color-red);
  background: var(--color-red);
}

.progress-step--complete::after {
  background: var(--color-red);
}

@media (max-width: 900px) {
  .progress-shell {
    grid-template-columns: 1fr;
  }

  .progress-step::after {
    top: calc(100% + 6px);
    left: 50%;
    width: 1px;
    height: 12px;
    transform: translateX(-50%);
  }
}
</style>

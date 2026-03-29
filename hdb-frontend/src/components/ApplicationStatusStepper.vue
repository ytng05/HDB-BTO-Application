<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle2, Clock3, FileCheck2, Lock } from 'lucide-vue-next'
import type { ApplicationStatus } from '@/stores/application'

const props = defineProps<{
  status: ApplicationStatus
}>()

const trackerSteps = computed(() => {
  const currentStatus = props.status

  const processingState =
    currentStatus === 'draft' ? 'locked' : currentStatus === 'processing' ? 'active' : 'complete'

  const ballotState =
    currentStatus === 'balloted' ? 'active' : currentStatus === 'selected' ? 'complete' : 'locked'

  return [
    {
      label: 'Applied for Flat',
      state: currentStatus === 'draft' ? 'active' : 'complete',
      icon: FileCheck2,
    },
    {
      label: 'Processing',
      state: processingState,
      icon: Clock3,
    },
    {
      label: 'Ballot Results',
      state: ballotState,
      icon: ballotState === 'locked' ? Lock : CheckCircle2,
    },
  ]
})
</script>

<template>
  <div class="status-stepper">
    <div
      v-for="(step, index) in trackerSteps"
      :key="step.label"
      :class="['status-step', `status-step--${step.state}`]"
    >
      <div class="status-step__icon">
        <component :is="step.icon" :size="18" />
      </div>
      <div class="status-step__copy">
        <strong>{{ step.label }}</strong>
      </div>
      <div v-if="index < trackerSteps.length - 1" class="status-step__line" />
    </div>
  </div>
</template>

<style scoped>
.status-stepper {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.status-step {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-white);
}

.status-step__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
}

.status-step__copy strong {
  display: block;
  font-size: 0.95rem;
}

.status-step__line {
  position: absolute;
  top: 50%;
  left: calc(100% + 8px);
  width: 16px;
  height: 1px;
  background: var(--color-border);
  transform: translateY(-50%);
}

.status-step--complete {
  border-color: rgba(26, 127, 75, 0.24);
}

.status-step--complete .status-step__icon {
  color: var(--color-white);
  border-color: var(--color-green);
  background: var(--color-green);
}

.status-step--active {
  border-color: rgba(200, 16, 46, 0.24);
}

.status-step--active .status-step__icon {
  color: var(--color-white);
  border-color: var(--color-red);
  background: var(--color-red);
}

.status-step--locked {
  color: rgba(29, 29, 31, 0.56);
  background: var(--color-grey-bg);
}

@media (max-width: 900px) {
  .status-stepper {
    grid-template-columns: 1fr;
  }

  .status-step__line {
    top: calc(100% + 8px);
    left: 18px;
    width: 1px;
    height: 16px;
    transform: none;
  }
}
</style>

<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    message: string
    eyebrow?: string
    processing?: boolean
    confirmLabel?: string
    cancelLabel?: string
    processingLabel?: string
  }>(),
  {
    eyebrow: 'Please Confirm',
    processing: false,
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    processingLabel: 'Processing request',
  },
)

const emit = defineEmits<{
  close: []
  confirm: []
}>()

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open && !props.processing) {
    emit('close')
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('modal-open', isOpen)
    }

    if (typeof window === 'undefined') {
      return
    }

    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
      return
    }

    window.removeEventListener('keydown', handleEscape)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.body.classList.remove('modal-open')
  }

  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleEscape)
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="open" class="modal-overlay" @click.self="!processing && emit('close')">
        <div class="surface modal-panel" role="dialog" aria-modal="true" aria-labelledby="selection-modal-title">
          <div class="modal-copy">
            <p class="eyebrow">{{ eyebrow }}</p>
            <h2 id="selection-modal-title">{{ title }}</h2>
            <p class="modal-description">{{ message }}</p>
          </div>

          <div v-if="processing" class="modal-loading">
            <LoadingSpinner :label="processingLabel" />
          </div>

          <div class="modal-actions">
            <button class="btn btn-neutral" type="button" :disabled="processing" @click="emit('close')">
              {{ cancelLabel }}
            </button>
            <button class="btn btn-primary" type="button" :disabled="processing" @click="emit('confirm')">
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1400;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(29, 29, 31, 0.36);
}

.modal-panel {
  width: min(100%, 560px);
  padding: 28px;
}

.modal-copy h2 {
  margin: 0 0 14px;
  font-size: 1.7rem;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.modal-description {
  margin: 0 0 12px;
  color: rgba(29, 29, 31, 0.78);
}

.modal-loading {
  padding: 8px 0 16px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .modal-panel {
    padding: 22px 18px;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }
}
</style>

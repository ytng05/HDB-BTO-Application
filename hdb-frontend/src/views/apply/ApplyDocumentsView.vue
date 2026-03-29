<script setup lang="ts">
import { useRouter } from 'vue-router'
import { FileText } from 'lucide-vue-next'
import { useApplicationStore } from '@/stores/application'

const router = useRouter()
const applicationStore = useApplicationStore()

function handleFileChange(event: Event, documentKey: 'incomePdfName' | 'hfeLetterPdfName') {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (file) {
    applicationStore.setDocument(documentKey, file.name)
  }
}
</script>

<template>
  <div class="surface step-card">
    <div class="step-card__copy">
      <h2>Step 2 &mdash; Document Review</h2>
      <p>Attach the required PDF documents for income assessment and HFE verification.</p>
    </div>

    <div class="upload-grid">
      <div class="upload-card">
        <div class="upload-card__header">
          <FileText :size="18" />
          <strong>Income PDF</strong>
        </div>
        <input class="field field--file" type="file" accept=".pdf,application/pdf" @change="handleFileChange($event, 'incomePdfName')" />
        <p v-if="applicationStore.documents.incomePdfName" class="upload-card__filename">
          {{ applicationStore.documents.incomePdfName }}
        </p>
      </div>

      <div class="upload-card">
        <div class="upload-card__header">
          <FileText :size="18" />
          <strong>HFE Letter PDF</strong>
        </div>
        <input class="field field--file" type="file" accept=".pdf,application/pdf" @change="handleFileChange($event, 'hfeLetterPdfName')" />
        <p v-if="applicationStore.documents.hfeLetterPdfName" class="upload-card__filename">
          {{ applicationStore.documents.hfeLetterPdfName }}
        </p>
      </div>
    </div>

    <div class="step-actions">
      <button class="btn btn-secondary" type="button" @click="router.push('/apply/details')">Back</button>
      <button class="btn btn-primary" type="button" :disabled="!applicationStore.hasRequiredDocuments" @click="router.push('/apply/payment')">
        Next
      </button>
    </div>
  </div>
</template>

<style scoped>
.step-card {
  padding: 32px;
}

.step-card__copy h2 {
  margin: 0 0 10px;
  font-size: 1.7rem;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.step-card__copy p {
  margin: 0 0 24px;
  color: rgba(29, 29, 31, 0.72);
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.upload-card {
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-white);
}

.upload-card__header {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.field--file {
  padding-top: 10px;
  padding-bottom: 10px;
}

.upload-card__filename {
  margin: 12px 0 0;
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--color-red);
}

.step-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 28px;
}

@media (max-width: 720px) {
  .upload-grid {
    grid-template-columns: 1fr;
  }

  .step-actions {
    flex-direction: column-reverse;
  }
}
</style>

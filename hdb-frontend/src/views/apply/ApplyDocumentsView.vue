<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { FileText } from 'lucide-vue-next'
import { useApplicationStore } from '@/stores/application'

const router = useRouter()
const applicationStore = useApplicationStore()

const isSavingDraft = ref(false)
const nextLabel = computed(() => {
  if (isSavingDraft.value || applicationStore.isPreparingSubmission) {
    return 'Checking Eligibility...'
  }

  return applicationStore.isCurrentSubmitted ? 'Review Application' : 'Next'
})

function handleFileChange(event: Event, documentKey: 'incomePdfName' | 'hfeLetterPdfName') {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  applicationStore.setDocument(documentKey, file)
}

async function goNext() {
  isSavingDraft.value = true
  try {
    if (applicationStore.isCurrentSubmitted) {
      await applicationStore.saveDraft('documents')
      if (applicationStore.draftSaveError) {
        return
      }

      await router.push('/apply/review')
      return
    }

    const preparation = await applicationStore.prepareSubmission()
    if (!preparation) {
      return
    }

    console.log('Eligibility result:', preparation.eligibility)
    await router.push('/apply/payment')
  } finally {
    isSavingDraft.value = false
  }
}
</script>

<template>
  <div class="surface step-card">
    <div class="step-card__copy">
      <h2>Step 2 - Documents</h2>
      <p>Select your income statement PDF and HFE letter PDF. They will be uploaded and checked when you continue to payment.</p>
    </div>

    <div class="upload-grid">
      <div class="upload-card">
        <div class="upload-card__header">
          <FileText :size="18" />
          <strong>Income PDF</strong>
          <span class="doc-hint">CPF Contribution History</span>
        </div>

        <input
          class="field field--file"
          type="file"
          accept=".pdf,application/pdf"
          @change="handleFileChange($event, 'incomePdfName')"
        />

        <p v-if="applicationStore.documents.incomePdfName" class="filename-tag">
          {{ applicationStore.documents.incomePdfName }}
        </p>
        <p v-else class="doc-note">No income PDF selected yet.</p>
      </div>

      <div class="upload-card">
        <div class="upload-card__header">
          <FileText :size="18" />
          <strong>HFE Letter PDF</strong>
          <span class="doc-hint">HDB Flat Eligibility</span>
        </div>

        <input
          class="field field--file"
          type="file"
          accept=".pdf,application/pdf"
          @change="handleFileChange($event, 'hfeLetterPdfName')"
        />

        <p v-if="applicationStore.documents.hfeLetterPdfName" class="filename-tag">
          {{ applicationStore.documents.hfeLetterPdfName }}
        </p>
        <p v-else class="doc-note">No HFE letter selected yet.</p>
      </div>
    </div>

    <div class="submit-note">
      <p>The files stay in the browser for now. We will upload them and run the eligibility checks when you move to the payment step.</p>
    </div>

    <div class="step-actions">
      <button class="btn btn-secondary" type="button" @click="router.push('/apply/details')">Back</button>
      <button
        class="btn btn-primary"
        type="button"
        :disabled="!applicationStore.hasRequiredDocuments || isSavingDraft || applicationStore.isPreparingSubmission"
        @click="goNext"
      >
        {{ nextLabel }}
      </button>
    </div>

    <p v-if="applicationStore.draftSaveMessage" class="filename-tag">{{ applicationStore.draftSaveMessage }}</p>
    <p v-if="applicationStore.draftSaveError" class="retrieve-error">{{ applicationStore.draftSaveError }}</p>
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
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.doc-hint {
  font-size: 0.76rem;
  color: rgba(29, 29, 31, 0.42);
  font-weight: 500;
}

.field--file {
  padding-top: 10px;
  padding-bottom: 10px;
}

.filename-tag {
  margin: 0;
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--color-red);
}

.doc-note {
  margin: 0;
  font-size: 0.86rem;
  color: rgba(29, 29, 31, 0.56);
}

.submit-note {
  margin-top: 18px;
  padding: 16px 18px;
  border-radius: 10px;
  background: rgba(29, 29, 31, 0.04);
}

.submit-note p {
  margin: 0;
  color: rgba(29, 29, 31, 0.68);
  line-height: 1.5;
}

.retrieve-error {
  margin: 0;
  font-size: 0.875rem;
  color: #c8102e;
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

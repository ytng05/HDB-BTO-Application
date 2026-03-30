<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { FileText } from 'lucide-vue-next'
import { useApplicationStore } from '@/stores/application'

const router = useRouter()
const applicationStore = useApplicationStore()

const OCR_SERVICE_URL = import.meta.env.VITE_OCR_URL ?? 'http://localhost:5050'

interface OcrResult {
  status: 'idle' | 'loading' | 'success' | 'error'
  documentType?: string
  fields?: Record<string, unknown>
  error?: string
}

const incomeOcr = ref<OcrResult>({ status: 'idle' })
const hfeOcr = ref<OcrResult>({ status: 'idle' })

async function runOcr(file: File, target: typeof incomeOcr) {
  target.value = { status: 'loading' }
  const formData = new FormData()
  formData.append('file', file)
  try {
    const res = await fetch(`${OCR_SERVICE_URL}/extract`, { method: 'POST', body: formData })
    const data = await res.json()
    if (!res.ok || data.error) {
      target.value = { status: 'error', error: data.error ?? `HTTP ${res.status}` }
      return
    }
    target.value = { status: 'success', documentType: data.document_type, fields: data.fields }
  } catch (err) {
    target.value = {
      status: 'error',
      error: err instanceof Error ? err.message : 'Could not reach OCR service (is it running?)',
    }
  }
}

function handleFileChange(event: Event, documentKey: 'incomePdfName' | 'hfeLetterPdfName') {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  applicationStore.setDocument(documentKey, file.name)
  if (documentKey === 'incomePdfName') {
    runOcr(file, incomeOcr)
  } else {
    runOcr(file, hfeOcr)
  }
}

function fmtKey(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function fmtValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '-'
  if (Array.isArray(value)) {
    if (value.length === 0) return '-'
    return value
      .map((item) =>
        typeof item === 'object' && item !== null
          ? Object.entries(item as Record<string, unknown>)
              .filter(([, v]) => v !== null && v !== undefined && v !== '')
              .map(([k, v]) => `${fmtKey(k)}: ${v}`)
              .join(' | ')
          : String(item),
      )
      .join('\n')
  }
  return String(value)
}

function visibleFields(fields: Record<string, unknown>): [string, unknown][] {
  return Object.entries(fields).filter(
    ([, v]) => v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0),
  )
}
</script>

<template>
  <div class="surface step-card">
    <div class="step-card__copy">
      <h2>Step 2 &mdash; Document Review</h2>
      <p>Attach the required PDF documents. They are scanned automatically once uploaded.</p>
    </div>

    <div class="upload-grid">
      <!-- Income PDF -->
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

        <!-- OCR result -->
        <div v-if="incomeOcr.status === 'loading'" class="ocr-panel ocr-panel--loading">
          <span class="ocr-spinner" />
          <span>Scanning document...</span>
        </div>

        <div v-else-if="incomeOcr.status === 'error'" class="ocr-panel ocr-panel--error">
          <strong>OCR error:</strong> {{ incomeOcr.error }}
        </div>

        <div v-else-if="incomeOcr.status === 'success' && incomeOcr.fields" class="ocr-panel ocr-panel--success">
          <div class="ocr-panel__header">
            <span class="ocr-badge">OCR | {{ incomeOcr.documentType }}</span>
            <span class="ocr-badge-label">Extracted fields</span>
          </div>
          <template v-for="[key, val] in visibleFields(incomeOcr.fields)" :key="key">
            <div v-if="!Array.isArray(val)" class="ocr-row">
              <span class="ocr-row__key">{{ fmtKey(key) }}</span>
              <span class="ocr-row__val">{{ fmtValue(val) }}</span>
            </div>
            <div v-else class="ocr-row ocr-row--block">
              <span class="ocr-row__key">{{ fmtKey(key) }}</span>
              <div class="ocr-applicant-list">
                <div v-for="(item, idx) in (val as Record<string, unknown>[])" :key="idx" class="ocr-applicant">
                  <template v-for="[ak, av] in Object.entries(item).filter(([, v]) => v)" :key="ak">
                    <span class="ocr-row__key">{{ fmtKey(ak) }}</span>
                    <span class="ocr-row__val">{{ av }}</span>
                  </template>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- HFE Letter PDF -->
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

        <!-- OCR result -->
        <div v-if="hfeOcr.status === 'loading'" class="ocr-panel ocr-panel--loading">
          <span class="ocr-spinner" />
          <span>Scanning document...</span>
        </div>

        <div v-else-if="hfeOcr.status === 'error'" class="ocr-panel ocr-panel--error">
          <strong>OCR error:</strong> {{ hfeOcr.error }}
        </div>

        <div v-else-if="hfeOcr.status === 'success' && hfeOcr.fields" class="ocr-panel ocr-panel--success">
          <div class="ocr-panel__header">
            <span class="ocr-badge">OCR | {{ hfeOcr.documentType }}</span>
            <span class="ocr-badge-label">Extracted fields</span>
          </div>
          <template v-for="[key, val] in visibleFields(hfeOcr.fields)" :key="key">
            <div v-if="!Array.isArray(val)" class="ocr-row">
              <span class="ocr-row__key">{{ fmtKey(key) }}</span>
              <span class="ocr-row__val">{{ fmtValue(val) }}</span>
            </div>
            <div v-else class="ocr-row ocr-row--block">
              <span class="ocr-row__key">{{ fmtKey(key) }}</span>
              <div class="ocr-applicant-list">
                <div v-for="(item, idx) in (val as Record<string, unknown>[])" :key="idx" class="ocr-applicant">
                  <template v-for="[ak, av] in Object.entries(item).filter(([, v]) => v)" :key="ak">
                    <span class="ocr-row__key">{{ fmtKey(ak) }}</span>
                    <span class="ocr-row__val">{{ av }}</span>
                  </template>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div class="step-actions">
      <button class="btn btn-secondary" type="button" @click="router.push('/apply/details')">Back</button>
      <button
        class="btn btn-primary"
        type="button"
        :disabled="!applicationStore.hasRequiredDocuments"
        @click="router.push('/apply/payment')"
      >
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

/* OCR result panel */
.ocr-panel {
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 0.82rem;
}

.ocr-panel--loading {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(29, 29, 31, 0.04);
  color: rgba(29, 29, 31, 0.65);
}

.ocr-panel--error {
  background: rgba(163, 18, 25, 0.06);
  color: var(--color-red);
}

.ocr-panel--success {
  background: rgba(29, 29, 31, 0.03);
  border: 1px solid var(--color-border);
  display: grid;
  gap: 6px;
}

.ocr-panel__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border);
}

.ocr-badge {
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(29, 29, 31, 0.08);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-charcoal);
}

.ocr-badge-label {
  font-size: 0.76rem;
  color: rgba(29, 29, 31, 0.5);
}

.ocr-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
  gap: 6px;
  align-items: baseline;
  padding: 3px 0;
}

.ocr-row--block {
  grid-template-columns: 1fr;
  gap: 4px;
}

.ocr-row__key {
  font-size: 0.76rem;
  font-weight: 600;
  color: rgba(29, 29, 31, 0.52);
}

.ocr-row__val {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--color-charcoal);
  word-break: break-word;
  white-space: pre-line;
}

.ocr-applicant-list {
  display: grid;
  gap: 8px;
}

.ocr-applicant {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
  gap: 4px 6px;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(29, 29, 31, 0.03);
  border: 1px solid var(--color-border);
}

.ocr-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(29, 29, 31, 0.15);
  border-top-color: rgba(29, 29, 31, 0.5);
  border-radius: 999px;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

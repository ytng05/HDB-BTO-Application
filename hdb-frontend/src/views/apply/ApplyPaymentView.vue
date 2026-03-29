<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { CreditCard, ShieldCheck } from 'lucide-vue-next'
import { useApplicationStore } from '@/stores/application'

const router = useRouter()
const applicationStore = useApplicationStore()

const isProcessing = ref(false)
const paymentStep = ref<'summary' | 'processing' | 'done'>('summary')

const APPLICATION_FEE = 10

async function confirmPayment() {
  isProcessing.value = true
  paymentStep.value = 'processing'

  // Simulate NETS terminal processing
  await new Promise((resolve) => window.setTimeout(resolve, 2200))

  applicationStore.submitApplication()
  paymentStep.value = 'done'
  isProcessing.value = false

  await new Promise((resolve) => window.setTimeout(resolve, 800))
  router.push({ path: '/', hash: '#dashboard' })
}
</script>

<template>
  <div class="surface step-card">
    <div class="step-card__copy">
      <h2>Step 3 &mdash; Payment</h2>
      <p>Pay the application processing fee via NETS to submit your flat application.</p>
    </div>

    <!-- Application summary -->
    <div class="summary-grid">
      <div class="summary-row">
        <span class="summary-label">Applicant</span>
        <span class="summary-value">{{ applicationStore.form.fullName || applicationStore.form.nric }}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">NRIC</span>
        <span class="summary-value">{{ applicationStore.form.nric }}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Preferred Town</span>
        <span class="summary-value">{{ applicationStore.form.preferredTown || '—' }}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Flat Type</span>
        <span class="summary-value">{{ applicationStore.form.flatType || '—' }}</span>
      </div>
    </div>

    <!-- NETS payment terminal -->
    <div class="nets-terminal">
      <div class="nets-terminal__header">
        <div class="nets-logo">
          <CreditCard :size="20" />
          <span>NETS</span>
        </div>
        <span class="nets-terminal__label">Application Processing Fee</span>
      </div>

      <div class="nets-amount">
        <span class="nets-amount__currency">SGD</span>
        <span class="nets-amount__value">{{ APPLICATION_FEE.toFixed(2) }}</span>
      </div>

      <div v-if="paymentStep === 'summary'" class="nets-instruction">
        <ShieldCheck :size="18" />
        <span>Tap or insert your NETS card to pay</span>
      </div>

      <div v-if="paymentStep === 'processing'" class="nets-processing">
        <div class="nets-spinner" />
        <span>Processing payment…</span>
      </div>

      <div v-if="paymentStep === 'done'" class="nets-success">
        <ShieldCheck :size="20" />
        <span>Payment successful. Redirecting…</span>
      </div>
    </div>

    <div class="step-actions">
      <button
        class="btn btn-secondary"
        type="button"
        :disabled="isProcessing"
        @click="router.push('/apply/documents')"
      >
        Back
      </button>
      <button
        class="btn btn-primary nets-pay-btn"
        type="button"
        :disabled="isProcessing || paymentStep !== 'summary'"
        @click="confirmPayment"
      >
        <CreditCard :size="17" />
        <span>Pay with NETS</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.step-card {
  padding: 32px;
  max-width: 720px;
  margin: 0 auto;
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

.summary-grid {
  display: grid;
  gap: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-bottom: 24px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 12px 18px;
  border-bottom: 1px solid var(--color-border);
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-label {
  font-size: 0.88rem;
  color: rgba(29, 29, 31, 0.6);
  font-weight: 500;
}

.summary-value {
  font-size: 0.94rem;
  font-weight: 600;
  color: var(--color-charcoal);
  text-align: right;
}

.nets-terminal {
  padding: 28px;
  border: 2px solid var(--color-border);
  border-radius: 16px;
  background: linear-gradient(160deg, #1a1a2e 0%, #16213e 100%);
  color: var(--color-white);
  display: grid;
  gap: 20px;
}

.nets-terminal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.nets-logo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.nets-terminal__label {
  font-size: 0.84rem;
  color: rgba(255, 255, 255, 0.6);
  text-align: right;
}

.nets-amount {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.nets-amount__currency {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}

.nets-amount__value {
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1;
}

.nets-instruction {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

.nets-processing {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

.nets-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 999px;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.nets-success {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  font-size: 0.9rem;
  font-weight: 600;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 28px;
}

.nets-pay-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 180px;
}

@media (max-width: 720px) {
  .step-actions {
    flex-direction: column-reverse;
  }

  .nets-amount__value {
    font-size: 2.4rem;
  }
}
</style>

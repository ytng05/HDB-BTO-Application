<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ArrowLeft, CheckCircle2, Download, House, XCircle } from 'lucide-vue-next'
import type { PaymentReceiptState } from '@/types/payment'

const router = useRouter()
const receipt = ref<PaymentReceiptState | null>(null)

const isSuccess = computed(() => receipt.value?.status === 'success')

const formattedAmount = computed(() => {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: 2,
  }).format(receipt.value?.amountPaid ?? 0)
})

const formattedTimestamp = computed(() => {
  if (!receipt.value?.timestamp) {
    return ''
  }

  return new Intl.DateTimeFormat('en-SG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(receipt.value.timestamp))
})

onMounted(() => {
  const historyState = window.history.state as { paymentReceipt?: PaymentReceiptState } | null

  if (!historyState?.paymentReceipt) {
    router.replace('/flat-selection')
    return
  }

  receipt.value = historyState.paymentReceipt
})
</script>

<template>
  <section class="section confirmation-page">
    <div class="container confirmation-shell">
      <div
        v-if="receipt"
        :class="['surface confirmation-card', { 'confirmation-card--success': isSuccess, 'confirmation-card--failure': !isSuccess }]"
      >
        <div class="confirmation-status">
          <CheckCircle2 v-if="isSuccess" :size="28" />
          <XCircle v-else :size="28" />
          <div>
            <h1>{{ isSuccess ? 'Flat Selection Confirmed' : 'Payment Failed' }}</h1>
            <p>
              {{
                isSuccess
                  ? 'Your selected flat has been reserved successfully.'
                  : receipt.explanation || 'The option fee could not be processed.'
              }}
            </p>
          </div>
        </div>

        <div class="receipt-body">
          <div class="receipt-row">
            <span>Applicant Name</span>
            <strong>{{ receipt.applicantName }}</strong>
          </div>

          <div class="receipt-row">
            <span>NRIC</span>
            <strong>{{ receipt.maskedNric }}</strong>
          </div>

          <div class="receipt-divider" />

          <div class="receipt-section">
            <p class="receipt-section__title">Flat Details</p>
            <div class="receipt-row">
              <span>Block</span>
              <strong>{{ receipt.flat.block }}</strong>
            </div>
            <div class="receipt-row">
              <span>Level</span>
              <strong>{{ receipt.flat.level }}</strong>
            </div>
            <div class="receipt-row">
              <span>Unit</span>
              <strong>{{ receipt.flat.unit }}</strong>
            </div>
            <div class="receipt-row">
              <span>Type</span>
              <strong>{{ receipt.flat.type }}</strong>
            </div>
          </div>

          <div class="receipt-divider" />

          <div class="receipt-section">
            <p class="receipt-section__title">Payment</p>
            <div class="receipt-row">
              <span>Transaction ID</span>
              <strong>{{ receipt.transactionId }}</strong>
            </div>
            <div class="receipt-row">
              <span>Amount Paid</span>
              <strong>{{ formattedAmount }}</strong>
            </div>
            <div class="receipt-row">
              <span>Date &amp; Time</span>
              <strong>{{ formattedTimestamp }}</strong>
            </div>
          </div>
        </div>

        <div class="confirmation-actions">
          <button class="btn btn-secondary" type="button">
            <Download :size="18" />
            <span>Download Receipt</span>
          </button>

          <button class="btn btn-primary" type="button" @click="router.push('/')">
            <House :size="18" />
            <span>Return to Home</span>
          </button>
        </div>

        <RouterLink v-if="!isSuccess" class="retry-link" to="/flat-selection">
          <ArrowLeft :size="16" />
          <span>Back to flat selection</span>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.confirmation-page {
  background: var(--color-grey-bg);
}

.confirmation-shell {
  display: flex;
  justify-content: center;
}

.confirmation-card {
  width: min(100%, 720px);
  padding: 32px;
}

.confirmation-card--success {
  border-top: 4px solid var(--color-green);
}

.confirmation-card--failure {
  border-top: 4px solid var(--color-red);
}

.confirmation-status {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 28px;
}

.confirmation-card--success .confirmation-status {
  color: var(--color-green);
}

.confirmation-card--failure .confirmation-status {
  color: var(--color-red);
}

.confirmation-status h1 {
  margin: 0 0 8px;
  font-size: 1.9rem;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.confirmation-status p {
  margin: 0;
  color: rgba(29, 29, 31, 0.72);
}

.receipt-body {
  padding: 24px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-white);
}

.receipt-section__title {
  margin: 0 0 14px;
  font-size: 0.86rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(29, 29, 31, 0.56);
}

.receipt-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 7px 0;
}

.receipt-row span {
  color: rgba(29, 29, 31, 0.72);
}

.receipt-row strong {
  text-align: right;
}

.receipt-divider {
  height: 1px;
  margin: 18px 0;
  background: var(--color-border);
}

.confirmation-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.retry-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
  font-weight: 600;
  color: var(--color-red);
}

@media (max-width: 640px) {
  .confirmation-card {
    padding: 22px 18px;
  }

  .receipt-body {
    padding: 18px 16px;
  }

  .receipt-row {
    flex-direction: column;
    gap: 4px;
  }

  .receipt-row strong {
    text-align: left;
  }

  .confirmation-actions {
    flex-direction: column;
  }
}
</style>

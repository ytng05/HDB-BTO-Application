<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-vue-next'
import { useApplicationStore } from '@/stores/application'
import { getErrorMessage, getPaymentStatus, type PaymentStatusData } from '@/services/api'

const route = useRoute()
const router = useRouter()
const applicationStore = useApplicationStore()
const NETS_PAYMENT_REF_KEY = 'nets_last_merchant_txn_ref'
const NETS_ACTIVE_PAYMENT_REF_KEY = 'nets_active_merchant_txn_ref'

function getStoredPaymentRef(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  const refValue = window.sessionStorage.getItem(NETS_PAYMENT_REF_KEY)
  return refValue && refValue !== 'unknown' ? refValue : undefined
}

function clearStoredPaymentRef() {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.removeItem(NETS_PAYMENT_REF_KEY)
  window.sessionStorage.removeItem(NETS_ACTIVE_PAYMENT_REF_KEY)
}

const queryRef = computed(() => route.query.ref as string | undefined)
const ref_ = computed(() => {
  if (queryRef.value && queryRef.value !== 'unknown') {
    return queryRef.value
  }

  return getStoredPaymentRef()
})
const callbackStatus = computed(() => route.query.status as string | undefined)
const verifiedStatus = ref<string>('unknown')
const statusMessage = ref('Verifying payment status with NETS...')
const verificationError = ref('')
const isVerifying = ref(true)
const paymentDetails = ref<PaymentStatusData | null>(null)

const isSuccess = computed(() => verifiedStatus.value === 'success')
const isFailed = computed(() => verifiedStatus.value === 'failed')
const isCancelled = computed(() => verifiedStatus.value === 'cancelled')
const isPending = computed(() => verifiedStatus.value === 'pending')

function isTerminalStatus(status?: string) {
  return status === 'success' || status === 'failed' || status === 'cancelled'
}

async function verifyPayment() {
  isVerifying.value = true
  verificationError.value = ''
  paymentDetails.value = null

  if (!ref_.value) {
    if (callbackStatus.value === 'success' || callbackStatus.value === 'failed' || callbackStatus.value === 'cancelled') {
      verifiedStatus.value = callbackStatus.value
      statusMessage.value = 'NETS returned without a transaction reference, so this result could not be re-verified.'
      clearStoredPaymentRef()

      if (callbackStatus.value === 'success' && !applicationStore.hasSubmitted) {
        applicationStore.submitApplication()
      }
    } else {
      statusMessage.value = 'Missing transaction reference. Unable to verify this payment.'
      verifiedStatus.value = 'unknown'
    }
    isVerifying.value = false
    return
  }

  try {
    const shouldRefresh = !isTerminalStatus(callbackStatus.value)
    const payment = await getPaymentStatus(ref_.value, shouldRefresh)
    paymentDetails.value = payment
    verifiedStatus.value = payment.status || 'unknown'
    statusMessage.value = payment.message || 'Payment status checked with NETS.'

    if (payment.status === 'success' && !applicationStore.hasSubmitted) {
      applicationStore.submitApplication()
    }

    if (payment.status === 'success' || payment.status === 'failed' || payment.status === 'cancelled') {
      clearStoredPaymentRef()
    }
  } catch (error) {
    verificationError.value = getErrorMessage(error, 'Unable to verify payment status with NETS.')

    if (isTerminalStatus(callbackStatus.value)) {
      verifiedStatus.value = callbackStatus.value
      statusMessage.value = `${verificationError.value} Showing the callback result instead.`
      clearStoredPaymentRef()
    } else {
      verifiedStatus.value = 'unknown'
      statusMessage.value = verificationError.value
    }
  } finally {
    isVerifying.value = false
  }
}

onMounted(() => {
  void verifyPayment()
})
</script>

<template>
  <section class="section result-page">
    <div class="container result-shell">
      <div v-if="isVerifying" class="surface result-card">
        <div class="result-icon">
          <AlertCircle :size="32" />
        </div>
        <h1>Verifying Payment</h1>
        <p>{{ statusMessage }}</p>

        <div v-if="ref_" class="txn-ref">
          <span class="txn-ref__label">Transaction Reference</span>
          <span class="txn-ref__value">{{ ref_ }}</span>
        </div>
      </div>

      <div v-else-if="isSuccess" class="surface result-card result-card--success">
        <div class="result-icon result-icon--success">
          <CheckCircle2 :size="32" />
        </div>
        <h1>Payment Successful</h1>
        <p>{{ statusMessage || 'Your application fee has been processed. Your BTO flat application has been submitted.' }}</p>

        <div v-if="ref_" class="txn-ref">
          <span class="txn-ref__label">Transaction Reference</span>
          <span class="txn-ref__value">{{ ref_ }}</span>
        </div>

        <div class="result-actions">
          <button class="btn btn-primary" type="button" @click="router.push({ path: '/', hash: '#dashboard' })">
            View My Dashboard
          </button>
        </div>
      </div>

      <div v-else-if="isFailed" class="surface result-card result-card--failed">
        <div class="result-icon result-icon--failed">
          <XCircle :size="32" />
        </div>
        <h1>Payment Failed</h1>
        <p>{{ statusMessage || 'Your payment could not be processed. Please try again.' }}</p>

        <div v-if="ref_" class="txn-ref">
          <span class="txn-ref__label">Reference</span>
          <span class="txn-ref__value">{{ ref_ }}</span>
        </div>

        <div
          v-if="paymentDetails?.stage_resp_code || paymentDetails?.action_code || paymentDetails?.verification_source"
          class="nets-debug"
        >
          <div v-if="paymentDetails?.stage_resp_code" class="nets-debug__row">
            <span class="nets-debug__label">NETS Code</span>
            <span class="nets-debug__value">{{ paymentDetails.stage_resp_code }}</span>
          </div>
          <div v-if="paymentDetails?.action_code" class="nets-debug__row">
            <span class="nets-debug__label">Action Code</span>
            <span class="nets-debug__value">{{ paymentDetails.action_code }}</span>
          </div>
          <div v-if="paymentDetails?.verification_source" class="nets-debug__row">
            <span class="nets-debug__label">Verified Via</span>
            <span class="nets-debug__value">{{ paymentDetails.verification_source }}</span>
          </div>
        </div>

        <div class="result-actions">
          <button class="btn btn-secondary" type="button" @click="router.push('/apply/payment')">
            Try Again
          </button>
          <button class="btn btn-primary" type="button" @click="router.push('/')">
            Return Home
          </button>
        </div>
      </div>

      <div v-else-if="isCancelled" class="surface result-card result-card--cancelled">
        <div class="result-icon result-icon--cancelled">
          <AlertCircle :size="32" />
        </div>
        <h1>Payment Cancelled</h1>
        <p>{{ statusMessage || 'You cancelled the payment. Your application has not been submitted.' }}</p>

        <div class="result-actions">
          <button class="btn btn-secondary" type="button" @click="router.push('/apply/payment')">
            Go Back to Payment
          </button>
        </div>
      </div>

      <div v-else-if="isPending" class="surface result-card">
        <div class="result-icon">
          <AlertCircle :size="32" />
        </div>
        <h1>Payment Still Verifying</h1>
        <p>{{ statusMessage || "We're still waiting for NETS to confirm this payment." }}</p>

        <div v-if="ref_" class="txn-ref">
          <span class="txn-ref__label">Transaction Reference</span>
          <span class="txn-ref__value">{{ ref_ }}</span>
        </div>

        <div class="result-actions">
          <button class="btn btn-secondary" type="button" @click="verifyPayment">
            Check Again
          </button>
          <button class="btn btn-primary" type="button" @click="router.push('/')">
            Return Home
          </button>
        </div>
      </div>

      <div v-else class="surface result-card">
        <div class="result-icon">
          <AlertCircle :size="32" />
        </div>
        <h1>Unknown Status</h1>
        <p>{{ verificationError || statusMessage || "We couldn't determine the payment outcome. Please check your dashboard or contact support." }}</p>

        <div v-if="ref_" class="txn-ref">
          <span class="txn-ref__label">Transaction Reference</span>
          <span class="txn-ref__value">{{ ref_ }}</span>
        </div>

        <div class="result-actions">
          <button v-if="ref_" class="btn btn-secondary" type="button" @click="verifyPayment">
            Check Again
          </button>
          <button class="btn btn-primary" type="button" @click="router.push('/')">
            Return Home
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.result-page {
  background: var(--color-grey-bg);
  min-height: calc(100vh - var(--nav-height));
}

.result-shell {
  display: flex;
  justify-content: center;
  padding-top: 60px;
}

.result-card {
  width: min(100%, 560px);
  padding: 40px;
  text-align: center;
}

.result-card--success {
  border-top: 4px solid var(--color-green);
}

.result-card--failed {
  border-top: 4px solid var(--color-red);
}

.result-card--cancelled {
  border-top: 4px solid #d97706;
}

.result-icon {
  display: inline-grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 999px;
  background: rgba(29, 29, 31, 0.06);
  color: rgba(29, 29, 31, 0.5);
  margin: 0 auto 20px;
}

.result-icon--success {
  background: rgba(26, 127, 75, 0.1);
  color: var(--color-green);
}

.result-icon--failed {
  background: rgba(163, 18, 25, 0.08);
  color: var(--color-red);
}

.result-icon--cancelled {
  background: rgba(217, 119, 6, 0.1);
  color: #d97706;
}

.result-card h1 {
  margin: 0 0 12px;
  font-size: 1.8rem;
  letter-spacing: -0.03em;
}

.result-card p {
  margin: 0 0 24px;
  color: rgba(29, 29, 31, 0.68);
  line-height: 1.6;
}

.txn-ref {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  padding: 10px 16px;
  border-radius: 8px;
  background: rgba(29, 29, 31, 0.04);
}

.txn-ref__label {
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(29, 29, 31, 0.5);
}

.txn-ref__value {
  font-size: 0.88rem;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-weight: 600;
  color: var(--color-charcoal);
}

.nets-debug {
  margin: 0 0 24px;
  padding: 16px 18px;
  border-radius: 12px;
  border: 1px solid rgba(29, 29, 31, 0.08);
  background: rgba(29, 29, 31, 0.03);
  text-align: left;
}

.nets-debug__row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 0;
}

.nets-debug__row + .nets-debug__row {
  border-top: 1px solid rgba(29, 29, 31, 0.08);
}

.nets-debug__label {
  color: rgba(29, 29, 31, 0.62);
  font-size: 0.9rem;
}

.nets-debug__value {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: right;
  word-break: break-all;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}
</style>

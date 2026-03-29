<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CreditCard, ShieldCheck, AlertCircle } from 'lucide-vue-next'
import { useApplicationStore } from '@/stores/application'
import { useAuth } from '@/stores/auth'
import { abandonPayment, getErrorMessage, getPaymentStatus } from '@/services/api'

const router = useRouter()
const applicationStore = useApplicationStore()
const { applicantName } = useAuth()

const NETS_SERVICE_URL = import.meta.env.VITE_NETS_URL ?? 'http://localhost:5003'
const APPLICATION_FEE = 10
const NETS_PAYMENT_REF_KEY = 'nets_last_merchant_txn_ref'
const NETS_ACTIVE_PAYMENT_REF_KEY = 'nets_active_merchant_txn_ref'

const paymentStep = ref<'idle' | 'initiating' | 'redirecting' | 'checking' | 'error'>('idle')
const paymentError = ref('')
const isRecoveringPayment = ref(false)

function getStoredActivePaymentRef(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  const refValue = window.sessionStorage.getItem(NETS_ACTIVE_PAYMENT_REF_KEY)
  return refValue && refValue !== 'unknown' ? refValue : undefined
}

function storePendingPaymentRef(merchantTxnRef: string) {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.setItem(NETS_PAYMENT_REF_KEY, merchantTxnRef)
  window.sessionStorage.setItem(NETS_ACTIVE_PAYMENT_REF_KEY, merchantTxnRef)
}

function clearActivePaymentRef() {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.removeItem(NETS_ACTIVE_PAYMENT_REF_KEY)
}

async function recoverReturnedPayment() {
  const pendingRef = getStoredActivePaymentRef()
  if (!pendingRef || isRecoveringPayment.value) {
    return
  }

  isRecoveringPayment.value = true
  paymentStep.value = 'checking'
  paymentError.value = ''

  try {
    const payment = await getPaymentStatus(pendingRef)

    if (payment.status === 'success' || payment.status === 'failed' || payment.status === 'cancelled') {
      clearActivePaymentRef()
      await router.replace({
        path: '/payment-result',
        query: { ref: pendingRef, status: payment.status },
      })
      return
    }

    await abandonPayment(pendingRef)
    clearActivePaymentRef()
    await router.replace({
      path: '/payment-result',
      query: { ref: pendingRef, status: 'cancelled' },
    })
  } catch (error) {
    paymentError.value = getErrorMessage(
      error,
      'We found an unfinished NETS payment and could not confirm its status.',
    )
    paymentStep.value = 'error'
  } finally {
    isRecoveringPayment.value = false
    if (paymentStep.value === 'checking') {
      paymentStep.value = 'idle'
    }
  }
}

function handlePageShow() {
  void recoverReturnedPayment()
}

async function confirmPayment() {
  paymentStep.value = 'initiating'
  paymentError.value = ''

  try {
    const res = await fetch(`${NETS_SERVICE_URL}/payment/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicant_id: String(applicationStore.form.nric),
        amount: APPLICATION_FEE,
        description: `BTO Application Fee – ${applicantName.value ?? applicationStore.form.nric}`,
      }),
    })

    const result = await res.json()

    if (result.code !== 200) {
      throw new Error(result.message ?? 'Payment service error')
    }

    const { gateway_url, payload, hmac, api_key_id, merchant_txn_ref } = result.data

    if (merchant_txn_ref && typeof window !== 'undefined') {
      storePendingPaymentRef(merchant_txn_ref)
    }

    paymentStep.value = 'redirecting'

    const form = document.createElement('form')
    form.method = 'POST'
    form.action = gateway_url

    const fields: Record<string, string> = { apiKey: api_key_id, payload, hmac }
    for (const [name, value] of Object.entries(fields)) {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = name
      input.value = value
      form.appendChild(input)
    }

    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)

    paymentStep.value = 'idle'
  } catch (err) {
    paymentError.value =
      err instanceof Error ? err.message : 'Unable to connect to payment service.'
    paymentStep.value = 'error'
  }
}

onMounted(() => {
  void recoverReturnedPayment()

  if (typeof window !== 'undefined') {
    window.addEventListener('pageshow', handlePageShow)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('pageshow', handlePageShow)
  }
})
</script>

<template>
  <div class="surface step-card">
    <div class="step-card__copy">
      <h2>Step 3 &mdash; Payment</h2>
      <p>Pay the application processing fee via NETS to submit your flat application.</p>
    </div>

    <div class="summary-grid">
      <div class="summary-row">
        <span class="summary-label">Applicant</span>
        <span class="summary-value">{{ applicantName ?? applicationStore.form.nric }}</span>
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
      <div class="summary-row summary-row--total">
        <span class="summary-label">Application Fee</span>
        <span class="summary-value summary-value--amount">SGD {{ APPLICATION_FEE.toFixed(2) }}</span>
      </div>
    </div>

    <div class="nets-terminal">
      <div class="nets-terminal__header">
        <div class="nets-logo">
          <CreditCard :size="18" />
          <span>NETS</span>
        </div>
        <span class="nets-env-badge">eNETS Gateway</span>
      </div>

      <div class="nets-amount">
        <span class="nets-amount__currency">SGD</span>
        <span class="nets-amount__value">{{ APPLICATION_FEE.toFixed(2) }}</span>
      </div>

      <div v-if="paymentStep === 'idle'" class="nets-status">
        <ShieldCheck :size="17" />
        <span>Tap <strong>Pay with NETS</strong> — you'll be redirected to the eNETS secure payment page</span>
      </div>
      <div v-else-if="paymentStep === 'initiating'" class="nets-status nets-status--processing">
        <span class="nets-spinner" />
        <span>Contacting payment service…</span>
      </div>
      <div v-else-if="paymentStep === 'redirecting'" class="nets-status nets-status--processing">
        <span class="nets-spinner" />
        <span>Redirecting to the eNETS gateway…</span>
      </div>
      <div v-else-if="paymentStep === 'checking'" class="nets-status nets-status--processing">
        <span class="nets-spinner" />
        <span>Checking your unfinished NETS payment…</span>
      </div>
      <div v-else-if="paymentStep === 'error'" class="nets-status nets-status--error">
        <AlertCircle :size="17" />
        <span>{{ paymentError }}</span>
      </div>
    </div>

    <div class="step-actions">
      <button
        class="btn btn-secondary"
        type="button"
        :disabled="paymentStep === 'initiating' || paymentStep === 'redirecting' || paymentStep === 'checking'"
        @click="router.push('/apply/documents')"
      >
        Back
      </button>
      <button
        class="btn btn-primary nets-pay-btn"
        type="button"
        :disabled="paymentStep === 'initiating' || paymentStep === 'redirecting' || paymentStep === 'checking'"
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
  max-width: 680px;
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
  padding: 11px 18px;
  border-bottom: 1px solid var(--color-border);
}

.summary-row:last-child { border-bottom: none; }
.summary-row--total { background: rgba(29, 29, 31, 0.02); }

.summary-label { font-size: 0.88rem; color: rgba(29, 29, 31, 0.6); }
.summary-value { font-size: 0.94rem; font-weight: 600; color: var(--color-charcoal); }
.summary-value--amount { font-size: 1.05rem; color: var(--color-charcoal); }

.nets-terminal {
  padding: 26px;
  border-radius: 14px;
  background: linear-gradient(145deg, #111827 0%, #1e2a3a 100%);
  color: #fff;
  display: grid;
  gap: 18px;
}

.nets-terminal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nets-logo {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  font-size: 0.88rem;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.nets-env-badge { font-size: 0.76rem; color: rgba(255, 255, 255, 0.45); }

.nets-amount { display: flex; align-items: baseline; gap: 7px; }
.nets-amount__currency { font-size: 1rem; font-weight: 600; color: rgba(255, 255, 255, 0.6); }
.nets-amount__value { font-size: 2.8rem; font-weight: 800; letter-spacing: -0.03em; line-height: 1; }

.nets-status {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.07);
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.45;
}

.nets-status--processing { color: rgba(255, 255, 255, 0.85); }
.nets-status--error { background: rgba(220, 38, 38, 0.15); color: #fca5a5; }

.nets-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-top-color: #fff;
  border-radius: 999px;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }

.step-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 26px;
}

.nets-pay-btn { display: inline-flex; align-items: center; gap: 8px; }

@media (max-width: 640px) {
  .step-actions { flex-direction: column-reverse; }
}
</style>

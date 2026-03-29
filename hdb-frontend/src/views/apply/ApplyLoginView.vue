<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ShieldCheck } from 'lucide-vue-next'
import { useApplicationStore } from '@/stores/application'
import { useAuth } from '@/stores/auth'
import { singpassLogin } from '@/services/myinfo'

const router = useRouter()
const applicationStore = useApplicationStore()
const { login, setSessionNric } = useAuth()

const nric = ref(applicationStore.form.nric)
const isLoading = ref(false)

const isDisabled = computed(() => nric.value.trim().length === 0 || isLoading.value)

function buildApplicantId(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 6)
  return Number.parseInt(digits || '100001', 10)
}

async function handleContinue() {
  const formattedNric = nric.value.trim().toUpperCase()
  isLoading.value = true

  try {
    const profile = await singpassLogin(formattedNric)
    const name = profile?.name ?? formattedNric
    applicationStore.startApplicationLogin(formattedNric)
    login(buildApplicantId(formattedNric), name)
    setSessionNric(formattedNric)
    router.push('/apply/details')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="surface step-card step-card--compact">
    <div class="step-card__icon">
      <ShieldCheck :size="22" />
    </div>

    <div class="step-card__copy">
      <h2>Step 1 &mdash; NRIC Login</h2>
      <p>Enter your NRIC to start a mocked SingPass application journey.</p>
    </div>

    <div class="step-card__form">
      <div>
        <label class="field-label" for="apply-nric">NRIC</label>
        <input id="apply-nric" v-model="nric" class="field" type="text" placeholder="e.g. S1234567A" />
      </div>

      <button class="btn btn-primary" type="button" :disabled="isDisabled" @click="handleContinue">
        Login with SingPass
      </button>
    </div>
  </div>
</template>

<style scoped>
.step-card {
  padding: 32px;
}

.step-card--compact {
  max-width: 640px;
  margin: 0 auto;
}

.step-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-bottom: 18px;
  border-radius: 999px;
  color: var(--color-red);
  background: var(--color-red-light);
}

.step-card__copy h2 {
  margin: 0 0 10px;
  font-size: 1.7rem;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.step-card__copy p {
  margin: 0;
  color: rgba(29, 29, 31, 0.72);
}

.step-card__form {
  display: grid;
  gap: 18px;
  margin-top: 24px;
}
</style>

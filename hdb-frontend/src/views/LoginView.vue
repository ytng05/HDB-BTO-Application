<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ShieldCheck } from 'lucide-vue-next'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { loginApplicant } from '@/services/api'
import { useAuth } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const { login, setSessionNric } = useAuth()

const nric = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

async function handleLogin() {
  errorMessage.value = ''
  loading.value = true

  try {
    const applicant = await loginApplicant({
      nric: nric.value.trim().toUpperCase(),
      password: password.value,
    })

    login(applicant.applicant_id, applicant.name)
    setSessionNric(applicant.nric ?? nric.value)

    const redirectTarget = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    router.push(redirectTarget)
  } catch {
    errorMessage.value = 'Invalid NRIC or password. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="login-page">
    <div class="container login-shell">
      <div class="surface login-card">
        <div class="login-card__header">
          <div class="login-card__icon">
            <ShieldCheck :size="22" />
          </div>
          <p class="login-card__brand">HDB</p>
          <h1>Login with your SingPass credentials</h1>
        </div>

        <form class="login-form" @submit.prevent="handleLogin">
          <div>
            <label class="field-label" for="nric">NRIC</label>
            <input id="nric" v-model="nric" class="field" type="text" placeholder="e.g. S1234567A" required />
          </div>

          <div>
            <label class="field-label" for="password">Password</label>
            <input id="password" v-model="password" class="field" type="password" required />
          </div>

          <p v-if="errorMessage" class="login-error">{{ errorMessage }}</p>

          <button class="btn btn-primary btn-block" type="submit" :disabled="loading">
            <LoadingSpinner v-if="loading" :size="18" inline />
            <span>{{ loading ? 'Signing in' : 'Login with SingPass' }}</span>
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
.login-page {
  min-height: calc(100vh - var(--nav-height));
  background: var(--color-grey-bg);
}

.login-shell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--nav-height));
  padding: 48px 0;
}

.login-card {
  width: min(100%, 460px);
  padding: 36px 32px;
}

.login-card__header {
  margin-bottom: 28px;
  text-align: center;
}

.login-card__icon {
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

.login-card__brand {
  margin: 0 0 10px;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-red);
}

.login-card__header h1 {
  margin: 0;
  font-size: 1.75rem;
  line-height: 1.2;
  letter-spacing: -0.03em;
}

.login-form {
  display: grid;
  gap: 18px;
}

.login-error {
  margin: 0;
  font-size: 0.94rem;
  font-weight: 600;
  color: var(--color-red);
}

@media (max-width: 640px) {
  .login-card {
    padding: 28px 20px;
  }
}
</style>

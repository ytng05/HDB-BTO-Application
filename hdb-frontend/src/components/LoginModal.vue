<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { closeLoginModal, login, store } from '../store/index'
import { demoUsers } from '../data/home'

const router = useRouter()
const nric = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

watch(
  () => store.showLoginModal,
  (open) => {
    if (open) {
      nric.value = ''
      password.value = ''
      error.value = ''
      loading.value = false
    }
  },
)

function handleSubmit() {
  if (!nric.value || !password.value) {
    error.value = 'Enter both your NRIC and password to continue.'
    return
  }

  loading.value = true
  error.value = ''

  window.setTimeout(() => {
    const user = demoUsers.find(
      (entry) =>
        entry.nric === nric.value.trim().toUpperCase() && entry.password === password.value,
    )

    if (!user) {
      error.value = 'The NRIC or password provided is not valid.'
      loading.value = false
      return
    }

    login(user)
    loading.value = false
    router.push(user.role === 'admin' ? '/admin' : '/my-application')
  }, 600)
}

function fillDemoCredentials(nricValue: string, passwordValue: string) {
  nric.value = nricValue
  password.value = passwordValue
  error.value = ''
}
</script>

<template>
  <Transition name="modal">
    <div v-if="store.showLoginModal" class="backdrop" @click.self="closeLoginModal">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="portal-login-title">
        <button
          type="button"
          class="modal-close"
          aria-label="Close sign in"
          @click="closeLoginModal"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 3l10 10M13 3L3 13"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
        </button>

        <div class="modal__header">
          <div class="modal__brand">
            <div class="modal__mark">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M9 1.5L1.5 8.5V16.5h5v-5h5v5h5V8.5L9 1.5z"
                  stroke="white"
                  stroke-width="1.6"
                  stroke-linejoin="round"
                  fill="rgba(255,255,255,0.2)"
                />
              </svg>
            </div>
            <div>
              <p class="modal__kicker">Secure Access</p>
              <h2 id="portal-login-title">Sign in</h2>
            </div>
          </div>
          <p class="modal__copy">Use your NRIC and password.</p>
        </div>

        <div class="modal__notice">
          <strong>Demo mode</strong>
          <span>Select an account to autofill.</span>
        </div>

        <form class="modal__form" @submit.prevent="handleSubmit">
          <div class="field">
            <label for="login-nric">NRIC Number</label>
            <input
              id="login-nric"
              v-model="nric"
              type="text"
              placeholder="S1234567A"
              autocomplete="username"
              spellcheck="false"
              style="text-transform: uppercase"
            />
          </div>

          <div class="field">
            <label for="login-password">Password</label>
            <input
              id="login-password"
              v-model="password"
              type="password"
              placeholder="Enter your password"
              autocomplete="current-password"
            />
          </div>

          <Transition name="fade-error">
            <p v-if="error" class="modal__error" role="alert">{{ error }}</p>
          </Transition>

          <button type="submit" class="btn btn-primary btn-lg modal__submit" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <div class="demo-grid">
          <button
            type="button"
            class="demo-card"
            @click="fillDemoCredentials('S1234567A', 'apple123')"
          >
            <div class="demo-card__head">
              <span class="demo-card__avatar">R</span>
              <div>
                <strong>Rachel Tan</strong>
                <small>Applicant</small>
              </div>
            </div>
            <div class="demo-card__body mono">
              <span>S1234567A</span>
              <span>apple123</span>
            </div>
          </button>

          <button
            type="button"
            class="demo-card"
            @click="fillDemoCredentials('S7654321D', 'redhome')"
          >
            <div class="demo-card__head">
              <span class="demo-card__avatar">M</span>
              <div>
                <strong>Marcus Lee</strong>
                <small>Applicant</small>
              </div>
            </div>
            <div class="demo-card__body mono">
              <span>S7654321D</span>
              <span>redhome</span>
            </div>
          </button>

          <button
            type="button"
            class="demo-card demo-card--admin"
            @click="fillDemoCredentials('T0000001Z', 'admin2026')"
          >
            <div class="demo-card__head">
              <span class="demo-card__avatar demo-card__avatar--admin">A</span>
              <div>
                <strong>HDB Administrator</strong>
                <small>Admin</small>
              </div>
            </div>
            <div class="demo-card__body mono">
              <span>T0000001Z</span>
              <span>admin2026</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 220;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(15, 23, 38, 0.5);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.modal {
  position: relative;
  width: min(560px, 100%);
  display: grid;
  gap: 20px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: var(--shadow-xl);
  padding: 32px;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: rgba(15, 23, 38, 0.03);
  color: var(--text-2);
  cursor: pointer;
}

.modal-close:hover {
  background: rgba(15, 23, 38, 0.06);
}

.modal__header {
  display: grid;
  gap: 14px;
  padding-right: 28px;
}

.modal__brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.modal__mark {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: linear-gradient(180deg, var(--red-light) 0%, var(--red) 100%);
  box-shadow: 0 14px 24px rgba(196, 54, 43, 0.16);
}

.modal__kicker {
  margin: 0 0 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--blue-text);
}

.modal__brand h2 {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--heading);
}

.modal__copy {
  margin: 0;
  color: var(--text-2);
  line-height: 1.65;
}

.modal__notice {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: center;
  border: 1px solid rgba(21, 94, 239, 0.14);
  border-radius: 16px;
  background: rgba(21, 94, 239, 0.06);
  padding: 14px 16px;
  color: var(--blue-text);
}

.modal__notice strong {
  font-size: 13px;
}

.modal__notice span {
  font-size: 13px;
  color: var(--text-2);
}

.modal__form {
  display: grid;
  gap: 16px;
}

.modal__error {
  margin: 0;
  border-radius: 14px;
  background: var(--red-soft);
  padding: 12px 14px;
  color: var(--red);
  font-size: 14px;
  font-weight: 600;
}

.modal__submit {
  width: 100%;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.demo-card {
  display: grid;
  gap: 14px;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: var(--surface-tint);
  padding: 16px;
  text-align: left;
  cursor: pointer;
  transition:
    transform 140ms ease,
    border-color 140ms ease,
    box-shadow 140ms ease;
}

.demo-card:hover {
  transform: translateY(-1px);
  border-color: var(--border-md);
  box-shadow: var(--shadow-sm);
}

.demo-card--admin {
  background: #f8f9fb;
}

.demo-card__head {
  display: flex;
  gap: 10px;
  align-items: center;
}

.demo-card__head strong {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
}

.demo-card__head small {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  color: var(--text-3);
}

.demo-card__avatar {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: var(--red-soft);
  color: var(--red);
  font-size: 13px;
  font-weight: 700;
}

.demo-card__avatar--admin {
  background: rgba(21, 94, 239, 0.1);
  color: var(--blue-text);
}

.demo-card__body {
  display: grid;
  gap: 4px;
  font-size: 12px;
  color: var(--text-2);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #ffffff;
  border-radius: 999px;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 180ms ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal {
  transition:
    transform 220ms ease,
    opacity 220ms ease;
}

.modal-enter-from .modal {
  transform: translateY(12px) scale(0.97);
  opacity: 0;
}

.fade-error-enter-active,
.fade-error-leave-active {
  transition: opacity 140ms ease;
}

.fade-error-enter-from,
.fade-error-leave-to {
  opacity: 0;
}

@media (max-width: 760px) {
  .demo-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .modal {
    padding: 24px 20px;
  }

  .modal__brand h2 {
    font-size: 22px;
  }
}
</style>

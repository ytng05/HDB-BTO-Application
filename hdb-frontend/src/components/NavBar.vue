<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { LogIn, LogOut, UserRound, X } from 'lucide-vue-next'
import { useAuth } from '@/stores/auth'
import { useApplicationStore } from '@/stores/application'
import { singpassLogin } from '@/services/myinfo'

const route = useRoute()
const applicationStore = useApplicationStore()
const { applicantName, isLoggedIn, login, logout, setSessionNric } = useAuth()

const demoAccounts = [
  { nric: 'S9401234L', label: 'Lena Ong' },
  { nric: 'S9501234R', label: 'Ryan Tan' },
  { nric: 'S8901234D', label: 'Daniel Goh' },
  { nric: 'S9001234J', label: 'Jasmine Tan' },
  { nric: 'S9201234W', label: 'Wendy Chen' },
]

const showModal = ref(false)
const nric = ref('')
const isLoading = ref(false)
const loginError = ref('')

function openModal() {
  showModal.value = true
  nric.value = ''
  loginError.value = ''
}

function closeModal() {
  showModal.value = false
}

async function handleLogin() {
  const formattedNric = nric.value.trim().toUpperCase()
  if (!formattedNric) {
    loginError.value = 'Please enter your NRIC.'
    return
  }

  isLoading.value = true
  loginError.value = ''

  try {
    const profile = await singpassLogin(formattedNric)
    const name = profile?.name ?? formattedNric
    const digits = formattedNric.replace(/\D/g, '').slice(0, 6)
    const id = Number.parseInt(digits || '100001', 10)
    applicationStore.startApplicationLogin(formattedNric, name)
    login(id, name, formattedNric)
    setSessionNric(formattedNric)
    applicationStore.syncSessionApplications(formattedNric)
    closeModal()
  } catch {
    loginError.value = 'Login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const navLinks = computed(() => {
  if (!isLoggedIn.value) return []

  if (route.path === '/') {
    return [
      { id: 'dashboard', label: 'Dashboard', to: { path: '/', hash: '#dashboard' } },
      { id: 'launches', label: 'BTO Launches', to: { path: '/', hash: '#launches' } },
    ]
  }

  return []
})

function isActiveLink(linkId: string) {
  if (linkId === 'dashboard') return route.path === '/' && route.hash === '#dashboard'
  if (linkId === 'launches') return route.path === '/' && route.hash === '#launches'
  return false
}

function handleLogout() {
  applicationStore.resetApplication()
  logout()
}
</script>

<template>
  <header class="nav-shell">
    <div class="container nav-inner">
      <RouterLink class="brand-link" to="/">
        <span class="brand-mark">HDB</span>
        <span class="brand-copy">
          <strong>Flat Portal</strong>
          <small>Build-To-Order Services</small>
        </span>
      </RouterLink>

      <nav v-if="navLinks.length > 0" class="nav-links" aria-label="Primary">
        <RouterLink
          v-for="link in navLinks"
          :key="link.id"
          :to="link.to"
          :class="['nav-link', { 'nav-link--active': isActiveLink(link.id) }]"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="nav-actions">
        <template v-if="isLoggedIn">
          <span class="user-pill">
            <UserRound :size="16" />
            <span>{{ applicantName }}</span>
          </span>
          <button class="nav-logout" type="button" aria-label="Logout" @click="handleLogout">
            <LogOut :size="17" />
          </button>
        </template>
        <button v-else class="nav-login" type="button" @click="openModal">
          <LogIn :size="17" />
          <span>Login</span>
        </button>
      </div>
    </div>
  </header>

  <Transition name="modal">
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="login-modal-title">
        <button class="modal-close" type="button" aria-label="Close" @click="closeModal">
          <X :size="16" />
        </button>

        <div class="modal-header">
          <div class="modal-mark">HDB</div>
          <div>
            <p class="modal-kicker">Secure Access</p>
            <h2 id="login-modal-title">Sign In</h2>
          </div>
        </div>

        <p class="modal-copy">Enter your NRIC to access the portal.</p>

        <div class="demo-hint">
          <strong>Scenario Accounts:</strong>
          <button
            v-for="account in demoAccounts"
            :key="account.nric"
            type="button"
            class="demo-pill"
            @click="nric = account.nric"
          >
            {{ account.label }} · {{ account.nric }}
          </button>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="modal-field">
            <label for="modal-nric">NRIC Number</label>
            <input
              id="modal-nric"
              v-model="nric"
              type="text"
              placeholder="e.g. S1234567A"
              spellcheck="false"
              style="text-transform: uppercase"
              :disabled="isLoading"
              autofocus
            />
          </div>

          <p v-if="loginError" class="modal-error">{{ loginError }}</p>

          <button type="submit" class="btn btn-primary modal-submit" :disabled="isLoading || !nric.trim()">
            <span v-if="isLoading">Signing in…</span>
            <span v-else>Sign In</span>
          </button>
        </form>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.nav-shell {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 1000;
  border-top: 3px solid var(--color-red);
  border-bottom: 1px solid rgba(29, 29, 31, 0.08);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
}

.nav-inner {
  display: grid;
  grid-template-columns: minmax(220px, auto) 1fr auto;
  align-items: center;
  gap: 24px;
  min-height: calc(var(--nav-height) - 3px);
}

.brand-link {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  justify-self: start;
  min-width: 0;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(180deg, #d31d3c 0%, var(--color-red) 100%);
  color: var(--color-white);
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  flex-shrink: 0;
}

.brand-copy {
  display: grid;
  gap: 2px;
}

.brand-copy strong {
  color: var(--color-charcoal);
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.brand-copy small {
  color: rgba(29, 29, 31, 0.56);
  font-size: 0.78rem;
}

.nav-links {
  display: flex;
  align-items: center;
  justify-content: center;
  justify-self: center;
  gap: 26px;
  min-width: 0;
}

.nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  color: rgba(29, 29, 31, 0.72);
  font-size: 0.94rem;
  font-weight: 700;
  white-space: nowrap;
  transition: color 0.18s ease;
}

.nav-link::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 2px;
  background: transparent;
  transition: background-color 0.18s ease;
}

.nav-link:hover {
  color: var(--color-red);
}

.nav-link--active {
  color: var(--color-red);
}

.nav-link--active::after {
  background: var(--color-red);
}

.nav-actions {
  display: flex;
  align-items: center;
  justify-self: end;
  gap: 10px;
  flex-shrink: 0;
}

.user-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-charcoal);
  font-size: 0.92rem;
  font-weight: 600;
  white-space: nowrap;
}

.nav-login {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 18px;
  border: 1px solid var(--color-red);
  border-radius: 999px;
  background: transparent;
  color: var(--color-red);
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.nav-login:hover {
  background: var(--color-red);
  color: var(--color-white);
}

.nav-logout {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: var(--color-white);
  color: rgba(29, 29, 31, 0.72);
  cursor: pointer;
  transition: color 0.15s ease;
}

.nav-logout:hover {
  color: var(--color-red);
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(15, 23, 38, 0.48);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.modal {
  position: relative;
  width: min(480px, 100%);
  display: grid;
  gap: 18px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
  padding: 32px;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: transparent;
  color: rgba(29, 29, 31, 0.56);
  cursor: pointer;
}

.modal-close:hover {
  color: var(--color-red);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-right: 28px;
}

.modal-mark {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(180deg, #d31d3c 0%, var(--color-red) 100%);
  color: var(--color-white);
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  flex-shrink: 0;
}

.modal-kicker {
  margin: 0 0 4px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(29, 29, 31, 0.5);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-charcoal);
}

.modal-copy {
  margin: 0;
  font-size: 0.94rem;
  color: rgba(29, 29, 31, 0.65);
}

.demo-hint {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(29, 29, 31, 0.04);
  font-size: 0.84rem;
}

.demo-hint strong {
  color: rgba(29, 29, 31, 0.65);
}

.demo-pill {
  padding: 3px 10px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-white);
  color: var(--color-charcoal);
  font-size: 0.82rem;
  font-family: 'SF Mono', 'Fira Code', monospace;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.demo-pill:hover {
  border-color: var(--color-red);
  color: var(--color-red);
}

.modal-field {
  display: grid;
  gap: 8px;
  margin-bottom: 12px;
}

.modal-field label {
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--color-charcoal);
}

.modal-field input {
  height: 48px;
  padding: 0 16px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-white);
  font-size: 1rem;
  color: var(--color-charcoal);
  outline: none;
  transition: border-color 0.15s ease;
}

.modal-field input:focus {
  border-color: var(--color-red);
}

.modal-field input:disabled {
  opacity: 0.6;
}

.modal-error {
  margin: 0 0 12px;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(163, 18, 25, 0.06);
  color: var(--color-red);
  font-size: 0.88rem;
  font-weight: 600;
}

.modal-submit {
  width: 100%;
  height: 48px;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 180ms ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal {
  transition: transform 220ms ease, opacity 220ms ease;
}

.modal-enter-from .modal {
  transform: translateY(10px) scale(0.97);
  opacity: 0;
}

@media (max-width: 640px) {
  .nav-inner {
    grid-template-columns: 1fr auto;
  }

  .nav-links {
    display: none;
  }

  .modal {
    padding: 24px 20px;
  }
}
</style>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { isAdmin } from '@/stores/admin'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { LogIn, LogOut, UserRound } from 'lucide-vue-next'
import { useAuth } from '@/stores/auth'
import { useApplicationStore } from '@/stores/application'
import { getSingpassAuthLoginUrl, singpassLogout } from '@/services/myinfo'

const route = useRoute()
const router = useRouter()
const applicationStore = useApplicationStore()
const { applicantName, isLoggedIn, logout } = useAuth()
const isLoginConfirmOpen = ref(false)
const isRedirectingToSingpass = ref(false)
const pendingLoginUrl = ref('')

function openLoginConfirm() {
  if (isRedirectingToSingpass.value) {
    return
  }

  pendingLoginUrl.value = getSingpassAuthLoginUrl(route.fullPath || '/')
  isLoginConfirmOpen.value = true
}

function cancelLoginConfirm() {
  if (isRedirectingToSingpass.value) {
    return
  }

  isLoginConfirmOpen.value = false
}

function confirmRedirectToMockPass() {
  if (isRedirectingToSingpass.value) {
    return
  }

  if (!pendingLoginUrl.value) {
    pendingLoginUrl.value = getSingpassAuthLoginUrl(route.fullPath || '/')
  }

  isRedirectingToSingpass.value = true
  // Show a short transition state before handing over to Singpass.
  window.setTimeout(() => {
    window.location.assign(pendingLoginUrl.value)
  }, 25)
}

const navLinks = computed(() => {
  if (isLoggedIn.value) {
    return [
      { id: 'dashboard', label: 'Dashboard', to: { path: '/', hash: '#dashboard' } },
    ]
  }
  if (isAdmin.value) {
    return [
      { id: 'admin-ballot', label: 'Admin Ballot', to: { path: '/admin/ballot' } },
    ]
  }
  return []
})

function isActiveLink(linkId: string) {
  if (linkId === 'dashboard') return router.currentRoute.value.path === '/'
  if (linkId === 'admin-ballot') return router.currentRoute.value.path === '/admin/ballot'
  return false
}

function openAdminLogin() {
  const pw = window.prompt('Enter admin password:')
  if (pw === 'admin123') {
    isAdmin.value = true
    router.push('/admin/ballot')
  } else if (pw !== null) {
    window.alert('Incorrect password')
  }
}

function handleAdminLogout() {
  isAdmin.value = false
  router.push('/')
}

async function handleLogout() {
  try {
    await singpassLogout()
  } catch {
    // Continue local logout even if backend logout fails.
  }

  applicationStore.resetApplication()
  logout()
  
  // Navigate to home after logout
  await router.push({ path: '/', replace: true })
}
</script>

<template>
  <header class="nav-shell">
    <div class="container nav-inner">
      <RouterLink class="brand-link" to="/">
        <span class="brand-mark">HDB</span>
        <span class="brand-copy">
          <strong>Flat Portal</strong>
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
        <template v-else-if="isAdmin">
          <span class="user-pill">
            <UserRound :size="16" />
            <span>Admin</span>
          </span>
          <button class="nav-logout" type="button" aria-label="Logout" @click="handleAdminLogout">
            <LogOut :size="17" />
          </button>
        </template>
        <template v-else>
          <button class="nav-login" type="button" :disabled="isRedirectingToSingpass" @click="openLoginConfirm">
            <LogIn :size="17" />
            <span>{{ isRedirectingToSingpass ? 'Connecting...' : 'Login' }}</span>
          </button>
          <button class="nav-login" type="button" @click="openAdminLogin" style="margin-left: 8px;">
            <LogIn :size="17" />
            <span>Admin Login</span>
          </button>
        </template>
      </div>
    </div>
  </header>

  <div v-if="isLoginConfirmOpen" class="auth-redirect-overlay" role="dialog" aria-modal="true" aria-live="polite">
    <div class="auth-redirect-card">
      <p class="auth-redirect-title">Continue to Singpass?</p>
      <p class="auth-redirect-copy">You are about to leave this page and sign in through MockPass.</p>
      <div class="auth-redirect-actions">
        <button class="auth-btn auth-btn--secondary" type="button" :disabled="isRedirectingToSingpass" @click="cancelLoginConfirm">
          Cancel
        </button>
        <button class="auth-btn auth-btn--primary" type="button" :disabled="isRedirectingToSingpass" @click="confirmRedirectToMockPass">
          {{ isRedirectingToSingpass ? 'Redirecting...' : 'Continue to Singpass' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Layout */
.nav-shell {
  position: relative;
  z-index: 1000;
  background: var(--color-white);
  border-bottom: 1px solid var(--color-border);
  height: var(--nav-height, 60px);
}

.nav-inner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  padding: 0 20px;
  height: 100%;
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

.nav-login:disabled {
  opacity: 0.6;
  cursor: wait;
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

.auth-redirect-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(29, 29, 31, 0.35);
}

.auth-redirect-card {
  width: min(420px, 100%);
  border-radius: 14px;
  border: 1px solid rgba(29, 29, 31, 0.12);
  background: #fff;
  padding: 20px;
  text-align: center;
  box-shadow: 0 16px 30px rgba(29, 29, 31, 0.18);
}

.auth-redirect-title {
  margin: 0;
  font-size: 1.02rem;
  font-weight: 700;
  color: var(--color-charcoal);
}

.auth-redirect-copy {
  margin: 8px 0 0;
  color: rgba(29, 29, 31, 0.72);
  font-size: 0.94rem;
}

.auth-redirect-actions {
  margin-top: 16px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.auth-btn {
  min-height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

.auth-btn--secondary {
  border: 1px solid var(--color-border);
  background: #fff;
  color: var(--color-charcoal);
}

.auth-btn--primary {
  border: 1px solid var(--color-red);
  background: var(--color-red);
  color: #fff;
}

.auth-btn:disabled {
  opacity: 0.65;
  cursor: wait;
}

@media (max-width: 640px) {
  .nav-inner {
    grid-template-columns: 1fr auto;
  }

  .nav-links {
    display: none;
  }
}
</style>

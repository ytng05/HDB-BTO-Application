<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ArrowRight, LogIn, LogOut, UserRound } from 'lucide-vue-next'
import { useAuth } from '@/stores/auth'
import { useApplicationStore } from '@/stores/application'

const route = useRoute()
const applicationStore = useApplicationStore()
const { applicantName, isLoggedIn, logout } = useAuth()

const dashboardLink = computed(() => ({
  path: '/',
  hash: '#dashboard',
}))

const loginLink = computed(() => {
  if (route.path.startsWith('/apply')) {
    return { path: '/apply/login' }
  }

  return {
    path: '/apply/login',
    query: {
      redirect: route.fullPath,
    },
  }
})

const startLink = computed(() => {
  if (applicationStore.status === 'processing') {
    return { path: '/apply/review' }
  }

  if (applicationStore.form.nric) {
    return { path: '/apply/details' }
  }

  return { path: '/apply/login' }
})

const ctaLabel = computed(() => (applicationStore.hasSubmitted ? 'Continue Application' : 'Start Application'))

const navLinks = computed(() => [
  {
    id: 'home',
    label: 'Home',
    to: { path: '/' },
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    to: dashboardLink.value,
  },
  {
    id: 'launches',
    label: 'Launches',
    to: { path: '/', hash: '#launches' },
  },
  {
    id: 'apply',
    label: 'Apply',
    to: startLink.value,
  },
])

function isActiveLink(linkId: string) {
  if (linkId === 'home') {
    return route.path === '/' && route.hash.length === 0
  }

  if (linkId === 'dashboard') {
    return route.path === '/' && route.hash === '#dashboard'
  }

  if (linkId === 'launches') {
    return route.path === '/' && route.hash === '#launches'
  }

  return (
    route.path.startsWith('/apply') ||
    route.path.startsWith('/select-flat') ||
    route.path.startsWith('/payment-confirmation')
  )
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

      <nav class="nav-links" aria-label="Primary">
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
        <RouterLink v-if="isLoggedIn" class="dashboard-link" :to="dashboardLink">
          <UserRound :size="17" />
          <span>{{ applicantName }}</span>
        </RouterLink>

        <RouterLink v-else class="nav-login" :to="loginLink">
          <LogIn :size="17" />
          <span>Login</span>
        </RouterLink>

        <RouterLink class="btn btn-primary nav-apply" :to="startLink">
          <span>{{ ctaLabel }}</span>
          <ArrowRight :size="15" />
        </RouterLink>

        <button v-if="isLoggedIn" class="nav-logout" type="button" @click="logout" aria-label="Logout">
          <LogOut :size="17" />
        </button>
      </div>
    </div>
  </header>
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

.dashboard-link,
.nav-login {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 12px;
  color: var(--color-charcoal);
  font-size: 0.92rem;
  font-weight: 600;
  white-space: nowrap;
}

.dashboard-link {
  border: 1px solid var(--color-border);
  border-radius: 999px;
}

.dashboard-link:hover,
.nav-login:hover {
  color: var(--color-red);
}

.nav-apply {
  min-width: 176px;
  border-radius: 10px;
  white-space: nowrap;
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
}

.nav-logout:hover {
  color: var(--color-red);
}

@media (max-width: 980px) {
  .nav-inner {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 10px 0;
  }

  .brand-link,
  .nav-links,
  .nav-actions {
    justify-self: start;
  }

  .nav-links {
    gap: 20px;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .nav-actions {
    flex-wrap: wrap;
  }
}

@media (max-width: 640px) {
  .nav-links {
    gap: 16px;
  }

  .nav-apply {
    min-width: 0;
  }
}
</style>

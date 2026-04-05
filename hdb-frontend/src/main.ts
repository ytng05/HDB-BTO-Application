import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { pinia } from './stores/pinia'
import { looksLikeNric } from './utils/validation'
import './assets/main.css'

const AUTH_STORAGE_KEY = 'hdb-flat-portal-auth'

function toApplicantId(nric: string): number {
  const digits = nric.replace(/\D/g, '').slice(0, 6)
  return Number.parseInt(digits || '100001', 10)
}

function getSafeRedirectPath(rawPath: string | null): string {
  if (!rawPath || !rawPath.startsWith('/') || rawPath.startsWith('//')) {
    return '/'
  }
  return rawPath
}

function consumeAuthCallbackOnBoot(): boolean {
  const normalizedPath = window.location.pathname.replace(/\/+$/, '').toLowerCase()
  if (!normalizedPath.startsWith('/auth/callback')) {
    return false
  }

  const params = new URLSearchParams(window.location.search)
  const status = (params.get('status') || '').toLowerCase()
  const redirectPath = getSafeRedirectPath(params.get('redirect'))

  if (status === 'success') {
    const nric = (params.get('nric') || '').trim().toUpperCase()
    const nameFromQuery = (params.get('name') || '').trim()

    if (looksLikeNric(nric)) {
      const payload = {
        applicant_id: toApplicantId(nric),
        name: nameFromQuery || nric,
        nric,
      }
      window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload))
    }
  }

  window.location.replace(redirectPath)
  return true
}

if (consumeAuthCallbackOnBoot()) {
  // Callback was consumed and browser navigation is in progress.
} else {
  const app = createApp(App)

  app.use(pinia)
  app.use(router)

  app.mount('#app')
}

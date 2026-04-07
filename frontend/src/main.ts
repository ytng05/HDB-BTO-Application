import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { pinia } from './stores/pinia'
import './assets/main.css'

const RUNTIME_CACHE_CLEANUP_KEY = '__hdb_runtime_cache_cleanup_done'

function isAuthCallbackPath(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const normalizedPath = window.location.pathname.replace(/\/+$/, '').toLowerCase()
  return normalizedPath.startsWith('/auth/callback')
}

if (isAuthCallbackPath()) {
  const app = createApp(App)
  app.use(pinia)
  app.use(router)
  app.mount('#app')
} else {
  void (async () => {
    const cleanupTriggeredReload = await cleanupLegacyRuntimeCaches()
    if (cleanupTriggeredReload) {
      return
    }

    const app = createApp(App)

    app.use(pinia)
    app.use(router)

    app.mount('#app')
  })()
}

async function cleanupLegacyRuntimeCaches(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false
  }

  if (window.sessionStorage.getItem(RUNTIME_CACHE_CLEANUP_KEY) === '1') {
    return false
  }

  let didCleanup = false

  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations()
      if (registrations.length > 0) {
        await Promise.all(registrations.map((registration) => registration.unregister()))
        didCleanup = true
      }
    } catch {
      // Best-effort only: app should still boot even if cleanup fails.
    }
  }

  if ('caches' in window) {
    try {
      const keys = await caches.keys()
      if (keys.length > 0) {
        await Promise.all(keys.map((key) => caches.delete(key)))
        didCleanup = true
      }
    } catch {
      // Best-effort only: app should still boot even if cleanup fails.
    }
  }

  if (didCleanup) {
    window.sessionStorage.setItem(RUNTIME_CACHE_CLEANUP_KEY, '1')
    window.location.replace(window.location.href)
    return true
  }

  return false
}

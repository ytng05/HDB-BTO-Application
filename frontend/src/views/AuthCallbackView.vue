<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/stores/auth'
import { useApplicationStore } from '@/stores/application'
import { getMyInfoProfile } from '@/services/myinfo'
import { looksLikeNric } from '@/utils/validation'

const route = useRoute()
const applicationStore = useApplicationStore()
const { login, setSessionNric } = useAuth()

function firstQueryValue(value: unknown): string {
  if (Array.isArray(value)) {
    const first = value[0]
    return typeof first === 'string' ? first : ''
  }
  return typeof value === 'string' ? value : ''
}

function toApplicantId(nric: string): number {
  const digits = nric.replace(/\D/g, '').slice(0, 6)
  return Number.parseInt(digits || '100001', 10)
}

function completeLoginFromCallback() {
  const status = firstQueryValue(route.query.status)
  const redirectPath = firstQueryValue(route.query.redirect) || '/'
  const callbackMessage = firstQueryValue(route.query.message)

  if (status === 'error') {
    console.error('[Auth] Callback returned error status:', callbackMessage || 'Sign-in failed')
    window.location.href = '/'
    return
  }

  // Wrapper provides nric and name in callback URL
  const nric = firstQueryValue(route.query.nric).trim().toUpperCase()
  let name = firstQueryValue(route.query.name).trim()

  // Validate NRIC is present and valid
  if (!nric) {
    throw new Error('Wrapper did not return NRIC in callback. Check server logs.')
  }

  if (!looksLikeNric(nric)) {
    console.error('Invalid NRIC format from wrapper:', { nric, name })
    throw new Error('Wrapper returned invalid NRIC format. Check server logs.')
  }

  // Name might be NRIC initially (minimal persona from auth code)
  if (!name) {
    name = nric
  }

  console.log(`[Auth] User authenticated as ${nric}, initial name: ${name}`)

  // Complete the login with initial data immediately
  try {
    applicationStore.startApplicationLogin(nric, name)
    login(toApplicantId(nric), name, nric)
    setSessionNric(nric)
  } catch (loginError) {
    console.error('[Auth] Login setup failed:', loginError)
    throw loginError
  }

  // Enrich with full profile in the background (non-blocking)
  if (name === nric) {
    getMyInfoProfile()
      .then((fullProfile) => {
        if (fullProfile?.name?.value && fullProfile.name.value.trim()) {
          const realName = fullProfile.name.value.trim()
          console.log(`[Auth] Background: enriched name to ${realName}`)
          login(toApplicantId(nric), realName, nric)
        }
      })
      .catch((error) => {
        console.warn(`[Auth] Background profile enrichment failed:`, error)
      })
  }

  // Use direct navigation to avoid router state issues
  // Redirect immediately with window.location for clean state reset
  window.location.href = redirectPath
}

onMounted(() => {
  try {
    completeLoginFromCallback()
  } catch (error) {
    // Log detailed error for debugging - still redirect to home
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Auth callback failed:', {
      message: errorMessage,
      query: route.query,
      timestamp: new Date().toISOString(),
    })
    // Fallback: redirect to home after failed auth
    window.location.href = '/'
  }
})
</script>

<template>
  <!-- Auth callback - Page redirects immediately, nothing to display -->
</template>

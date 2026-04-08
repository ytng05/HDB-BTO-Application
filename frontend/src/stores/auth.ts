import { computed, ref, type ComputedRef, type Ref } from 'vue'

const STORAGE_KEY = 'hdb-flat-portal-auth'
const APPLICATION_STORAGE_KEY = 'hdb-flat-portal-application'

interface StoredAuthSession {
  applicant_id: number
  name: string
  nric: string | null
}

const applicantId = ref<number | null>(null)
const applicantName = ref<string | null>(null)
const applicantNric = ref<string | null>(null)
const isLoggedIn = computed(() => applicantId.value !== null && applicantName.value !== null)

function restoreSession() {
  if (typeof window === 'undefined') {
    return
  }

  const rawSession = window.sessionStorage.getItem(STORAGE_KEY)
  if (!rawSession) {
    return
  }

  try {
    const parsedSession = JSON.parse(rawSession) as Partial<StoredAuthSession>
    applicantId.value = typeof parsedSession.applicant_id === 'number' ? parsedSession.applicant_id : null
    applicantName.value = typeof parsedSession.name === 'string' ? parsedSession.name : null
    applicantNric.value = typeof parsedSession.nric === 'string' ? parsedSession.nric : null
  } catch {
    window.sessionStorage.removeItem(STORAGE_KEY)
    applicantId.value = null
    applicantName.value = null
    applicantNric.value = null
  }
}

function login(id: number, name: string, nric: string | null = null) {
  const newNric = nric ? nric.trim().toUpperCase() : null

  // If a different user previously used this browser, wipe their cached application state
  if (typeof window !== 'undefined') {
    try {
      const prev = window.localStorage.getItem(APPLICATION_STORAGE_KEY)
      if (prev) {
        const parsed = JSON.parse(prev)
        const prevNric = typeof parsed?.form?.nric === 'string'
          ? parsed.form.nric.trim().toUpperCase()
          : null
        if (prevNric && prevNric !== newNric) {
          window.localStorage.removeItem(APPLICATION_STORAGE_KEY)
        }
      }
    } catch {
      window.localStorage.removeItem(APPLICATION_STORAGE_KEY)
    }
  }

  applicantId.value = id
  applicantName.value = name
  applicantNric.value = newNric

  if (typeof window !== 'undefined') {
    const session: StoredAuthSession = {
      applicant_id: id,
      name,
      nric: applicantNric.value,
    }

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  }
}

function logout() {
  applicantId.value = null
  applicantName.value = null
  applicantNric.value = null

  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(STORAGE_KEY)
    window.localStorage.removeItem(APPLICATION_STORAGE_KEY)
  }
}

function setSessionNric(nric: string | null) {
  applicantNric.value = nric ? nric.trim().toUpperCase() : null
}

export function useAuth(): {
  applicantId: Ref<number | null>
  applicantName: Ref<string | null>
  applicantNric: Ref<string | null>
  isLoggedIn: ComputedRef<boolean>
  login: (id: number, name: string, nric?: string | null) => void
  logout: () => void
  restoreSession: () => void
  setSessionNric: (nric: string | null) => void
} {
  return {
    applicantId,
    applicantName,
    applicantNric,
    isLoggedIn,
    login,
    logout,
    restoreSession,
    setSessionNric,
  }
}
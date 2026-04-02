import { computed, ref, type ComputedRef, type Ref } from 'vue'

const STORAGE_KEY = 'hdb-flat-portal-auth'

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

  const rawSession = window.localStorage.getItem(STORAGE_KEY)
  if (!rawSession) {
    return
  }

  try {
    const parsedSession = JSON.parse(rawSession) as Partial<StoredAuthSession>
    applicantId.value = typeof parsedSession.applicant_id === 'number' ? parsedSession.applicant_id : null
    applicantName.value = typeof parsedSession.name === 'string' ? parsedSession.name : null
    applicantNric.value = typeof parsedSession.nric === 'string' ? parsedSession.nric : null
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    applicantId.value = null
    applicantName.value = null
    applicantNric.value = null
  }
}

function login(id: number, name: string, nric: string | null = null) {
  applicantId.value = id
  applicantName.value = name
  applicantNric.value = nric ? nric.trim().toUpperCase() : null

  if (typeof window !== 'undefined') {
    const session: StoredAuthSession = {
      applicant_id: id,
      name,
      nric: applicantNric.value,
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  }
}

function logout() {
  applicantId.value = null
  applicantName.value = null
  applicantNric.value = null

  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY)
    window.location.assign('/login')
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

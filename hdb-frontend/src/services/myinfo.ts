import type { MyInfoPersona } from '@/data/myinfoPersonas'

const SINGPASS_API_URL = import.meta.env.VITE_SINGPASS_URL ?? 'http://localhost:5007'

interface SingpassLoginResponse {
  nric: string
  name: string
}

export async function singpassLogin(nric: string): Promise<{ name: string } | null> {
  const response = await fetch(`${SINGPASS_API_URL}/singpass/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nric,
    }),
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error('Unable to sign in with Singpass right now.')
  }

  const payload = (await response.json()) as SingpassLoginResponse
  return { name: payload.name }
}

export async function getMyInfoProfile(nric: string): Promise<MyInfoPersona | null> {
  const response = await fetch(
    `${SINGPASS_API_URL}/singpass/profile?nric=${encodeURIComponent(nric.trim().toUpperCase())}`,
  )

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error('Unable to retrieve MyInfo data right now.')
  }

  return (await response.json()) as MyInfoPersona
}

export function mapMaritalStatus(code: string | undefined): string {
  const map: Record<string, string> = {
    '1': 'Single',
    '2': 'Married',
    '3': 'Widowed',
    '4': 'Separated',
    '5': 'Divorced',
    '6': 'Single',
    '9': 'Single',
  }
  return map[code ?? ''] ?? ''
}

export function getCitizenshipStatusFromProfile(profile: MyInfoPersona): string {
  const residentialStatus = profile.residentialstatus?.desc?.trim().toUpperCase()
  if (residentialStatus?.includes('CITIZEN')) {
    return 'Citizen'
  }

  if (residentialStatus === 'PR' || residentialStatus?.includes('PERMANENT RESIDENT')) {
    return 'PR'
  }

  const nationality = profile.nationality?.desc?.trim().toUpperCase()
  if (nationality?.includes('SINGAPORE')) {
    return 'Citizen'
  }

  return 'Foreigner'
}

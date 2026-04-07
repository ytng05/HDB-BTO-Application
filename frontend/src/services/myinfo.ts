import type { MyInfoPersona } from '@/data/myinfoPersonas'
import { withRetry } from '@/utils/http'

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL ?? 'http://localhost:8000'
const SINGPASS_API_URL = import.meta.env.VITE_SINGPASS_URL ?? API_GATEWAY_URL
const SINGPASS_SESSIONS_ENABLED = (import.meta.env.VITE_SINGPASS_USE_SESSIONS ?? 'true').toLowerCase() === 'true'
const SESSION_CREDENTIALS: RequestCredentials = SINGPASS_SESSIONS_ENABLED ? 'include' : 'omit'
const SESSION_VALIDATION_TTL_MS = 15000
let lastSessionValidatedAt = 0
let lastSessionValidationResult = false
let inFlightSessionValidation: Promise<boolean> | null = null

export function getSingpassAuthLoginUrl(redirectPath = '/'): string {
  return `${SINGPASS_API_URL}/singpass/auth/login?redirect=${encodeURIComponent(redirectPath)}`
}

export async function singpassLogout(): Promise<void> {
  const response = await withRetry(() =>
    fetch(`${SINGPASS_API_URL}/singpass/logout`, {
      method: 'POST',
      credentials: 'include',
    }),
  )

  if (response.status === 400) {
    return
  }

  if (!response.ok) {
    throw new Error('Unable to sign out from Singpass right now.')
  }
}

export async function getMyInfoProfile(nric?: string): Promise<MyInfoPersona | null> {
  const formattedNric = nric?.trim().toUpperCase()
  const hasNric = Boolean(formattedNric)
  const endpoint = hasNric && formattedNric
    ? `${SINGPASS_API_URL}/singpass/profile?nric=${encodeURIComponent(formattedNric)}`
    : `${SINGPASS_API_URL}/singpass/profile`
  const response = await withRetry(() =>
    fetch(endpoint, {
      // Keep explicit NRIC lookups stateless so household-member retrieval does not get overridden by login session.
      credentials: hasNric ? 'omit' : SESSION_CREDENTIALS,
    }),
  )

  if (response.status === 404) {
    return null
  }

  if (!hasNric && response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw new Error('Unable to retrieve MyInfo data right now.')
  }

  const data = normalizeMyInfoProfile((await response.json()) as Record<string, unknown>)
  
  // STRICT format validation: no fallback
  if (!validateMyInfoFormat(data)) {
    throw new Error('MyInfo profile returned in unexpected format from wrapper.')
  }

  console.info('[MyInfo] Profile loaded', {
    nric: data.uinfin?.value,
    source: (data as Record<string, unknown>)._source,
    monthlyincome: data.monthlyincome?.value,
    noaAmount: data.noa?.amount?.value,
  })
  
  return data
}

function readNumericValue(field: unknown): number | null {
  if (field === undefined || field === null) {
    return null
  }

  if (typeof field === 'number') {
    return Number.isFinite(field) ? field : null
  }

  if (typeof field === 'string') {
    const normalised = field.replace(/,/g, '').replace(/[^0-9.\-]/g, '').trim()
    if (!normalised) {
      return null
    }

    const parsed = Number.parseFloat(normalised)
    return Number.isFinite(parsed) ? parsed : null
  }

  if (typeof field === 'object') {
    const record = field as Record<string, unknown>
    for (const key of ['value', 'amount', '$numberDecimal', '$numberDouble', '$numberInt']) {
      if (key in record) {
        const parsed = readNumericValue(record[key])
        if (parsed !== null) {
          return parsed
        }
      }
    }
  }

  return null
}

function readStringValue(field: unknown): string | undefined {
  if (typeof field === 'string') {
    return field
  }

  if (field && typeof field === 'object') {
    const value = (field as Record<string, unknown>).value
    if (typeof value === 'string') {
      return value
    }
  }

  return undefined
}

function readCodeDesc(field: unknown): { code?: string; desc?: string } {
  if (!field || typeof field !== 'object') {
    return {}
  }

  const record = field as Record<string, unknown>
  return {
    code: typeof record.code === 'string' ? record.code : undefined,
    desc: typeof record.desc === 'string' ? record.desc : undefined,
  }
}

function normalizePhone(field: unknown): MyInfoPersona['mobileno'] {
  if (!field || typeof field !== 'object') {
    return undefined
  }

  const phone = field as Record<string, unknown>
  const maybeNbr = readStringValue(phone.nbr)
  const maybeDirect = readStringValue(phone.value)
  const nbr = maybeNbr || maybeDirect

  if (!nbr) {
    return undefined
  }

  const areaRaw = readStringValue(phone.areacode)
  const area = areaRaw ? areaRaw.replace(/^\+/, '') : '65'

  return {
    areacode: { value: area },
    prefix: { value: '+' },
    nbr: { value: nbr },
  }
}

function normalizeMyInfoProfile(raw: Record<string, unknown>): MyInfoPersona {
  const name = readStringValue(raw.name)
  const uinfin = readStringValue(raw.uinfin)
  const dob = readStringValue(raw.dob) || readStringValue(raw.dateofbirth)
  const email = readStringValue(raw.email) || readStringValue(raw.emailaddress)

  const maritalFromLegacy = readCodeDesc(raw.marital)
  const maritalFromV3 = readCodeDesc(raw.maritalstatus)
  const marital = {
    code: maritalFromLegacy.code || maritalFromV3.code,
    desc: maritalFromLegacy.desc || maritalFromV3.desc,
  }

  const normalized: MyInfoPersona = {
    ...(raw as MyInfoPersona),
    name: name ? { value: name } : undefined,
    uinfin: uinfin ? { value: uinfin } : undefined,
    dob: dob ? { value: dob } : undefined,
    email: email ? { value: email } : undefined,
    marital,
    mobileno: normalizePhone(raw.mobileno),
  }

  return normalized
}

export function getMonthlyIncomeFromProfile(profile: MyInfoPersona): string {
  const directMonthly =
    readNumericValue(profile.monthlyincome) ??
    readNumericValue(profile.average_monthly_income)

  if (directMonthly !== null) {
    return directMonthly.toFixed(2)
  }

  const annualIncome =
    readNumericValue(profile.noa?.amount) ??
    readNumericValue(profile.noa?.employment)

  if (annualIncome !== null) {
    return (annualIncome / 12).toFixed(2)
  }

  return ''
}

export function validateMyInfoFormat(profile: unknown): boolean {
  // Check profile is an object
  if (!profile || typeof profile !== 'object') {
    console.error('Profile is not an object:', typeof profile)
    return false
  }

  const p = profile as Record<string, unknown>

  // Required fields must exist and be properly formatted
  if (!p.uinfin || typeof p.uinfin !== 'object') {
    console.error('Missing or invalid uinfin field:', p.uinfin)
    return false
  }

  const uinfin = p.uinfin as Record<string, unknown>
  if (!uinfin.value || typeof uinfin.value !== 'string' || !uinfin.value.trim()) {
    console.error('uinfin.value is not a valid string:', uinfin.value)
    return false
  }

  if (!p.name || typeof p.name !== 'object') {
    console.error('Missing or invalid name field:', p.name)
    return false
  }

  const name = p.name as Record<string, unknown>
  if (!name.value || typeof name.value !== 'string' || !name.value.trim()) {
    console.error('name.value is not a valid string:', name.value)
    return false
  }

  return true
}

export async function validateSession(): Promise<boolean> {
  const now = Date.now()
  if (now - lastSessionValidatedAt < SESSION_VALIDATION_TTL_MS) {
    return lastSessionValidationResult
  }

  if (inFlightSessionValidation) {
    return inFlightSessionValidation
  }

  inFlightSessionValidation = (async () => {
    try {
      const profile = await getMyInfoProfile()
      lastSessionValidationResult = profile !== null
      return lastSessionValidationResult
    } catch {
      lastSessionValidationResult = false
      return false
    } finally {
      lastSessionValidatedAt = Date.now()
      inFlightSessionValidation = null
    }
  })()

  return inFlightSessionValidation
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
  const residentialCode = profile.residentialstatus?.code?.trim().toUpperCase()
  const residentialStatus = profile.residentialstatus?.desc?.trim().toUpperCase()
  if (residentialStatus?.includes('CITIZEN')) {
    return 'Citizen'
  }

  if (
    residentialCode === 'P' ||
    residentialCode === 'PR' ||
    residentialStatus === 'PR' ||
    residentialStatus?.includes('PERMANENT RESIDENT')
  ) {
    return 'PR'
  }

  const nationality = profile.nationality?.desc?.trim().toUpperCase()
  if (nationality?.includes('SINGAPORE')) {
    return 'Citizen'
  }

  return 'Foreigner'
}

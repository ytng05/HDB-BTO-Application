/**
 * MyInfo service — mock implementation.
 *
 * In dev/demo mode, resolves personas from the local mockpass dataset.
 * When the real SingPass integration is ready, replace the function bodies
 * with HTTP calls to your backend's MyInfo proxy — the exported interface
 * stays the same so nothing else in the app needs to change.
 */
import { myinfoPersonas, type MyInfoPersona } from '@/data/myinfoPersonas'

/**
 * Simulate a SingPass login — returns only the name, as a real SingPass
 * auth callback does. Returns null if the NRIC is not in the mock dataset.
 */
export async function singpassLogin(nric: string): Promise<{ name: string } | null> {
  const persona = await getMyInfoProfile(nric)
  if (!persona) return null
  return { name: persona.name.value }
}

/**
 * Retrieve the full MyInfo profile for an authenticated user.
 * This is a separate, consent-gated step — not part of login.
 *
 * Replace with: GET /myinfo/person?nric=... (proxied through your backend)
 */
export async function getMyInfoProfile(nric: string): Promise<MyInfoPersona | null> {
  const upper = nric.trim().toUpperCase()
  return (myinfoPersonas[upper] as MyInfoPersona) ?? null
}

/** Maps MyInfo marital status codes to display labels */
export function mapMaritalStatus(code: string | undefined): string {
  const map: Record<string, string> = {
    '1': 'Single',
    '2': 'Married',
    '3': 'Widowed',
    '4': 'Separated',
    '5': 'Divorced',
    '6': 'Single', // Void Marriage → treat as Single for HDB purposes
    '9': 'Single', // Others
  }
  return map[code ?? ''] ?? ''
}

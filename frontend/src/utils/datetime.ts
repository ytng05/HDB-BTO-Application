export function parseApiDateTime(value: string | null | undefined): Date | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  const direct = new Date(trimmed)
  if (!Number.isNaN(direct.getTime())) {
    // When timezone is missing, browsers interpret as local time. Backend payloads
    // are UTC-based, so coerce these into UTC for consistent SGT rendering.
    const hasExplicitZone = /(?:Z|[+\-]\d{2}:?\d{2})$/i.test(trimmed)
    if (!hasExplicitZone && /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(trimmed)) {
      const utcCandidate = new Date(trimmed.replace(' ', 'T') + 'Z')
      if (!Number.isNaN(utcCandidate.getTime())) {
        return utcCandidate
      }
    }
    return direct
  }

  // Normalize common API variants: space separator, 6-digit microseconds, and +0000 offsets.
  let normalized = trimmed.replace(' ', 'T')
  normalized = normalized.replace(/\.(\d{3})\d+(Z|[+\-]\d{2}:?\d{2})$/, '.$1$2')
  normalized = normalized.replace(/([+\-]\d{2})(\d{2})$/, '$1:$2')

  const parsed = new Date(normalized)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed
}

const SINGAPORE_TIME_ZONE = 'Asia/Singapore'

export function formatApiDate(value: string | null | undefined, fallback = 'N/A'): string {
  const parsed = parseApiDateTime(value)
  if (!parsed) {
    return typeof value === 'string' && value.trim() ? value : fallback
  }

  return new Intl.DateTimeFormat('en-SG', {
    timeZone: SINGAPORE_TIME_ZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(parsed)
}

export function formatApiDateTime(value: string | null | undefined, fallback = 'N/A'): string {
  const parsed = parseApiDateTime(value)
  if (!parsed) {
    return typeof value === 'string' && value.trim() ? value : fallback
  }

  return new Intl.DateTimeFormat('en-SG', {
    timeZone: SINGAPORE_TIME_ZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(parsed)
}

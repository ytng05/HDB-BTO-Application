export function looksLikeNric(value: string): boolean {
  return /^[STFG]\d{7}[A-Z]$/i.test(value.trim())
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  initialDelayMs = 150,
): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (attempt === maxAttempts) {
        break
      }

      const delay = initialDelayMs * Math.pow(2, attempt - 1)
      await new Promise((resolve) => window.setTimeout(resolve, delay))
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Request failed after retries.')
}

export interface RetryOptions {
  maxRetries: number;
  baseDelayMs?: number;
}

/**
 * Retries an async operation with exponential backoff.
 * Throws the last encountered error if all attempts are exhausted.
 */
export async function withRetry<T>(operation: () => Promise<T>, options: RetryOptions): Promise<T> {
  const { maxRetries, baseDelayMs = 500 } = options;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err as Error;
      if (attempt === maxRetries) break;
      const delay = baseDelayMs * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

import { ApiRequestError } from "@/lib/api"

/** First server validation message for a field; use for inline `FormField` (not toasts). */
export function firstFieldError(err: unknown, field: string): string | undefined {
  if (err instanceof ApiRequestError) {
    return err.errors?.[field]?.[0]
  }
  return undefined
}

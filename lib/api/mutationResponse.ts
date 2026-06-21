import type { ApiSuccessResponse } from "./api.types"
import { requireApiEnvelopeData } from "./parseApiResponse"

/**
 * Extract mutation payload from a parsed Laravel success envelope.
 * Use after apiExecutor/useAction — never check HTTP status === 200 in features.
 */
export function extractMutationResult<T>(
  response: ApiSuccessResponse<T> | unknown,
  httpStatus = 200
): { data: T; message: string; status: number; code?: string } {
  return requireApiEnvelopeData<T>(response, httpStatus)
}

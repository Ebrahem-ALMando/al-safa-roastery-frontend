import type { OperationalDateScopePageId } from "./operational-date-scope.types"

export function getOperationalDateScopeStorageKey(pageId: OperationalDateScopePageId): string {
  return `lab.${pageId}.date_scope`
}

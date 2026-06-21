"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import type { ActionStatus } from "@/lib/actions/action.types"
import type { ApiError } from "@/lib/api/api.types"

export interface ActionToastState {
  id: string
  status: ActionStatus
  error: ApiError | null
  successMessage?: string
}

interface ActionToastContextValue {
  actions: ActionToastState[]
  reportAction: (action: ActionToastState) => void
  clearAction: (id: string) => void
}

const ActionToastContext = createContext<ActionToastContextValue | undefined>(
  undefined
)

export function ActionToastProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<ActionToastState[]>([])

  const reportAction = useCallback((action: ActionToastState) => {
    setActions((prev) => {
      const existingIndex = prev.findIndex((a) => a.id === action.id)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = action
        return updated
      }
      return [...prev, action]
    })
  }, [])

  const clearAction = useCallback((id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id))
  }, [])

  return (
    <ActionToastContext.Provider
      value={{ actions, reportAction, clearAction }}
    >
      {children}
    </ActionToastContext.Provider>
  )
}

export function useActionToast() {
  const context = useContext(ActionToastContext)
  if (!context) {
    return {
      actions: [] as ActionToastState[],
      reportAction: () => {},
      clearAction: () => {},
    }
  }
  return context
}

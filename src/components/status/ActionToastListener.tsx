"use client"

import { useEffect, useRef } from "react"
import { toast } from "@/components/ui/custom-toast-with-icons"
import { useActionToast, type ActionToastState } from "./ActionToastContext"
import type { ApiError } from "@/lib/api/api.types"

/**
 * 4xx (incl. 422) — no error toast; inline/field errors only.
 * 5xx and network (0) — show error toast with mapped `error.message`.
 */
function shouldShowErrorToast(error: ApiError | null): boolean {
  if (!error) return false
  const status = error.status
  if (status >= 400 && status < 500) {
    return false
  }
  return status >= 500 || status === 0
}

function getErrorMessage(error: ApiError | null): string {
  if (!error) return "حدث خطأ غير متوقع"
  if (error.message) return error.message
  if (error.status === 0) {
    return "فشل الاتصال بالشبكة. يرجى المحاولة لاحقاً"
  }
  if (error.status >= 500) {
    return "حدث خطأ في الخادم. يرجى المحاولة لاحقاً"
  }
  return "حدث خطأ غير متوقع"
}

export function ActionToastListener() {
  const { actions } = useActionToast()
  const shownToastsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    actions.forEach((action: ActionToastState) => {
      const toastId = `${action.id}-${action.status}`

      if (shownToastsRef.current.has(toastId)) {
        return
      }

      if (action.status === "queued") {
        shownToastsRef.current.add(toastId)
        toast({
          title: "قيد الانتظار",
          description: "سيتم تنفيذ العملية عند توفر الاتصال",
          variant: "info",
        })
        return
      }

      if (action.status === "success") {
        if (action.successMessage) {
          shownToastsRef.current.add(toastId)
          toast({
            title: "نجاح",
            description: action.successMessage,
            variant: "success",
          })
        }
        return
      }

      if (action.status === "failed" && action.error) {
        if (shouldShowErrorToast(action.error)) {
          shownToastsRef.current.add(toastId)
          const errorMessage = getErrorMessage(action.error)
          toast({
            title: "خطأ",
            description: errorMessage,
            variant: "error",
          })
        }
        return
      }
    })

    if (shownToastsRef.current.size > 50) {
      const idsArray = Array.from(shownToastsRef.current)
      shownToastsRef.current = new Set(idsArray.slice(-50))
    }
  }, [actions])

  return null
}

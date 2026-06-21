"use client"

import * as React from "react"
import { ToastProvider, ToastViewport, useToast, CustomToast } from "@/components/ui/custom-toast-with-icons"

function ToasterInner() {
  const { toasts } = useToast()

  return (
    <>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <CustomToast
            key={id}
            title={title}
            description={description}
            variant={variant}
            {...props}
          />
        )
      })}
      <ToastViewport />
    </>
  )
}

/**
 * Radix toast host (MOD portal). Children render inside the same React tree as the viewport.
 */
export function CustomToaster({ children }: { children?: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <ToasterInner />
    </ToastProvider>
  )
}

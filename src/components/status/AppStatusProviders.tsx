"use client"

import * as React from "react"
import { CustomToaster } from "@/components/ui/custom-toaster"
import { ActionToastListener } from "./ActionToastListener"
import { ActionToastProvider } from "./ActionToastContext"

/**
 * App-wide: Radix `toast` host + action observation (MOD portal pattern).
 */
export function AppStatusProviders({ children }: { children: React.ReactNode }) {
  return (
    <CustomToaster>
      <ActionToastProvider>
        <ActionToastListener />
        {children}
      </ActionToastProvider>
    </CustomToaster>
  )
}

"use client"

import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { NewOrderPageContent } from "./new-order-page-content"

function NewOrderPageFallback() {
  return (
    <div className="space-y-6 p-1" dir="rtl" lang="ar">
      <div className="flex gap-3">
        <Skeleton className="size-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    </div>
  )
}

export default function NewOrderPage() {
  return (
    <React.Suspense fallback={<NewOrderPageFallback />}>
      <NewOrderPageContent />
    </React.Suspense>
  )
}

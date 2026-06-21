"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * تخطيط رأس صفحة القائمة في لوحة التحكم — عمود للعنوان + عمود للإجراءات.
 * لا يفرض محتوى العنوان؛ مرِّر JSX كما هي للحفاظ على الهوية البصرية.
 */
function DashboardPageHeaderRoot({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-3",
        className
      )}
    >
      {children}
    </div>
  )
}

/** عمود العنوان — يتقلص أفقياً (`min-w-0`) حتى لا يدفع شريط الإجراءات إلى لفّ داخلي على سطرين */
function DashboardPageHeaderLead({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={cn("min-w-0 flex-1", className)}>{children}</div>
}

/**
 * شريط إجراءات موحّد على سطر واحد (مثل صفحة المرضى). عند ضيق العرض: تمرير أفقي خفيف بدل كسر السطر.
 * ترتيب مقترح (RTL): نطاق التاريخ التشغيلي → إجراء أساسي → تخصيص → تصدير → تبديل العرض.
 */
function DashboardPageHeaderActions({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-nowrap items-center gap-2 overflow-x-auto overscroll-x-contain pb-0.5",
        className
      )}
    >
      {children}
    </div>
  )
}

export const DashboardPageHeader = Object.assign(DashboardPageHeaderRoot, {
  Lead: DashboardPageHeaderLead,
  Actions: DashboardPageHeaderActions,
})

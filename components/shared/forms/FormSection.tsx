"use client"

import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import {
  adminFormSectionClass,
  adminFormSectionTitleClass,
} from "./administrative-form-styles"

type FormSectionProps = {
  icon: LucideIcon
  title: string
  children: ReactNode
}

export function FormSection({ icon: Icon, title, children }: FormSectionProps) {
  return (
    <div className={adminFormSectionClass}>
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-primary" aria-hidden />
        <p className={adminFormSectionTitleClass}>{title}</p>
      </div>
      {children}
    </div>
  )
}

export function FormFieldIcon({ children }: { children: ReactNode }) {
  return (
    <span
      className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors peer-focus:text-primary"
      aria-hidden
    >
      {children}
    </span>
  )
}

export function FormTextareaIcon({ children }: { children: ReactNode }) {
  return (
    <span
      className="pointer-events-none absolute start-3 top-3 text-muted-foreground/60"
      aria-hidden
    >
      {children}
    </span>
  )
}

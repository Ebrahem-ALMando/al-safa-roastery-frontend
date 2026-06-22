"use client"

import { Mail, MapPin, Phone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { Supplier } from "@/features/suppliers"

function ContactBadge({
  icon: Icon,
  value,
  variant = "muted",
  dir,
}: {
  icon: React.ElementType
  value: string | null | undefined
  variant?: "phone" | "muted"
  dir?: "ltr"
}) {
  const display = value?.trim() || "—"
  return (
    <Badge
      variant="outline"
      className={
        variant === "phone"
          ? "max-w-[200px] justify-end gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
          : "max-w-[200px] justify-end gap-1.5 border-border/60 bg-background text-muted-foreground"
      }
    >
        <Icon className="size-3.5 shrink-0" />
      <span className="truncate" dir={dir}>
        {display}
      </span>
    
    </Badge>
  )
}

export function SupplierContactBadges({ supplier }: { supplier: Supplier }) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <ContactBadge icon={Phone} value={supplier.phone} variant="phone" dir="ltr" />
      <ContactBadge icon={Mail} value={supplier.email} />
      {supplier.address ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <ContactBadge icon={MapPin} value={supplier.address} />
            </span>
          </TooltipTrigger>
          <TooltipContent side="left" dir="rtl" className="max-w-xs text-right">
            {supplier.address}
          </TooltipContent>
        </Tooltip>
      ) : (
        <ContactBadge icon={MapPin} value={null} />
      )}
    </div>
  )
}

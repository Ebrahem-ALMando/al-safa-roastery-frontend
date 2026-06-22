"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Power,
  Trash2,
  Users,
  XCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  formatCustomerLastActivity,
  formatBalanceAmount,
  getBalanceBadgeClass,
  getBalanceStatusLabel,
  getCustomerTypeLabel,
  customerInitials,
  type Customer,
} from "@/features/customers"

function customerDetailsHref(id: number) {
  return `/dashboard/customers/${id}`
}

type CustomerCardProps = {
  customer: Customer
  onEdit?: (customer: Customer) => void
  onRequestDelete?: (customer: Customer) => void
  onToggleActive?: (customer: Customer) => void
}

export function CustomerCard({
  customer,
  onEdit,
  onRequestDelete,
  onToggleActive,
}: CustomerCardProps) {
  const router = useRouter()
  const isActive = customer.is_active
  const balanceInfo = getBalanceStatusLabel(customer.current_balance)
  const lastActivity = formatCustomerLastActivity(customer)

  const goToDetails = () => {
    router.push(customerDetailsHref(customer.id))
  }

  return (
    <TooltipProvider>
      <Card
        role="button"
        tabIndex={0}
        dir="rtl"
        className={`group relative flex min-w-0 flex-col justify-between overflow-hidden border-2 shadow-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${
          isActive
            ? "border-primary/30 bg-linear-to-br from-white via-primary/5 to-primary/10 dark:from-card dark:via-primary/15 dark:to-primary/20"
            : "border-red-600/50 bg-linear-to-br from-white via-red-50/60 to-red-100/30 dark:from-card dark:via-red-950/20 dark:to-red-900/10"
        }`}
        onClick={goToDetails}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            goToDetails()
          }
        }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-5 transition-opacity duration-500 group-hover:opacity-10">
          <div className="absolute -right-10 -top-10 h-20 w-20 rounded-full bg-linear-to-br from-primary/20 to-primary/30 blur-xl" />
          <div className="absolute -bottom-8 -left-8 h-16 w-16 rounded-full bg-linear-to-tr from-primary/20 to-primary/30 blur-lg" />
        </div>

        <div
          className={`absolute right-3 top-3 h-3 w-3 rounded-full animate-pulse ${
            isActive ? "bg-primary shadow-lg shadow-primary/50" : "bg-red-400 shadow-lg shadow-red-400/50"
          }`}
        />

        <CardHeader className="relative z-10 pb-3">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center justify-start gap-2.5">
              <Avatar className="h-12 w-12 shrink-0 ring-4 ring-primary/10 transition-all duration-300 group-hover:ring-primary/20">
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {customerInitials(customer.name) || <Users className="size-5" />}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-bold leading-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                  {customer.name}
                </p>
                {customer.contact_person ? (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {customer.contact_person}
                  </p>
                ) : null}
                {customer.code ? (
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground" dir="ltr">
                    {customer.code}
                  </p>
                ) : null}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={`px-2 py-0.5 text-[11px] font-medium transition-all duration-300 ${
                      isActive
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
                        : "border-red-600/40 bg-red-100 text-red-700"
                    }`}
                  >
                    {isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {isActive ? "فعال" : "موقوف"}
                  </Badge>
                  <Badge variant="outline" className="px-2 py-0.5 text-[11px] font-medium">
                    {getCustomerTypeLabel(customer.customer_type)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`px-2 py-0.5 text-[11px] font-medium ${getBalanceBadgeClass(balanceInfo.key)}`}
                  >
                    {balanceInfo.label}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 space-y-3">
          <div className="flex flex-col gap-1.5">
            <Badge
              variant="outline"
              className="max-w-full justify-end gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-800"
            >
              <span className="truncate" dir="ltr">
                {customer.phone || "—"}
              </span>
              <Phone className="h-3.5 w-3.5 shrink-0" />
            </Badge>
            <Badge variant="outline" className="max-w-full justify-end gap-1.5">
              <span className="truncate">{customer.email || "—"}</span>
              <Mail className="h-3.5 w-3.5 shrink-0" />
            </Badge>
            {customer.address ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="max-w-full cursor-default justify-end gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="max-w-[170px] truncate">{customer.address}</span>
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="left" dir="rtl" className="rounded-md text-right shadow-lg">
                  {customer.address}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Badge variant="outline" className="max-w-full justify-end gap-1.5">
                <span>—</span>
                <MapPin className="h-3.5 w-3.5 shrink-0" />
              </Badge>
            )}
          </div>

          <div>
            <p className="text-base font-semibold" dir="ltr">
              {formatBalanceAmount(customer.current_balance)}
            </p>
            <p className="text-xs text-muted-foreground">{balanceInfo.label}</p>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>{lastActivity.primary}</p>
            {lastActivity.secondary ? (
              <p className="mt-0.5 text-[11px]">{lastActivity.secondary}</p>
            ) : null}
          </div>

          <div className="flex items-center justify-between border-t border-border/60 pt-3">
            <span className="text-xs text-muted-foreground">آخر نشاط</span>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary transition-all duration-200 group-hover:scale-110 hover:bg-primary/10 hover:text-primary"
                    asChild
                  >
                    <Link
                      href={customerDetailsHref(customer.id)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Users className="h-3.5 w-3.5" />
                      <span className="sr-only">تفاصيل الزبون</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>تفاصيل الزبون</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary transition-all duration-200 group-hover:scale-110 hover:bg-primary/10 hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit?.(customer)
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="sr-only">تعديل</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>تعديل</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 transition-all duration-200 group-hover:scale-110 ${
                      isActive
                        ? "text-[#e4801a] hover:bg-[#e4801a]/10 hover:text-[#e4801a]"
                        : "text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleActive?.(customer)
                    }}
                  >
                    <Power className="h-3.5 w-3.5" />
                    <span className="sr-only">{isActive ? "إيقاف" : "تفعيل"}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isActive ? "إيقاف" : "تفعيل"}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 transition-all duration-200 group-hover:scale-110 hover:bg-red-50 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRequestDelete?.(customer)
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">حذف</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>حذف</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

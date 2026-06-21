"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Beaker, MoreHorizontal, Edit, Eye, Trash2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface TestCardData {
  id: string
  name: string
  code: string
  category: string
  icon?: LucideIcon
  prices?: string[]
  price: number
  unit: string
  referenceRange: string
  resultType: "number" | "select" | "text"
  isActive: boolean
}

interface TestCardProps {
  test: TestCardData
  index?: number
  onViewDetails?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export function TestCard({
  test,
  index = 0,
  onViewDetails,
  onEdit,
  onDelete,
}: TestCardProps) {
  const Icon = test.icon ?? Beaker
  const priceBadges = test.prices ?? []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{
        y: -4,
        scale: 1.015,
        transition: { duration: 0.2 },
      }}
    >
      <Card className="group relative overflow-hidden border-border/50 transition-shadow duration-200 hover:border-primary/30 hover:shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-base line-clamp-1">{test.name}</h3>
                <p className="text-xs font-mono text-muted-foreground">{test.code}</p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-lg opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={onViewDetails}>
                  <Eye className="size-4" />
                  عرض التفاصيل
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 cursor-pointer"
                  onClick={onEdit}
                >
                  <Edit className="size-4" />
                  تعديل
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                  onClick={onDelete}
                >
                  <Trash2 className="size-4" />
                  حذف
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pb-5">
          {/* Category */}
          <Badge variant="outline" className="rounded-lg w-fit">
            {test.category}
          </Badge>

          {/* Unit & Reference Range */}
          {test.unit && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">وحدة القياس</span>
              <span className="font-mono font-medium">{test.unit}</span>
            </div>
          )}

          {test.referenceRange && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">المعدل الطبيعي</span>
              <span className="font-mono font-medium">{test.referenceRange}</span>
            </div>
          )}

          {/* Prices & Status */}
          <div className="space-y-2 pt-3 border-t">
            <div className="flex flex-wrap items-center gap-1.5">
              {priceBadges.length ? (
                priceBadges.slice(0, 3).map((price) => (
                  <Badge key={`${test.id}-${price}`} variant="secondary" className="text-xs font-mono">
                    {price}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline" className="text-xs">—</Badge>
              )}
              {priceBadges.length > 3 ? (
                <Badge variant="outline" className="text-xs">+{priceBadges.length - 3}</Badge>
              ) : null}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-primary">أقل سعر: {test.price} ر.س</div>
            <Badge
              variant="outline"
              className={cn(
                "font-medium",
                test.isActive
                  ? "bg-success/10 text-success border-success/20"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {test.isActive ? "نشط" : "غير نشط"}
            </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

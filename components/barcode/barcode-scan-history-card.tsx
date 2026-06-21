"use client"

import * as React from "react"
import { History, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  BARCODE_SCAN_HISTORY_UPDATED_EVENT,
  clearBarcodeScanHistory,
  getBarcodeScanHistory,
  type BarcodeScanHistoryItem,
} from "@/lib/barcode-scan-history"

function formatHistoryTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  } catch {
    return iso
  }
}

function statusLabel(status: BarcodeScanHistoryItem["status"]) {
  return status === "success" ? "صالح" : "غير صالح"
}

function typeLabel(type: BarcodeScanHistoryItem["type"]) {
  if (type === "patient") return "مريض"
  if (type === "results") return "نتائج"
  if (type === "verify") return "تحقق تقرير"
  return "غير معروف"
}

function HistoryRow({ item }: { item: BarcodeScanHistoryItem }) {
  return (
    <div className="space-y-2 rounded-xl border border-border/60 bg-card/80 p-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-muted-foreground">القيمة</span>
        <span className="font-mono text-xs font-medium" dir="ltr">
          {item.rawValue}
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-muted-foreground">النوع</span>
        <span>{typeLabel(item.type)}</span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-muted-foreground">الحالة</span>
        <Badge
          variant={item.status === "success" ? "default" : "destructive"}
          className="rounded-lg"
        >
          {statusLabel(item.status)}
        </Badge>
      </div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <span className="shrink-0 text-muted-foreground">الرابط</span>
        <span
          className={cn(
            "break-all font-mono text-xs",
            item.route ? "text-foreground" : "text-muted-foreground"
          )}
          dir="ltr"
        >
          {item.route ?? "—"}
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-muted-foreground">الوقت</span>
        <span className="text-xs tabular-nums">{formatHistoryTime(item.createdAt)}</span>
      </div>
    </div>
  )
}

export function BarcodeScanHistoryCard() {
  const [history, setHistory] = React.useState<BarcodeScanHistoryItem[]>([])

  const refreshHistory = React.useCallback(() => {
    setHistory(getBarcodeScanHistory())
  }, [])

  React.useEffect(() => {
    refreshHistory()

    const onFocus = () => refreshHistory()
    const onUpdated = () => refreshHistory()

    window.addEventListener("focus", onFocus)
    window.addEventListener(BARCODE_SCAN_HISTORY_UPDATED_EVENT, onUpdated)

    return () => {
      window.removeEventListener("focus", onFocus)
      window.removeEventListener(BARCODE_SCAN_HISTORY_UPDATED_EVENT, onUpdated)
    }
  }, [refreshHistory])

  const handleClear = () => {
    clearBarcodeScanHistory()
    setHistory([])
  }

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm lg:col-span-2">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 text-right">
        <div className="min-w-0 space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="size-4 text-primary" />
            سجل آخر القراءات
          </CardTitle>
          <CardDescription>
            يعرض آخر عمليات قراءة الباركود المحفوظة محليًا على هذا الجهاز.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-2 rounded-xl"
          onClick={handleClear}
          disabled={history.length === 0}
        >
          <Trash2 className="size-4" />
          مسح السجل
        </Button>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">لا توجد قراءات مسجلة بعد.</p>
        ) : (
          <ScrollArea className="h-[min(420px,50vh)] pe-2">
            <div className="space-y-2">
              {history.map((item) => (
                <HistoryRow key={item.id} item={item} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

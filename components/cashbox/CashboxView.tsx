"use client";

import { DashboardPageHeader } from "@/components/dashboard";
import { ItemsPeriodControls } from "@/components/items/ItemsPeriodControls";
import { DateRangeDialog } from "@/components/shared/DateRangeDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  CASHBOX_MESSAGES,
  defaultCashboxPeriod,
  useCashboxPage,
  type CashboxTransaction,
} from "@/src/features/cashbox";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  LayoutGrid,
  RefreshCw,
  Settings2,
  Table,
} from "lucide-react";
import { useState } from "react";
import { CashboxColumnCustomizer } from "./CashboxColumnCustomizer";
import { CashboxDataView } from "./CashboxDataView";
import { CashboxFilters } from "./CashboxFilters";
import { CashboxManualTransactionDialog } from "./CashboxManualTransactionDialog";
import { CashboxSummary } from "./CashboxSummary";
import { CashboxTransactionDetailsDialog } from "./CashboxTransactionDetailsDialog";

export function CashboxView() {
  const page = useCashboxPage();
  const [manualDialog, setManualDialog] = useState<
    "deposit" | "withdrawal" | null
  >(null);
  const [selectedTransaction, setSelectedTransaction] =
    useState<CashboxTransaction | null>(null);
  const dialogDefault = defaultCashboxPeriod();
  const parsedBalance = Number(page.summary?.current_balance ?? 0);
  const currentBalance = Number.isFinite(parsedBalance) ? parsedBalance : 0;
  const filterValue = {
    search: page.search,
    direction: page.direction,
    sourceType: page.sourceType,
    paymentMethod: page.paymentMethod,
    transactionType: page.transactionType,
  };

  return (
    <div className="space-y-6" dir="rtl" lang="ar">
      <DashboardPageHeader>
        <DashboardPageHeader.Lead>
          <h1 className="flex items-center gap-2 text-md font-bold">
            الصندوق /{" "}
            <span className="font-normal text-muted-foreground">
              سجل تدقيق الحركات المالية
            </span>
          </h1>
        </DashboardPageHeader.Lead>
        <DashboardPageHeader.Actions>
          <Button
            type="button"
            className="gap-2 rounded-xl "
            onClick={() => setManualDialog("deposit")}
          >
            <ArrowDownToLine className="size-4" />
            إيداع يدوي
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2 rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
            onClick={() => setManualDialog("withdrawal")}
          >
            <ArrowUpFromLine className="size-4" />
            سحب يدوي
          </Button>
          <ItemsPeriodControls
            preset={page.periodPreset}
            onPresetChange={page.setPeriodPreset}
          />
          <CashboxColumnCustomizer
            visibleColumns={page.visibleColumns}
            onChange={page.setVisibleColumns}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-xl">
                <Settings2 className="size-4" />
                تخصيص الصفحة
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>خيارات العرض</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={page.config.showKPI}
                onCheckedChange={(value) => page.toggleShowKPI(Boolean(value))}
              >
                إظهار الإحصائيات
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={page.config.showFilters}
                onCheckedChange={(value) =>
                  page.toggleShowFilters(Boolean(value))
                }
              >
                إظهار الفلاتر
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex rounded-lg border p-1">
            <Button
              size="sm"
              variant={page.config.viewMode === "cards" ? "default" : "ghost"}
              className={cn(
                "gap-2",
                page.config.viewMode === "cards" && "bg-primary",
              )}
              onClick={() => page.setViewMode("cards")}
            >
              <LayoutGrid className="size-4" />
              بطاقات
            </Button>
            <Button
              size="sm"
              variant={page.config.viewMode === "table" ? "default" : "ghost"}
              className="gap-2"
              onClick={() => page.setViewMode("table")}
            >
              <Table className="size-4" />
              جدول
            </Button>
          </div>
        </DashboardPageHeader.Actions>
      </DashboardPageHeader>

      {page.config.showKPI ? (
        <CashboxSummary
          summary={page.summary}
          isLoading={page.summaryIsLoading}
          error={page.summaryError}
        />
      ) : null}
      {page.config.showFilters ? (
        <CashboxFilters
          value={filterValue}
          onChange={(next) => {
            page.setSearch(next.search);
            page.setDirection(next.direction);
            page.setSourceType(next.sourceType);
            page.setPaymentMethod(next.paymentMethod);
            page.setTransactionType(next.transactionType);
          }}
          onReset={page.resetFilters}
          isLoading={page.isLoading}
        />
      ) : null}
      {page.error && !page.isLoading ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <p className="text-sm text-destructive">
            {CASHBOX_MESSAGES.loadingError}
          </p>
          <Button
            variant="outline"
            onClick={() => void page.mutate()}
            className="gap-2"
          >
            <RefreshCw className="size-4" />
            إعادة المحاولة
          </Button>
        </div>
      ) : (
        <div
          className={
            page.config.viewMode === "table"
              ? "overflow-hidden rounded-xl border shadow-sm"
              : "overflow-hidden"
          }
        >
          <CashboxDataView
            viewMode={page.config.viewMode}
            transactions={page.transactions}
            meta={page.meta}
            visibleColumns={page.visibleColumns}
            isLoading={page.isLoading}
            page={page.page}
            onPageChange={page.setPage}
            onDetails={setSelectedTransaction}
          />
        </div>
      )}
      <DateRangeDialog
        open={page.customDialogOpen}
        onOpenChange={page.setCustomDialogOpen}
        from={page.customPeriod?.from ?? dialogDefault.from}
        to={page.customPeriod?.to ?? dialogDefault.to}
        onApply={page.applyCustomPeriod}
      />
      <CashboxManualTransactionDialog
        mode="deposit"
        open={manualDialog === "deposit"}
        onOpenChange={(open) => {
          if (!open) setManualDialog(null);
        }}
        currentBalance={currentBalance}
      />
      <CashboxManualTransactionDialog
        mode="withdrawal"
        open={manualDialog === "withdrawal"}
        onOpenChange={(open) => {
          if (!open) setManualDialog(null);
        }}
        currentBalance={currentBalance}
      />
      <CashboxTransactionDetailsDialog
        transactionId={selectedTransaction?.id ?? null}
        open={selectedTransaction !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedTransaction(null);
        }}
      />
    </div>
  );
}

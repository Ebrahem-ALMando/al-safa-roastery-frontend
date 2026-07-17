"use client";

import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Product } from "@/features/products";
import { cn } from "@/lib/utils";
import { CircleDollarSign, Eye, Pencil, Power, Tags, Trash2 } from "lucide-react";
import type { MouseEvent } from "react";

const itemClass =
  "flex w-full flex-row-reverse items-center justify-start gap-2 text-right focus:text-inherit";

type ProductRowActionsMenuContentProps = {
  product: Product;
  onViewDetails: () => void;
  onEdit: () => void;
  onViewPrices?: () => void;
  onManagePrices: () => void;
  onClearPrices?: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  stopPropagation?: boolean;
};

function stopIfNeeded(event: MouseEvent, stopPropagation: boolean) {
  if (stopPropagation) event.stopPropagation();
}

export function ProductRowActionsMenuContent({
  product,
  onViewDetails,
  onEdit,
  onViewPrices,
  onManagePrices,
  onClearPrices,
  onToggleActive,
  onDelete,
  stopPropagation = false,
}: ProductRowActionsMenuContentProps) {
  return (
    <DropdownMenuContent align="end" className="min-w-56 text-right">
      <DropdownMenuItem
        className={cn(itemClass, "text-sky-800 focus:bg-sky-50 focus:text-sky-900")}
        onClick={(event) => {
          stopIfNeeded(event, stopPropagation);
          onViewDetails();
        }}
      >
        <Eye className="size-4 text-sky-600" />
        عرض التفاصيل
      </DropdownMenuItem>
      <DropdownMenuItem
        className={cn(itemClass, "text-sky-800 focus:bg-sky-50 focus:text-sky-900")}
        onClick={(event) => {
          stopIfNeeded(event, stopPropagation);
          onEdit();
        }}
      >
        <Pencil className="size-4 text-sky-600" />
        تعديل
      </DropdownMenuItem>
      <DropdownMenuItem
        className={cn(itemClass, "text-emerald-800 focus:bg-emerald-50 focus:text-emerald-900")}
        disabled={!onViewPrices}
        onClick={(event) => {
          stopIfNeeded(event, stopPropagation);
          onViewPrices?.();
        }}
      >
        <Eye className="size-4 text-emerald-600" />
        عرض الأسعار
      </DropdownMenuItem>
      <DropdownMenuItem
        className={cn(itemClass, "text-violet-800 focus:bg-violet-50 focus:text-violet-900")}
        onClick={(event) => {
          stopIfNeeded(event, stopPropagation);
          onManagePrices();
        }}
      >
        <CircleDollarSign className="size-4 text-violet-600" />
        إدارة الأسعار
      </DropdownMenuItem>
      <DropdownMenuItem
        className={cn(itemClass, "text-amber-800 focus:bg-amber-50 focus:text-amber-900")}
        disabled={!onClearPrices}
        onClick={(event) => {
          stopIfNeeded(event, stopPropagation);
          onClearPrices?.();
        }}
      >
        <Tags className="size-4 text-amber-600" />
        حذف التسعيرات
      </DropdownMenuItem>
      <DropdownMenuItem
        className={cn(
          itemClass,
          product.is_active
            ? "text-orange-800 focus:bg-orange-50 focus:text-orange-900"
            : "text-emerald-800 focus:bg-emerald-50 focus:text-emerald-900",
        )}
        onClick={(event) => {
          stopIfNeeded(event, stopPropagation);
          onToggleActive();
        }}
      >
        <Power className={cn("size-4", product.is_active ? "text-orange-600" : "text-emerald-600")} />
        {product.is_active ? "إيقاف" : "تفعيل"}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        variant="destructive"
        className={cn(itemClass, "text-rose-700 focus:bg-rose-50 focus:text-rose-800")}
        onClick={(event) => {
          stopIfNeeded(event, stopPropagation);
          onDelete();
        }}
      >
        <Trash2 className="size-4 text-rose-600" />
        حذف
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}

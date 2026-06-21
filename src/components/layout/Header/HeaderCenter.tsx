"use client"

import Image from "next/image"
import { LAB_LOGO_PATH } from "@/lib/lab-brand"

export function HeaderCenter() {
  return (
    <div className="hidden flex-1 items-center justify-center px-3 sm:flex">
      <div className="flex items-center gap-2.5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-white shadow-sm dark:bg-white">
          <Image
            src={LAB_LOGO_PATH}
            alt=""
            width={45}
            height={45}
            className="object-contain "
            priority
          />
        </div>
        <div className="text-center leading-tight">
          <p className="text-sm md:text-base font-bold text-foreground">مختبر التحاليل الطبية</p>
          <p className="text-[11px] md:text-xs text-muted-foreground">نظام إدارة المختبرات</p>
        </div>
      </div>
    </div>
  )
}

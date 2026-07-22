"use client"

import { BrandLogo } from "@/components/branding/BrandLogo"
import { BRAND_NAME_AR, BRAND_TAGLINE_AR } from "@/lib/brand"

export function HeaderCenter() {
  return (
    <div className="hidden flex-1 items-center justify-center px-2 sm:flex md:px-3">
      <div className="flex items-center gap-3 md:gap-3.5">
        <BrandLogo variant="header" priority />
        <div className="text-center leading-tight">
          <p className="text-sm font-bold text-foreground md:text-base lg:text-[17px]">
            {BRAND_NAME_AR}
          </p>
          <p className="text-[11px] text-muted-foreground md:text-xs">{BRAND_TAGLINE_AR}</p>
        </div>
      </div>
    </div>
  )
}

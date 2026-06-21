"use client"

import * as React from "react"
import { ChevronDown, FileIcon, ImageIcon, FileTextIcon, Download, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export interface Attachment {
  id: string
  name: string
  url: string
  type: string
  uploadDate: string
}

interface AttachmentsViewerProps {
  attachments: Attachment[]
  testName?: string
  className?: string
  defaultOpen?: boolean
}

export function AttachmentsViewer({
  attachments,
  testName,
  className,
  defaultOpen = false,
}: AttachmentsViewerProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  const [previewImage, setPreviewImage] = React.useState<string | null>(null)

  if (attachments.length === 0) return null

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return <ImageIcon className="size-4" />
    }
    if (type === "application/pdf") {
      return <FileTextIcon className="size-4" />
    }
    return <FileIcon className="size-4" />
  }

  const isImage = (type: string) => type.startsWith("image/")

  return (
    <>
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className={cn("rounded-lg border border-primary/20 bg-muted/30", className)}
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-2 transition-colors hover:bg-muted/50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              المرفقات ({attachments.length})
            </span>
            {testName && (
              <Badge variant="secondary" className="text-xs">
                {testName}
              </Badge>
            )}
          </div>
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </CollapsibleTrigger>

        <CollapsibleContent className="border-t border-primary/10">
          <div className="space-y-2 p-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-3 rounded-lg bg-background p-2 transition-colors hover:bg-muted/50"
              >
                {/* Icon/Thumbnail */}
                <div className="shrink-0">
                  {isImage(attachment.type) ? (
                    <div className="relative size-10 overflow-hidden rounded-md bg-muted">
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="size-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                      {getFileIcon(attachment.type)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {attachment.name}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {attachment.type.split("/")[1]?.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(attachment.uploadDate).toLocaleDateString("ar-SA")}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 gap-1">
                  {isImage(attachment.type) && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8 rounded-lg"
                      onClick={() => setPreviewImage(attachment.url)}
                    >
                      <Eye className="size-4" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 rounded-lg"
                    onClick={() => window.open(attachment.url, "_blank")}
                  >
                    <Download className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>معاينة الصورة</DialogTitle>
            <DialogDescription>عرض الصورة بحجم كامل</DialogDescription>
          </DialogHeader>
          <div className="relative">
            {previewImage && (
              <img
                src={previewImage}
                alt="Preview"
                className="max-h-[70vh] w-full rounded-lg object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

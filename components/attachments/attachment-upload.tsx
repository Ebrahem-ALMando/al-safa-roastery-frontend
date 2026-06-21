"use client"

import * as React from "react"
import { Upload, X, FileIcon, ImageIcon, FileTextIcon, Loader2, Eye, Download, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export interface Attachment {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadDate: string
}

interface AttachmentUploadProps {
  attachments?: Attachment[]
  onUpload?: (files: File[]) => void
  onDelete?: (id: string) => void
  maxSize?: number // in MB
  allowedTypes?: string[]
  className?: string
}

export function AttachmentUpload({
  attachments = [],
  onUpload,
  onDelete,
  maxSize = 5,
  allowedTypes = ["image/jpeg", "image/png", "application/pdf"],
  className,
}: AttachmentUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [previewImage, setPreviewImage] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }

  const handleFiles = async (files: File[]) => {
    // Validate files
    const validFiles = files.filter((file) => {
      if (!allowedTypes.includes(file.type)) {
        alert(`نوع الملف ${file.name} غير مدعوم`)
        return false
      }
      if (file.size > maxSize * 1024 * 1024) {
        alert(`حجم الملف ${file.name} أكبر من ${maxSize} ميجابايت`)
        return false
      }
      return true
    })

    if (validFiles.length > 0 && onUpload) {
      setUploading(true)
      await onUpload(validFiles)
      setUploading(false)
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return <ImageIcon className="size-5" />
    }
    if (type === "application/pdf") {
      return <FileTextIcon className="size-5" />
    }
    return <FileIcon className="size-5" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} بايت`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} كيلوبايت`
    return `${(bytes / (1024 * 1024)).toFixed(1)} ميجابايت`
  }

  const isImage = (type: string) => type.startsWith("image/")

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary hover:bg-muted/50"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(",")}
          onChange={handleFileSelect}
          className="hidden"
        />
        <div
          className="flex flex-col items-center justify-center gap-3 p-8"
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="size-10 animate-spin text-primary" />
              <p className="text-sm font-medium text-primary">جاري رفع الملفات...</p>
            </>
          ) : (
            <>
              <div className="rounded-full bg-primary/10 p-4">
                <Upload className="size-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  اسحب الملفات هنا أو انقر للتحميل
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  الحد الأقصى: {maxSize} ميجابايت • الأنواع المدعومة: صور، PDF
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            المرفقات ({attachments.length})
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {attachments.map((attachment) => (
              <Card
                key={attachment.id}
                className="group relative overflow-hidden p-3 transition-all hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  {/* Icon/Thumbnail */}
                  <div className="shrink-0">
                    {isImage(attachment.type) ? (
                      <div className="relative size-12 overflow-hidden rounded-lg bg-muted">
                        <img
                          src={attachment.url}
                          alt={attachment.name}
                          className="size-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {getFileIcon(attachment.type)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {attachment.name}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {attachment.type.split("/")[1]?.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.size)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(attachment.uploadDate).toLocaleDateString("ar-SA")}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
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
                    {onDelete && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onDelete(attachment.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

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
    </div>
  )
}

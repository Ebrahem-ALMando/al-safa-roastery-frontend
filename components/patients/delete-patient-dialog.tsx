"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import type { Patient } from "@/features/patients"

type DeletePatientDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: Patient | null
  onDelete: (id: number) => Promise<void>
}

export function DeletePatientDialog({ open, onOpenChange, patient, onDelete }: DeletePatientDialogProps) {
  const [deleting, setDeleting] = React.useState(false)

  React.useEffect(() => {
    if (!open) setDeleting(false)
  }, [open])

  const handleOpenChange = (next: boolean) => {
    if (deleting) return
    onOpenChange(next)
  }

  async function handleConfirm() {
    if (!patient) return
    setDeleting(true)
    try {
      await onDelete(patient.id)
      onOpenChange(false)
    } catch {
      // toasts from useAction on failure; keep dialog open
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="rounded-2xl text-right" dir="rtl" lang="ar">
        <AlertDialogHeader>
          <AlertDialogTitle>هل أنت متأكد من حذف هذا المريض؟</AlertDialogTitle>
          <AlertDialogDescription className="text-start">
            لا يمكن التراجع عن هذا الإجراء.
            {patient ? (
              <span className="mt-2 block text-foreground/90">«{patient.full_name}»</span>
            ) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-start sm:space-x-2 sm:space-x-reverse">
          <AlertDialogCancel className="rounded-xl" disabled={deleting} type="button">
            إلغاء
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            className="rounded-xl"
            onClick={() => void handleConfirm()}
            disabled={!patient || deleting}
            aria-busy={deleting}
          >
            {deleting ? <Loader2 className="me-1 size-4 animate-spin" /> : null}
            حذف
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

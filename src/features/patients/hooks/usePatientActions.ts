"use client"

import { useCallback } from "react"
import { useSWRConfig } from "swr"
import { useAction } from "@/lib/hooks/useAction"
import { useActionToast } from "@/src/components/status"
import { ApiRequestError } from "@/lib/api"
import type { LaravelSuccessResponse } from "@/lib/api"
import type { CreatePatientInput, Patient, UpdatePatientInput } from "../types/patient.types"

function isPatientsListKey(k: unknown): boolean {
  if (typeof k === "string") {
    return k.startsWith("patients:")
  }
  if (Array.isArray(k) && k.length > 0 && typeof k[0] === "string") {
    return (k[0] as string).startsWith("patients:")
  }
  return false
}

function isPatientDetailKeyForId(k: unknown, id: number): boolean {
  const prefix = `patient:${id}`
  if (typeof k === "string") {
    return k === prefix
  }
  if (Array.isArray(k) && k.length > 0 && typeof k[0] === "string") {
    return k[0] === prefix
  }
  return false
}

export function usePatientActions() {
  const { execute } = useAction()
  const { reportAction } = useActionToast()
  const { mutate: mutateGlobal } = useSWRConfig()

  const invalidateList = useCallback(() => {
    return mutateGlobal((key) => isPatientsListKey(key), undefined, {
      revalidate: true,
    })
  }, [mutateGlobal])

  const revalidateDetail = useCallback(
    (id: number) => {
      return mutateGlobal(
        (key) => isPatientDetailKeyForId(key, id),
        undefined,
        { revalidate: true }
      )
    },
    [mutateGlobal]
  )

  const createPatient = useCallback(
    async (payload: CreatePatientInput) => {
      const actionId = crypto.randomUUID()
      console.log("FINAL PAYLOAD", payload)
      const res = await execute<LaravelSuccessResponse<Patient>>({
        id: actionId,
        endpoint: "patients",
        method: "POST",
        payload,
        notify: false,
      })
      if (!res?.data) {
        throw new ApiRequestError("استجابة غير صالحة", 500)
      }
      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: res.message,
      })
      await invalidateList()
      return res.data
    },
    [execute, reportAction, invalidateList]
  )

  const updatePatient = useCallback(
    async (id: number, payload: UpdatePatientInput) => {
      const actionId = crypto.randomUUID()
      const res = await execute<LaravelSuccessResponse<Patient>>({
        id: actionId,
        endpoint: `patients/${id}`,
        method: "PUT",
        payload,
        notify: false,
      })
      if (!res?.data) {
        throw new ApiRequestError("استجابة غير صالحة", 500)
      }
      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: res.message,
      })
      await Promise.all([invalidateList(), revalidateDetail(id)])
      return res.data
    },
    [execute, reportAction, invalidateList, revalidateDetail]
  )

  const deletePatient = useCallback(
    async (id: number) => {
      const actionId = crypto.randomUUID()
      await execute<LaravelSuccessResponse<unknown>>({
        id: actionId,
        endpoint: `patients/${id}`,
        method: "DELETE",
        notify: true,
      })
      await invalidateList()
    },
    [execute, invalidateList]
  )

  return { createPatient, updatePatient, deletePatient }
}

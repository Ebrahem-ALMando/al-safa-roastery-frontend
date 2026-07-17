"use client";

import {
  ApiRequestError,
  extractMutationResult,
  type ApiSuccessResponse,
} from "@/lib/api";
import { useAction } from "@/lib/hooks/useAction";
import { useActionToast } from "@/src/components/status";
import { useCallback } from "react";
import { useSWRConfig } from "swr";
import { PRODUCT_MESSAGES } from "../lib/products.messages";
import type {
  CreateProductInput,
  Product,
  SaveProductPricesInput,
  UpdateProductInput,
} from "../types/product.types";

function isProductsListKey(key: unknown): boolean {
  if (typeof key === "string") return key.startsWith("products:");
  if (Array.isArray(key) && typeof key[0] === "string")
    return key[0].startsWith("products:");
  return false;
}

function isProductsSummaryKey(key: unknown): boolean {
  if (typeof key === "string") return key.startsWith("products-summary:");
  if (Array.isArray(key) && typeof key[0] === "string")
    return key[0].startsWith("products-summary:");
  return false;
}

function isProductDetailKeyForId(key: unknown, id: number): boolean {
  if (typeof key === "string") return key === `product:${id}`;
  if (Array.isArray(key) && typeof key[0] === "string")
    return key[0] === `product:${id}`;
  return false;
}

function isProductPricesKeyForId(key: unknown, id: number): boolean {
  if (typeof key === "string") return key === `product-prices:${id}`;
  if (Array.isArray(key) && typeof key[0] === "string")
    return key[0] === `product-prices:${id}`;
  return false;
}

export function useProductActions() {
  const { execute } = useAction();
  const { reportAction } = useActionToast();
  const { mutate: mutateGlobal } = useSWRConfig();

  const invalidateList = useCallback(
    () =>
      mutateGlobal((key) => isProductsListKey(key), undefined, {
        revalidate: true,
      }),
    [mutateGlobal],
  );

  const invalidateSummary = useCallback(
    () =>
      mutateGlobal((key) => isProductsSummaryKey(key), undefined, {
        revalidate: true,
      }),
    [mutateGlobal],
  );

  const revalidateDetail = useCallback(
    (id: number) =>
      mutateGlobal((key) => isProductDetailKeyForId(key, id), undefined, {
        revalidate: true,
      }),
    [mutateGlobal],
  );

  const revalidatePrices = useCallback(
    (id: number) =>
      mutateGlobal((key) => isProductPricesKeyForId(key, id), undefined, {
        revalidate: true,
      }),
    [mutateGlobal],
  );

  const createProduct = useCallback(
    async (payload: CreateProductInput) => {
      const actionId = crypto.randomUUID();
      try {
        const res = await execute<ApiSuccessResponse<Product>>({
          id: actionId,
          endpoint: "products",
          method: "POST",
          payload,
          notify: false,
        });
        const { data } = extractMutationResult<Product>(res);
        reportAction({
          id: actionId,
          status: "success",
          error: null,
          successMessage: PRODUCT_MESSAGES.created,
        });
        await Promise.all([invalidateList(), invalidateSummary()]);
        return data;
      } catch (error) {
        reportAction({
          id: actionId,
          status: "failed",
          error: {
            status: error instanceof ApiRequestError ? error.status : 0,
            code: error instanceof ApiRequestError ? error.code : undefined,
            message: PRODUCT_MESSAGES.failure,
          },
        });
        throw error;
      }
    },
    [execute, reportAction, invalidateList, invalidateSummary],
  );

  const updateProduct = useCallback(
    async (id: number, payload: UpdateProductInput) => {
      const actionId = crypto.randomUUID();
      try {
        const res = await execute<ApiSuccessResponse<Product>>({
          id: actionId,
          endpoint: `products/${id}`,
          method: "PATCH",
          payload,
          notify: false,
        });
        const { data } = extractMutationResult<Product>(res);
        reportAction({
          id: actionId,
          status: "success",
          error: null,
          successMessage: PRODUCT_MESSAGES.updated,
        });
        await Promise.all([
          invalidateList(),
          invalidateSummary(),
          revalidateDetail(id),
        ]);
        return data;
      } catch (error) {
        reportAction({
          id: actionId,
          status: "failed",
          error: {
            status: error instanceof ApiRequestError ? error.status : 0,
            code: error instanceof ApiRequestError ? error.code : undefined,
            message: PRODUCT_MESSAGES.failure,
          },
        });
        throw error;
      }
    },
    [
      execute,
      reportAction,
      invalidateList,
      invalidateSummary,
      revalidateDetail,
    ],
  );

  const setProductActive = useCallback(
    async (product: Product, isActive: boolean) => {
      const actionId = crypto.randomUUID();
      const res = await execute<ApiSuccessResponse<Product>>({
        id: actionId,
        endpoint: `products/${product.id}`,
        method: "PATCH",
        payload: { is_active: isActive },
        notify: false,
      });
      const { data } = extractMutationResult<Product>(res);
      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: isActive
          ? PRODUCT_MESSAGES.activated
          : PRODUCT_MESSAGES.deactivated,
      });
      await Promise.all([
        invalidateList(),
        invalidateSummary(),
        revalidateDetail(product.id),
      ]);
      return data;
    },
    [
      execute,
      reportAction,
      invalidateList,
      invalidateSummary,
      revalidateDetail,
    ],
  );

  const toggleProductActive = useCallback(
    (product: Product) => setProductActive(product, !product.is_active),
    [setProductActive],
  );

  const deleteProduct = useCallback(
    async (id: number) => {
      const actionId = crypto.randomUUID();
      try {
        await execute<ApiSuccessResponse<unknown>>({
          id: actionId,
          endpoint: `products/${id}`,
          method: "DELETE",
          notify: false,
        });
        reportAction({
          id: actionId,
          status: "success",
          error: null,
          successMessage: PRODUCT_MESSAGES.deleted,
        });
        await Promise.all([invalidateList(), invalidateSummary()]);
      } catch (error) {
        const isInUse =
          error instanceof ApiRequestError && error.code === "PRODUCT_IN_USE";
        reportAction({
          id: actionId,
          status: "failed",
          error: {
            status: error instanceof ApiRequestError ? error.status : 0,
            code: error instanceof ApiRequestError ? error.code : undefined,
            message: isInUse
              ? PRODUCT_MESSAGES.inUseDelete
              : PRODUCT_MESSAGES.failure,
          },
        });
        throw error;
      }
    },
    [execute, reportAction, invalidateList, invalidateSummary],
  );

  const saveProductPrices = useCallback(
    async (
      id: number,
      payload: SaveProductPricesInput,
      options: { notify?: boolean } = {},
    ) => {
      const actionId = crypto.randomUUID();
      const notify = options.notify ?? true;
      try {
        const res = await execute<ApiSuccessResponse<Product>>({
          id: actionId,
          endpoint: `products/${id}/prices`,
          method: "PUT",
          payload,
          notify: false,
        });
        const { data } = extractMutationResult<Product>(res);
        if (notify) {
          reportAction({
            id: actionId,
            status: "success",
            error: null,
            successMessage: PRODUCT_MESSAGES.pricesUpdated,
          });
        }
        await Promise.all([
          invalidateList(),
          invalidateSummary(),
          revalidateDetail(id),
          revalidatePrices(id),
        ]);
        return data;
      } catch (error) {
        if (notify) {
          reportAction({
            id: actionId,
            status: "failed",
            error: {
              status: error instanceof ApiRequestError ? error.status : 0,
              code: error instanceof ApiRequestError ? error.code : undefined,
              message: PRODUCT_MESSAGES.pricesFailure,
            },
          });
        }
        throw error;
      }
    },
    [
      execute,
      reportAction,
      invalidateList,
      invalidateSummary,
      revalidateDetail,
      revalidatePrices,
    ],
  );

  const clearProductPrices = useCallback(
    async (id: number) => {
      const actionId = crypto.randomUUID();
      try {
        const res = await execute<ApiSuccessResponse<Product>>({
          id: actionId,
          endpoint: `products/${id}/prices`,
          method: "DELETE",
          notify: false,
        });
        const { data } = extractMutationResult<Product>(res);
        reportAction({
          id: actionId,
          status: "success",
          error: null,
          successMessage: PRODUCT_MESSAGES.pricesCleared,
        });
        await Promise.all([
          invalidateList(),
          invalidateSummary(),
          revalidateDetail(id),
          revalidatePrices(id),
        ]);
        return data;
      } catch (error) {
        reportAction({
          id: actionId,
          status: "failed",
          error: {
            status: error instanceof ApiRequestError ? error.status : 0,
            code: error instanceof ApiRequestError ? error.code : undefined,
            message: PRODUCT_MESSAGES.pricesClearFailure,
          },
        });
        throw error;
      }
    },
    [
      execute,
      reportAction,
      invalidateList,
      invalidateSummary,
      revalidateDetail,
      revalidatePrices,
    ],
  );

  return {
    createProduct,
    updateProduct,
    toggleProductActive,
    deleteProduct,
    saveProductPrices,
    clearProductPrices,
  };
}

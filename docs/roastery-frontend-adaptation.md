# Al Safa Roastery Frontend Adaptation Plan

## Project Origin
This project was cloned from a laboratory management frontend and is now being adapted for Al Safa Roastery.

## What is Reused
- Next.js App Router
- BFF (Backend for Frontend) layer
- httpOnly cookie-based authentication
- SWR hooks
- UI components (from shadcn/ui)
- Layout/sidebar/header structure
- Tables/cards/forms/dialog patterns
- Existing utility functions and helpers

## What Should NOT be Reused as-is
- Lab domain names (patients, tests, orders, results, etc.)
- Medical report routes
- Lab-specific print/verify logic
- Lab-specific dashboard charts and tables

## New Roastery Module Naming Rule
When creating new modules for Al Safa Roastery, use real roastery feature names:
- src/features/suppliers
- src/features/customers
- src/features/employees
- src/features/items
- src/features/products
- src/features/inventory
- src/features/purchases
- src/features/production
- src/features/sales
- src/features/payments
- src/features/returns
- src/features/expenses
- src/features/payroll
- src/features/cashbox
- src/features/statements
- src/features/reports

**Do NOT leave internal names like "patients" for suppliers.**

## Backend API
- Backend project: al-safa-roastery-backend
- API base: /api/v1
- Auth endpoints:
  - POST /api/v1/auth/login
  - GET /api/v1/auth/me
  - POST /api/v1/auth/logout
- Standard ApiResponse envelope

## Next Planned Sprint
Build the Suppliers module using the existing Patients page pattern as a UI reference, but create clean suppliers domain files (do not reuse patient files directly, use them as a template).

## Canonical Administrative Form Pattern
All administrative create/edit dialogs must follow the Add Patient dialog visual system. See **Canonical Administrative Form Pattern** in `docs/conventions.md`.

## Central API Success and Error Handling Rule

1. **All HTTP 2xx responses are success** — including 200, 201, 202, and 204. Never hardcode `status === 200` or `success === true` in feature modules.
2. **Parsing is centralized** in `lib/api/apiClient.ts`, `lib/api/parseApiResponse.ts`, and `lib/api/mutationResponse.ts`.
3. **`apiClient`** treats `response.status >= 200 && response.status < 300` as success via `isHttpSuccessStatus`.
4. **Success envelopes** follow Laravel `ApiResponse`: `{ status, message, data, meta? }`. Body `status` mirrors HTTP when present but is not the sole success gate.
5. **Mutations** must use `extractMutationResult()` after `useAction` / `apiExecutor` — never `if (!res?.data)` in feature hooks.
6. **UTF-8 BOM** from upstream PHP/Laravel is stripped in `parseResponseJson` (and defensively in the BFF JSON forwarder). Unparseable 2xx bodies throw a precise error (`استجابة نجاح غير متوقعة من الخادم.`) instead of silently returning `{}`.
7. **Errors** map through `mapApiError` — validation (422), auth (401/403), not found (404), and server (5xx) remain unchanged.
8. **New modules** must consume `useApiQuery`, `useAction`, and shared types from `lib/api` — no per-feature success-status checks.

## Feature Completion Gate

A frontend feature must not be marked complete until all of these are verified against the real running Laravel API:

1. List rendering
2. Pagination
3. Search
4. Every visible filter
5. Create
6. Edit
7. Activate/deactivate
8. Delete if supported
9. Details page
10. Success/error toasts
11. Table view
12. Cards view
13. Actual response data inspection in Network
14. No fake client-side filtering over paginated data
15. Build/type/lint quality checks where tooling is available

## Feature Completion Gate — Suppliers Module

Status: **COMPLETE** (Sprint: Supplier Completion)

### What was shipped

| Task | Description |
|------|-------------|
| B1 | New `useSupplierSummary` hook — single `GET bff/suppliers/summary`, replaces multi-call `useSuppliersSummary` |
| B2 | `suppliers.constants.ts` — new column IDs (`row_number`, `supplier_name`, `contact_phone`), updated defaults, `last_activity = "آخر نشاط"` |
| B3 | `SuppliersFilters` balance_status / balance_min / balance_max enabled; wired through `useSuppliersPage` + `buildSuppliersQueryParams` |
| B4 | `SuppliersTable` rewritten: page-aware # col, supplier name+code subline, contact_phone col, last_activity from backend, row navigate to detail, context menu on right-click |
| B5 | `app/(protected)/dashboard/suppliers/[supplierId]/page.tsx` — supplier detail hero page; `SupplierDetailsDialog` replaced with navigation |
| B6 | `lib/suppliers.messages.ts` — Arabic toast messages; `useSupplierActions` uses them; activate/deactivate/delete have distinct messages |
| B7 | `supplier-form-fields.tsx` — phone→whatsapp auto-sync, renamed contact label, code field removed |
| B8 | `components/suppliers/supplier-card.tsx` — PatientCard-style supplier card; `SuppliersCards` rebuilt |
| B9 | `useSuppliersPage` — SSR hydration fix: static defaults for period/custom, localStorage only in useEffect |
| B10 | `supplier.types.ts` — `SupplierLastActivity`, `SupplierSummaryResponse`, `BalanceStatusFilter`; code removed from `CreateSupplierInput` |
| AUTH | `useSuppliers`, `useSupplier`, `useSupplierSummary` — null SWR key until `isAuthenticated` |

### API contracts consumed

- `GET /api/bff/suppliers/summary?date_from=&date_to=` → `{ active_suppliers_count, purchases_total_in_period, suppliers_payable_total, supplier_credit_total }`
- `GET /api/v1/suppliers` — index filters: `balance_status`, `balance_min`, `balance_max`, `is_active`, `search`, `page`, `per_page`
- `GET /api/v1/suppliers/{id}` — supplier detail; response now includes `last_activity: { type, number, date } | null`

---

## Laravel Collection Envelope and Rendering Rule

1. **Paginated list items** live in top-level `response.data` (an array).
2. **Pagination** lives in top-level `response.meta` (`total`, `current_page`, `per_page`, `last_page`, …).
3. **Do not assume** `response.data.data` or `response.data.meta` unless a specific endpoint contract proves otherwise.
4. **Normalize collections** through `normalizePaginatedResponse()` (via `useApiQuery` with `paginated: true`).
5. **Components** receive normalized item arrays and `meta.total` — not raw envelopes.
6. **Empty states** render only after a successful fetch when the normalized array length is exactly 0.
7. **KPI counts** from list endpoints must use `meta.total` (e.g. `?is_active=1&per_page=1`), not visible row count.
8. **Before wiring a new list UI**, inspect the actual Network response from the BFF — do not guess the envelope shape.

## Non-Destructive Development Database Rule

From now on, do **not** run any destructive database command unless the user explicitly requests it.

**Forbidden by default:**

- `php artisan migrate:fresh`
- `php artisan migrate:refresh`
- `php artisan db:wipe`
- `php artisan migrate:reset`
- Dropping databases
- Deleting local records
- Resetting seed data

**Allowed by default:**

- `php artisan migrate`
- `php artisan migrate:status`
- `php artisan optimize:clear`
- `composer dump-autoload`

**For tests:**

- Inspect `phpunit.xml` and the testing environment first.
- Run `php artisan test` only when tests use a separate safe testing database or in-memory SQLite.
- If tests could touch the local development database, do not run them. Report the exact reason instead.

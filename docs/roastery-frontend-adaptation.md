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

## Laravel Collection Envelope and Rendering Rule

1. **Paginated list items** live in top-level `response.data` (an array).
2. **Pagination** lives in top-level `response.meta` (`total`, `current_page`, `per_page`, `last_page`, …).
3. **Do not assume** `response.data.data` or `response.data.meta` unless a specific endpoint contract proves otherwise.
4. **Normalize collections** through `normalizePaginatedResponse()` (via `useApiQuery` with `paginated: true`).
5. **Components** receive normalized item arrays and `meta.total` — not raw envelopes.
6. **Empty states** render only after a successful fetch when the normalized array length is exactly 0.
7. **KPI counts** from list endpoints must use `meta.total` (e.g. `?is_active=1&per_page=1`), not visible row count.
8. **Before wiring a new list UI**, inspect the actual Network response from the BFF — do not guess the envelope shape.

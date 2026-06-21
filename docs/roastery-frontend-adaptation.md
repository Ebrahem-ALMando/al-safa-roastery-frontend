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

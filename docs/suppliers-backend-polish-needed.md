# Suppliers Module — Backend API Polish Needed

This document lists backend additions required for full Suppliers frontend functionality. The frontend implements everything the current API supports correctly; items below are deferred until the backend exposes them.

---

## Missing need: Dedicated supplier summary endpoint

**Why frontend needs it:** KPI cards on `/dashboard/suppliers` currently combine multiple report/list calls. A single endpoint would reduce round-trips and keep card semantics aligned with supplier domain keys.

**Recommended backend solution:**

```
GET /api/v1/suppliers/summary?date_from=&date_to=
```

Response `data`:

```json
{
  "active_suppliers_count": 12,
  "purchases_total_in_period": "15000.00",
  "suppliers_payable_total": "8200.00",
  "supplier_credit_total": "450.00"
}
```

- `active_suppliers_count`: count where `is_active = true`
- `purchases_total_in_period`: sum of completed purchase invoices in `[date_from, date_to]` (omit dates for all-time if needed)
- `suppliers_payable_total`: cumulative sum of positive `current_balance` across all suppliers
- `supplier_credit_total`: absolute sum of negative `current_balance` across all suppliers

---

## Missing need: `supplier_credit_total` on balances report

**Why frontend needs it:** `GET /api/v1/reports/balances` exposes `total_supplier_payables` but not total supplier credit (negative balances). The frontend shows **غير متاح حالياً** for the fourth KPI card until this exists.

**Recommended backend solution:** Add card to `BalancesReportService`:

```php
$this->formatter->card(
    'supplier_credit_total',
    'Total Supplier Credit',
    $this->formatter->formatMoney($supplierCredit),
    'money'
),
```

(`$supplierCredit` is already computed internally.)

---

## Missing need: Balance status filter

**Why frontend needs it:** Advanced filter **حالة الرصيد** (علينا للمورد / رصيد دائن لنا / متوازن) cannot work across paginated list data without backend support.

**Recommended backend solution:** Extend `IndexSupplierRequest` / `SupplierFilterData` / `ListSuppliersAction`:

```
balance_status = payable | credit | settled
```

- `payable`: `current_balance > 0`
- `credit`: `current_balance < 0`
- `settled`: `current_balance = 0`

---

## Missing need: Minimum / maximum balance filters

**Why frontend needs it:** Filters **من الرصيد** and **إلى الرصيد** must apply server-side on the full dataset, not the current page.

**Recommended backend solution:** Extend `IndexSupplierRequest`:

```
balance_min: nullable|numeric
balance_max: nullable|numeric
```

Apply in `ListSuppliersAction` on `current_balance`.

---

## Missing need: Last supplier activity fields

**Why frontend needs it:** Table column **آخر نشاط** should show typed activity (purchase invoice, supplier payment, supplier return) with document number and date—not only `updated_at`.

**Recommended backend solution:** Extend `SupplierResource` (list + show) with optional computed fields:

```json
{
  "last_activity_type": "purchase_invoice",
  "last_activity_number": "PI-202606-0004",
  "last_activity_date": "2026-06-15T10:30:00+00:00"
}
```

Types: `purchase_invoice` | `supplier_payment` | `supplier_return` (align with backend enums).

Frontend display mapping:

- `purchase_invoice` → فاتورة شراء · {number}
- `supplier_payment` → دفعة للمورد · {number}
- `supplier_return` → مرتجع مورد · {number}

**Current frontend fallback:** Column labeled **آخر تحديث** using `updated_at` only.

---

## Missing need: Supplier-specific period KPI (optional consolidation)

**Why frontend needs it:** Period selector affects purchase totals via `reports/purchases`; cumulative balance cards via `reports/balances`. Supplier page would benefit from one domain-scoped summary that documents which metrics are period vs cumulative.

**Recommended backend solution:** Same as dedicated summary endpoint above, with documented semantics:

| Field | Period-scoped? |
|-------|----------------|
| `active_suppliers_count` | No |
| `purchases_total_in_period` | Yes (`date_from` / `date_to`) |
| `suppliers_payable_total` | No (cumulative) |
| `supplier_credit_total` | No (cumulative) |

---

## Supported today (no polish required)

- `GET/POST /api/v1/suppliers`, `GET/PUT/DELETE /api/v1/suppliers/{id}`
- List filters: `search`, `is_active`, `page`, `per_page`, `sort_by`, `sort_direction`
- Search fields: `name`, `code`, `phone`, `email`, `contact_person`
- Soft delete via `destroy`
- Toggle active via `update` with `is_active`

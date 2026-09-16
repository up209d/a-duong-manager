# 01 - Requirement Understanding

Source of truth: `requirement/requirement.md` + `requirement/raw-req.html` + `requirement/app-screenshot/` (7 reference screenshots).
Status: confirmed with Duc on 2026-09-14 (see `02-decisions.md`).

## Product

Minimal inventory + debt (cong no) + profit/loss app for small Vietnamese shops
("cua hang nho"). Designed to skip approval flows and multi-warehouse complexity.

- Primary language: Vietnamese. Secondary: English (i18n required).
- Users: Vietnamese small shop owners. Mobile-first UI (big buttons, one-screen flows).
- Platform: web first, must convert to React Native later.

## 4 Core Modules

### 1. Products & Stock (San pham & Ton kho)
- Product list: search by name/SKU, filter by category, show stock + selling price
- Add/edit product: SKU (auto or barcode scan), name (required), category,
  unit, cost price (gia von), selling price(s), min-stock alert threshold
- Low-stock warning when stock hits the per-product minimum
- Stock auto-adjusts: + on import (Nhap kho), - on export/sale (Xuat kho)

### 2. Sales (Xuat kho) & Customers (Khach hang)
- Customer list: name, phone, address, current total debt
- Quick-add customer from inside the sale form
- Sale voucher (one screen, no approval):
  - Customer (or walk-in "Khach le")
  - Products: qty + actual selling price per line
  - Discount: % OR fixed amount (both inputs shown in reference UI)
  - Extra fees (shipping, packaging)
  - Payment status: Da tra / No mot phan / Mua no
  - Note
  - Stock decrements automatically on save
- Sales history: filter by time, payment status

### 3. Purchases (Nhap kho) & Suppliers (Nha cung cap)
- Supplier list: name, phone, address, total debt owed
- Import voucher (one screen):
  - Supplier (optional per reference UI)
  - Products: qty + actual import price per line
  - Supplier discount
  - Shipping/import costs
  - Payment status: Da tra / No mot phan / No toan bo
  - Note
  - Stock increments automatically on save
- Import history: filter by supplier, time

### 4. Dashboard & Reports (Bao cao Tai chinh)
- Today summary on home: revenue, COGS, gross profit of the day
- Profit/loss report for any period:
  total revenue, total COGS, total discounts & extra fees, net profit
- Debt overview: total receivables (khach no) vs total payables (no NCC)
- Debt management screen: record thu no (collect) / tra no (pay) + history
  (confirmed in scope)

## Confirmed Business Formulas (Duc confirmed 2026-09-14)

1. Order revenue (Doanh thu don) = (sum qty x unit_price) - discount + extra_fee
2. Order COGS = sum(qty x cost_price snapshot at time of sale)
3. Gross profit per order = order revenue - order COGS
4. Net profit (period) = sum(gross profit of sales)
   - sum(import costs: shipping/processing fees from nhap kho)
5. Customer debt += (total - paid) per sale
   Supplier debt += (total - paid) per import
   (repayments via debt screen reduce the respective debt)

## Data Model (from requirement.md, to be extended per scope)

- products: id, sku (unique), name, category, unit, cost_price, selling_price,
  stock_quantity, min_stock_alert
  + EXTEND: multiple labeled selling prices (label + amount),
    sub-units (don vi phu) with conversion
- customers: id, name, phone, address, current_debt
- suppliers: id, name, phone, address, current_debt
- transactions: id, code (XK001/NK001), type (EXPORT|IMPORT), entity_id (FK
  customer or supplier), subtotal, discount, extra_fee, total_amount,
  paid_amount, note, created_at
  + EXTEND: attachment refs (invoice/receipt photos)
- transaction_items: id, transaction_id, product_id, quantity, unit_price,
  cost_price (snapshot for accurate P/L)
  + EXTEND: price label used, unit used (base or sub-unit)
+ NEW: debts/payments table for thu no / tra no records (id, party type,
  party id, amount, note, created_at)

## Screens (from reference screenshots + spec)

1. Home (Trang chu): today-summary card (revenue/profit, swipeable),
   quick-access grid (Nhap kho, Xuat kho, Them san pham, Khach hang,
   Nha cung cap, Kho, Don mua hang, Don ban hang, Quan ly no),
   5-tab bottom nav (Trang chu / San pham / Lich su / Khac / Ho so)
2. Nhap kho form (green theme) - Xuat kho form (red theme)
3. Them/sua san pham (SKU + barcode scan, multi-price labels, sub-unit toggle)
4. Khach hang list (search, count + total debt, add) - Nha cung cap list (same)
5. Product list, transaction history lists
6. Reports: period P/L, debt overview, debt management
7. Ho so (profile) - content TBD

## In Scope / Out of Scope

IN: multi labeled selling prices, sub-units, invoice photo upload,
    debt management screen, barcode camera scanning, i18n vi/en
OUT: multi-warehouse (explicitly excluded by requirement),
     approval flows, multi-shop/multi-user (assumed, see open questions)

## Tech Stack (confirmed)

- Frontend: Expo + react-native-web (single codebase, web + native)
- Backend: Node.js + SQLite (designed to swap to other DB later)
- Agent harness: Pi; codegraph for code scanning (see AGENTS.md)

## Roadmap (from requirement.md)

- Phase 1 (2w): DB + products module + basic sale/import vouchers - **DONE 2026-09-14**
- Phase 2 (1w): customers, suppliers, debt tracking - **DONE 2026-09-14** (built together with Phase 1)
- Phase 3 (1w): dashboard/reports + camera barcode scanning - **PARTIAL**: dashboard + P/L report + low-stock filter done; barcode scan TODO
- Phase 4 (1w): testing, mobile UI/UX polish, handover - TODO (invoice photo upload, data export, onboarding also pending)

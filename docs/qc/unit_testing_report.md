# ✅ Laporan Unit Testing Full-Stack — FruityPOS

**Tanggal:** 19 Mei 2026  
**Sprint:** 10 — Testing & Stabilization  
**Author:** Abdul Aziz (assisted by AI)

---

## 📊 Summary

| Layer | Framework | Tests | Assertions | Failures | Duration |
|-------|-----------|-------|------------|----------|----------|
| **Backend** | PHPUnit 11 + Mockery | 71 | 97 | 0 ✅ | ~2.2s |
| **Frontend** | Vitest 4.1 + Testing Library | 73 | 73 | 0 ✅ | ~2.8s |
| **Total** | — | **144** | **170** | **0** ✅ | ~5s |

---

## 🟢 Backend Tests (PHPUnit)

**Command:** `php artisan test --testsuite=Unit`

### Test Suites

| # | Test Suite | File | Tests | Cakupan |
|---|-----------|------|-------|---------|
| 1 | InventoryWacFormulaTest | `tests/Unit/Repositories/InventoryWacFormulaTest.php` | 14 | Formula WAC, HPP Mentah, division-by-zero guards |
| 2 | PricingServiceTest | `tests/Unit/Services/PricingServiceTest.php` | 12 | Selling price, rounding, lock/unlock |
| 3 | ReorderPointServiceTest | `tests/Unit/Services/ReorderPointServiceTest.php` | 10 | CRUD upsert, toggle, cooldown 1 jam |
| 4 | PurchaseOrderServiceTest | `tests/Unit/Services/PurchaseOrderServiceTest.php` | 8 | Status guards (draft/confirmed), min items |
| 5 | InboundServiceTest | `tests/Unit/Services/InboundServiceTest.php` | 7 | HPP formula, PO status validation |
| 6 | ShiftServiceTest | `tests/Unit/Services/ShiftServiceTest.php` | 7 | Open/close shift, balance reconciliation |
| 7 | MutationServiceTest | `tests/Unit/Services/MutationServiceTest.php` | 5 | State transitions, stock deduct, loss calc |
| 8 | WasteServiceTest | `tests/Unit/Services/WasteServiceTest.php` | 5 | Approve (stock deduct), reject (stock preserved) |

### Detail Test Cases

#### 1. InventoryWacFormulaTest (14 tests)

Formula **Weighted Average Cost (FR-207)**:
```
WAC = ((oldQty × oldAvg) + (addQty × newHpp)) / (oldQty + addQty)
```

| Test | Skenario | Expected |
|------|----------|----------|
| `wac_calculation_existing_inventory` | 100pcs @5000, +50pcs @8000 | WAC = 6000 |
| `wac_calculation_new_inventory` | 0→30pcs @7500 | WAC = 7500 |
| `wac_multiple_inbounds` | 3x sequential inbound | WAC correctly recalculated |
| `wac_with_decimal_quantities` | 25.5kg + 10.5kg | WAC = 12875.00 |
| `wac_with_zero_incoming_hpp` | Free sample (HPP=0) | WAC = 4166.67 |
| `wac_large_numbers` | 5000+2000 pcs | WAC = 25857.14 |
| `wac_same_cost_no_change` | Same HPP both batches | WAC unchanged |
| `wac_small_addition` | 1000 + 1 pc | WAC = 5094.91 |
| `hpp_raw_calculation` | 10 box ×50pcs = 1000/pc | HPP = 1000 |
| `hpp_raw_single_unit` | content=1 | HPP = 50000 |
| `hpp_raw_zero_quantity` | Qty=0 | No division-by-zero |
| `hpp_raw_zero_content` | Content=0 | No division-by-zero |
| `stock_deduction_preserves_avg_cost` | Deduct stock | avg_cost unchanged |
| `stock_deduction_insufficient_throws` | Qty < deduct | Detected |

#### 2. PricingServiceTest (12 tests)

| Test | FR | Skenario |
|------|-----|----------|
| `calculate_selling_price_with_margin` | FR-302 | 10000 + 20% = 12000 |
| `calculate_selling_price_with_rounding_500` | FR-304 | 11200 → 11500 |
| `calculate_selling_price_with_rounding_1000` | FR-304 | 11200 → 12000 |
| `calculate_selling_price_zero_baseline` | — | Returns 0 |
| `calculate_selling_price_negative_baseline` | — | Returns 0 |
| `calculate_selling_price_zero_margin` | — | No markup |
| `calculate_selling_price_fractional_margin` | — | 33.5% margin |
| `calculate_selling_price_high_margin` | — | 100% margin |
| `round_hpp_rounds_up_*` | FR-304 | ceil rounding logic |
| `lock_price_throws_when_zero` | FR-306 | Guard: selling_price > 0 |
| `unlock_price_sets_pending` | FR-306 | Status → pending |

#### 3. InboundServiceTest (7 tests)

| Test | FR | Skenario |
|------|-----|----------|
| `hpp_raw_calculation_formula` | FR-205 | HPP = total / (qty × content) |
| `hpp_raw_single_unit_content` | FR-205 | content=1 |
| `hpp_raw_zero_quantity` | — | Division-by-zero guard |
| `hpp_raw_zero_content` | — | Division-by-zero guard |
| `process_receipt_throws_on_draft_po` | FR-208 | Guard: PO must be confirmed |
| `process_receipt_throws_on_cancelled_po` | FR-208 | Guard |
| `process_receipt_throws_on_completed_po` | FR-208 | Guard |

#### 4. PurchaseOrderServiceTest (8 tests)

| Test | FR | Skenario |
|------|-----|----------|
| `confirm_throws_when_not_draft` | FR-203 | Guard: only draft |
| `confirm_throws_when_no_items` | FR-203 | Guard: min 1 item |
| `confirm_succeeds_with_draft_and_items` | FR-203 | Happy path |
| `cancel_throws_when_not_draft` | — | Guard |
| `cancel_succeeds_when_draft` | — | Happy path |
| `update_throws_when_confirmed` | FR-203 | Guard: locked |
| `delete_throws_when_not_draft` | — | Guard |
| `delete_succeeds_when_draft` | — | Happy path |

#### 5. MutationServiceTest (5 tests)

| Test | FR | Skenario |
|------|-----|----------|
| `ship_throws_when_not_preparing` | FR-603 | Guard: preparing→shipped |
| `receive_throws_when_not_shipped` | FR-604 | Guard: shipped→received |
| `complete_throws_when_not_received` | — | Guard: received→completed |
| `ship_deducts_stock_from_source` | FR-603 | Stock deducted per item |
| `receive_calculates_loss_correctly` | FR-605 | Sent 10, received 8 → loss 2 |

#### 6. WasteServiceTest (5 tests)

| Test | FR | Skenario |
|------|-----|----------|
| `approve_deducts_stock_for_each_item` | FR-704 | Stock deduction on approve |
| `approve_throws_when_not_pending` | — | Guard: only pending |
| `approve_throws_when_rejected` | — | Guard: rejected ≠ approvable |
| `reject_does_not_deduct_stock` | FR-705 | inventoryRepo never called |
| `reject_throws_when_not_pending` | — | Guard |

#### 7. ShiftServiceTest (7 tests)

| Test | Skenario |
|------|----------|
| `open_shift_throws_when_active_shift_exists` | Guard: 1 shift per user |
| `open_shift_throws_when_negative_balance` | Guard: balance ≥ 0 |
| `open_shift_creates_successfully` | Happy path |
| `open_shift_with_zero_balance` | Edge case: 0 balance allowed |
| `close_shift_throws_when_already_closed` | Guard: double-close |
| `close_shift_calculates_balance_difference` | Reconciliation: 850000-840000=-10000 |
| `close_shift_zero_difference` | Reconciliation: difference = 0 |

#### 8. ReorderPointServiceTest (10 tests)

| Test | FR | Skenario |
|------|-----|----------|
| `set_creates_new_reorder_point` | FR-1207 | Upsert: create new |
| `set_updates_existing_reorder_point` | FR-1210 | Upsert: update existing |
| `toggle_activates_inactive` | FR-1215 | Toggle: false → true |
| `toggle_deactivates_active` | FR-1215 | Toggle: true → false |
| `check_threshold_skips_empty_ids` | FR-1211 | Early exit guard |
| `check_threshold_skips_no_active` | FR-1211 | No RPs to check |
| `cooldown_expired_when_never_notified` | FR-1214 | null → expired |
| `cooldown_not_expired_within_one_hour` | FR-1214 | 30min < 1hr → not expired |
| `cooldown_expired_after_one_hour` | FR-1214 | 61min > 1hr → expired |
| `cooldown_at_exact_boundary` | FR-1214 | Boundary condition test |

### Struktur File Backend

```
tests/Unit/
├── ExampleTest.php                           (1)
├── Repositories/
│   └── InventoryWacFormulaTest.php           (14)
└── Services/
    ├── InboundServiceTest.php                (7)
    ├── MutationServiceTest.php               (5)
    ├── PricingServiceTest.php                (12)
    ├── PurchaseOrderServiceTest.php          (8)
    ├── ReorderPointServiceTest.php           (10)
    ├── ShiftServiceTest.php                  (7)
    └── WasteServiceTest.php                  (5)
```

---

## 🔵 Frontend Tests (Vitest)

**Command:** `npm test`

### Test Suites

| # | Test Suite | File | Tests | Cakupan |
|---|-----------|------|-------|---------|
| 1 | currency.test.js | `resources/js/__tests__/utils/currency.test.js` | 10 | `formatRupiah`: IDR formatting, null/undefined guards, decimal truncation |
| 2 | pricing.test.js | `resources/js/__tests__/utils/pricing.test.js` | 15 | `calculateMarginActual`: margin formula, div-by-zero; `getMarginColor`: threshold boundaries |
| 3 | Badge.test.jsx | `resources/js/__tests__/components/Badge.test.jsx` | 10 | 5 variant styles, fallback, custom className, DOM structure |
| 4 | OfflineIndicator.test.jsx | `resources/js/__tests__/components/OfflineIndicator.test.jsx` | 12 | Online/offline state, pending badge, sync button, spinner animation |
| 5 | ProductCard.test.jsx | `resources/js/__tests__/components/ProductCard.test.jsx` | 13 | Render, click guard (in-stock vs out-of-stock), tier indicator, image handling |
| 6 | offlineDB.test.js | `resources/js/__tests__/lib/offlineDB.test.js` | 13 | Catalog cache, pending TX queue, status update, cleanup (synced/duplicate/failed) |

### Detail Test Cases

#### 1. currency.test.js (10 tests)

| Test | Skenario |
|------|----------|
| `formats positive integers correctly` | 15000 → "Rp15.000" |
| `formats large numbers with thousand separators` | 1500000 → "Rp1.500.000" |
| `formats zero as Rp 0` | 0 → contains "Rp" + "0" |
| `formats negative amounts` | -5000 → contains "5.000" |
| `returns Rp 0 for null` | null → "Rp 0" |
| `returns Rp 0 for undefined` | undefined → "Rp 0" |
| `truncates decimal amounts` | 15000.75 → no ".75" shown |
| `formats small values correctly` | 500 → "500" |
| `formats typical fruit price` | 45000 → "45.000" |
| `formats large transaction total` | 2350000 → "2.350.000" |

#### 2. pricing.test.js (15 tests)

| Test | Skenario |
|------|----------|
| `calculates margin correctly` | sell=12000, avg=10000 → "20.00" |
| `calculates with fractional result` | sell=15000, avg=12000 → "25.00" |
| `zero margin when prices equal` | sell=avg=10000 → "0.00" |
| `negative margin (loss)` | sell=8000, avg=10000 → "-20.00" |
| `high margin` | sell=30000, avg=10000 → "200.00" |
| `two decimal places` | sell=11333, avg=10000 → "13.33" |
| `returns 0 when avgCost is 0/null/undefined/negative` | Division-by-zero guard (4 tests) |
| `getMarginColor emerald for >= 20%` | Threshold boundary |
| `getMarginColor amber for >= 10% and < 20%` | Threshold boundary |
| `getMarginColor red for < 10%` | Threshold boundary |

#### 3. Badge.test.jsx (10 tests)

| Test | Skenario |
|------|----------|
| `renders children text` | Renders "Aktif" |
| `default variant` | bg-[#F3F4F6], text-[#9CA3AF] |
| `success variant` | bg-[#F0FDF4], text-[#16A34A] |
| `warning variant` | bg-[#FFFBEB], text-[#EAB308] |
| `danger variant` | bg-[#FEF2F2], text-[#DC2626] |
| `info variant` | bg-[#E6F1FB], text-[#0C447C] |
| `fallback for unknown variant` | Falls back to default |
| `appends custom className` | Custom "ml-2" appended |
| `renders as span` | tagName = "SPAN" |
| `rounded-full pill shape` | Contains "rounded-full" |

#### 4. OfflineIndicator.test.jsx (12 tests)

| Test | Skenario |
|------|----------|
| `shows Online text` | isOnline=true → "Online" |
| `green dot when online` | .bg-emerald-500 exists |
| `shows Offline text` | isOnline=false → "Offline" |
| `red dot when offline` | .bg-red-500 exists |
| `pulse animation when offline` | .animate-pulse exists |
| `hides sync button when no pending` | pendingCount=0 → no button |
| `shows pending count` | pendingCount=3 → "3 Pending" |
| `sync button clickable when online` | onClick fires |
| `sync button disabled when offline` | button is disabled |
| `shows Syncing... text` | isSyncing=true → "Syncing..." |
| `sync button disabled while syncing` | isSyncing → disabled |
| `spinner animation while syncing` | .animate-spin exists |

#### 5. ProductCard.test.jsx (13 tests)

| Test | Skenario |
|------|----------|
| `renders product name` | "Apel Fuji Premium" |
| `renders product category` | "Buah Import" |
| `renders formatted price` | 45000 → "45.000" |
| `renders stock count` | "Stok: 150" |
| `onClick fires for in-stock` | Click → mockClick called |
| `onClick NOT fires for out-of-stock` | Click → mockClick NOT called |
| `opacity-60 for out-of-stock` | Visual dimming |
| `cursor-not-allowed for out-of-stock` | Cursor style |
| `cursor-pointer for in-stock` | Cursor style |
| `shows tier indicator` | "Tersedia harga grosir" |
| `hides tier indicator when no tiers` | Not rendered |
| `renders product image` | img src verified |
| `renders placeholder when no image` | SVG placeholder |

#### 6. offlineDB.test.js (13 tests)

| Test | Skenario |
|------|----------|
| `caches catalog products` | 2 products stored in IndexedDB |
| `caches prices with tiers` | Tiers array persisted |
| `replaces catalog on re-cache` | Old data cleared |
| `retrieves merged catalog` | Products + prices merged |
| `returns 0 when no price found` | Orphan product → price=0 |
| `saves pending transaction` | status='pending', created_at set |
| `saves multiple transactions` | 3 TXs stored |
| `counts pending correctly` | count=2 |
| `returns 0 when no pending` | Empty table → 0 |
| `updates status to synced` | No longer in getPending |
| `updates status to failed` | Kept in DB, not in pending |
| `removes synced and duplicate` | Only pending remains |
| `keeps failed after cleanup` | Failed not deleted |

### Struktur File Frontend

```
resources/js/__tests__/
├── setup.js                                   (global setup)
├── utils/
│   ├── currency.test.js                       (10)
│   └── pricing.test.js                        (15)
├── components/
│   ├── Badge.test.jsx                         (10)
│   ├── OfflineIndicator.test.jsx              (12)
│   └── ProductCard.test.jsx                   (13)
└── lib/
    └── offlineDB.test.js                      (13)
```

---

## ⚙️ Setup & Konfigurasi

### Backend
- **Framework:** PHPUnit 11 (bawaan Laravel)
- **Mocking:** Mockery (repository interface mocking)
- **Database:** Tidak perlu koneksi DB (pure unit test)
- **Config:** `phpunit.xml`

### Frontend
- **Framework:** Vitest 4.1
- **DOM Environment:** jsdom
- **React Testing:** @testing-library/react + @testing-library/jest-dom + @testing-library/user-event
- **IndexedDB Mock:** fake-indexeddb (untuk Dexie tests)
- **Config:** `vitest.config.js`

### Commands
```bash
# Backend tests
php artisan test --testsuite=Unit

# Frontend tests (single run)
npm test

# Frontend tests (watch mode)
npm run test:watch
```

---

## 🗺️ Cakupan Bisnis Logic

### Financial Formulas ✅
- WAC (Weighted Average Cost) — 8 skenario
- HPP Mentah — 4 skenario
- Selling Price + Margin + Rounding — 8 skenario
- Margin Actual (%) — 6 skenario
- Balance Reconciliation (Shift) — 2 skenario

### State Machine Guards ✅
- PO: draft → confirmed / cancelled — 5 guards
- Mutation: preparing → shipped → received → completed — 3 guards
- Waste: pending → approved / rejected — 3 guards
- Shift: open → closed — 2 guards

### Frontend Logic ✅
- Currency Formatting (IDR) — 10 skenario
- Margin Color Thresholds — 5 skenario
- Offline DB: Catalog Cache — 5 skenario
- Offline DB: TX Queue & Sync — 8 skenario
- Component Rendering & Interaction — 35 skenario

---

## 📝 Catatan

1. **Backend tests** menggunakan Mockery untuk isolasi — tidak memerlukan koneksi database.
2. **Frontend tests** menggunakan fake-indexeddb untuk simulasi IndexedDB/Dexie tanpa browser.
3. Semua test bersifat **deterministic** dan **idempotent** — bisa dijalankan berulang kali tanpa side effects.
4. Jika ingin menambah integration test dengan DB, perlu mengaktifkan `pdo_sqlite` di `php.ini`.

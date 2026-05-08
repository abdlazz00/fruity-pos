# Sprint 8 — Frontend Guideline
## Mutasi Stok + Waste Management + Stock Opname

**Tanggal:** 8 Mei 2026 | **Status Backend:** ✅ Selesai (S8-B01 s/d S8-B16)

---

## 1. Ringkasan Sprint 8

Sprint 8 membangun **3 modul inventori** di frontend:

| Modul | Halaman | Aktor | Jumlah Halaman |
|-------|---------|-------|----------------|
| **Mutasi Stok** | CRUD + Status Transitions | Stockist + Owner | 3 |
| **Waste Management** | Submit + Approval | Stockist + Owner | 3 |
| **Stock Opname** | Start Session + Count + Approve | Stockist + Owner | 3 |

**Total: 9 halaman/komponen React baru**

---

## 2. API Endpoints (Backend Ready)

### 2.1 Mutasi Stok

| Method | URL | Aksi | Aktor |
|--------|-----|------|-------|
| `GET` | `/inventory/mutations` | List mutasi (paginated) | Stockist, Owner |
| `GET` | `/inventory/mutations/create` | Form buat mutasi | Stockist |
| `POST` | `/inventory/mutations` | Simpan mutasi baru | Stockist |
| `GET` | `/inventory/mutations/{id}` | Detail mutasi | Stockist, Owner |
| `PATCH` | `/inventory/mutations/{id}/ship` | Kirim mutasi | Stockist (asal) |
| `PATCH` | `/inventory/mutations/{id}/receive` | Terima mutasi | Stockist (tujuan) |
| `PATCH` | `/inventory/mutations/{id}/complete` | Selesaikan mutasi | Stockist, Owner |

### 2.2 Waste Management

| Method | URL | Aksi | Aktor |
|--------|-----|------|-------|
| `GET` | `/inventory/waste` | List waste requests | Stockist (own), Owner (all pending) |
| `GET` | `/inventory/waste/create` | Form submit waste | Stockist |
| `POST` | `/inventory/waste` | Simpan waste baru | Stockist |
| `GET` | `/inventory/waste/{id}` | Detail waste | Stockist, Owner |
| `PATCH` | `/inventory/waste/{id}/approve` | Approve waste | **Owner only** |
| `PATCH` | `/inventory/waste/{id}/reject` | Reject waste | **Owner only** |

### 2.3 Stock Opname

| Method | URL | Aksi | Aktor |
|--------|-----|------|-------|
| `GET` | `/inventory/opname` | List sesi opname | Stockist, Owner |
| `POST` | `/inventory/opname/start` | Mulai sesi opname | Stockist |
| `GET` | `/inventory/opname/{id}` | Detail + form input fisik | Stockist, Owner |
| `PUT` | `/inventory/opname/{id}/counts` | Simpan hitungan fisik | Stockist |
| `PATCH` | `/inventory/opname/{id}/submit` | Submit ke Owner | Stockist |
| `PATCH` | `/inventory/opname/{id}/approve` | Approve + adjust stok | **Owner only** |

---

## 3. Task Checklist Frontend

| ID | Task | File Target | Est |
|----|------|-------------|-----|
| S8-F01 | Halaman `MutationIndex.jsx` (list, filter status) | `Pages/Inventory/MutationIndex.jsx` | 2h |
| S8-F02 | Komponen `MutationForm.jsx` (toko tujuan, item, qty) | `Pages/Inventory/MutationForm.jsx` | 3h |
| S8-F03 | Flow button: Ship → Receive → Complete | Terintegrasi di `MutationShow.jsx` | 3h |
| S8-F04 | Komponen `ReceiveConfirmation.jsx` (input qty diterima) | `Components/Inventory/ReceiveConfirmation.jsx` | 2h |
| S8-F05 | Halaman `WasteIndex.jsx` (dual view: Stockist/Owner) | `Pages/Inventory/WasteIndex.jsx` | 3h |
| S8-F06 | Komponen `WasteForm.jsx` (produk, qty, alasan, foto) | `Pages/Inventory/WasteForm.jsx` | 3h |
| S8-F07 | Komponen `WasteApproval.jsx` (Owner: lihat foto, approve/reject) | `Pages/Inventory/WasteShow.jsx` | 3h |
| S8-F08 | Halaman `OpnameIndex.jsx` + `OpnameForm.jsx` | `Pages/Inventory/OpnameIndex.jsx` | 4h |
| S8-F09 | Komponen `OpnameResult.jsx` (tabel selisih) | `Pages/Inventory/OpnameShow.jsx` | 2h |
| S8-F10 | Flow Owner approval opname adjustment | Terintegrasi di `OpnameShow.jsx` | 2h |

---

## 4. Folder Structure

```
resources/js/Pages/Inventory/
├── MutationIndex.jsx       # S8-F01: List mutasi + filter
├── MutationForm.jsx        # S8-F02: Form buat mutasi
├── MutationShow.jsx        # S8-F03: Detail + status buttons
├── WasteIndex.jsx          # S8-F05: List waste (dual view)
├── WasteForm.jsx           # S8-F06: Form submit waste
├── WasteShow.jsx           # S8-F07: Detail + approval
├── OpnameIndex.jsx         # S8-F08: List opname sessions
└── OpnameShow.jsx          # S8-F09/F10: Detail + counts + approval

resources/js/Components/Inventory/
└── ReceiveConfirmation.jsx  # S8-F04: Modal konfirmasi penerimaan
```

---

## 5. Implementasi Detail

### 5.1 S8-F01: MutationIndex.jsx

**Props dari backend (Inertia):**
```javascript
{
  mutations: {          // Paginated collection
    data: [{
      id, mutation_number, status,
      from_location: { id, name, code },
      to_location: { id, name, code },
      creator: { id, name },
      receiver: { id, name } | null,
      items: [{ id, product: { name }, quantity_sent, quantity_received, loss_quantity }],
      shipped_at, received_at, created_at
    }],
    links: {...},       // Pagination links
  },
  locations: [{ id, name, code }],  // Untuk filter (Owner)
  filters: { status, location_id }
}
```

**UI Requirements:**
- Tabel dengan kolom: No. Mutasi, Asal → Tujuan, Items, Status, Tanggal
- Filter tabs: Semua | Preparing | Shipped | Received | Completed
- Owner: dropdown filter lokasi
- Status badge dengan warna:
  - `preparing` → kuning/amber
  - `shipped` → biru
  - `received` → hijau muda
  - `completed` → hijau tua
- Tombol "Buat Mutasi" (visible hanya untuk Stockist)

---

### 5.2 S8-F02: MutationForm.jsx

**Props dari backend:**
```javascript
{
  locations: [{ id, name, code }],  // Toko tujuan (exclude toko sendiri)
  products: [{                       // Produk dengan stok > 0 di lokasi user
    product_id, name, sku, stock
  }]
}
```

**Form Fields:**
- **Toko Tujuan**: dropdown `to_location_id` (required)
- **Items**: repeater (tambah/hapus baris)
  - Produk: search/select dropdown `product_id`
  - Qty Kirim: number input `quantity_sent` (max = stock)
- **Catatan**: textarea `notes` (optional)

**Payload POST `/inventory/mutations`:**
```json
{
  "to_location_id": 2,
  "items": [
    { "product_id": 5, "quantity_sent": 10.5 },
    { "product_id": 8, "quantity_sent": 5.0 }
  ],
  "notes": "Stok menipis di KG"
}
```

---

### 5.3 S8-F03: MutationShow.jsx (Status Transitions)

**Conditional Action Buttons:**

```
Status: preparing
  └─ [📦 Kirim Mutasi]  →  PATCH /mutations/{id}/ship
     Visible: Stockist dari lokasi ASAL

Status: shipped
  └─ [✅ Terima Mutasi]  →  PATCH /mutations/{id}/receive
     Visible: Stockist dari lokasi TUJUAN
     → Opens ReceiveConfirmation modal

Status: received
  └─ [🏁 Selesaikan]    →  PATCH /mutations/{id}/complete
     Visible: Stockist, Owner

Status: completed
  └─ (no actions, final state)
```

**Payload PATCH `/mutations/{id}/receive`:**
```json
{
  "items": [
    { "item_id": 1, "quantity_received": 10.0 },
    { "item_id": 2, "quantity_received": 4.5 }
  ]
}
```

---

### 5.4 S8-F04: ReceiveConfirmation.jsx (Modal)

Modal popup saat Stockist tujuan menekan "Terima Mutasi".

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Konfirmasi Penerimaan Mutasi MUT-KG-...    │
├─────────────────────────────────────────────┤
│ Produk         │ Dikirim │ Diterima │ Loss  │
│ Apel Fuji      │ 10.00   │ [  9.5 ] │  0.5  │
│ Jeruk Mandarin │  5.00   │ [  5.0 ] │  0.0  │
├─────────────────────────────────────────────┤
│           [Batal]   [Konfirmasi Penerimaan] │
└─────────────────────────────────────────────┘
```

- Kolom "Diterima" = input number (default = qty_sent)
- Kolom "Loss" = auto-calculate (sent - received)
- Loss > 0 → highlight merah

---

### 5.5 S8-F05: WasteIndex.jsx (Dual View)

**Role-based rendering:**

| Role | View | Data Source |
|------|------|-------------|
| **Stockist** | Daftar waste milik toko sendiri | `GET /inventory/waste` |
| **Owner** | Daftar semua waste pending (approval) | `GET /inventory/waste` (returns all pending) |

**Props:**
```javascript
{
  wastes: {
    data: [{
      id, request_number, status,
      location: { name },
      requester: { name },
      approver: { name } | null,
      items: [{ product: { name }, quantity, reason, photo_path, hpp_value }],
      rejection_reason, approved_at, created_at
    }]
  },
  filters: { status }
}
```

**UI:**
- Tabel: No. Request, Lokasi, Pengaju, Items, Total HPP, Status, Tanggal
- Stockist: tombol "Ajukan Waste Baru"
- Owner: tombol "Review" per baris (link ke WasteShow)
- Status badges:
  - `pending` → kuning/amber + icon jam
  - `approved` → hijau + icon checklist
  - `rejected` → merah + icon X

---

### 5.6 S8-F06: WasteForm.jsx

**⚠️ PENTING: Form ini menggunakan `multipart/form-data` karena ada file upload foto.**

**Form Fields per Item:**
- **Produk**: dropdown `product_id`
- **Jumlah**: number `quantity` (max = stock di toko)
- **Alasan**: dropdown `reason` dengan opsi:
  - `rotten` → "Busuk"
  - `damaged` → "Rusak Fisik"
  - `expired` → "Kadaluarsa"
  - `failed_qc` → "Gagal QC"
- **Foto Bukti**: file upload `photo` (required, max 5MB, jpg/png/webp)

**Cara submit dengan Inertia.js (multipart):**
```javascript
import { router } from '@inertiajs/react';

const handleSubmit = () => {
  const formData = new FormData();
  items.forEach((item, index) => {
    formData.append(`items[${index}][product_id]`, item.product_id);
    formData.append(`items[${index}][quantity]`, item.quantity);
    formData.append(`items[${index}][reason]`, item.reason);
    formData.append(`items[${index}][photo]`, item.photo); // File object
  });

  router.post('/inventory/waste', formData, {
    forceFormData: true,
  });
};
```

**Preview Foto:**
Tampilkan preview foto sebelum submit menggunakan `URL.createObjectURL(file)`.

---

### 5.7 S8-F07: WasteShow.jsx (Owner Approval)

**Layout untuk Owner review:**
```
┌───────────────────────────────────────────────┐
│ Waste Request WST-SRP-20260508-0001           │
│ Status: ⏳ Pending                             │
│ Toko: Serpong  |  Pengaju: Budi (Stockist)    │
├───────────────────────────────────────────────┤
│ Item 1: Apel Fuji                             │
│ Qty: 5.00 kg  |  Alasan: Busuk               │
│ Nilai HPP: Rp 125.000                         │
│ ┌──────────────┐                              │
│ │  📷 FOTO     │  ← gambar bukti fisik buah   │
│ └──────────────┘                              │
├───────────────────────────────────────────────┤
│ Total Nilai Kerugian: Rp 125.000              │
├───────────────────────────────────────────────┤
│ [❌ Tolak]                    [✅ Setujui]     │
│ ┌─────────────────────────┐                   │
│ │ Alasan penolakan...     │ ← muncul jika tolak│
│ └─────────────────────────┘                   │
└───────────────────────────────────────────────┘
```

**Payload approve:**
```
PATCH /inventory/waste/{id}/approve
(no body needed)
```

**Payload reject:**
```json
PATCH /inventory/waste/{id}/reject
{
  "rejection_reason": "Foto tidak jelas, mohon foto ulang."
}
```

**Akses foto:**
```javascript
// Photo URL dari backend
const photoUrl = `/storage/${item.photo_path}`;
// Gunakan <img src={photoUrl} /> untuk menampilkan
```

---

### 5.8 S8-F08: OpnameIndex.jsx

**Props:**
```javascript
{
  opnames: {
    data: [{
      id, opname_number, status,
      location: { name },
      conductor: { name },
      approver: { name } | null,
      opname_date, total_shrinkage_value,
      items_count,       // jumlah item
      approved_at, created_at
    }]
  },
  locations: [{ id, name }],
  filters: { status, location_id }
}
```

**UI:**
- Tabel: No. Opname, Lokasi, Pelaksana, Status, Tanggal, Nilai Penyusutan
- Stockist: tombol "Mulai Opname Baru" → `POST /inventory/opname/start`
- Status badges:
  - `in_progress` → biru + "Sedang Berjalan"
  - `submitted` → kuning + "Menunggu Approval"
  - `approved` → hijau + "Selesai"
- ⚠️ Hanya 1 opname `in_progress` per lokasi. Tombol "Mulai" disable jika ada yang aktif.

---

### 5.9 S8-F09/F10: OpnameShow.jsx

**3 tampilan berbeda berdasarkan status:**

#### Status: `in_progress` (Stockist mengisi)
```
┌────────────────────────────────────────────────────┐
│ Opname OPN-SRP-20260508-0001                        │
│ Status: 🔵 Sedang Berjalan                          │
├────────────────────────────────────────────────────┤
│ Produk         │ Stok Sistem │ Fisik     │ Selisih │
│ Apel Fuji      │ 50.00       │ [ 48.5 ]  │  -1.5   │
│ Jeruk Mandarin │ 30.00       │ [ 30.0 ]  │   0.0   │
│ Mangga Harum   │ 20.00       │ [ 22.0 ]  │  +2.0   │
├────────────────────────────────────────────────────┤
│ [💾 Simpan Hitungan]         [📤 Submit ke Owner]   │
└────────────────────────────────────────────────────┘
```

**Payload PUT `/inventory/opname/{id}/counts`:**
```json
{
  "counts": [
    { "item_id": 1, "physical_quantity": 48.5 },
    { "item_id": 2, "physical_quantity": 30.0 },
    { "item_id": 3, "physical_quantity": 22.0 }
  ]
}
```

#### Status: `submitted` (Owner review)
- Tampilan tabel selisih (read-only)
- Highlight merah untuk selisih negatif (stok hilang)
- Highlight hijau untuk selisih positif (stok lebih)
- Total nilai penyusutan di footer
- Tombol [✅ Approve & Adjust Stok] (Owner only)

#### Status: `approved` (Final)
- Tampilan read-only
- Badge "Disetujui oleh [Nama Owner] pada [tanggal]"
- Tidak ada action buttons

---

## 6. Sidebar Navigation Update

Tambahkan menu "Inventori" di sidebar untuk role `owner` dan `stockist`:

```javascript
// Di Sidebar component, tambahkan section:
{
  label: 'Inventori',
  icon: 'Package', // Lucide icon
  roles: ['owner', 'stockist'],
  children: [
    { label: 'Mutasi Stok', href: '/inventory/mutations', icon: 'ArrowLeftRight' },
    { label: 'Waste / Rusak', href: '/inventory/waste', icon: 'Trash2' },
    { label: 'Stock Opname', href: '/inventory/opname', icon: 'ClipboardCheck' },
  ]
}
```

---

## 7. Shared Components yang Perlu Dibuat

### StatusBadge.jsx (reusable)
```javascript
// Mapping status → warna untuk ketiga modul:
const statusConfig = {
  // Mutasi
  preparing:   { label: 'Preparing',   color: 'amber' },
  shipped:     { label: 'Shipped',     color: 'blue' },
  received:    { label: 'Received',    color: 'emerald' },
  completed:   { label: 'Completed',   color: 'green' },
  // Waste
  pending:     { label: 'Pending',     color: 'amber' },
  approved:    { label: 'Approved',    color: 'green' },
  rejected:    { label: 'Rejected',    color: 'red' },
  // Opname
  in_progress: { label: 'In Progress', color: 'blue' },
  submitted:   { label: 'Submitted',   color: 'amber' },
  // approved already defined above
};
```

---

## 8. Aturan Keamanan UI

> **⛔ DILARANG KERAS menampilkan di halaman Stockist/Kasir:**
> - `avg_cost` (WAC per toko)
> - `hpp_value` (nilai kerugian waste) — **HANYA Owner yang boleh lihat**
> - Margin dan HPP baseline

**Waste HPP Value:**
- Kolom `hpp_value` pada waste items **hanya ditampilkan di view Owner** (WasteShow.jsx saat Owner review)
- Stockist hanya melihat: produk, qty, alasan, foto

**Opname Shrinkage Value:**
- Kolom `shrinkage_value` dan `total_shrinkage_value` **hanya ditampilkan untuk Owner**
- Stockist hanya melihat: produk, stok sistem, fisik, selisih (qty saja)

---

## 9. Alur Reason Mapping (Waste)

Gunakan mapping bahasa Indonesia untuk tampilan:

```javascript
const reasonLabels = {
  rotten:    'Busuk',
  damaged:   'Rusak Fisik',
  expired:   'Kadaluarsa',
  failed_qc: 'Gagal QC',
};
```

---

## 10. Dependency Chain

```
S8-F01 (MutationIndex) ─┐
S8-F02 (MutationForm)  ─┤── Bisa paralel
S8-F04 (ReceiveModal)  ─┘
        │
S8-F03 (MutationShow + buttons) ← depends on F01, F04
        │
S8-F05 (WasteIndex) ────┐
S8-F06 (WasteForm)  ────┤── Bisa paralel
        │               │
S8-F07 (WasteShow/Approval) ← depends on F05
        │
S8-F08 (OpnameIndex) ───┐
        │                │── Bisa paralel
S8-F09 (OpnameShow)  ───┘
        │
S8-F10 (Owner approval flow) ← depends on F09
```

---

## 11. Testing Checklist (S8-F11)

| # | Test Case | Expected |
|---|-----------|----------|
| 1 | Stockist buat mutasi → ship | Stok asal berkurang |
| 2 | Stockist tujuan terima mutasi (qty < sent) | Loss tercatat, stok tujuan bertambah |
| 3 | WAC recalc di toko tujuan setelah receive | avg_cost berubah sesuai WAC formula |
| 4 | Stockist submit waste tanpa foto | Validation error (foto wajib) |
| 5 | Stockist submit waste → Owner approve | Stok berkurang |
| 6 | Owner reject waste | Stok TIDAK berubah, alasan tercatat |
| 7 | Stockist mulai opname saat ada opname aktif | Error "sudah ada sesi aktif" |
| 8 | Input fisik + submit → Owner approve | Stok di-adjust ke jumlah fisik |
| 9 | avg_cost setelah opname approve | TIDAK berubah (FR-805) |
| 10 | Kasir/Admin coba akses /inventory/* | 403 Forbidden |

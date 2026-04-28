# 🎨 Sprint 4 — Frontend Integration Guide
## API Reference untuk Halaman Pengadaan & Inbound

**Versi:** 1.0  
**Tanggal:** 28 April 2026  
**Target:** React (Inertia.js) Developer

---

## 📑 Daftar Halaman yang Perlu Dibuat

| No | Halaman | Route Name | URL | Komponen React |
|----|---------|------------|-----|----------------|
| 1 | Daftar Purchase Order | `purchase-orders.index` | `/procurement/purchase-orders` | `PurchaseOrder/Index.jsx` |
| 2 | Form Buat PO | `purchase-orders.create` | `/procurement/purchase-orders/create` | `PurchaseOrder/Form.jsx` |
| 3 | Detail PO | `purchase-orders.show` | `/procurement/purchase-orders/{id}` | `PurchaseOrder/Show.jsx` |
| 4 | Form Edit PO (draft only) | `purchase-orders.edit` | `/procurement/purchase-orders/{id}/edit` | `PurchaseOrder/Form.jsx` |
| 5 | Daftar Inbound | `inbounds.index` | `/procurement/inbounds` | `Inbound/Index.jsx` |
| 6 | Form Buat Inbound | `inbounds.create` | `/procurement/inbounds/create` | `Inbound/Form.jsx` |
| 7 | Detail Inbound | `inbounds.show` | `/procurement/inbounds/{id}` | `Inbound/Show.jsx` |
| 8 | Notifikasi (dropdown) | — | — | `Components/NotificationDropdown.jsx` |

---

## 1️⃣ Purchase Order — Index

### Route
```
GET /procurement/purchase-orders
```

### Inertia Props (`PurchaseOrder/Index.jsx`)
```json
{
  "purchaseOrders": {
    "data": [
      {
        "id": 1,
        "po_number": "PO-SRP-20260428-0001",
        "order_date": "2026-04-28",
        "status": "draft",
        "notes": "Pesanan bulan ini",
        "supplier": {
          "id": 1,
          "name": "PT Agro Buah Nusantara"
        },
        "location": {
          "id": 1,
          "name": "Toko Serpong",
          "code": "SRP"
        },
        "creator": {
          "id": 2,
          "name": "Stockist Serpong"
        },
        "items": [
          {
            "id": 1,
            "product": { "id": 1, "name": "Apel Fuji", "sku": "APE-00001" },
            "product_unit": { "id": 1, "unit_name": "Kilogram" },
            "quantity_ordered": "10.00",
            "estimated_price": "50000.00"
          }
        ],
        "created_at": "2026-04-28T09:00:00.000000Z"
      }
    ],
    "current_page": 1,
    "last_page": 1,
    "per_page": 10,
    "total": 1
  },
  "locations": [
    { "id": 1, "name": "Toko Serpong", "code": "SRP" }
  ]
}
```

### Status Badge Colors (Rekomendasi)
| Status | Warna | Label |
|--------|-------|-------|
| `draft` | Slate/Gray | Draft |
| `confirmed` | Blue | Dikonfirmasi |
| `partially_received` | Amber/Yellow | Sebagian Diterima |
| `completed` | Emerald/Green | Selesai |
| `cancelled` | Red | Dibatalkan |

### Filter Query Parameter
```
GET /procurement/purchase-orders?status=draft
GET /procurement/purchase-orders?status=confirmed
```

---

## 2️⃣ Purchase Order — Form (Create/Edit)

### Route
```
GET /procurement/purchase-orders/create
GET /procurement/purchase-orders/{id}/edit
```

### Inertia Props (`PurchaseOrder/Form.jsx`)
```json
{
  "purchaseOrder": null,          // null saat create, object saat edit
  "suppliers": [
    { "id": 1, "name": "PT Agro Buah Nusantara", "is_active": true }
  ],
  "products": [
    {
      "id": 1, "name": "Apel Fuji", "sku": "APE-00001",
      "units": [
        { "id": 1, "unit_name": "Kilogram", "conversion_to_base": "1.0000" },
        { "id": 2, "unit_name": "Dus (24 pcs)", "conversion_to_base": "24.0000" }
      ]
    }
  ],
  "locations": [
    { "id": 1, "name": "Toko Serpong", "code": "SRP" }
  ],
  "userLocationId": 1             // null jika Owner (bisa pilih toko)
}
```

### Submit Payload — Create
```javascript
// POST /procurement/purchase-orders
router.post('/procurement/purchase-orders', {
  supplier_id: 1,
  location_id: 1,               // auto-set dari userLocationId jika stockist
  order_date: '2026-04-28',
  notes: 'Pesanan bulan April',
  items: [
    {
      product_id: 1,
      product_unit_id: 1,
      quantity_ordered: 10,
      estimated_price: 50000     // opsional
    },
    {
      product_id: 3,
      product_unit_id: 5,
      quantity_ordered: 5,
      estimated_price: 120000
    }
  ]
});
```

### Submit Payload — Update (draft only)
```javascript
// PUT /procurement/purchase-orders/{id}
router.put(`/procurement/purchase-orders/${po.id}`, { ... });
```

### ⚠️ Aturan Edit
- Hanya PO **draft** yang bisa diedit
- PO **confirmed/completed/cancelled** → tombol edit disembunyikan

---

## 3️⃣ Purchase Order — Aksi (Confirm/Cancel/Delete)

### Confirm PO
```javascript
// PATCH /procurement/purchase-orders/{id}/confirm
router.patch(`/procurement/purchase-orders/${po.id}/confirm`);
```
> Hanya PO `draft` dengan minimal 1 item yang bisa dikonfirmasi.

### Cancel PO
```javascript
// PATCH /procurement/purchase-orders/{id}/cancel
router.patch(`/procurement/purchase-orders/${po.id}/cancel`);
```
> Hanya PO `draft` yang bisa dibatalkan.

### Delete PO
```javascript
// DELETE /procurement/purchase-orders/{id}
router.delete(`/procurement/purchase-orders/${po.id}`);
```
> Hanya PO `draft` yang bisa dihapus.

### UI Recommendation: Action Buttons per Status
| Status | Edit | Confirm | Cancel | Delete |
|--------|------|---------|--------|--------|
| `draft` | ✅ | ✅ | ✅ | ✅ |
| `confirmed` | ❌ | ❌ | ❌ | ❌ |
| `partially_received` | ❌ | ❌ | ❌ | ❌ |
| `completed` | ❌ | ❌ | ❌ | ❌ |
| `cancelled` | ❌ | ❌ | ❌ | ❌ |

---

## 4️⃣ Inbound — Index

### Route
```
GET /procurement/inbounds
```

### Inertia Props (`Inbound/Index.jsx`)
```json
{
  "inbounds": {
    "data": [
      {
        "id": 1,
        "inbound_number": "INB-SRP-20260428-0001",
        "received_date": "2026-04-28",
        "shipping_cost": "50000.00",
        "notes": null,
        "purchase_order": {
          "id": 1,
          "po_number": "PO-SRP-20260428-0001",
          "supplier": { "id": 1, "name": "PT Agro Buah Nusantara" }
        },
        "receiver": { "id": 2, "name": "Stockist Serpong" },
        "location": { "id": 1, "name": "Toko Serpong" },
        "items": [
          {
            "product": { "id": 1, "name": "Apel Fuji" },
            "product_unit": { "id": 1, "unit_name": "Kilogram" },
            "quantity_received": "10.00",
            "total_buy_price": "500000.00",
            "content_per_unit": 1,
            "hpp_raw_calculated": "50000.00"
          }
        ]
      }
    ],
    "current_page": 1, "last_page": 1, "per_page": 10, "total": 1
  }
}
```

---

## 5️⃣ Inbound — Form (Create)

### Route
```
GET /procurement/inbounds/create
```

### Inertia Props (`Inbound/Form.jsx`)
```json
{
  "inbound": null,
  "purchaseOrders": [
    {
      "id": 1,
      "po_number": "PO-SRP-20260428-0001",
      "status": "confirmed",
      "supplier": { "id": 1, "name": "PT Agro Buah Nusantara" },
      "items": [
        {
          "product_id": 1,
          "product_unit_id": 1,
          "quantity_ordered": "10.00",
          "product": { "id": 1, "name": "Apel Fuji", "sku": "APE-00001" },
          "product_unit": { "id": 1, "unit_name": "Kilogram" }
        }
      ],
      "inbounds": [
        {
          "items": [
            { "product_id": 1, "product_unit_id": 1, "quantity_received": "3.00" }
          ]
        }
      ]
    }
  ]
}
```

### Submit Payload
```javascript
// POST /procurement/inbounds
router.post('/procurement/inbounds', {
  purchase_order_id: 1,
  received_date: '2026-04-28',
  shipping_cost: 50000,          // opsional, default 0
  notes: 'Diterima lengkap',
  items: [
    {
      product_id: 1,
      product_unit_id: 1,
      quantity_received: 10,     // ≤ quantity_ordered di PO
      total_buy_price: 500000,   // Total harga beli untuk qty ini
      content_per_unit: 1        // Isi per unit (e.g. 1 kg = 1, 1 dus = 24)
    }
  ]
});
```

### HPP Preview (Realtime di Frontend)
```javascript
// Rumus yang bisa dihitung di client-side untuk preview:
const hppRaw = totalBuyPrice / (quantityReceived * contentPerUnit);
// Contoh: 500000 / (10 * 1) = Rp 50.000 per base unit
```

### ⚠️ Validasi Penting (ditangani backend)
1. **PO harus berstatus `confirmed` atau `partially_received`**
2. **Qty received ≤ qty ordered** (FR-208) — akumulatif dari semua inbound sebelumnya
3. **Item harus ada di PO** — product_id + product_unit_id harus match

### Menghitung Sisa Qty yang Bisa Diterima
```javascript
// Di frontend, saat user pilih PO, hitung sisa per item:
const getRemainingQty = (poItem, allInbounds) => {
  let totalReceived = 0;
  allInbounds.forEach(inbound => {
    inbound.items.forEach(item => {
      if (item.product_id === poItem.product_id 
          && item.product_unit_id === poItem.product_unit_id) {
        totalReceived += parseFloat(item.quantity_received);
      }
    });
  });
  return parseFloat(poItem.quantity_ordered) - totalReceived;
};
```

---

## 6️⃣ Notifications API

### Fetch Notifications
```javascript
// GET /api/notifications
const response = await axios.get('/api/notifications');
// Response:
{
  "notifications": [
    {
      "id": "uuid-string",
      "type": "App\\Notifications\\InboundReceivedNotification",
      "data": {
        "type": "inbound_received",
        "inbound_id": 1,
        "inbound_number": "INB-SRP-20260428-0001",
        "po_number": "PO-SRP-20260428-0001",
        "supplier_name": "PT Agro Buah Nusantara",
        "location_name": "Toko Serpong",
        "received_by": "Stockist Serpong",
        "received_date": "28/04/2026",
        "shipping_cost": "50000.00",
        "total_items": 2,
        "hpp_summary": [
          {
            "product_name": "Apel Fuji",
            "hpp_raw": 50000,
            "new_avg_cost": 48500,
            "new_qty": 25
          }
        ],
        "message": "Barang masuk INB-SRP-20260428-0001 dari PT Agro Buah Nusantara telah diterima di Toko Serpong."
      },
      "read_at": null,
      "created_at": "2026-04-28T09:30:00.000000Z"
    }
  ],
  "unread_count": 3
}
```

### Mark All as Read
```javascript
// POST /api/notifications/mark-read
await axios.post('/api/notifications/mark-read');
```

---

## 7️⃣ Sidebar Navigation (Rekomendasi)

Tambahkan menu baru di sidebar untuk Pengadaan:

```jsx
// Di Sidebar.jsx, tambahkan menu group:
{
  label: 'Pengadaan',
  icon: ShoppingCart,
  roles: ['owner', 'stockist'],
  children: [
    { label: 'Purchase Order', href: '/procurement/purchase-orders' },
    { label: 'Barang Masuk', href: '/procurement/inbounds' },
  ]
}
```

---

## 8️⃣ Breadcrumbs (Rekomendasi)

| Halaman | Breadcrumb |
|---------|------------|
| Index PO | `Home / Purchase Order` |
| Create PO | `Home / Purchase Order / Buat PO Baru` |
| Edit PO | `Home / Purchase Order / Edit PO` |
| Detail PO | `Home / Purchase Order / Detail PO` |
| Index Inbound | `Home / Barang Masuk` |
| Create Inbound | `Home / Barang Masuk / Terima Barang` |
| Detail Inbound | `Home / Barang Masuk / Detail` |

---

## 9️⃣ Error Handling

Semua error validasi dikembalikan dalam format Inertia standard:

```javascript
// Di component form, akses error dari useForm():
const { errors } = useForm({ ... });

// Contoh error yang mungkin muncul:
errors.supplier_id      // "Supplier wajib dipilih."
errors.items            // "Minimal 1 item produk harus ditambahkan."
errors.status           // "PO yang sudah dikonfirmasi tidak dapat diedit."
errors['items.0.quantity_ordered'] // "Jumlah pesanan wajib diisi."
```

---

## 🔑 Environment Checklist

Sebelum mulai develop frontend, pastikan:

- [ ] MySQL aktif, `php artisan migrate` berhasil
- [ ] Minimal 1 Location dengan field `code` terisi
- [ ] Minimal 1 Supplier aktif
- [ ] Minimal 1 Product aktif dengan minimal 1 ProductUnit
- [ ] Jalankan `composer run dev` untuk start server

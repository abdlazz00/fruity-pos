# 🚀 Dokumentasi Pengerjaan Frontend — Sprint 4
**Modul:** Pengadaan (Purchase Order) & Penerimaan Barang (Inbound)  
**Tanggal:** 29 April 2026  
**Status:** ✅ Selesai (100%)  

---

## 🏗️ Komponen dan Halaman yang Dibuat
Sesuai dengan `sprint_4_frontend_guide.md` dan *Blueprint* desain UI/UX, berikut adalah komponen dan halaman *frontend* (React + Inertia.js) yang telah diselesaikan pada sprint ini:

### A. Modul Purchase Order (PO)
| Halaman / Fitur | Path / File | Status | Keterangan |
|-----------------|-------------|--------|------------|
| **Daftar PO (Index)** | `Pages/PurchaseOrder/Index.jsx` | ✅ Selesai | Tabel *zebra-stripes*, paginasi, filter status (Draft, Confirmed, dsb) dengan *Badge* komponen kustom. |
| **Form PO (Create & Edit)** | `Pages/PurchaseOrder/Form.jsx` | ✅ Selesai | Form dengan input *dynamic table* untuk item produk. Terintegrasi *client-side total estimate calculator*. Mode otomatis berubah ke *readonly* jika status bukan `draft`. |
| **Detail PO (Show)** | `Pages/PurchaseOrder/Show.jsx` | ✅ Selesai | UI terbagi menjadi Info Dokumen dan Detail Produk. Dilengkapi *Action Buttons* yang kemunculannya bersyarat (kondisional). |
| **Konfirmasi Aksi** | `Components/Modal.jsx` | ✅ Selesai | Pembuatan *custom modal* elegan bergaya *pop-up* untuk menggantikan `window.confirm` bawaan browser. Digunakan saat klik Konfirmasi, Batal, atau Hapus. |

### B. Modul Penerimaan Barang (Inbound)
| Halaman / Fitur | Path / File | Status | Keterangan |
|-----------------|-------------|--------|------------|
| **Daftar Inbound (Index)**| `Pages/Inbound/Index.jsx` | ✅ Selesai | Menampilkan rekam jejak barang masuk lengkap dengan total ongkos kirim. |
| **Form Terima Barang** | `Pages/Inbound/Form.jsx` | ✅ Selesai | Menangani *logic client-side* berat: validasi akumulasi **sisa Qty PO** dan fitur **Preview HPP Mentah secara real-time**. |
| **Detail Inbound (Show)** | `Pages/Inbound/Show.jsx` | ✅ Selesai | Menampilkan rincian data penerimaan beserta HPP Mentah per-item yang sudah diproses di sisi backend. |

### C. Komponen Pendukung & Ekstra
- **`Sidebar.jsx`**: Penambahan navigasi menu *dropdown* "Pengadaan" khusus untuk *role* Owner & Stockist.
- **`Header.jsx` & `NotificationDropdown.jsx`**: Mengubah bel notifikasi statis menjadi komponen *dropdown* dinamis yang me-*request* notifikasi via *axios polling* dan memproses fitur *mark-as-read*.
- **`Badge.jsx` & `Button.jsx`**: Standardisasi desain *token* tombol dan label (merah, hijau, abu-abu, dll).
- Penyesuaian skema pewarnaan (*Tailwind tokens*) serta struktur navigasi *Breadcrumbs* untuk pengalaman navigasi yang mulus.

# Quality Control & Bug Fixes Report (Sprint 1 - Sprint 4)

**Date:** April 30, 2026
**Component:** Backend (Laravel)
**Status:** Completed

Dokumen ini berisi rangkuman perbaikan *bug*, implementasi *tech-debt*, serta *Quality Control* dari sprint 1 hingga sprint 4 sebelum memasuki Sprint 5.

---

## 1. Perbaikan Purchase Order & Product SKU Generation
**Masalah Sebelumnya:**
Terjadi *argument count error* (jumlah argumen tidak valid) atau perhitungan urutan *sequence* yang tidak sesuai pada saat auto-generate nomor PO (`generatePoNumber`) maupun `generateSku` pada model.

**Penyelesaian:**
Telah dilakukan perbaikan penyesuaian indeks pada pemotongan string ID/SKU berdasarkan panjang prefix yang bervariasi:
- Pada Query MySQL (`orderByRaw`), indeks `SUBSTRING()` dimulai dari `1`. Oleh karena itu kode menggunakan offset `strlen($prefix) + 2` (karakter pemisah `-` dihitung 1 langkah, lalu lanjut membaca angka).
- Pada PHP, `substr()` menggunakan indeks berbasis `0`. Oleh karena itu kode telah disesuaikan agar menggunakan `strlen($prefix) + 1` guna mendapatkan *sequence number* yang benar.

## 2. Implementasi Multi-Tenant Location Scope (S1-B12)
**Masalah Sebelumnya:**
Sistem multi-toko (multi-tenant) masih mengharuskan penulisan manual berupa pemfilteran berdasarkan `location_id` di setiap query masing-masing Controller (misal `$user->location_id` di `PurchaseOrderController`). Middleware `LocationScope.php` hanya berupa placeholder/stub.

**Penyelesaian:**
- Mengaktifkan fitur **Eloquent Global Scope** secara dinamis melalui middleware `LocationScope`.
- Logika ini otomatis menyisipkan kueri `->where('location_id', auth()->user()->location_id)` untuk seluruh pengguna selain dari *Owner*.
- Global scope ini diterapkan secara spesifik ke model *multi-tenant* esensial: `PurchaseOrder`, `Inbound`, `Inventory`, dan `User`.
- Middleware tersebut telah diregistrasikan di file konfigurasi pusat `bootstrap/app.php` ke dalam *group web*.

## 3. Implementasi Force Password Change on First Login (S2-B11)
**Masalah Sebelumnya:**
Tidak ada sistem yang secara otomatis memaksa akun *staff* (yang dibuatkan oleh Owner dengan kata sandi default) untuk mengganti kata sandi mereka saat *login* perdana, sehingga rentan akan masalah keamanan.

**Penyelesaian:**
- Ditambahkan kolom baru ke tabel basis data: `must_change_password` (tipe *boolean*, default: *true*) menggunakan *Database Migration*.
- Pembaruan properti `$fillable` dan pengaturan `casts` tipe boolean pada model `User`.
- Pembuatan dan registrasi middleware baru `ForcePasswordChange.php` di `bootstrap/app.php`. Middleware ini mencegat semua *request web* dari pengguna yang telah masuk dan me-*redirect* ke rute `/change-password` jika `must_change_password` masih bernilai *true* (kecuali untuk proses *logout*).
- Menambahkan rute terkait (`/change-password`) pada *auth route group* dan membuat metode `showChangePassword` serta `updatePassword` di `AuthController`.
- Pembaruan `UserSeeder.php` dan pengaturan ulang DB untuk mengubah status dummy data akun saat *development* menjadi *false* agar developer tidak terkunci.

---

Dengan perbaikan 3 hal krusial di atas, arsitektur dasar Backend secara resmi dinyatakan siap dan aman (*robust*) untuk melanjutkan tahap pengembangan modul kompleks (Pricing Engine & POS).

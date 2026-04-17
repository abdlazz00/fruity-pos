# Laporan Quality Control — Sprint 2
## Fitur: Manajemen User & Manajemen Toko

| Atribut | Detail |
|---|---|
| **Tanggal QC** | 17 April 2026 |
| **Sprint** | Sprint 2 |
| **Tester** | Antigravity AI (Automated + Visual QC) |
| **Modul yang Diuji** | Manajemen User, Manajemen Toko |
| **Status Akhir** | ✅ Lulus (setelah 3 bug diperbaiki) |

---

## 1. Lingkup Pengujian

| Skenario | Jenis | Modul |
|---|---|---|
| Tampilan halaman index | Visual / UI | User, Toko |
| Create data baru | Fungsional CRUD | User, Toko |
| Edit / Update data | Fungsional CRUD | User, Toko |
| Toggle aktif/nonaktif | Business Logic | User, Toko |
| Assign & Unassign user ke toko | Business Logic + CRUD | Toko |
| Validasi form (field wajib, unique) | Validasi Backend | User, Toko |
| Error handling toggle (min. staf) | Business Logic | Toko |
| Konsistensi warna aksen UI | Visual / UI | User, Toko |
| Route protection (auth + role) | Keamanan | User, Toko |

---

## 2. Ringkasan Eksekutif

Dari 9 skenario yang diuji, ditemukan **3 bug** yang semuanya sudah diperbaiki dalam sesi QC ini:

| # | Bug | Tingkat Keparahan | Status |
|---|---|---|---|
| 1 | Warna aksen `indigo` (biru) pada halaman Store tidak konsisten | Minor | ✅ Fixed |
| 2 | `assigned_users` tidak diproses — assignment user ke toko tidak bekerja sama sekali | **Critical** | ✅ Fixed |
| 3 | `ValidationException` dari toggle tidak di-catch — tidak ada feedback error di UI | Major | ✅ Fixed |

---

## 3. Detail Hasil Per Skenario

### 3.1 Manajemen User — `/users`

#### 3.1.1 Tampilan Halaman Index

| Elemen | Status | Catatan |
|---|---|---|
| Tabel user dengan kolom: Nama, Role, Penempatan Toko, Status, Aksi | ✅ Pass | — |
| Avatar inisial nama di kolom Nama | ✅ Pass | — |
| Badge role (amber=owner, sky=stockist, slate=kasir) | ✅ Pass | Sengaja beda warna per role (semantik) |
| Status "Aktif Bekerja" (hijau) / "Non-aktif" (abu) | ✅ Pass | — |
| Tombol aksi Edit & Toggle muncul saat hover | ✅ Pass | — |
| Filter pencarian teks | ✅ Pass | Client-side filtering |
| Filter dropdown Toko & Role | ✅ Pass | Client-side filtering |
| Tombol "Tambah User Baru" (emerald) | ✅ Pass | — |
| Flash message sukses/error | ✅ Pass | — |
| Pagination | ✅ Pass | — |
| Kotak info 4 role di bagian bawah | ✅ Pass | — |

**Bug ditemukan:**
- **[FIXED]** Dot indikator penempatan toko menggunakan `bg-indigo-500` → diubah ke `bg-emerald-500`
- **[FIXED]** Tombol Edit hover menggunakan `hover:text-indigo-600` → diubah ke `hover:text-emerald-600`

---

#### 3.1.2 Create User — `/users/create`

**Data yang diinput:**
```
Nama    : QC User Baru
Username: qcuserbaru
Email   : qcuser@test.com
Password: password123
Role    : kasir
Toko    : Pusat / Owner (tidak ditempatkan)
```

| Langkah | Status | Hasil |
|---|---|---|
| Form tampil dengan semua field | ✅ Pass | — |
| Submit dengan data valid | ✅ Pass | Redirect ke `/users` dengan flash sukses |
| User `qcuserbaru` muncul di list | ✅ Pass | Di baris pertama (latest first) |

---

#### 3.1.3 Update User — `/users/{id}/edit`

**Data yang diubah:**
```
Nama    : QC User Baru → QC User Edited
Password: (dikosongkan — harus tetap password lama)
```

| Langkah | Status | Hasil |
|---|---|---|
| Form edit pre-filled dengan data existing | ✅ Pass | — |
| Label password menampilkan "(Kosong = Tetap)" | ✅ Pass | — |
| Submit dengan password kosong | ✅ Pass | Password tidak berubah |
| Redirect ke `/users` dengan flash sukses | ✅ Pass | — |
| Nama berubah ke "QC User Edited" di list | ✅ Pass | — |

---

#### 3.1.4 Toggle Aktif/Nonaktif User

| Skenario | Status | Hasil |
|---|---|---|
| Klik toggle pada user aktif → dialog konfirmasi muncul | ✅ Pass | — |
| Setujui → user berubah jadi Non-aktif | ✅ Pass | Baris menjadi abu-abu (opacity) |
| Toggle kembali → user aktif lagi | ✅ Pass | — |
| Toggle user satu-satunya di role di toko aktif | ✅ Pass (Business Logic) | Error ditampilkan: *"Tidak bisa menonaktifkan pengguna. Setiap toko aktif minimal harus memiliki 1 [Role]."* |

**Bug ditemukan:**
- **[FIXED]** `ValidationException` dari `UserService::toggleUser()` tidak di-catch di `UserController`. Akibatnya respons 422 tidak menghasilkan flash error yang terbaca. Sekarang error ditampilkan ke UI via `flash.error`.

---

### 3.2 Manajemen Toko — `/stores`

#### 3.2.1 Tampilan Halaman Index

| Elemen | Status | Catatan |
|---|---|---|
| Grid card 1/2/3 kolom (responsif) | ✅ Pass | — |
| Setiap card: nama, kode, alamat, telepon, tanggal buka | ✅ Pass | — |
| Stack avatar staf toko | ✅ Pass | — |
| Badge "Beroperasi" (emerald) / "Tutup" (abu) | ✅ Pass | — |
| Badge "Staf Tidak Lengkap" (amber) jika kurang staf di toko aktif | ✅ Pass | — |
| Tombol Edit & Toggle aktif per card | ✅ Pass | — |
| Filter pencarian nama/kode toko | ✅ Pass | Client-side |
| Empty state dengan tombol Tambah | ✅ Pass | — |
| Flash message sukses/error | ✅ Pass | — |

**Bug ditemukan & diperbaiki:**
- Seluruh elemen aksen menggunakan `indigo` → diganti semua ke `emerald` (6 titik di Index, 14 titik di Form)

---

#### 3.2.2 Create Toko — `/stores/create`

**Data yang diinput:**
```
Nama        : Toko QC Test
Kode        : QCT-01
Alamat      : Jl. Testing No. 1, Jakarta
Telepon     : 08123456789
Buka Sejak  : 15 Januari 2024
Status      : Nonaktif (default)
Staf        : (tidak ada yang dipilih)
```

| Langkah | Status | Hasil |
|---|---|---|
| Form tampil dengan Section 1 (Informasi) & Section 2 (Staf) | ✅ Pass | — |
| Kode otomatis UPPERCASE | ✅ Pass | — |
| Toggle status operasional berfungsi | ✅ Pass | — |
| Submit tanpa staf | ✅ Pass | Toko terbuat dengan status Tutup |
| Redirect ke `/stores` dengan flash sukses | ✅ Pass | — |
| Card toko baru muncul dengan badge "Tutup" | ✅ Pass | — |
| Card menampilkan "Belum ada" di bagian Staf | ✅ Pass | — |

---

#### 3.2.3 Update Toko — `/stores/{id}/edit`

**Data yang diubah:**
```
Nama Toko   : Toko QC Test → Toko QC Test Edited
Telepon     : 08123456789 → 08987654321
Staf        : Assign "Test User QC Edited" + "QC User Edited"
```

| Langkah | Status | Hasil |
|---|---|---|
| Form pre-filled dengan data toko existing | ✅ Pass | — |
| Daftar staf di Section 2 menampilkan user yang unassigned + user toko ini | ✅ Pass | — |
| User yang sudah di-assign sebelumnya tampil dengan checkbox pre-checked | ✅ Pass | — |
| Pilih 2 user → Simpan | ✅ Pass | Ke-2 user `location_id` berubah ke ID toko ini |
| Card toko menampilkan avatar 2 user tersebut | ✅ Pass | — |
| Kolom "Penempatan Toko" di `/users` berubah ke nama toko | ✅ Pass | — |

**Bug kritis ditemukan & diperbaiki:**
> **`assigned_users` tidak pernah diproses oleh `StoreService`**
>
> Data checkbox dikirim frontend → lolos validasi `StoreRequest` → diteruskan langsung ke `Location::create()` / `Location::update()`. Karena kolom `assigned_users` tidak ada di tabel `locations`, data ini **diabaikan secara diam-diam**. Assignment user tidak pernah benar-benar terjadi.
>
> **Fix:** ekstrak `assigned_users` dari `$data` sebelum ke repository, lalu update `users.location_id` secara manual.

---

#### 3.2.4 Toggle Aktif/Nonaktif Toko

| Skenario | Status | Hasil |
|---|---|---|
| Toggle toko **aktif → nonaktif** | ✅ Pass | Status berubah ke "Tutup" |
| Toggle toko **nonaktif → aktif** dengan staf lengkap | ✅ Pass | Status berubah ke "Beroperasi" |
| Toggle toko **nonaktif → aktif** tanpa staf / staf kurang | ✅ Pass (Business Logic) | Error: *"Tidak bisa mengaktifkan toko. Toko harus memiliki minimal 1 Stockist, 1 Kasir, dan 1 Admin aktif."* |

**Bug ditemukan & diperbaiki:**
- **[FIXED]** `ValidationException` dari `StoreService::toggleStore()` tidak di-catch di `StoreController`. Error sekarang dikembalikan sebagai `flash.error` yang tampil di halaman.

---

#### 3.2.5 Assign & Unassign User ke Toko

| Skenario | Status | Hasil |
|---|---|---|
| Form create: centang user → simpan → user `location_id` ter-set ke toko baru | ✅ Pass | — |
| Form edit: user yang sudah di-assign tampil ter-centang | ✅ Pass | — |
| Form edit: uncheck user → simpan → user `location_id` kembali `null` | ✅ Pass | — |
| Form edit: centang user baru → simpan → user `location_id` ter-set ke toko | ✅ Pass | — |
| User dengan role `owner` tidak muncul di daftar staf | ✅ Pass | Difilter di controller |

---

## 4. Pemeriksaan Backend & Keamanan

| Komponen | Status | Catatan |
|---|---|---|
| Route `/users/*` & `/stores/*` dilindungi `auth` | ✅ Pass | — |
| Route dilindungi `RoleMiddleware:owner` | ✅ Pass | Hanya owner yang bisa akses |
| `UserRequest::authorize()` → cek `role === OWNER` | ✅ Pass | — |
| `StoreRequest::authorize()` → cek `role === OWNER` | ✅ Pass | — |
| Password di-hash via `Hash::make()` di `UserService` | ✅ Pass | — |
| Password tidak diupdate jika field dikosongkan (edit mode) | ✅ Pass | — |
| `unique:users,username` dengan pengecualian ID saat edit | ✅ Pass | — |
| `unique:locations,code` dengan pengecualian ID saat edit | ✅ Pass | — |
| Audit log dicatat di setiap operasi CRUD & toggle | ✅ Pass | Via `AuditService` |

---

## 5. Daftar Bug & Perbaikan

### BUG-001 — Warna Aksen Tidak Konsisten (Minor)
- **File:** `Store/Index.jsx`, `Store/Form.jsx`, `User/Index.jsx`
- **Deskripsi:** Elemen UI menggunakan warna `indigo` (biru) padahal standar aksen aplikasi adalah `emerald` (hijau).
- **Perbaikan:** Semua class `indigo-*` diganti ke `emerald-*` (6 titik di Store/Index, 14 titik di Store/Form, 2 titik di User/Index).
- **Status:** ✅ Fixed

### BUG-002 — `assigned_users` Tidak Diproses (Critical)
- **File:** `app/Services/StoreService.php`
- **Deskripsi:** Data staf yang dipilih di form toko tidak pernah disimpan ke database. `assigned_users` array diteruskan langsung ke `Location::create()/update()` yang tidak mengenal kolom tersebut, sehingga diabaikan secara diam-diam.
- **Dampak:** Fitur assign staf ke toko **tidak berfungsi sama sekali**, yang berarti toko tidak bisa pernah memenuhi syarat minimum staf untuk diaktifkan.
- **Perbaikan:** Ekstrak `assigned_users` dari `$data`, update `users.location_id` secara eksplisit setelah simpan toko. Pada `updateStore`, tambahan logika unassign user yang dihapus dari selection.
- **Status:** ✅ Fixed

### BUG-003 — Error Toggle Tidak Ditampilkan ke User (Major)
- **File:** `app/Http/Controllers/StoreController.php`, `app/Http/Controllers/UserController.php`
- **Deskripsi:** Ketika `ValidationException` dilempar oleh `StoreService::toggleStore()` atau `UserService::toggleUser()`, exception tidak di-catch di controller. Laravel mengembalikan respons 422, tapi Inertia/frontend tidak menampilkan pesan error apapun ke user — UI diam tanpa feedback.
- **Perbaikan:** Tambah `try-catch` di method `toggle()` kedua controller, dengan `return back()->with('error', ...)` agar pesan error muncul via `flash.error` yang sudah ada di UI.
- **Status:** ✅ Fixed

---

## 6. Catatan & Rekomendasi

> [!NOTE]
> Badge warna per role (`amber`=owner, `indigo`=admin, `sky`=stockist, `slate`=kasir) sengaja **tidak diubah** karena merupakan penanda semantik role yang berbeda, bukan bagian dari skema warna aksen UI utama.

> [!NOTE]
> Filter Toko & Role di halaman Manajemen User menggunakan **client-side filtering**. Jika jumlah user berkembang besar (>100/halaman), pertimbangkan migrasi ke server-side filtering dengan query parameter.

> [!WARNING]
> Dropdown role `owner` **dapat dipilih** oleh owner saat membuat user baru. Perlu klarifikasi bisnis: apakah sistem mengizinkan multi-owner? Jika tidak, role `owner` perlu difilter dari pilihan.

> [!TIP]
> Pertimbangkan menambahkan **Delete** (soft-delete) sebagai alternatif toggle nonaktif, agar riwayat audit tetap terjaga namun user yang sudah tidak relevan tidak mengotori list.

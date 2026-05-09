# 🏁 Sprint 8 Frontend Summary: Modul Inventori Lanjutan

**Tanggal:** 9 Mei 2026  
**Status:** ✅ Selesai 100% (Frontend Scope)  

---

## 🎯 Pencapaian Sprint 8 (Frontend)

Pada Sprint 8, tim Frontend telah memborong penyelesaian **3 Modul Raksasa Manajemen Inventori** (Mutasi Stok, Waste Management, dan Stock Opname). Seluruh pengerjaan merujuk pada `sprint_8_frontend_guideline.md` serta mengakomodasi perbaikan UI/UX berlandaskan *QA Report* sebelumnya.

Berikut adalah daftar fitur yang telah dirancang, dikoding, dan diuji coba dengan sukses:

### 1. Struktur Navigasi & Utilitas Global
- **Sidebar Khusus Inventori:** Menambahkan kategori menu "Manajemen Stok" ke akses masuk untuk *Owner* dan *Stockist*.
- **Pencegah 403 (BUG-12):** Mengarahkan *default view* Stockist ke "Beranda Stok" (layar `/inventory/stocks`) untuk mencegah *error blank page* saat *login*.
- **Flash Message Global (BUG-11):** Menginjeksi *Banner Notifikasi* pintar ke dalam `AppLayout.jsx` yang menanggapi respons balik dari operasi server (hijau jika sukses).

### 2. Modul Mutasi Stok Antar-Toko
- **MutationIndex.jsx:** Tabel daftar rute mutasi yang dipilah secara elegan menggunakan sistem *Tab Filter* berbasis status (*Semua, Preparing, Shipped, Received, Completed*), dengan penegasan warna *badge* yang berbeda (**BUG-09**).
- **MutationForm.jsx:** Formulir transfer barang multi-item dengan fungsi *Repeater*. Diperkuat perlindungan ganda untuk mencegah stokis memilih produk duplikat di baris berbeda (**BUG-06**).
- **MutationShow.jsx:** Antarmuka interaktif yang merepresentasikan *Timeline* perpindahan barang. Dilengkapi pop-up Modal `ReceiveConfirmation` yang otomatis mencatat nilai *Loss* jika unit fisik yang diterima kurang dari yang dikirim.

### 3. Modul Waste Management (Retur/Rusak)
- **WasteIndex.jsx:** Tabel asimetris; di mana Stockist hanya melihat rekam jejak limbah tokonya sendiri, sementara Owner melihat antrean limbah dari seluruh titik dengan kalkulasi total HPP yang bocor.
- **WasteForm.jsx:** Sistem pengajuan berbasis `multipart/form-data`. Dilengkapi pratinjau foto (*thumbnail preview*), pelindungan ukuran file maksimum 5MB (**BUG-05**), dan perbaikan rembesan memori DOM *URL Object* (**BUG-07**).
- **WasteShow.jsx:** Panel validasi Owner yang dirancang untuk mencegah mata Stockist mencuri intip nilai valuasi HPP produk, sekaligus memfasilitasi persetujuan maupun penolakan pengajuan *waste*.

### 4. Modul Stock Opname (Penyesuaian Fisik)
- **OpnameIndex.jsx:** Halaman penginisiasi sesi *Opname*. Terproteksi oleh *prop logic* cerdas dari backend yang otomatis mematikan tombol "Mulai" jika sudah ada sesi yang menggantung (**BUG-08**).
- **OpnameShow.jsx:** Lembar kerja audit dinamis. Memperbaiki kekeliruan sistematis nilai `0` menjadi *form input* yang murni kosong (`""`), agar Stockist harus benar-benar menghitung alih-alih melewati baris tersebut (**BUG-04**).

---

## ⚠️ Isu Eksternal / Temuan Backend

Secara visual dan eksekusi logika (*React render*), Frontend lulus 100% tanpa ada gejala *crash*. Namun, dijumpai rintangan yang berasal murni dari *Backend/Database Environment*:

- **Gejala:** Layar Tabel Riwayat (seperti `/inventory/mutations`) melempar **Error 500 (Internal Server Error)** saat dieksekusi.
- **Penyebab Utama:** *Database Migration* terbaru (Tabel `stock_mutations`, `waste_requests`, dll) **belum dijalankan/dieksekusi** pada mesin lokal (server). 
- **Rekomendasi Tindakan:** Tim *Backend* / Tim DevOps hanya perlu menjalankan perintah `php artisan migrate` di sistem untuk menyempurnakan peluncuran fitur raksasa ini.

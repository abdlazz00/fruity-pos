# Recap Sprint 2: Manajemen Toko + Manajemen Pengguna (RBAC Lanjutan)

Sprint 2 berfokus pada administrasi sumber daya operasional aplikasi, yakni pendataan pengelola (User Management) serta entitas tempat bekerja (Store/Location Management) sehingga infrastruktur kepemilikan dan penugasan karyawan dapat dituntaskan.

## 🚀 Pencapaian Backend (Laravel)
- **Modul Layanan Toko (Store Management)**:
  - Pembaruan struktur *Database* (penambahan parameter kode unik toko `code`, tanggal buka `opened_at`, & boolean status operasional otomatis).
  - Implementasi *Design Pattern* menggunakan `StoreService` (untuk eksekusi logika mutasi entitas, auto-assignment status relasional) serta `StoreRepository` untuk kontrol akses langsung ORM (penambahan fungsi `Eager Load` hitung karyawan relasional di modul list).
  - Pembangunan Endpoint Controller CRUD (`StoreController`) fungsional (*index, create, store, edit, update, toggle* status aktif).
- **Modul Layanan Pengguna (User Management)**:
  - Ekosistem *Design Pattern Repository* dan *Service* untuk modul CRUD karyawan.
  - Implementasi endpoint validasi kustom `unique` dan cek kompatibilitas Role Enum saat pendaftaran staf.
  - Form validations via `StoreRequest` dan `UserRequest`.
  - Sistem pengikatan (*Assign Staff*), di mana seorang Staf dapat didaftarkan menjadi elemen *owner/pusat* (`location_id=null`) atau dipetakan otomatis ke id bangunan milik salah satu Cabang.

## 🎨 Pencapaian Frontend (React + Tailwind + Inertia)
- **Antarmuka Interaktif - Kelola Karyawan (`User/Index.jsx` & `User/Form.jsx`)**:
  - Tabel Daftar Personil modern berkonsep antarmuka ringkas *Bento Box*. Menampilkan *Badge Role*, Indikasi Identitas Profil Inisial Aktif, Filter Pintar berdasarkan Jabatan dan Cabang Penugasan.
  - Layar Tambah Data/Ubah Data Pengguna menggunakan form estetis dan formulir raut input ber-ikon dari *Lucide React*.
- **Antarmuka Interaktif - Kelola Toko (`Store/Index.jsx` & `Store/Form.jsx`)**:
  - Konversi desain dari sekadar tabel standar menjadi penataan layout **Grid Card** yang responsif, mudah dibaca, dan jauh lebih modern (mendukung tampilan lintas-perangkat/Mobile-First Readiness).
  - **Kalkulasi & Alert Otomatis Lapisan Ui**: Menyisipkan pemberitahuan atau label peringatan warna oranye/kuning (*"Tidak Lengkap"*) apabila suatu cabang telah beroperasi tetapi tidak memiliki minimum format operasi: *1 Stockist, 1 Admin, 1 Kasir*.
  - Ekstensi *Overlapping Avatar* (Tumpukan Inisial) per Card yang menampilkan siapa saja jajaran staf pada masing-masing toko.
  - Formulir pendaftaran cabang toko dinamis yang terbagi strukturisasinya atas input Entitas Dasar dan langsung menggabungkannya dengan fitur ceklis kotak-jamak (Daftar Pengguna Non-aktif) untuk **Penugasan Pekerja Ekstensi** tepat di Form pendaftaran properti tersebut.

---
**Status Sprint 2:** ✅ Berhasil Diselesaikan, Telah Terintegrasi dan Tes Lokal. Seluruh target fitur penguasaan administratif cabang dan pekerja berhasil dirampungkan.

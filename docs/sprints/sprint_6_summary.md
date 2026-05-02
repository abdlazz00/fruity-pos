# Recap Sprint 6: Point of Sale (POS) & Manajemen Shift

Sprint 6 berfokus pada pembangunan inti transaksi kasir fisik dan pesanan online (Point of Sale), serta manajemen siklus hidup laci kasir (Shift). Modul ini mengintegrasikan pengaturan harga dari Sprint 5 dan pemotongan stok otomatis dari Sprint 4.

## 🚀 Pencapaian Backend (Laravel)
- **Struktur Database Transaksional**:
  - Pembuatan tabel `shifts` untuk melacak modal awal, pemasukan kasir, serta pencatatan selisih kas (*actual vs expected balance*).
  - Pembuatan tabel `transactions` dan `transaction_items` yang menyimpan *snapshot* informasi produk (harga, kuantitas) saat transaksi terjadi demi menjaga integritas data historis.
- **Implementasi Service Layer**:
  - `ShiftService`: Mengelola logika pembukaan shift (modal laci) dan penutupan shift (rekonsiliasi otomatis perhitungan pemasukan kas).
  - `TransactionService`: Memisahkan logika transaksi menjadi *Offline* (oleh Kasir) dan *Online* (oleh Admin). Di dalamnya terenkapsulasi logika pemotongan persediaan (`deductStock`), validasi harga dasar (*locked price*), dan penerapan otomatis tier diskon jumlah (*wholesale pricing*). Semua dibungkus dengan *Database Transactions* (`DB::transaction`) untuk memastikan tidak ada parsial data tersimpan.
- **Penyediaan API & Controllers**:
  - Endpoint `ShiftController` dengan dukungan pagination riwayat transaksi (25 data/page).
  - `PosOfflineController` dan `PosOnlineController` dilengkapi validasi ketat terkait keberadaan shift aktif.

## 🎨 Pencapaian Frontend (React + Tailwind + Inertia)
- **Antarmuka Manajemen Shift (`Shift/Index.jsx`)**:
  - Sistem layar otomatisasi *Dashboard* (KPI total transaksi, pemasukan tunai vs non-tunai, dan uang berjalan) atau formulir *"Buka Shift"* berdasarkan status kerja kasir.
  - Implementasi popup interaktif (Modal) untuk merekonsiliasi tutup shift serta untuk membedah *Detail Transaksi* per riwayat pemesanan secara komprehensif.
- **Antarmuka Kasir POS Offline (`Pos/Offline.jsx`)**:
  - Layout POS modern berkonsep 2 kolom asimetris (Katalog Produk & Keranjang Pemesanan).
  - Integrasi efek penyusutan *Sidebar* otomatis (*auto-collapse*) untuk keleluasaan visibilitas layar kasir.
  - Sistem keranjang asinkron canggih (*CartItem*) dengan input gramasi yang diantisipasi logika validasi *over-stock* secara seketika (*real-time validation*).
- **Antarmuka Kasir POS Online (`Pos/Online.jsx`)**:
  - Konversi tata letak menjadi tipe formulir tumpuk (4-Card form) berisikan kolom detail pelanggan (Nama, Alamat), integrasi platform eksternal (GoFood/Grab), hingga parameter ongkos kirim.
  - Opsi *Autocomplete Textbox* ringkas khusus admin dalam menambah item pesanan untuk mempercepat proses entri.
- **Komponen Ekstensi Pembayaran & Sukses (Reusable)**:
  - `PaymentModal.jsx`: Modal kalkulator *smart* pelunasan dengan hitungan matematis instan penyedia "Kembalian".
  - `TransactionResultModal.jsx`: Layar popup penanda visual indikator "Berhasil/Gagal" (*center of screen*) sesaat pasca-pemrosesan pesanan berhasil divalidasi.
- **Keamanan Data Layer Presentasi**:
  - Pengecualian total terhadap paparan nilai *HPP* dan *Margin* di semua jendela ber-entitas kasir untuk melindungi data kerahasiaan profit margin perusahaan.

---
**Status Sprint 6:** ✅ Berhasil Diselesaikan, Telah Terintegrasi dan Lulus Live QC. Terminal penjualan kasir (POS) telah siap beroperasi dan mencetak pemasukan.

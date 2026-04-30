# 🧪 Laporan Hasil Quality Control (QC) — Sprint 5
**Modul:** Pricing Engine (Sistem Manajemen Harga & Margin)
**Tanggal:** 30 April 2026
**Status Pengujian:** ✅ Lolos (Passed)

---

## 1. Skenario Pengujian (Test Cases)
Setelah fase pengembangan *backend* dan *frontend* selesai, dilakukan *End-to-End Testing* untuk seluruh *workflow* Sprint 5, khususnya untuk memverifikasi logika finansial (HPP) dan UI/UX Owner.

### A. Flow Perhitungan HPP Baseline Otomatis
- [x] Sistem (*Event Listener*) berhasil menangkap trigger dari setiap penyelesaian dokumen *Inbound*.
- [x] Sistem sukses menghitung *Weighted Average Cost* (WAC) menghasilkan `avg_cost` yang akurat pada setiap lokasi gudang/toko.
- [x] Logika *Pricing*: Sistem otomatis mengambil nilai tertinggi (`MAX(avg_cost)`) dari seluruh lokasi untuk diset sebagai `hpp_baseline` demi melindungi margin keuntungan.
- [x] Sistem secara mandiri membuat record harga berstatus `pending` bagi barang yang baru pertama kali masuk.

### B. Halaman Daftar Harga (Pricing Index - UI Owner)
- [x] 4 *KPI Cards* (Total Diset, Locked, Pending, Belum Diset) muncul dan angka ter-update secara *real-time*.
- [x] Tabel daftar harga muncul dengan kolom HPP Baseline, Margin, Harga Jual, Status, dan Aksi.
- [x] Filter status (Semua / Pending / Locked) dan Kolom Pencarian SKU/Produk berfungsi dengan normal.
- [x] *Alert Box* di bagian bawah halaman berhasil menampilkan daftar khusus produk-produk yang belum pernah di-Inbound (belum memiliki HPP).

### C. Halaman Detail Produk & Margin Calculator
- [x] Menampilkan rincian komparasi tabel **HPP per Toko**; sistem secara visual memberikan sorotan khusus (badge merah) untuk toko dengan HPP tertinggi.
- [x] *Margin Calculator* bersifat interaktif (slider dan input angka) dan sinkron dua arah.
- [x] Fitur **Pembulatan (Rounding)** sukses memperbarui perhitungan Harga Jual final secara *live* tanpa nge-lag (Opsi: Rp100, Rp500, Rp1.000).
- [x] Margin aktual di setiap toko dihitung otomatis dan diberikan kode warna (Hijau = di atas target, Kuning = rendah, Merah = minus).
- [x] Modul *Multi-Tier Pricing* sukses melakukan CRUD untuk harga grosir secara berurutan.

### D. Fitur Distribusi Harga (Lock/Unlock)
- [x] Tombol aksi terintegrasi dengan modal konfirmasi interaktif.
- [x] Mengunci harga ("Lock") berhasil mengubah status harga menjadi `locked`, serta memancarkan event `PriceLocked` yang siap ditangkap oleh terminal Kasir (POS).
- [x] *Unlock* berhasil menarik produk dari katalog Kasir.

---

## 2. Temuan Bug & Perbaikan Terakhir (Resolutions)
Selama fase QC akhir integrasi PO-Inbound-Pricing, ditemukan 1 isu *logical* yang langsung diselesaikan:

1. 🐛 **Isu:** Produk yang **baru pertama kali** di-Inbound tidak langsung muncul di antrean tabel "Pending" pada *Pricing Engine*, melainkan "nyangkut" di peringatan "Produk Belum Diset Harga". Hal ini terjadi karena sistem *event listener* `RecalculateHppBaseline` hanya memodifikasi data harga yang sudah ada, namun gagal melakukan *insert* jika data sebelumnya *null*.
   ✅ **Solusi:** Modifikasi dilakukan pada metode `recalculateAndSaveBaseline()` di file `app/Services/PricingService.php`. Kami menambahkan fungsi *create fallback* sehingga produk baru secara *default* akan dibuatkan record dengan `margin=0%` dan status `pending` pada tabel `product_prices` segera setelah proses *Inbound* dikonfirmasi.

---

**Kesimpulan QC:** 
Sprint 5 (Pricing Engine) berhasil mencapai status *Production-Ready*. Modul yang sangat krusial ini berhasil mengimplementasikan *separation of concern* (Stockist hanya fokus pada QTY masuk, sementara Owner fokus pada HPP dan Set Harga Jual). Seluruh *flow* perhitungan uang bekerja dengan akurasi dua angka desimal (*round*) tanpa kendala, dengan *user-experience* kalkulator yang *premium* dan reaktif. Modul ini sekarang siap diintegrasikan penuh sebagai sumber data harga untuk aplikasi POS pada Sprint 6.

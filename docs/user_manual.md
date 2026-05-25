# 📖 Panduan Penggunaan Sistem (User Manual) — FruityPOS

Selamat datang di **FruityPOS**, sistem kasir dan manajemen inventaris berbasis web yang dirancang khusus untuk operasional toko buah. Panduan ini dirancang untuk membantu setiap peran (*role*) memahami alur kerja dan cara menggunakan fitur-fitur di dalam aplikasi secara optimal.

---

## 📌 Daftar Peran (Roles) & Akses
Aplikasi memiliki **4 tipe akun pengguna** dengan hak akses yang berbeda sesuai dengan fungsinya masing-masing:

| Role / Peran | Tanggung Jawab Utama | Akses Modul |
|---|---|---|
| **Owner (Pemilik Toko)** | Memantau performa bisnis, mengatur harga jual, melihat laporan laba rugi lengkap, serta mengelola toko & pengguna. | Semua Modul (Full Access) |
| **Stockist (Petugas Gudang)** | Mengelola stok masuk/keluar, membuat PO ke supplier, memproses transfer barang, opname fisik, serta melaporkan buah rusak. | Inventaris, PO, Inbound, Mutasi, Opname, Waste |
| **Kasir (Petugas Kasir)** | Memproses transaksi penjualan langsung di toko, baik saat online maupun saat koneksi internet mati (Offline Mode). | Sesi Shift, POS Offline |
| **Admin (Petugas Kasir Online)**| Memproses penjualan langsung yang tersambung instan ke database server. | Sesi Shift, POS Online |

---

## 👨‍💼 1. Panduan Khusus: OWNER (Pemilik Toko)

Fokus utama Owner adalah memantau kesehatan keuangan toko dan mengatur kebijakan harga.

### A. Dashboard & Analisis Bisnis
Saat pertama kali login, Anda akan disambut oleh Dashboard interaktif yang menyajikan data *real-time*:
* **KPI Utama:** Total Pendapatan, Laba Kotor, Total Transaksi, dan Qty Produk Terjual.
* **Filter Tanggal & Lokasi:** Anda dapat menyaring data performa berdasarkan cabang toko tertentu atau rentang tanggal tertentu.
* **Grafik Tren:** Grafik visual tren penjualan harian/mingguan dan persentase kontribusi per kategori buah.

### B. Menggunakan Pricing Engine (Mengatur Harga Jual & HPP)
FruityPOS secara otomatis menghitung HPP (Harga Pokok Penjualan) berdasarkan metode **Weighted Average Cost (WAC)** setiap kali ada barang masuk dari supplier. Sebagai Owner, Anda bertugas menetapkan harga jual:
1. Buka menu **Pricing Engine** -> **Daftar Harga**.
2. Pilih produk buah yang ingin Anda atur harganya. Anda akan melihat nilai **HPP Baseline** saat ini.
3. Masukkan persentase **Margin** yang diinginkan (contoh: `25` untuk margin 25%).
4. Pilih metode **Rounding (Pembulatan)** (contoh: dibulatkan ke kelipatan terdekat `1.000` atau `500`). Sistem otomatis menghitung estimasi Harga Jual.
5. **Grosir (Tier Pricing):** Anda bisa menambahkan harga grosir khusus. Contoh: *"Jika membeli minimal 10 kg, harga turun menjadi Rp 18.000/kg"*.
6. Klik **Lock Harga** agar produk tersebut aktif dan otomatis muncul di aplikasi kasir (POS). Jika statusnya *Pending / Unlocked*, produk tersebut tidak akan bisa dijual oleh Kasir.

### C. Mengakses Laporan Keuangan
Masuk ke menu **Laporan** untuk melihat analisis mendalam:
* **Laporan Laba Rugi (Profit & Loss):** Menyajikan total pendapatan dikurangi HPP produk terjual dan nilai kerugian buah rusak (*waste*).
* **Laporan Shift Kasir:** Memantau rekonsiliasi kas kasir, uang modal awal, total penjualan tunai/non-tunai, serta **selisih kas (plus/minus)** setelah kasir menutup laporannya.
* **Komparasi HPP:** Melihat perbandingan performa harga modal antar cabang untuk produk yang sama.

---

## 📦 2. Panduan Khusus: STOCKIST (Petugas Gudang & Inventaris)

Stockist bertanggung jawab menjaga ketersediaan buah dan memastikan pencatatan mutasi fisik tercatat dengan akurat.

### A. Alur Pengadaan (Purchase Order & Inbound)
1. **Membuat PO (Draft):**
   * Masuk ke menu **Pengadaan** -> **Purchase Order** -> **Buat PO Baru**.
   * Pilih **Supplier**, isi tanggal target, lalu klik **+ Tambah Baris**.
   * Pilih produk buah, masukkan jumlah pesanan (*quantity*), serta estimasi harga beli. Klik **Simpan Draft**.
   * *Catatan:* PO yang baru dibuat berstatus **Draft**. Anda atau Owner harus mengonfirmasinya menjadi **Confirmed** sebelum barang dikirim oleh supplier.
2. **Memproses Penerimaan Barang (Inbound):**
   * Saat buah tiba di toko, masuk ke menu **Pengadaan** -> **Barang Masuk** -> **Proses Inbound**.
   * Pilih nomor PO yang sesuai.
   * Masukkan jumlah buah fisik yang benar-benar diterima (jika ada buah yang busuk/kurang di jalan, sesuaikan angkanya).
   * Klik **Submit Inbound**. Stok di toko akan otomatis bertambah, dan sistem otomatis menghitung ulang HPP produk tersebut menggunakan rumus rata-rata tertimbang.

### B. Mutasi Stok (Transfer Buah Antar Cabang)
Jika Cabang A kelebihan stok buah Apel dan Cabang B kekurangan, Anda dapat melakukan mutasi:
1. Buka menu **Manajemen Stok** -> **Mutasi Stok** -> **Buat Mutasi**.
2. Pilih Lokasi Asal, Lokasi Tujuan, produk, dan jumlah yang ingin dikirim. Klik **Submit**. Status mutasi akan menjadi **Preparing**.
3. Saat buah dikemas dan dikirim, klik **Ship (Kirim)**. Status berubah menjadi **Shipped**.
4. Petugas di lokasi tujuan wajib login, membuka mutasi tersebut, memeriksa kondisi fisik buah yang datang, menginput jumlah yang diterima, lalu klik **Receive (Terima)** dan **Selesai (Complete)**. 
5. Jika ada selisih (misal dikirim 20 kg, tapi hanya diterima 18 kg karena busuk di jalan), sistem akan otomatis mencatat kerugian selisih (*Loss*) sebanyak 2 kg.

### C. Manajemen Buah Rusak (Waste Management)
Karena buah adalah produk yang mudah membusuk (*perishable*), laporkan setiap penyusutan stok akibat kerusakan:
1. Masuk ke **Manajemen Stok** -> **Waste / Rusak** -> **Buat Laporan Waste**.
2. Pilih buah yang rusak, masukkan jumlah kg/pcs yang dibuang, pilih alasan (busuk, bonyok, pecah), dan **wajib unggah foto fisik buah** sebagai bukti valid.
3. Klik **Submit**. Laporan berstatus **Pending** dan akan dikirim ke Owner untuk disetujui. Setelah disetujui oleh Owner, stok buah di sistem baru akan otomatis dikurangi.

### D. Stock Opname (Pencocokan Stok Fisik)
Lakukan stock opname secara berkala (misal seminggu sekali) untuk mencocokkan stok di sistem dengan fisik di rak:
1. Masuk ke **Manajemen Stok** -> **Stock Opname** -> **Mulai Opname**. Sistem akan mengambil snapshot stok saat itu juga.
2. Hitung fisik buah di rak, lalu input angka fisiknya ke dalam tabel sistem.
3. Klik **Submit**. 
4. Setelah disetujui oleh Owner, sistem akan otomatis melakukan penyesuaian stok (*Stock Adjustment*). Selisih kurang atau lebih akan tercatat secara otomatis.

---

## 🛒 3. Panduan Khusus: KASIR (Point of Sale - POS)

Kasir bertugas melayani pelanggan secara cepat dan akurat di meja kasir.

### A. Alur Membuka Shift (Penting Sebelum Mulai Menjual)
Sebelum dapat mengakses layar penjualan (POS), Anda **wajib** membuka shift:
1. Masuk ke menu **Sesi Shift** -> klik **Buka Shift**.
2. Input jumlah uang tunai yang ada di laci kasir sebagai **Saldo Awal / Modal Awal** (contoh: `500000` untuk Rp 500.000).
3. Klik **Buka Shift Sekarang**. Layar penjualan POS kini sudah aktif dan bisa diakses.

### B. Memproses Transaksi di POS Offline
Aplikasi kasir didesain sangat tangguh menghadapi koneksi internet yang tidak stabil:
1. Masuk ke **POS Offline**.
2. **Memilih Produk:** Klik pada gambar/nama buah di katalog. Buah akan otomatis masuk ke keranjang belanja di sebelah kanan.
3. **Mengatur Jumlah (Decimal Qty):** Untuk produk buah yang ditimbang, Anda dapat memasukkan angka desimal (contoh: `1.5` untuk pembelian 1,5 kg).
4. **Metode Pembayaran:** Klik tombol **Bayar**.
   * Pilih metode: **Tunai** atau **E-Wallet (QRIS)**.
   * Masukkan nominal uang yang diterima dari pelanggan. Sistem otomatis menghitung kembalian uang tunai yang harus diserahkan.
5. Klik **Konfirmasi & Cetak Struk**.

### C. Cara Kerja Mode Offline (Saat Internet Mati)
Jika tiba-tiba koneksi internet di toko Anda terputus total:
* 🔴 **Indikator Offline:** Aplikasi kasir akan menampilkan bar/ikon merah bertuliskan **Offline**.
* **Tetap Bisa Jualan:** Anda **tetap bisa bertransaksi seperti biasa**! Layar kasir tidak akan macet. Semua transaksi selama internet mati akan disimpan sementara secara super aman di dalam memori penyimpanan lokal browser (*IndexedDB*).
* **Pending Badge:** Di layar kasir akan muncul badge angka penunjuk (misal: `3 Pending Sync`), yang berarti ada 3 transaksi lokal yang belum terkirim ke server.
* **Auto-Sync:** Begitu koneksi internet kembali normal (indikator berubah menjadi hijau/Online), aplikasi kasir akan **otomatis menyinkronkan** dan mengirimkan seluruh transaksi pending tersebut ke database server di latar belakang tanpa mengganggu aktivitas penjualan Anda.

### D. Menutup Shift & Rekonsiliasi Kas (Setiap Akhir Hari/Gantian Shift)
Setelah tugas Anda selesai, lakukan penutupan shift untuk mencocokkan uang di laci:
1. Masuk ke menu **Sesi Shift** -> klik **Tutup Shift**.
2. Hitung total uang tunai fisik yang ada di laci kasir Anda saat itu, lalu input nominal totalnya ke kolom **Saldo Aktual**.
3. Klik **Tutup Shift & Kirim Laporan**.
4. Sistem akan otomatis membandingkan:
   * **Saldo Ekspektasi** (Uang Modal Awal + Total Penjualan Tunai hari itu) VS **Saldo Aktual** (Uang fisik yang Anda hitung).
   * Jika ada selisih, sistem akan mencatat **Selisih Kas** (Plus jika berlebih, Minus jika kurang). Laporan ini langsung dikirim ke sistem Owner untuk di-review.

---

## 💡 Tips & Panduan Pemecahan Masalah (Troubleshooting)

* **Tanya:** *Kenapa produk buah tertentu tidak muncul di layar kasir (POS)?*
  * **Jawab:** Pastikan Owner sudah melakukan **Lock Harga** pada produk tersebut di menu *Pricing Engine*. Jika statusnya masih *Pending*, Kasir tidak dapat melihat produk tersebut di katalog.
* **Tanya:** *Kenapa notifikasi "Low Stock" berbunyi terus?*
  * **Jawab:** Itu pertanda stok fisik buah di toko Anda sudah berada di bawah ambang batas minimum yang diatur di menu *Reorder Point*. Segera buat Purchase Order (PO) baru untuk menyuplai stok buah tersebut dari supplier.
* **Tanya:** *Bagaimana jika data transaksi offline tidak mau tersinkronisasi padahal internet sudah menyala kembali?*
  * **Jawab:** Pastikan browser Anda tidak dalam mode *Private/Incognito* yang membatasi kapasitas penyimpanan IndexedDB, dan lakukan refresh halaman kasir sekali untuk memicu ulang *background synchronization script*.

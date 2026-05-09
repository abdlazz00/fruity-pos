# 📝 Sprint 8 Frontend Execution Plan: Mutasi, Waste, & Opname

Berdasarkan *guideline*, rangkuman *backend*, dan catatan QC E2E, Sprint 8 berfokus pada 3 pilar utama manajemen Inventori untuk Stockist dan Owner. Kita juga akan menyisipkan perbaikan UI/UX berdasarkan temuan *bug* di QA Report.

Berikut adalah perencanaan fase (*step-by-step*) eksekusinya:

---

## 🛠️ Fase 1: Persiapan Navigasi & Komponen Reusable
Kita mulai dari pintu masuk dan elemen visual yang akan dipakai berulang-ulang di ketiga modul.
- **Tugas Utama:**
  1. Memodifikasi `Sidebar.jsx`: Tambahkan grup menu "Inventori" (Mutasi, Waste, Opname) untuk role `owner` dan `stockist`. *(Menyinggung BUG-12).*
  2. Membuat *helper* konfigurasi warna status (`StatusBadge` configs) untuk memastikan keseragaman UI.
  3. Menambahkan area *Flash Message* pada `AppLayout.jsx` agar setiap aksi (Ship/Receive/Approve) memunculkan notifikasi hijau *(Menjawab BUG-11)*.

---

## 📦 Fase 2: Modul Mutasi Stok (Antar-Toko)
Mengamankan perpindahan stok dari satu toko ke toko lain.
- **Tugas Utama:**
  1. Membangun `MutationIndex.jsx` dengan tabel dan *tabs* filter status. *(Menjawab BUG-09: Membedakan warna 'Received' (biru) dan 'Completed' (hijau))*
  2. Membangun `MutationForm.jsx` dengan fitur dinamis *tambah baris* produk. *(Menjawab BUG-06: Mencegah user memilih produk yang sama di 2 baris berbeda).*
  3. Membangun `MutationShow.jsx` (alur persetujuan Ship → Receive → Complete).
  4. Merakit Modal `ReceiveConfirmation.jsx` untuk mencatat jumlah aktual yang diterima dan menghitung status *Loss*.

---

## 🗑️ Fase 3: Modul Waste Management (Buah Rusak/Busuk)
Modul untuk mencatat buah yang terbuang dan membutuhkan persetujuan Owner.
- **Tugas Utama:**
  1. Membangun `WasteIndex.jsx` (Tampilan asimetris: Stockist hanya melihat tokonya, Owner melihat semua yang *pending* beserta nilai HPP).
  2. Membangun `WasteForm.jsx` dengan fitur unggah foto wajib `multipart/form-data`. 
     - *(Menjawab BUG-05: Injeksi peringatan file maks 5MB).*
     - *(Menjawab BUG-07: Membersihkan memory leak pada `URL.createObjectURL`).*
  3. Membangun `WasteShow.jsx`: Layout panel foto bukti untuk di-*review* Owner dan tombol Approve/Reject.

---

## 📊 Fase 4: Modul Stock Opname (Penyesuaian Fisik)
Modul audit bulanan untuk menyamakan stok sistem dengan stok gudang asli.
- **Tugas Utama:**
  1. Membangun `OpnameIndex.jsx` untuk daftar sesi audit. *(Menjawab BUG-08: Mengamankan tombol "Mulai" dengan prop khusus `has_active_opname`)*.
  2. Membangun `OpnameShow.jsx` yang memiliki 3 tahap render (*In Progress*, *Submitted*, *Approved*).
  3. *Modifikasi Kritis:* *(Menjawab BUG-04: Mengubah default nilai `physical_quantity` menjadi teks kosong `""` agar Stockist tidak tertipu mengira stok sudah dihitung).*
  4. Menampilkan nominal penyusutan (*shrinkage value*) secara eksklusif hanya untuk mata Owner.

---

*Saya sudah mempelajari pola backend, larangan keamanan akses HPP, serta semua peringatan dari tim QA. Jika Anda setuju dengan fase perencanaan ini, silakan beri lampu hijau untuk langsung kita hajar eksekusi **Fase 1**!* 🚀

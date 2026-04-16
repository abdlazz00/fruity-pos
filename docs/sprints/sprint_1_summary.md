# Recap Sprint 1: Project Setup + Authentication

Sprint 1 difokuskan pada fondasi awal proyek FruityPOS, meliputi setup lingkungan pengembangan, arsitektur dasar Laravel-React (menggunakan stack Inertia.js), serta implementasi pilar utama sistem keamanan dan *Role-Based Access Control* (RBAC).

## 🚀 Pencapaian Backend (Laravel)
- **Setup Lingkungan & Database**: Konfigurasi `.env` untuk integrasi database MySQL (`fruity-pos`) serta penerapan engine.
- **Model & Database Migrations**: 
  - Basis tabel `users` untuk kredensial autentikasi utama.
  - Basis tabel `locations` untuk pendataan entitas cabang operasional (konsep *Multi-Tenant* dasar).
- **Arsitektur Autentikasi Sistem**: 
  - Pengembangan sistem kustom Login dengan middleware Sanctum/Session guard.
  - Implementasi *Forgot Password Flow* lengkap berbasis OTP via Email (SMTP Gmail Integration).
- **Role-Based Access Control (RBAC)**:
  - Pembuatan *Enum Role* yang ketat (`OWNER`, `ADMIN`, `STOCKIST`, `KASIR`).
  - Penciptaan middleware esensial seperti `RoleMiddleware` untuk melindungi Endpoint API berdasarkan peran dan otorisasi.
  - Penyiapan `LocationScope` sebagai *Global Scope* atau batasan akses sehingga Staf hanya memproses data dari ranah domain Toko tempat mereka ditugaskan.

## 🎨 Pencapaian Frontend (React + Tailwind + Inertia)
- **Scaffolding Proyek & UI/UX Dasar**: 
  - Integrasi Inertia.js dan manipulasi Vite Configuration (contoh: Path Alias Vite).
  - Skema warna, *Typography*, penataan fondasi UI yang terpusat melalui Tailwind CSS untuk menjamin kesan aplikasi *SaaS Premium*.
- **Komponen *Reusable* & Navigasi**: 
  - Pembuatan *Master Layouts* seperti `GuestLayout` (untuk area public/Login) dan `AppLayout` (untuk panel *Dashboard*).
  - Penyusunan `Sidebar` dinamis dan estetik, menampilkan tautan menu yang menyesuaikan dengan otorisasi jenis peran staf, serta fitur *Collapse Sidebar*.
  - Penyusunan `Header` dengan jejak *Breadcrumbs* fungsional serta tombol navigasi profil (*User Menu*).
- **Halaman Fungsional**:
  - Halaman **Login** dengan antarmuka dinamis (*Split Screen UI*).
  - Halaman pemulihan otentikasi (**Lupa Password**, Input OTP Form).
  - Tampilan dasar layar masuk otomatis `Dashboard` (Placeholder *Welcome* Dashboard).

---
**Status Sprint 1:** ✅ Berhasil Diselesaikan, Telah Terintegrasi dan Tes Lokal.

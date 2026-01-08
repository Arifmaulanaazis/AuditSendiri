# AuditSendiri

![AuditSendiri Banner](frontend/public/logo.png)

AuditSendiri adalah apikasi manajemen audit yang dibangun menggunakan **Go (Golang)** untuk backend dan **React (Vite)** untuk frontend. Aplikasi ini mendukung fitur logging audit, manajemen pengguna, dan antarmuka modern yang responsif.

## 🚀 Teknologi Stack

### Backend
- **Language:** Go 1.25.3
- **Framework:** Fiber v2
- **Database:** SawitDB (Embedded / Local File DB)
- **Auth:** JWT (JSON Web Tokens)
- **Security:** bcrypt

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** TailwindCSS v4
- **UI Library:** jokoUI
- **Language:** TypeScript

**🚨 Darurat: Bantuan Banjir Aceh**
Mohon dukung saudara-saudari kita di Aceh.

[![Kitabisa](https://img.shields.io/badge/Kitabisa-Bantu%20Aceh-blue?style=flat&logo=heart)](https://kitabisa.com/campaign/donasipedulibanjiraceh)

*Diselenggarakan oleh Human Initiative Aceh*

---

## 📋 Prasyarat

Sebelum memulai, pastikan Anda telah menginstal:

- **Go**: Versi 1.25 atau lebih baru. [Download Go](https://go.dev/dl/)
- **Node.js**: Versi 18 atau lebih baru (LTS direkomendasikan). [Download Node.js](https://nodejs.org/)
- **Git**: Untuk kloning repositori.

---

## 🛠️ Instalasi & Setup

Ikuti langkah-langkah berikut untuk menjalankan aplikasi di komputer lokal Anda.

### 1. Kloning Repositori

```bash
git clone https://github.com/Arifmaulanaazis/AuditSendiri.git
cd AuditSendiri
```

### 2. Konfigurasi Backend

Sebelum menjalankan backend, Anda perlu mengatur variabel lingkungan.

1. Salin file contoh konfigurasi:
   ```bash
   cp .env.example .env
   # Di Windows (Command Prompt):
   # copy .env.example .env
   ```

2. Edit file `.env` dan sesuaikan nilainya.
   - **JWT_SECRET**: **Wajib diisi!** Minimal 32 karakter.
   - **ALLOWED_ORIGINS**: Sesuaikan dengan domain frontend jika perlu (default sudah mencakup localhost).
   - **PORT**: Port server (default: 3000).

   **Contoh .env:**
   ```ini
   JWT_SECRET=rahasia-super-panjang-min-32-karakter-harus-diganti
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   PORT=3000
   DB_PATH=./data
   ```

   > **Tips:** Anda bisa generate JWT Secret menggunakan command: `openssl rand -base64 64` atau script `generate-jwt-secret.ps1` jika tersedia.

3. Download dependensi Go:
   ```bash
   go mod tidy
   ```

### 3. Setup Frontend

Aplikasi frontend perlu dibangun (build) agar bisa disajikan oleh backend Go.

1. Masuk ke folder frontend:
   ```bash
   cd frontend
   ```

2. Install dependensi:
   ```bash
   npm install
   ```

3. Jalankan aplikasi frontend:
   ```bash
   npm run dev
   ```

---

## ▶️ Menjalankan Aplikasi

Setelah semua setup selesai, Anda dapat menjalankan aplikasi.

### Mode Produksi (Recommended)
Jalankan backend server yang akan melayani API sekaligus Frontend yang sudah di-build.

```bash
go run cmd/main.go
```

Akses aplikasi di: [http://localhost:5173](http://localhost:5173)

### Mode Development (Opsional)
Jika Anda ingin mengembangkan frontend dengan fitur *Hot Reload*:

1. **Terminal 1 (Backend):**
   ```bash
   go run cmd/main.go
   ```

2. **Terminal 2 (Frontend):**
   ```bash
   cd frontend
   npm run dev
   ```
   Akses frontend dev server di URL yang muncul (biasanya [http://localhost:5173](http://localhost:5173)).
   
   > **Catatan:** Pastikan `ALLOWED_ORIGINS` di `.env` mencakup port frontend dev server.

---

## 📂 Struktur Folder

```
AuditSendiri/
├── cmd/
│   └── main.go          # Entry point aplikasi backend
├── frontend/            # Source code frontend (React + Vite)
│   ├── dist/            # Hasil build frontend (dibuat otomatis)
│   ├── src/             # Source code React
│   └── package.json     # Konfigurasi Node.js
├── internal/            # Kode internal backend
│   ├── api/             # API Handlers & Routes
│   ├── db/              # Database Setup
│   └── domain/          # Model Domain & Logika Bisnis
├── data/                # Data database (terbuat otomatis)
├── .env                 # Konfigurasi Environment (Jangan di-commit!)
├── go.mod               # Dependensi Go
└── README.md            # Dokumentasi ini
```

## 📚 Referensi

- **joko-ui**: [https://github.com/rayasabari/joko-ui](https://github.com/rayasabari/joko-ui)
- **sawitDB**: [https://github.com/WowoEngine/SawitDB](https://github.com/WowoEngine/SawitDB)
- **Go Fiber**: [https://gofiber.io/](https://gofiber.io/)
- **React**: [https://react.dev/](https://react.dev/)
- **Vite**: [https://vitejs.dev/](https://vitejs.dev/)
- **TailwindCSS**: [https://tailwindcss.com/](https://tailwindcss.com/)
- **Lucide Icons**: [https://lucide.dev/](https://lucide.dev/)
- **Recharts**: [https://recharts.org/](https://recharts.org/)
- **Framer Motion**: [https://www.framer.com/motion/](https://www.framer.com/motion/)

## ⚠️ Troubleshooting

- **Error `.env file not found`**: Pastikan Anda sudah membuat file `.env` di root folder.
- **Error `JWT_SECRET required`**: Pastikan variabel `JWT_SECRET` diisi di file `.env`.
- **Frontend Blank/Putih**: Pastikan Anda sudah menjalankan `npm run build` di folder frontend sebelum menjalankan `go run cmd/main.go`.
- **Port Conflict**: Jika port 3000 sudah dipakai, ganti `PORT` di file `.env`.

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).


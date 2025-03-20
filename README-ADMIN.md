# Panduan Admin Blue Sky CBT

## Persiapan

Aplikasi Blue Sky CBT telah dilengkapi dengan fitur Admin yang terkoneksi ke database untuk mengelola sistem lebih aman.

## Inisialisasi Admin

Sebelum menggunakan fitur Admin, Anda perlu membuat akun admin pertama dengan langkah-langkah berikut:

1. Pastikan server dan database sudah berjalan
2. Jalankan perintah berikut di terminal (pada direktori server):

```bash
npm run init-admin
```

3. Ikuti petunjuk di terminal untuk memasukkan:
   - Nama Admin
   - Email Admin
   - Password Admin

## Login sebagai Admin

Setelah membuat akun admin, Anda bisa login dengan cara:

1. Buka aplikasi di browser
2. Klik "Login" di halaman utama
3. Di halaman login, klik tombol "Admin" di bagian bawah
4. Masukkan email dan password admin yang telah dibuat
5. Klik tombol "Login"

## Fitur Admin

Sebagai admin, Anda memiliki akses ke beberapa fitur:

1. **Dashboard Admin** - Melihat statistik dan informasi aplikasi
2. **Manajemen Soal** - Membuat, mengedit, dan menghapus soal
3. **Manajemen Ujian** - Membuat, mengedit, dan mengatur ujian
4. **Manajemen Pengguna** - Melihat dan mengelola pengguna aplikasi
5. **Laporan** - Melihat laporan hasil ujian

## Endpoints API Admin

Aplikasi dilengkapi dengan endpoints API untuk admin:

- `POST /api/admin/login` - Login admin
- `GET /api/admin/profile` - Mendapatkan profil admin
- `PUT /api/admin/profile` - Memperbarui profil admin
- `GET /api/admin` - Mendapatkan daftar admin (hanya bisa diakses admin)
- `POST /api/admin` - Membuat admin baru (hanya bisa diakses admin)
- `PUT /api/admin/change-password` - Mengganti password admin

## Keamanan

Sistem admin telah dilengkapi dengan fitur keamanan:

1. Authentication menggunakan JWT
2. Password dienkripsi dengan bcrypt
3. Middleware untuk melindungi routes
4. Pemisahan peran admin dan pengguna biasa

## Troubleshooting

### Lupa password admin?

Jika Anda lupa password admin, Anda perlu mengakses database langsung dan melakukan reset password:

```sql
-- Contoh query untuk reset password ke "admin123"
UPDATE "Admin" SET "password" = '$2b$10$qqWzKlWQYiCXx9tPhx.cfeGsXqWjXi3aNYRR8JN2JdGIkZ4P1aVS6' WHERE "email" = 'email-admin@example.com';
```

Password di atas adalah hash bcrypt dari "admin123". Segera ganti password setelah login.

### Token expired?

Jika token expired, Anda akan otomatis diarahkan ke halaman login. Token admin berlaku selama 1 hari. 
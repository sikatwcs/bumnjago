# Blue Sky CBT

## Aplikasi Computer Based Test untuk JAGOBUMN

Website ini sudah di-deploy pada VPS dengan PostgreSQL. Endpoint API: `https://api.jagobumn.com`

## Cara Menjalankan Aplikasi

### Menjalankan Server (Backend)

1. Masuk ke direktori server:
```bash
cd server
```

2. Install dependensi:
```bash
npm install
```

3. Setup database dengan Prisma:
```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Jalankan server:
```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

### Menjalankan Client (Frontend)

1. Masuk ke direktori client:
```bash
cd client
```

2. Install dependensi:
```bash
npm install
```

3. Jalankan aplikasi client:
```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

## Panduan Admin

### Inisialisasi Admin

Sebelum menggunakan fitur Admin, Anda perlu membuat akun admin pertama:

1. Pastikan server dan database sudah berjalan
2. Jalankan perintah berikut di terminal (pada direktori server):

```bash
npm run init-admin
```

3. Ikuti petunjuk di terminal untuk memasukkan:
   - Nama Admin
   - Email Admin
   - Password Admin

### Fitur Admin

Sebagai admin, Anda memiliki akses ke beberapa fitur:

1. **Dashboard Admin** - Melihat statistik dan informasi aplikasi
2. **Manajemen Soal** - Membuat, mengedit, dan menghapus soal
3. **Manajemen Ujian** - Membuat, mengedit, dan mengatur ujian
4. **Manajemen Pengguna** - Melihat dan mengelola pengguna aplikasi
5. **Laporan** - Melihat laporan hasil ujian

## Panduan Questioner

### Inisialisasi Questioner

Sebelum menggunakan fitur Questioner, Anda perlu membuat akun questioner pertama:

1. Pastikan server dan database sudah berjalan
2. Jalankan perintah berikut di terminal (pada direktori server):

```bash
npm run init-questioner
```

3. Ikuti petunjuk di terminal untuk memasukkan:
   - Nama Questioner
   - Email Questioner
   - Password Questioner

### Fitur Questioner

Sebagai questioner, Anda memiliki akses ke beberapa fitur:

1. **Dashboard Questioner** - Melihat statistik dan daftar soal
2. **Pembuatan Soal** - Membuat soal baru dengan berbagai tipe
3. **Pengelolaan Soal** - Mengedit dan menghapus soal yang telah dibuat
4. **Import/Export** - Mengimport atau mengeksport bank soal (jika tersedia)
5. **Pengelolaan Profil** - Mengubah data profil dan kata sandi

## Troubleshooting

### Lupa password admin?

Jika Anda lupa password admin, Anda perlu mengakses database langsung dan melakukan reset password:

```sql
-- Contoh query untuk reset password ke "admin123"
UPDATE "Admin" SET "password" = '$2b$10$qqWzKlWQYiCXx9tPhx.cfeGsXqWjXi3aNYRR8JN2JdGIkZ4P1aVS6' WHERE "email" = 'email-admin@example.com';
```

### Lupa password questioner?

Jika Anda lupa password questioner, Anda perlu mengakses database langsung dan melakukan reset password:

```sql
-- Contoh query untuk reset password ke "questioner123"
UPDATE "Questioner" SET "password" = '$2b$10$qqWzKlWQYiCXx9tPhx.cfeGsXqWjXi3aNYRR8JN2JdGIkZ4P1aVS6' WHERE "email" = 'email-questioner@example.com';
```

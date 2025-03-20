# Panduan Questioner Blue Sky CBT

## Persiapan

Aplikasi Blue Sky CBT telah dilengkapi dengan fitur Questioner yang terkoneksi ke database untuk mengelola pembuatan soal-soal dengan lebih aman.

## Inisialisasi Questioner

Sebelum menggunakan fitur Questioner, Anda perlu membuat akun questioner pertama dengan langkah-langkah berikut:

1. Pastikan server dan database sudah berjalan
2. Jalankan perintah berikut di terminal (pada direktori server):

```bash
npm run init-questioner
```

3. Ikuti petunjuk di terminal untuk memasukkan:
   - Nama Questioner
   - Email Questioner
   - Password Questioner

## Login sebagai Questioner

Setelah membuat akun questioner, Anda bisa login dengan cara:

1. Buka aplikasi di browser
2. Klik "Login" di halaman utama
3. Di halaman login, klik tombol "Questioner" di bagian bawah
4. Masukkan email dan password questioner yang telah dibuat
5. Klik tombol "Login"

## Fitur Questioner

Sebagai questioner, Anda memiliki akses ke beberapa fitur:

1. **Dashboard Questioner** - Melihat statistik dan daftar soal
2. **Pembuatan Soal** - Membuat soal baru dengan berbagai tipe (pilihan ganda, essay, dll)
3. **Pengelolaan Soal** - Mengedit dan menghapus soal yang telah dibuat
4. **Import/Export** - Mengimport atau mengeksport bank soal (jika tersedia)
5. **Pengelolaan Profil** - Mengubah data profil dan kata sandi

## Endpoints API Questioner

Aplikasi dilengkapi dengan endpoints API untuk questioner:

- `POST /api/questioner/login` - Login questioner
- `GET /api/questioner/profile` - Mendapatkan profil questioner
- `PUT /api/questioner/profile` - Memperbarui profil questioner
- `PUT /api/questioner/change-password` - Mengganti password questioner
- `POST /api/questioner` - Membuat questioner baru (hanya admin yang bisa mengakses)

## Keamanan

Sistem questioner telah dilengkapi dengan fitur keamanan:

1. Authentication menggunakan JWT
2. Password dienkripsi dengan bcrypt
3. Middleware untuk melindungi routes
4. Pemisahan peran questioner dan pengguna biasa

## Bagaimana Cara Membuat Soal

1. Login sebagai questioner
2. Masuk ke dashboard questioner
3. Klik tombol "Tambah Soal"
4. Pilih jenis soal (misalnya: pilihan ganda, essay, dsb)
5. Isi pertanyaan, pilihan jawaban (untuk soal pilihan ganda), dan tentukan jawaban yang benar
6. Tambahkan gambar jika diperlukan
7. Klik "Simpan" untuk menyimpan soal

## Troubleshooting

### Lupa password questioner?

Jika Anda lupa password questioner, Anda perlu mengakses database langsung dan melakukan reset password:

```sql
-- Contoh query untuk reset password ke "questioner123"
UPDATE "Questioner" SET "password" = '$2b$10$qqWzKlWQYiCXx9tPhx.cfeGsXqWjXi3aNYRR8JN2JdGIkZ4P1aVS6' WHERE "email" = 'email-questioner@example.com';
```

Password di atas adalah hash bcrypt dari "questioner123". Segera ganti password setelah login.

### Token expired?

Jika token expired, Anda akan otomatis diarahkan ke halaman login. Token questioner berlaku selama 1 hari. 
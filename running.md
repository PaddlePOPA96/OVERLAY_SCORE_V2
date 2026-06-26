# Panduan Perbaikan Struktur Kode (Refactoring) - scoreboard-next

Berikut adalah daftar rekomendasi perbaikan struktur direktori dan file untuk meningkatkan skalabilitas, kebersihan kode (clean code), dan kemudahan *maintenance*.

## 1. Sentralisasi Konfigurasi Environment (Secrets)
Saat ini parsing `.env` dilakukan secara tersebar, misalnya `JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)` langsung dipanggil di dalam `src/services/firebase/admin.js`.
**Tindakan yang perlu dilakukan:**
- Buat satu file khusus, misalnya `src/shared/configs/envConfig.js`.
- Pindahkan semua logika pembacaan `process.env` ke file tersebut.
- Lakukan validasi awal (fail-fast) di file tersebut sehingga jika ada variabel environment yang kurang, aplikasi akan langsung memberikan error yang jelas sebelum berjalan lebih jauh.

## 2. Pembersihan Duplikasi Modul Firebase
Terdapat banyak duplikasi file konfigurasi/inisialisasi di dalam folder `src/services/firebase/`.
**Daftar file duplikat yang ditemukan:**
- `app.js` vs `firebaseApp.js`
- `db.js` vs `firebaseDb.js`
- `auth.js` vs `firebaseAuth.js`
- `firestore.js` vs `firebaseFirestore.js`
- `admin.js` vs `firebaseAdmin.js` (sudah ditandai *deprecated*)

**Tindakan yang perlu dilakukan:**
- Pilih satu standar penamaan baku (misalnya: cukup simpan `app.js`, `db.js`, `auth.js`, `firestore.js`, dan `admin.js`).
- Hapus file versi *deprecated* (seperti `firebaseAdmin.js`, dsb).
- Lakukan *Find and Replace* pada seluruh proyek untuk memastikan baris `import` mengarah ke file yang benar. Ini sangat penting untuk mencegah *bug* akibat inisialisasi ganda pada Firebase (multiple instances).

## 3. Pemisahan Logika Bisnis dari API Routes
Saat ini, file-file di dalam `src/app/api/` (seperti proxy fetching, eksekusi shell `yt-dlp`, dan manipulasi string M3U8) memuat logika bisnis yang terlalu berat.
**Tindakan yang perlu dilakukan:**
- Jadikan file `route.js` hanya sebagai *Controller* (menerima request dari client, memanggil fungsi service, dan mengembalikan response).
- Pindahkan logika komputasi berat atau request pihak ketiga ke dalam folder `src/services/` atau `src/shared/utils/`.
- *Contoh:* Pindahkan fungsi `resolveInstagram()` dan pemanggilan `yt-dlp` dari `src/app/api/tiktok/route.js` ke file baru, misalnya `src/services/streams/tiktokResolver.js`.

## 4. Pengelompokan Route (App Router Grouping)
Struktur route yang terkait dengan *overlay* dan *room* saat ini masih agak tersebar. Ada yang tertanam jauh di dalam dashboard seperti `(dashboard)/dashboard/operator/overlay/[room]`, dan ada yang berada di luar seperti `/[room]/timer` atau `/[room]/tiktok`.
**Tindakan yang perlu dilakukan:**
- Kelompokkan semua route yang ditujukan untuk *overlay* publik (yang tidak memerlukan autentikasi operator/dashboard) ke dalam satu Route Group khusus, misalnya `(overlay)/[room]/...`.
- Pemisahan ini akan memudahkan penerapan *layout*, *middleware*, dan file CSS spesifik agar tidak bocor atau tercampur dengan UI Dashboard utama.

## 5. Pemisahan Komponen UI Global vs Spesifik Fitur
Folder `src/shared/components/ui/` saat ini menampung komponen dasar murni (`button.js`, `card.js`), namun juga menampung komponen kompleks yang spesifik untuk fitur tertentu seperti `RunningTextOverlay.js` dan `sidebar.js`.
**Tindakan yang perlu dilakukan:**
- Bersihkan `src/shared/components/ui/` agar hanya berisi komponen atomik (komponen reusable dasar tanpa logika bisnis atau state yang rumit).
- Pindahkan komponen kompleks seperti `RunningTextOverlay.js` ke folder fitur yang relevan, misalnya `src/features/overlay/components/` atau `src/shared/components/layout/` untuk sidebar.
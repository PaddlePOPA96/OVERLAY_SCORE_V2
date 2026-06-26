# Panduan Perbaikan Keamanan & Arsitektur (Security & Refactoring Fixes) - scoreboard-next

Dokumen ini berisi daftar kerentanan keamanan dan perbaikan arsitektur yang telah dan perlu dilakukan pada aplikasi.


## B. Temuan Lanjutan (Minor & Best Practices) ⚠️

### 1. Hardcoded Redirect (Potensi Open Redirect & Performa)
Di beberapa *Client Components*, proses pengalihan halaman dilakukan menggunakan API bawaan browser (`window.location`).

**File yang Terdampak:**
- `src/app/(dashboard)/dashboard/operator/_components/OperatorRoot.js` (Baris 498 & 561)

**Masalah:**
Menggunakan `window.location.replace('/login')` di Next.js akan memicu *full page reload* (memuat ulang seluruh aplikasi dari server), mengabaikan keuntungan performa dari arsitektur SPA (*Single Page Application*) Next.js. Selain itu, pola ini rentan menjadi *Open Redirect* jika suatu saat ditambahkan parameter URL yang dinamis tanpa validasi.

**Cara Memperbaiki:**
Ganti penggunaan `window.location` dengan Hooks `useRouter` bawaan Next.js.

```javascript
// Tambahkan import di atas file
import { useRouter } from 'next/navigation'

// Di dalam komponen:
const router = useRouter()

// Ubah:
// window.location.replace('/login')
// Menjadi:
router.replace('/login')
```

### 2. Sanitasi Parameter URL & Hash (Pencegahan DOM XSS)
**File yang Terdampak:**
- `src/app/(dashboard)/operator/page.jsx`

**Masalah:**
Nilai `roomId` diekstrak secara mentah dari `window.location.hash` dan query params tanpa proses pembersihan (*sanitization*). Walaupun React aman dalam merender teks (melakukan *auto-escaping*), tetap ada risiko XSS jika string tersebut nantinya digunakan di dalam URI (misalnya dimasukkan ke atribut `href` atau `src` iFrame).

**Cara Memperbaiki:**
Pastikan hanya karakter alfanumerik (atau karakter valid untuk ID) yang diterima, untuk memblokir injeksi *payload* berbahaya seperti `javascript:alert(1)`.

```javascript
// Di dalam src/app/(dashboard)/operator/page.jsx

const rawHash = window.location.hash.replace('#', '') || ''
const rawQuery = params.get('room') || ''

// Sanitasi: Hanya izinkan huruf, angka, dash, dan underscore
const sanitizeRoomId = (id) => id.replace(/[^a-zA-Z0-9_-]/g, '')

const safeRoomFromHash = sanitizeRoomRoom(rawHash)
const safeRoomFromQuery = sanitizeRoomId(rawQuery)

setRoomId(safeRoomFromQuery || safeRoomFromHash || authRoomId)
```

### 3. Pembaruan Dependensi (Vulnerability Alert)
Hasil pemindaian `pnpm audit` melaporkan adanya kerentanan pada pustaka bawaan aplikasi.

**Kerentanan Terdeteksi:**
- `next` (<14.2.25) -> Authorization Bypass
- `axios` (<1.8.2) -> SSRF & DoS
- `form-data` (<4.0.4) -> Unsafe Random Function

**Cara Memperbaiki:**
Buka terminal dan jalankan perintah:
```bash
pnpm update next axios form-data
```
*(Direkomendasikan untuk melakukan pengetesan aplikasi setelah proses update)*
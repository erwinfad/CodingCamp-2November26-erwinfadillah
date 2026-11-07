# Implementation Plan: Life Dashboard

## Overview

Implementasi aplikasi Life Dashboard sebagai pure Vanilla JS single-page app tanpa build tools. Urutan pengerjaan mengikuti dependency alami: scaffolding → HTML → CSS → shared helpers → empat widget JS → inisialisasi dashboard → tes properti opsional. Semua kode widget ditulis dalam satu file `js/app.js` menggunakan object literal sebagai namespace.

## Tasks

- [x] 1. Scaffolding struktur proyek
  - [x] 1.1 Buat file dan direktori dasar proyek
    - Buat `index.html` di root workspace
    - Buat direktori `css/` dan file `css/style.css`
    - Buat direktori `js/` dan file `js/app.js`
    - Buat direktori `test/` untuk pengujian opsional
    - _Requirements: 1.2_

- [x] 2. Struktur HTML
  - [x] 2.1 Buat markup dasar `index.html` dengan keempat widget
    - Tambahkan `<!DOCTYPE html>`, `<meta charset>`, `<meta viewport>`, dan link ke `css/style.css` serta `js/app.js`
    - Buat container utama `#dashboard` dengan empat section widget: `#greeting-widget`, `#timer-widget`, `#todo-widget`, `#links-widget`
    - Di dalam `#greeting-widget`: elemen `#greeting-time`, `#greeting-date`, `#greeting-text`
    - Di dalam `#timer-widget`: elemen `#timer-display`, tombol `#timer-btn-start`, `#timer-btn-stop`, `#timer-btn-reset`, dan `#timer-complete-msg`
    - Di dalam `#todo-widget`: `#todo-input`, `#todo-add-btn`, dan `<ul id="todo-list">`
    - Di dalam `#links-widget`: `#links-label-input`, `#links-url-input`, `#links-add-btn`, `#links-error-msg`, dan `<ul id="links-list">`
    - _Requirements: 1.1, 1.2_

- [x] 3. CSS dan layout
  - [x] 3.1 Tulis layout dasar dan desain visual widget di `css/style.css`
    - Terapkan CSS reset dan tipografi dasar
    - Buat layout grid/flexbox untuk `#dashboard` yang menampilkan keempat widget berdampingan pada layar lebar
    - Tambahkan `@media (max-width: 768px)` untuk menyusun widget dalam satu kolom vertikal
    - Pastikan tidak ada horizontal scroll pada lebar minimum 320px
    - Beri styling kartu widget (padding, border-radius, shadow), status task `done` (strikethrough), dan `#timer-complete-msg` yang hidden secara default
    - _Requirements: 1.5_

- [x] 4. Storage helpers
  - [x] 4.1 Implementasikan `storageGet` dan `storageSet` di `js/app.js`
    - Tulis fungsi `storageGet(key, fallback)`: ambil item dari `localStorage`, parse JSON, kembalikan `fallback` jika key tidak ada atau JSON tidak valid (bungkus `try/catch`)
    - Tulis fungsi `storageSet(key, value)`: serialize value ke JSON dan simpan ke `localStorage`, kembalikan `true` jika berhasil dan `false` jika gagal (bungkus `try/catch`)
    - _Requirements: 6.4, 6.5, 6.6_
  -

- [x] 5. Greeting Widget
  - [x] 5.1 Implementasikan `GreetingWidget` di `js/app.js`
    - Buat object literal `const GreetingWidget = { ... }` dengan method: `init()`, `tick()`, `formatTime(date)`, `formatDate(date)`, `getGreeting(hour)`
    - `formatTime` mengembalikan string `"HH:MM:SS"` dari objek Date
    - `formatDate` mengembalikan string tanggal panjang bahasa Indonesia (contoh: `"Senin, 3 November 2025"`) menggunakan `Date.toLocaleDateString('id-ID', ...)`
    - `getGreeting(hour)` memetakan: 5–11 → "Selamat Pagi", 12–14 → "Selamat Siang", 15–17 → "Selamat Sore", 18–23 dan 0–4 → "Selamat Malam"
    - `tick()` memperbarui `#greeting-time`, `#greeting-date`, `#greeting-text` setiap dipanggil
    - `init()` menjalankan `tick()` sekali langsung lalu memulai `setInterval(() => GreetingWidget.tick(), 1000)`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_
  - [x] 5.2 Tulis property test untuk getGreeting (P8)
    - **Property 8: Greeting sesuai dengan seluruh rentang jam dalam sehari**
    - **Validates: Requirements 2.3, 2.4, 2.5, 2.6**
    - Generator: `fc.integer({ min: 0, max: 23 })`
    - Tag komentar: `// Feature: life-dashboard, Property 8: Greeting sesuai jam`

- [x] 6. Focus Timer Widget
  - [x] 6.1 Implementasikan `TimerWidget` di `js/app.js`
    - Buat object literal `const TimerWidget = { ... }` dengan state internal: `timerState = { remaining: 25 * 60, running: false, intervalId: null }`
    - Implementasikan method: `init()`, `start()`, `stop()`, `reset()`, `tick()`, `onComplete()`, `render()`, `formatTime(seconds)`
    - `start()` hanya memulai interval jika `!timerState.running`; `stop()` memanggil `clearInterval` dan mempertahankan sisa waktu; `reset()` memanggil `clearInterval` dan mengembalikan `remaining` ke `25 * 60`
    - `tick()` mengurangi `remaining` satu detik, memanggil `render()`, dan memanggil `onComplete()` jika `remaining <= 0`
    - `onComplete()`: hentikan timer, tampilkan `#timer-complete-msg`, dan kirim `new Notification(...)` jika `Notification.permission === 'granted'`; jika tidak, gunakan fallback UI
    - `init()` query semua elemen DOM, pasang event listener untuk ketiga tombol, dan panggil `render()`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 7. To-Do List Widget
  - [x] 7.1 Implementasikan `TodoWidget` di `js/app.js`
    - Buat object literal `const TodoWidget = { ... }` dengan variabel state `let tasks = []`
    - Implementasikan `loadFromStorage()`: panggil `storageGet("life_dashboard_tasks", [])` dan simpan ke `tasks`
    - Implementasikan `saveToStorage()`: panggil `storageSet("life_dashboard_tasks", tasks)`
    - Implementasikan `addTask(text)`: validasi teks (trim, tolak jika kosong), buat task baru `{ id: "task_" + Date.now(), text, done: false }`, push ke `tasks`, panggil `saveToStorage()` lalu `render()`
    - Implementasikan `toggleTask(id)`: temukan task berdasarkan `id`, toggle `done`, simpan, render
    - Implementasikan `deleteTask(id)`: filter `tasks` untuk hapus item, simpan, render
    - _Requirements: 4.1, 4.2, 4.3, 4.8, 4.9, 4.10, 4.11, 6.1, 6.2, 6.4_
  - [x] 7.2 Implementasikan fungsi edit dan rendering `TodoWidget`
    - Implementasikan `editTask(id, text)`: validasi teks, update field `text` pada task yang cocok, simpan, render
    - Implementasikan `render()`: rebuild seluruh `<ul id="todo-list">` menggunakan `innerHTML`; setiap item task memiliki checkbox/toggle, teks (dengan class `done` jika selesai), tombol edit, dan tombol hapus dengan `data-action` dan `data-id`
    - Implementasikan `showEditInput(id)` dan `hideEditInput(id)` untuk menampilkan/menyembunyikan field edit inline
    - Implementasikan `handleEvent(e)` dengan event delegation: periksa `e.target.dataset.action` untuk routing ke `toggleTask`, `deleteTask`, `showEditInput`, `editTask`, `hideEditInput`
    - Pasang satu event listener `click` pada `#todo-list` di `init()` yang memanggil `handleEvent`
    - `init()` juga pasang listener pada `#todo-add-btn` (klik) dan `#todo-input` (keydown Enter) untuk memanggil `addTask`
    - _Requirements: 4.4, 4.5, 4.6, 4.7_
  - [x] 7.3 Tulis property test untuk validasi input task (P4 & P5)
    - **Property 4: Whitespace task input ditolak**
    - **Validates: Requirements 4.3**
    - **Property 5: Edit task dengan input kosong/whitespace mempertahankan teks lama**
    - **Validates: Requirements 4.6**
    - Tag komentar sesuai nomor property
  - [x] 7.4 Tulis property test untuk toggle dan length invariant (P6 & P7)
    - **Property 6: Toggle done adalah operasi round-trip**
    - **Validates: Requirements 4.8, 4.9**
    - **Property 7: Penambahan dan penghapusan task memelihara invariant panjang daftar**
    - **Validates: Requirements 4.2, 4.10**
    - Tag komentar sesuai nomor property

- [x] 8. Quick Links Widget
  - [x] 8.1 Implementasikan `LinksWidget` di `js/app.js`
    - Buat object literal `const LinksWidget = { ... }` dengan variabel state `let links = []`
    - Implementasikan `loadFromStorage()`, `saveToStorage()` menggunakan key `"life_dashboard_links"`
    - Implementasikan `validateUrl(url)`: return `true` jika dimulai `http://` atau `https://`
    - Implementasikan `validateLabel(lbl)`: return `true` jika panjang 1–50 karakter dan bukan whitespace-only
    - Implementasikan `addLink(label, url)`: validasi keduanya, tampilkan pesan error spesifik di `#links-error-msg` jika tidak valid; jika valid buat `{ id: "link_" + Date.now(), label, url }`, push ke `links`, simpan, render
    - Implementasikan `deleteLink(id)`: filter `links` untuk hapus item, simpan, render
    - Implementasikan `render()`: rebuild `<ul id="links-list">`; setiap item adalah `<a target="_blank">` dengan label dan tombol hapus dengan `data-action="delete"` dan `data-id`
    - Implementasikan `showError(msg)` untuk update `#links-error-msg`
    - Implementasikan `handleEvent(e)` dengan event delegation untuk aksi hapus pada `#links-list`
    - `init()` query semua elemen DOM, pasang event listener pada `#links-add-btn`, `#links-list`, lalu panggil `loadFromStorage()` dan `render()`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.3, 6.5_
  - [ ]* 8.2 Tulis property test untuk validasi URL dan label (P9)
    - **Property 9: Validasi URL dan label menolak semua input tidak valid**
    - **Validates: Requirements 5.3**
    - Generator URL: `fc.string()` dengan berbagai prefix; generator label: `fc.string()` dengan panjang variabel
    - Tag komentar: `// Feature: life-dashboard, Property 9: URL dan label validation`
  - [x] 8.3 Tulis property test untuk length invariant penambahan link (P10)
    - **Property 10: Penambahan link valid menambah panjang daftar tepat satu**
    - **Validates: Requirements 5.2**
    - Tag komentar: `// Feature: life-dashboard, Property 10: addLink length invariant`

- [x] 9. Inisialisasi dashboard dan error isolation
  - [x] 9.1 Implementasikan `initDashboard()` dan `showWidgetError()` di `js/app.js`
    - Tulis fungsi `showWidgetError(name)`: cari elemen `#${name.toLowerCase()}-widget` dan tambahkan pesan error yang informatif ke dalamnya
    - Tulis fungsi `initDashboard()`: buat array konfigurasi widget `[{ name, fn }]` untuk keempat widget, iterasi menggunakan `forEach` dan bungkus setiap `fn()` dalam `try/catch` yang memanggil `showWidgetError(name)` jika gagal
    - Panggil `initDashboard()` dari event listener `DOMContentLoaded`
    - _Requirements: 1.6_

- [x] 10. Checkpoint — Pastikan semua fungsionalitas inti berjalan
  - Buka `index.html` di browser dan verifikasi: jam berjalan real-time, timer hitung mundur, task CRUD bekerja dan persists setelah reload, link tersimpan dan terbuka di tab baru
  - Pastikan semua tests pass, tanya pengguna jika ada pertanyaan.

- [ ] 11. Tes properti (opsional)
  - [ ]* 11.1 Lengkapi dan jalankan semua property test di `test/test.html`
    - Pastikan semua 10 property test berjalan tanpa kegagalan (minimum 100 iterasi per property)
    - Buka `test/test.html` di browser dan verifikasi output di konsol
    - _Requirements: 4.2, 4.3, 4.6, 4.8, 4.9, 4.10, 4.11, 5.2, 5.3, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

## Notes

- Task yang ditandai `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Setiap task merujuk ke requirement spesifik untuk keterlacakan
- Semua property test menggunakan fast-check via CDN di `test/test.html` — tidak ada npm atau bundler yang dibutuhkan
- Fungsi pure seperti `getGreeting`, `validateUrl`, `validateLabel`, `formatTime`, dan `storageGet`/`storageSet` harus dapat diakses dari namespace global agar dapat diuji dari `test/test.html`
- Checkpoint pada task 10 memastikan validasi inkremental sebelum pengujian properti

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["3.1", "4.1"] },
    { "id": 3, "tasks": ["4.2", "4.3", "5.1"] },
    { "id": 4, "tasks": ["5.2", "6.1"] },
    { "id": 5, "tasks": ["7.1"] },
    { "id": 6, "tasks": ["7.2", "7.3"] },
    { "id": 7, "tasks": ["7.4", "8.1"] },
    { "id": 8, "tasks": ["8.2", "8.3", "9.1"] },
    { "id": 9, "tasks": ["11.1"] }
  ]
}
```

# Implementation Plan: TodoList App

## Overview

Implementasi aplikasi TodoList berbasis vanilla HTML/CSS/JavaScript dengan arsitektur State-Driven Rendering. Aplikasi terdiri dari tiga file utama (`index.html`, `style.css`, `app.js`) dengan suite pengujian menggunakan Vitest dan fast-check untuk property-based testing.

## Tasks

- [x] 1. Siapkan struktur proyek dan konfigurasi testing
  - Buat `index.html` dengan markup dasar: form input, daftar tugas, filter bar, dan area counter
  - Buat `style.css` dengan layout dasar, styling tugas (selesai vs belum selesai), dan filter aktif
  - Inisialisasi `package.json` dan instal dependensi: `vitest`, `fast-check`, `@vitest/coverage-v8`, `jsdom`
  - Buat `vitest.config.js` dengan konfigurasi environment jsdom
  - Buat struktur direktori `tests/unit/`, `tests/property/`, `tests/integration/`
  - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4, 3.5, 5.1, 5.5_

- [x] 2. Implementasi Data Model dan Validasi Input
  - [x] 2.1 Buat fungsi validasi `isValidTitle()` dan `getValidationError()` di `app.js`
    - `isValidTitle(title)`: kembalikan `false` jika title kosong setelah `trim()`, `true` jika ada setidaknya satu karakter non-whitespace
    - `getValidationError(title)`: kembalikan pesan error Bahasa Indonesia atau `null` jika valid
    - _Requirements: 1.4, 1.5, 7.4_

  - [x] 2.2 Tulis property test untuk validasi input (Property 2)
    - **Property 2: Judul Whitespace-Only Selalu Ditolak**
    - **Validates: Requirements 1.4, 1.5, 7.4**
    - File: `tests/property/task-operations.property.test.js`

  - [x] 2.3 Tulis unit test untuk `isValidTitle()` dan `getValidationError()`
    - Test: string kosong, string whitespace-only, string valid satu karakter, string dengan whitespace di ujung
    - File: `tests/unit/validation.test.js`

- [x] 3. Implementasi StorageService
  - [x] 3.1 Buat objek `StorageService` di `app.js` dengan `STORAGE_KEY`, `isAvailable()`, `load()`, dan `save()`
    - `isAvailable()`: deteksi menggunakan try/catch write-then-delete
    - `load()`: parse JSON dari localStorage, kembalikan `[]` jika gagal atau bukan array
    - `save(tasks)`: serialize ke JSON; silent no-op jika storage tidak tersedia
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 3.2 Tulis property test untuk StorageService (Property 9)
    - **Property 9: Penyimpanan ke localStorage adalah Round-Trip**
    - **Validates: Requirements 6.1, 6.2**
    - File: `tests/property/storage.property.test.js`

  - [x] 3.3 Tulis property test untuk operasi saat localStorage tidak tersedia (Property 10)
    - **Property 10: Semua Operasi Berjalan Tanpa Error Saat localStorage Tidak Tersedia**
    - **Validates: Requirements 6.4**
    - File: `tests/property/storage.property.test.js`

  - [ ]* 3.4 Tulis unit test untuk `StorageService`
    - Test: load data valid, load data korup, load bukan array, save dan read back, storage tidak tersedia
    - File: `tests/unit/storage.test.js`

- [ ] 4. Checkpoint - Pastikan semua test validasi dan storage lolos
  - Pastikan semua test lolos, tanyakan kepada pengguna jika ada pertanyaan.

- [ ] 5. Implementasi State Manager
  - [ ] 5.1 Inisialisasi objek `state` dan fungsi `addTask(title)` di `app.js`
    - Definisikan `state` dengan `tasks`, `filter`, `editingId`, `storageAvailable`
    - `addTask(title)`: validasi, buat Task baru dengan `crypto.randomUUID()` atau fallback, `completed: false`, `createdAt: Date.now()`, prepend ke `state.tasks`, panggil `StorageService.save()`
    - _Requirements: 1.2, 1.3, 6.1_

  - [ ]* 5.2 Tulis property test untuk penambahan tugas valid (Property 1)
    - **Property 1: Penambahan Tugas Valid Menghasilkan Tugas Baru dengan Status Belum Selesai**
    - **Validates: Requirements 1.2, 1.3**
    - File: `tests/property/task-operations.property.test.js`

  - [ ] 5.3 Implementasi `deleteTask(id)` di `app.js`
    - Filter `state.tasks` untuk menghapus task dengan `id` yang cocok; idempoten jika ID tidak ditemukan
    - Panggil `StorageService.save()` setelah penghapusan
    - _Requirements: 4.2, 6.1_

  - [ ]* 5.4 Tulis property test untuk penghapusan tugas (Property 7)
    - **Property 7: Penghapusan Tugas Bersifat Permanen**
    - **Validates: Requirements 4.2**
    - File: `tests/property/task-operations.property.test.js`

  - [ ] 5.5 Implementasi `toggleTask(id)` di `app.js`
    - Balik `completed` task yang cocok; idempoten jika ID tidak ditemukan
    - Panggil `StorageService.save()` setelah toggle
    - _Requirements: 3.2, 3.3, 6.1_

  - [ ]* 5.6 Tulis property test untuk toggle status (Property 6)
    - **Property 6: Toggle Status adalah Round-Trip (Idempoten Ganda)**
    - **Validates: Requirements 3.2, 3.3**
    - File: `tests/property/task-operations.property.test.js`

  - [ ] 5.7 Implementasi `editTask(id, newTitle)`, `startEditing(id)`, `cancelEditing()` di `app.js`
    - `startEditing(id)`: set `state.editingId = id`
    - `cancelEditing()`: set `state.editingId = null` tanpa mengubah task title
    - `editTask(id, newTitle)`: validasi; jika valid, update `task.title = newTitle.trim()` dan set `state.editingId = null`; simpan ke storage
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 6.1_

  - [ ]* 5.8 Tulis property test untuk mode edit (Properties 11, 12, 13)
    - **Property 11: Mode Edit Diinisialisasi dengan Judul Tugas Saat Ini**
    - **Property 12: Penyimpanan Edit dengan Judul Valid Memperbarui Tugas**
    - **Property 13: Pembatalan Edit Memulihkan Judul Asli**
    - **Validates: Requirements 7.2, 7.3, 7.5**
    - File: `tests/property/edit.property.test.js`

  - [ ] 5.9 Implementasi `setFilter(filter)` di `app.js`
    - Update `state.filter` ke nilai baru (`'all'`, `'active'`, atau `'completed'`)
    - _Requirements: 5.2, 5.3, 5.4_

  - [ ]* 5.10 Tulis unit test untuk semua fungsi state mutation
    - Test: addTask dengan judul valid/invalid, deleteTask dengan ID valid/tidak ada, toggleTask, editTask, setFilter
    - File: `tests/unit/state.test.js`

- [ ] 6. Implementasi Render Engine
  - [ ] 6.1 Buat fungsi `render()` sebagai entry point tunggal pembaruan DOM di `app.js`
    - Panggil sub-fungsi: `renderTaskList()`, `renderCounter()`, `renderFilterBar()`, `renderEmptyState()`
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ] 6.2 Implementasi `renderTaskList()` — render daftar tugas sesuai filter aktif
    - Hitung `filteredTasks` dari `state.tasks` sesuai `state.filter`
    - Urutkan berdasarkan `createdAt` descending
    - Render setiap task: judul, status visual (teks dicoret jika selesai), Tombol_Selesai, Tombol_Hapus
    - Jika task sedang di-edit (`state.editingId === task.id`), render input edit sebagai pengganti judul
    - _Requirements: 2.1, 2.3, 3.1, 3.5, 4.1, 7.1, 7.2_

  - [ ]* 6.3 Tulis property test untuk urutan tampilan tugas (Property 3)
    - **Property 3: Daftar Tugas Selalu Diurutkan dari Paling Baru**
    - **Validates: Requirements 2.1**
    - File: `tests/property/task-operations.property.test.js`

  - [ ] 6.4 Implementasi `renderCounter()` — render jumlah tugas belum selesai
    - Hitung `activeCount = state.tasks.filter(t => !t.completed).length`
    - _Requirements: 2.4_

  - [ ]* 6.5 Tulis property test untuk counter tugas belum selesai (Property 4)
    - **Property 4: Counter Tugas Belum Selesai Selalu Akurat**
    - **Validates: Requirements 2.4**
    - File: `tests/property/task-operations.property.test.js`

  - [ ] 6.6 Implementasi `renderFilterBar()` dan `renderEmptyState()` di `app.js`
    - `renderFilterBar()`: tambahkan kelas active pada filter yang sesuai `state.filter`
    - `renderEmptyState()`: tampilkan pesan jika `filteredTasks.length === 0`
    - _Requirements: 2.2, 5.5_

  - [ ]* 6.7 Tulis property test untuk filter tugas (Property 8)
    - **Property 8: Filter Mengembalikan Hanya Tugas dengan Status yang Sesuai**
    - **Validates: Requirements 5.2, 5.3, 5.4**
    - File: `tests/property/filter.property.test.js`

  - [ ]* 6.8 Tulis property test untuk render item tugas (Property 5)
    - **Property 5: Render Tugas Selalu Menampilkan Judul dan Status**
    - **Validates: Requirements 2.3, 3.5**
    - File: `tests/property/task-operations.property.test.js`

  - [ ]* 6.9 Tulis unit test untuk render engine
    - Test: daftar kosong menampilkan empty state, filter aktif menampilkan visual yang benar, counter akurat setelah toggle
    - File: `tests/unit/render.test.js`

- [ ] 7. Checkpoint - Pastikan semua test state dan render lolos
  - Pastikan semua test lolos, tanyakan kepada pengguna jika ada pertanyaan.

- [ ] 8. Implementasi Event Handlers dan Pending Queue
  - [ ] 8.1 Implementasi `handleAddTask()` dan binding event di `app.js`
    - Bind event `click` pada `#btn-tambah` dan `keydown (Enter)` pada `#input-tugas`
    - Panggil `addTask()` dengan nilai input; tampilkan error jika tidak valid; kosongkan input jika berhasil
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ] 8.2 Implementasi `handleToggleTask(id)` dengan pending queue
    - Implementasi flag `processingToggle` dan array `pendingToggles`
    - Jika sedang diproses, push ke queue; jika tidak, proses langsung dan cek queue setelah `setTimeout(0)`
    - Bind event `click` pada `.btn-selesai`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ] 8.3 Implementasi `handleDeleteTask(id)`, `handleStartEdit(id)`, `handleSaveEdit(id)`, `handleCancelEdit()`
    - `handleDeleteTask`: panggil `deleteTask(id)` dan `render()`; bind `click` pada `.btn-hapus`
    - `handleStartEdit`: panggil `startEditing(id)` dan `render()`; bind `dblclick` pada `.task-title`
    - `handleSaveEdit`: validasi dan panggil `editTask()`; tampilkan error jika invalid; bind `keydown (Enter)` dan `blur` pada `.edit-input`
    - `handleCancelEdit`: panggil `cancelEditing()` dan `render()`; bind `keydown (Escape)` pada `.edit-input`
    - _Requirements: 4.1, 4.2, 4.3, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ] 8.4 Implementasi `handleSetFilter(filter)` dan binding event filter bar
    - Bind event `click` pada `.filter-btn`; panggil `setFilter()` dan `render()`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 9. Implementasi Inisialisasi Aplikasi dan Error Handling
  - [ ] 9.1 Buat fungsi inisialisasi aplikasi di `app.js`
    - Deteksi ketersediaan localStorage saat halaman dimuat; set `state.storageAvailable`
    - Jika tidak tersedia, tampilkan banner peringatan
    - Muat data dari `StorageService.load()` ke `state.tasks`
    - Panggil `render()` untuk pertama kali
    - Bind semua event handler
    - _Requirements: 6.2, 6.3, 6.4_

  - [ ] 9.2 Implementasi penanganan error inline untuk form input dan edit
    - Tampilkan pesan error dekat elemen input saat validasi gagal
    - Hapus pesan error saat pengguna mulai mengetik kembali
    - _Requirements: 1.4, 1.5, 1.6, 7.4, 7.6_

- [ ] 10. Checkpoint - Pastikan semua test lolos dan alur aplikasi berjalan
  - Pastikan semua test lolos, tanyakan kepada pengguna jika ada pertanyaan.

- [ ] 11. Tulis Integration Tests
  - [ ]* 11.1 Tulis integration test alur lengkap aplikasi
    - Test: load halaman → tambah tugas → tampilkan tugas → toggle status → filter → hapus tugas
    - Test: simulasi refresh (reload dari localStorage)
    - Test: localStorage tidak tersedia — banner tampil, operasi tetap berjalan in-memory
    - File: `tests/integration/app.integration.test.js`
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.3, 3.2, 4.2, 5.2, 5.3, 5.4, 6.2, 6.3, 6.4_

- [ ] 12. Final Checkpoint - Pastikan semua test lolos
  - Jalankan seluruh test suite (`vitest --run`), pastikan semua test lolos. Tanyakan kepada pengguna jika ada pertanyaan.

## Notes

- Task yang ditandai `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Setiap task mereferensikan requirement spesifik untuk keterlacakan
- Checkpoint memastikan validasi incremental di setiap fase
- Property tests memvalidasi properti kebenaran universal (13 properti) menggunakan fast-check
- Unit tests memvalidasi contoh spesifik dan kondisi tepi
- Seluruh implementasi menggunakan vanilla HTML/CSS/JavaScript tanpa framework atau build tool
- Pengujian menggunakan Vitest + fast-check + jsdom; jalankan dengan `npx vitest --run`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1"] },
    { "id": 1, "tasks": ["2.2", "2.3", "3.1"] },
    { "id": 2, "tasks": ["3.2", "3.3", "3.4", "5.1"] },
    { "id": 3, "tasks": ["5.2", "5.3"] },
    { "id": 4, "tasks": ["5.4", "5.5"] },
    { "id": 5, "tasks": ["5.6", "5.7"] },
    { "id": 6, "tasks": ["5.8", "5.9", "5.10"] },
    { "id": 7, "tasks": ["6.1"] },
    { "id": 8, "tasks": ["6.2", "6.4", "6.6"] },
    { "id": 9, "tasks": ["6.3", "6.5", "6.7", "6.8", "6.9"] },
    { "id": 10, "tasks": ["8.1", "8.2", "8.3", "8.4"] },
    { "id": 11, "tasks": ["9.1"] },
    { "id": 12, "tasks": ["9.2"] },
    { "id": 13, "tasks": ["11.1"] }
  ]
}
```

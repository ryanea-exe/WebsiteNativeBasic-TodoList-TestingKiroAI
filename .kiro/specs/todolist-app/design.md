# Design Document: TodoList App

## Overview

Aplikasi TodoList adalah aplikasi web frontend berbasis vanilla HTML/CSS/JavaScript yang berjalan sepenuhnya di sisi klien (client-side). Tidak ada server atau API eksternal — seluruh logika berjalan di browser dan data disimpan menggunakan `localStorage`.

### Tujuan Teknis

- Menyediakan antarmuka yang responsif untuk membuat, membaca, memperbarui, dan menghapus tugas
- Mempertahankan data antar sesi browser menggunakan `localStorage`
- Mengimplementasikan filter berdasarkan status tugas
- Mendukung pengeditan judul tugas secara inline
- Beroperasi secara graceful ketika `localStorage` tidak tersedia

### Pendekatan Desain

Aplikasi menggunakan arsitektur **State-Driven Rendering**: satu objek state terpusat merepresentasikan seluruh kondisi aplikasi, dan UI di-render ulang setiap kali state berubah. Ini memastikan UI selalu konsisten dengan data.

```
State Object → Render Function → DOM
    ↑                                 |
    └──────── Event Handlers ─────────┘
```

---

## Architecture

### Arsitektur Keseluruhan

```
┌─────────────────────────────────────────────────────┐
│                   Browser (Client)                  │
│                                                     │
│  ┌───────────────┐    ┌──────────────────────────┐  │
│  │   index.html  │    │       app.js             │  │
│  │               │    │  ┌────────────────────┐  │  │
│  │  - Form Input │    │  │   State Manager    │  │  │
│  │  - Task List  │◄───┤  │  (in-memory state) │  │  │
│  │  - Filter Bar │    │  └────────┬───────────┘  │  │
│  │  - Counters   │    │           │               │  │
│  └───────────────┘    │  ┌────────▼───────────┐  │  │
│                       │  │  Storage Service   │  │  │
│  ┌───────────────┐    │  │  (localStorage)    │  │  │
│  │   style.css   │    │  └────────────────────┘  │  │
│  └───────────────┘    └──────────────────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │               localStorage                  │    │
│  │  Key: "todolist_app_tasks"                  │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Struktur File

```
Program-TodoListApp/
├── index.html          # Markup utama aplikasi
├── style.css           # Styling seluruh aplikasi
└── app.js              # Seluruh logika aplikasi
```

Aplikasi ini sengaja didesain sebagai single-file JavaScript tanpa build tools, bundler, atau framework untuk menjaga kesederhanaan.

### Alur Data

```
User Action
     │
     ▼
Event Handler (di app.js)
     │
     ▼
State Mutation Function
  (addTask / toggleTask / deleteTask / editTask / setFilter)
     │
     ├──► Storage Service (persist ke localStorage)
     │
     └──► render() — rebuild seluruh UI dari state
```

---

## Components and Interfaces

### 1. State Manager

Bertanggung jawab menyimpan dan memodifikasi state aplikasi.

```javascript
// State terpusat
const state = {
  tasks: [],          // Array of Task objects
  filter: 'all',      // 'all' | 'active' | 'completed'
  editingId: null,    // ID tugas yang sedang diedit, atau null
  storageAvailable: true
};
```

**Fungsi Mutasi State:**

| Fungsi | Deskripsi |
|---|---|
| `addTask(title)` | Membuat dan menambahkan Task baru; validasi whitespace-only |
| `deleteTask(id)` | Menghapus Task berdasarkan ID |
| `toggleTask(id)` | Membalik status `completed` sebuah Task |
| `editTask(id, newTitle)` | Memperbarui judul Task; validasi whitespace-only |
| `setFilter(filter)` | Mengubah filter aktif |
| `startEditing(id)` | Menetapkan `state.editingId` |
| `cancelEditing()` | Membatalkan mode edit |

### 2. Storage Service

Mengelola semua interaksi dengan `localStorage` dan menangani ketidaktersediaan.

```javascript
const StorageService = {
  STORAGE_KEY: 'todolist_app_tasks',

  isAvailable(): boolean,       // Deteksi ketersediaan localStorage
  load(): Task[],               // Muat tasks dari localStorage, kembalikan [] jika gagal
  save(tasks: Task[]): void,    // Simpan tasks ke localStorage; silent no-op jika tidak tersedia
};
```

Deteksi ketersediaan menggunakan pola try/catch write-then-delete untuk memastikan tidak hanya terdeteksi ada, tetapi juga bisa digunakan.

### 3. Render Engine

Fungsi `render()` adalah satu-satunya entry point untuk memperbarui DOM. Ia membaca `state` dan menghasilkan ulang seluruh tampilan.

```javascript
function render(): void
  │
  ├── renderTaskList()     // Render daftar tugas sesuai filter aktif
  ├── renderCounter()      // Render jumlah tugas belum selesai
  ├── renderFilterBar()    // Highlight filter aktif
  └── renderEmptyState()   // Tampilkan pesan jika daftar kosong
```

### 4. Input Validation

Fungsi validasi murni (pure functions) yang tidak memiliki side effect:

```javascript
function isValidTitle(title: string): boolean
// Returns false jika title kosong setelah trim()
// Returns true jika title memiliki setidaknya satu karakter non-whitespace

function getValidationError(title: string): string | null
// Returns pesan error dalam Bahasa Indonesia, atau null jika valid
```

### 5. Event Handlers

Tabel event yang di-bind saat halaman dimuat:

| Event | Target | Handler |
|---|---|---|
| `click` | `#btn-tambah` | `handleAddTask()` |
| `keydown (Enter)` | `#input-tugas` | `handleAddTask()` |
| `click` | `.btn-selesai` | `handleToggleTask(id)` |
| `click` | `.btn-hapus` | `handleDeleteTask(id)` |
| `dblclick` | `.task-title` | `handleStartEdit(id)` |
| `keydown (Enter)` | `.edit-input` | `handleSaveEdit(id)` |
| `keydown (Escape)` | `.edit-input` | `handleCancelEdit()` |
| `blur` | `.edit-input` | `handleSaveEdit(id)` |
| `click` | `.filter-btn` | `handleSetFilter(filter)` |

### 6. Pending Queue (Status Toggle)

Sesuai Requirement 3.4, perubahan status yang tidak dapat diproses segera harus diantrekan. Ini diimplementasikan dengan flag sederhana:

```javascript
let processingToggle = false;
const pendingToggles = []; // Array of task IDs

function handleToggleTask(id) {
  if (processingToggle) {
    pendingToggles.push(id);
    return;
  }
  processingToggle = true;
  toggleTask(id);
  // proses pending queue setelah render selesai
  setTimeout(() => {
    processingToggle = false;
    if (pendingToggles.length > 0) {
      handleToggleTask(pendingToggles.shift());
    }
  }, 0);
}
```

---

## Data Models

### Task Object

```javascript
/**
 * @typedef {Object} Task
 * @property {string}  id        - UUID unik, dibuat dengan crypto.randomUUID() atau fallback
 * @property {string}  title     - Judul tugas, tidak boleh kosong atau whitespace-only
 * @property {boolean} completed - Status tugas: true = selesai, false = belum selesai
 * @property {number}  createdAt - Unix timestamp (ms) saat tugas dibuat, digunakan untuk pengurutan
 */
```

**Contoh:**

```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "title": "Belajar properti berbasis pengujian",
  "completed": false,
  "createdAt": 1718000000000
}
```

### State Object

```javascript
/**
 * @typedef {Object} AppState
 * @property {Task[]}          tasks            - Semua tugas (tidak difilter)
 * @property {'all'|'active'|'completed'} filter - Filter aktif saat ini
 * @property {string|null}     editingId        - ID tugas dalam mode edit, atau null
 * @property {boolean}         storageAvailable - Apakah localStorage dapat digunakan
 */
```

### localStorage Schema

Data disimpan sebagai JSON string dengan key `"todolist_app_tasks"`:

```json
[
  {
    "id": "string",
    "title": "string",
    "completed": false,
    "createdAt": 1718000000000
  }
]
```

Pengurutan dilakukan saat render: tugas diurutkan berdasarkan `createdAt` descending (terbaru di atas).

### Derived State

Nilai-nilai berikut dihitung dari `state.tasks` saat render, bukan disimpan:

| Derived Value | Kalkulasi |
|---|---|
| `filteredTasks` | `tasks.filter(t => ...)` sesuai `state.filter` |
| `activeCount` | `tasks.filter(t => !t.completed).length` |
| `isEmpty` | `filteredTasks.length === 0` |


---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Penambahan Tugas Valid Menghasilkan Tugas Baru dengan Status Belum Selesai

*For any* string yang mengandung setidaknya satu karakter non-whitespace, memanggil `addTask(title)` harus menghasilkan sebuah Task baru yang muncul di `state.tasks` dengan `completed = false` dan `title` sama dengan input yang telah di-trim.

**Validates: Requirements 1.2, 1.3**

---

### Property 2: Judul Whitespace-Only Selalu Ditolak

*For any* string yang hanya berisi whitespace characters (spasi, tab, newline, atau kombinasinya), fungsi `isValidTitle()` harus mengembalikan `false` dan pemanggilan `addTask()` atau `editTask()` tidak boleh mengubah `state.tasks`.

**Validates: Requirements 1.4, 1.5, 7.4**

---

### Property 3: Daftar Tugas Selalu Diurutkan dari Paling Baru

*For any* daftar Task dengan nilai `createdAt` yang bervariasi, fungsi yang menghasilkan daftar untuk ditampilkan harus mengembalikan tugas dalam urutan `createdAt` descending (terbaru di posisi pertama).

**Validates: Requirements 2.1**

---

### Property 4: Counter Tugas Belum Selesai Selalu Akurat

*For any* daftar Task dengan kombinasi status `completed` yang acak, nilai counter yang ditampilkan harus selalu persis sama dengan `tasks.filter(t => !t.completed).length`.

**Validates: Requirements 2.4**

---

### Property 5: Render Tugas Selalu Menampilkan Judul dan Status

*For any* Task object dengan judul dan status apapun, fungsi render item tugas harus menghasilkan output DOM yang mengandung judul task dan indikator visual yang mencerminkan status `completed`.

**Validates: Requirements 2.3, 3.5**

---

### Property 6: Toggle Status adalah Round-Trip (Idempoten Ganda)

*For any* Task dengan status `completed` apapun (true atau false), memanggil `toggleTask(id)` dua kali berturut-turut harus mengembalikan `completed` ke nilai awal sebelum toggle pertama.

**Validates: Requirements 3.2, 3.3**

---

### Property 7: Penghapusan Tugas Bersifat Permanen

*For any* daftar Task yang mengandung setidaknya satu tugas, memanggil `deleteTask(id)` pada salah satu tugas harus menghasilkan `state.tasks` yang tidak lagi mengandung tugas dengan `id` tersebut, dan panjang `state.tasks` berkurang tepat satu.

**Validates: Requirements 4.2**

---

### Property 8: Filter Mengembalikan Hanya Tugas dengan Status yang Sesuai

*For any* daftar Task dengan campuran status `completed`, fungsi `getFilteredTasks(filter)` harus memenuhi:
- Jika `filter = 'all'`: mengembalikan semua task tanpa terkecuali
- Jika `filter = 'active'`: semua task yang dikembalikan memiliki `completed = false`
- Jika `filter = 'completed'`: semua task yang dikembalikan memiliki `completed = true`

**Validates: Requirements 5.2, 5.3, 5.4**

---

### Property 9: Penyimpanan ke localStorage adalah Round-Trip

*For any* array Task yang valid, memanggil `StorageService.save(tasks)` kemudian `StorageService.load()` harus menghasilkan array yang secara struktural identik dengan input awal (sama jumlah, sama `id`, `title`, `completed`, dan `createdAt` setiap elemen).

**Validates: Requirements 6.1, 6.2**

---

### Property 10: Semua Operasi Berjalan Tanpa Error Saat localStorage Tidak Tersedia

*For any* sequence of operations (addTask, toggleTask, deleteTask, editTask) yang dilakukan ketika `StorageService.isAvailable()` mengembalikan `false`, tidak boleh ada exception yang dilempar dan `state.tasks` harus mencerminkan hasil operasi tersebut secara benar dalam memori.

**Validates: Requirements 6.4**

---

### Property 11: Mode Edit Diinisialisasi dengan Judul Tugas Saat Ini

*For any* Task yang ada di `state.tasks` dengan judul apapun, memanggil `startEditing(id)` harus menetapkan `state.editingId = id` dan menyebabkan input edit dirender dengan `value` yang sama dengan `task.title` saat itu.

**Validates: Requirements 7.2**

---

### Property 12: Penyimpanan Edit dengan Judul Valid Memperbarui Tugas

*For any* Task yang sedang dalam mode edit dan *for any* judul baru yang valid (bukan whitespace-only), memanggil `editTask(id, newTitle)` harus memperbarui `task.title` menjadi `newTitle.trim()` dan `state.editingId` menjadi `null`.

**Validates: Requirements 7.3**

---

### Property 13: Pembatalan Edit Memulihkan Judul Asli

*For any* Task yang sedang dalam mode edit, memanggil `cancelEditing()` harus mengembalikan `state.editingId` ke `null` dan `task.title` harus tetap sama persis dengan nilai sebelum `startEditing()` dipanggil, terlepas dari perubahan apapun yang dilakukan pada input selama mode edit.

**Validates: Requirements 7.5**

---

## Error Handling

### Strategi Umum

Karena ini adalah aplikasi frontend tanpa backend, semua error bersifat lokal dan dapat ditangani secara graceful. Tidak ada operasi network yang bisa gagal.

### Kategori Error dan Penanganannya

#### 1. Validasi Input Pengguna

| Kondisi Error | Penanganan |
|---|---|
| Judul kosong (Form_Input kosong) | Tampilkan pesan error inline: "Judul tugas tidak boleh kosong." |
| Judul hanya whitespace | Tampilkan pesan error inline yang sama |
| Edit judul kosong/whitespace | Tampilkan pesan error inline di area edit; judul task tidak berubah |

Pesan error ditampilkan dekat elemen input dan dihapus saat pengguna mulai mengetik kembali.

#### 2. localStorage Tidak Tersedia

| Kondisi | Penanganan |
|---|---|
| `isAvailable()` returns false saat inisialisasi | Tampilkan banner peringatan di atas aplikasi: "Peringatan: Penyimpanan lokal tidak tersedia. Data tugas tidak akan tersimpan setelah halaman ditutup." |
| `localStorage.setItem()` melempar error (misal: storage quota exceeded) | Tangkap dengan try/catch di `StorageService.save()`, tampilkan notifikasi error sekali, lanjutkan operasi in-memory |

#### 3. Data localStorage Korup

| Kondisi | Penanganan |
|---|---|
| `JSON.parse()` gagal pada data tersimpan | Tangkap error di `StorageService.load()`, kembalikan `[]`, tampilkan peringatan bahwa data sebelumnya tidak dapat dimuat |
| Data tersimpan bukan array | Validasi tipe setelah parse; jika bukan array, gunakan `[]` |

```javascript
load() {
  try {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return []; // Silent fallback untuk data korup
  }
}
```

#### 4. ID Tidak Ditemukan

Operasi seperti `toggleTask(id)`, `deleteTask(id)`, `editTask(id)` yang dipanggil dengan ID yang tidak ada di `state.tasks` harus bersifat idempoten — tidak melakukan apapun, tidak melempar error. Ini melindungi dari race condition UI.

---

## Testing Strategy

### Stack Pengujian

Karena aplikasi menggunakan vanilla JavaScript tanpa framework:

- **Unit/Property Tests**: [fast-check](https://fast-check.io/) sebagai library property-based testing untuk JavaScript
- **Test Runner**: [Vitest](https://vitest.dev/) — ringan, kompatibel dengan fast-check, tidak memerlukan konfigurasi kompleks
- **DOM Testing**: [jsdom](https://github.com/jsdom/jsdom) (built-in di Vitest) untuk mensimulasikan browser environment
- **Coverage**: Vitest built-in coverage (`@vitest/coverage-v8`)

### Struktur Test

```
tests/
├── unit/
│   ├── validation.test.js      # isValidTitle(), getValidationError()
│   ├── storage.test.js         # StorageService
│   ├── state.test.js           # addTask, deleteTask, toggleTask, editTask, setFilter
│   └── render.test.js          # renderTaskList, renderCounter, renderFilterBar
├── property/
│   ├── task-operations.property.test.js   # Properties 1-7
│   ├── filter.property.test.js             # Property 8
│   ├── storage.property.test.js            # Properties 9-10
│   └── edit.property.test.js               # Properties 11-13
└── integration/
    └── app.integration.test.js # Alur lengkap: add → display → filter → delete
```

### Pendekatan Pengujian

#### Unit Tests (Contoh Spesifik)

Unit tests berfokus pada:
- Perilaku konkret dengan input spesifik
- Kondisi tepi (string kosong, array kosong, ID tidak valid)
- Integrasi antar komponen (event handler memperbarui state dan memanggil render)
- Perilaku graceful degradation (localStorage tidak tersedia)

Contoh unit test yang diperlukan:
- State kosong menampilkan empty state message
- Tombol filter menampilkan visual active state yang benar
- Pesan peringatan muncul saat localStorage tidak tersedia
- Cancel edit (Escape) memulihkan judul asli
- Toggle cepat berturut-turut menghasilkan status akhir yang benar (queue test)

#### Property-Based Tests

Setiap property dalam dokumen ini diimplementasikan sebagai **satu** property-based test menggunakan fast-check. Setiap test dikonfigurasi dengan **minimum 100 iterasi**.

Setiap test diberi tag dengan komentar referensi:

```javascript
// Feature: todolist-app, Property 1: Valid task addition produces new task with completed=false
it.prop([fc.string({ minLength: 1 }).filter(s => s.trim().length > 0)])(
  'adding valid task always creates task with completed=false',
  (title) => {
    const initialCount = state.tasks.length;
    addTask(title);
    expect(state.tasks.length).toBe(initialCount + 1);
    expect(state.tasks[0].completed).toBe(false);
    expect(state.tasks[0].title).toBe(title.trim());
  }
);
```

#### Property Test Configuration

```javascript
// vitest.config.js
export default {
  test: {
    // fast-check default: 100 runs per property
    // Override per test jika diperlukan untuk property yang lebih kompleks
  }
};
```

#### Integration Tests

Integration tests memverifikasi alur lengkap end-to-end dalam environment jsdom:
1. Muat halaman (inisialisasi state dan render)
2. Tambah beberapa tugas
3. Toggle status beberapa tugas
4. Terapkan filter dan verifikasi yang ditampilkan
5. Hapus tugas dan verifikasi daftar
6. Refresh simulasi (reload dari localStorage)

### Coverage Target

| Modul | Target Coverage |
|---|---|
| `isValidTitle`, `getValidationError` | 100% |
| `StorageService` | 100% |
| State mutation functions | 100% |
| `render()` dan sub-fungsi | ≥ 80% |
| Event handlers | ≥ 80% |

### Catatan Aksesibilitas dalam Testing

Selain correctness tests, verifikasi manual berikut diperlukan:
- Semua elemen interaktif dapat dijangkau dengan keyboard
- Pesan error dapat dibaca oleh screen reader (menggunakan `role="alert"` atau `aria-live`)
- Kontras warna untuk task selesai vs belum selesai memenuhi WCAG 2.1 AA

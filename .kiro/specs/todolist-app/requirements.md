# Requirements Document

## Introduction

Aplikasi TodoList adalah aplikasi frontend sederhana berbasis web yang memungkinkan pengguna mengelola daftar tugas (todo) secara efisien. Pengguna dapat membuat, membaca, memperbarui, dan menghapus tugas. Setiap tugas memiliki status (selesai/belum selesai) yang dapat diubah. Aplikasi ini berjalan sepenuhnya di sisi klien (client-side) tanpa memerlukan backend, menggunakan penyimpanan lokal browser (localStorage) agar data tetap tersimpan saat halaman di-refresh.

---

## Glossary

- **Aplikasi**: Aplikasi frontend TodoList berbasis web.
- **Pengguna**: Orang yang menggunakan Aplikasi melalui browser.
- **Tugas**: Satu item pekerjaan yang memiliki judul, status, dan tanggal pembuatan.
- **Daftar_Tugas**: Kumpulan seluruh Tugas yang dimiliki Pengguna.
- **Form_Input**: Komponen antarmuka yang digunakan Pengguna untuk memasukkan judul Tugas baru.
- **Tombol_Tambah**: Elemen UI yang memicu penambahan Tugas baru ke Daftar_Tugas.
- **Tombol_Selesai**: Elemen UI pada setiap Tugas yang memicu perubahan status Tugas menjadi selesai atau belum selesai.
- **Tombol_Hapus**: Elemen UI pada setiap Tugas yang memicu penghapusan Tugas dari Daftar_Tugas.
- **Filter**: Komponen antarmuka yang digunakan Pengguna untuk menampilkan Tugas berdasarkan status tertentu.
- **localStorage**: Mekanisme penyimpanan data di browser yang mempertahankan data meskipun halaman di-refresh.
- **Status_Tugas**: Kondisi sebuah Tugas, yaitu "belum selesai" atau "selesai".

---

## Requirements

### Requirement 1: Menambah Tugas Baru

**User Story:** Sebagai Pengguna, saya ingin menambahkan tugas baru ke daftar, agar saya dapat mencatat pekerjaan yang perlu dilakukan.

#### Kriteria Penerimaan

1. THE Aplikasi SHALL menampilkan Form_Input dan Tombol_Tambah pada halaman utama.
2. WHEN Pengguna memasukkan judul Tugas di Form_Input dan menekan Tombol_Tambah, THE Aplikasi SHALL menambahkan Tugas baru dengan Status_Tugas "belum selesai" ke Daftar_Tugas.
3. WHEN Pengguna menekan Tombol_Tambah, THE Aplikasi SHALL mengosongkan Form_Input setelah Tugas berhasil ditambahkan.
4. IF Pengguna menekan Tombol_Tambah dengan Form_Input kosong, THEN THE Aplikasi SHALL menampilkan pesan kesalahan yang menyatakan bahwa judul Tugas tidak boleh kosong.
5. IF Pengguna menekan Tombol_Tambah dengan Form_Input yang hanya berisi spasi, THEN THE Aplikasi SHALL menampilkan pesan kesalahan yang menyatakan bahwa judul Tugas tidak boleh kosong.
6. WHEN Pengguna menekan tombol Enter pada keyboard saat Form_Input aktif, THE Aplikasi SHALL memperlakukan aksi tersebut sama dengan menekan Tombol_Tambah, termasuk menampilkan pesan kesalahan jika Form_Input kosong atau hanya berisi spasi.

---

### Requirement 2: Menampilkan Daftar Tugas

**User Story:** Sebagai Pengguna, saya ingin melihat semua tugas saya dalam satu daftar, agar saya dapat memantau pekerjaan yang perlu dikerjakan.

#### Kriteria Penerimaan

1. THE Aplikasi SHALL menampilkan seluruh Tugas dalam Daftar_Tugas secara berurutan dari Tugas yang paling baru ditambahkan di posisi teratas.
2. WHILE Daftar_Tugas kosong, THE Aplikasi SHALL menampilkan pesan yang menyatakan bahwa belum ada tugas yang ditambahkan.
3. THE Aplikasi SHALL menampilkan judul dan Status_Tugas untuk setiap Tugas dalam Daftar_Tugas.
4. THE Aplikasi SHALL menampilkan jumlah total Tugas yang belum selesai di bagian atas atau bawah Daftar_Tugas.

---

### Requirement 3: Mengubah Status Tugas

**User Story:** Sebagai Pengguna, saya ingin menandai tugas sebagai selesai atau membatalkan penandaan tersebut, agar saya dapat melacak progres pekerjaan saya.

#### Kriteria Penerimaan

1. THE Aplikasi SHALL menampilkan Tombol_Selesai pada setiap Tugas dalam Daftar_Tugas.
2. WHEN Pengguna menekan Tombol_Selesai pada Tugas dengan Status_Tugas "belum selesai", THE Aplikasi SHALL mengubah Status_Tugas Tugas tersebut menjadi "selesai".
3. WHEN Pengguna menekan Tombol_Selesai pada Tugas dengan Status_Tugas "selesai", THE Aplikasi SHALL mengubah Status_Tugas Tugas tersebut menjadi "belum selesai".
4. WHEN perubahan Status_Tugas tidak dapat segera diproses, THE Aplikasi SHALL mengantrekan perubahan tersebut dan memprosesnya segera setelah Aplikasi kembali siap.
4. THE Aplikasi SHALL menampilkan perbedaan visual yang jelas antara Tugas dengan Status_Tugas "selesai" dan "belum selesai" (misalnya, teks dicoret untuk Tugas selesai).

---

### Requirement 4: Menghapus Tugas

**User Story:** Sebagai Pengguna, saya ingin menghapus tugas yang tidak relevan, agar daftar tugas saya tetap terorganisir.

#### Kriteria Penerimaan

1. THE Aplikasi SHALL menampilkan Tombol_Hapus pada setiap Tugas dalam Daftar_Tugas.
2. WHEN Pengguna menekan Tombol_Hapus pada sebuah Tugas, THE Aplikasi SHALL menghapus Tugas tersebut secara permanen dari Daftar_Tugas.
3. WHEN Pengguna menekan Tombol_Hapus, THE Aplikasi SHALL memperbarui tampilan Daftar_Tugas secara langsung tanpa perlu me-refresh halaman.

---

### Requirement 5: Memfilter Tugas

**User Story:** Sebagai Pengguna, saya ingin memfilter daftar tugas berdasarkan status, agar saya dapat fokus pada tugas yang relevan.

#### Kriteria Penerimaan

1. THE Aplikasi SHALL menampilkan Filter dengan tiga pilihan: "Semua", "Belum Selesai", dan "Selesai".
2. WHEN Pengguna memilih Filter "Semua", THE Aplikasi SHALL menampilkan seluruh Tugas dalam Daftar_Tugas.
3. WHEN Pengguna memilih Filter "Belum Selesai", THE Aplikasi SHALL menampilkan hanya Tugas dengan Status_Tugas "belum selesai".
4. WHEN Pengguna memilih Filter "Selesai", THE Aplikasi SHALL menampilkan hanya Tugas dengan Status_Tugas "selesai".
5. THE Aplikasi SHALL menandai pilihan Filter yang sedang aktif secara visual agar Pengguna mengetahui filter mana yang sedang digunakan.

---

### Requirement 6: Persistensi Data dengan localStorage

**User Story:** Sebagai Pengguna, saya ingin data tugas saya tetap tersimpan saat halaman di-refresh atau browser ditutup dan dibuka kembali, agar saya tidak kehilangan catatan pekerjaan saya.

#### Kriteria Penerimaan

1. WHEN Pengguna menambahkan, mengubah status, atau menghapus sebuah Tugas, THE Aplikasi SHALL menyimpan kondisi terbaru Daftar_Tugas ke localStorage secara otomatis.
2. WHEN Pengguna membuka atau me-refresh halaman Aplikasi, THE Aplikasi SHALL memuat Daftar_Tugas dari localStorage dan menampilkannya.
3. IF localStorage tidak tersedia di browser Pengguna, THEN THE Aplikasi SHALL menampilkan pesan peringatan kepada Pengguna segera saat halaman dimuat.
4. WHILE localStorage tidak tersedia, THE Aplikasi SHALL tetap berfungsi secara normal pada sesi tersebut dan melewati semua operasi penyimpanan tanpa menampilkan kesalahan lebih lanjut.

---

### Requirement 7: Mengedit Judul Tugas

**User Story:** Sebagai Pengguna, saya ingin mengedit judul tugas yang sudah ada, agar saya dapat memperbaiki kesalahan atau memperbarui informasi tugas.

#### Kriteria Penerimaan

1. THE Aplikasi SHALL menyediakan mekanisme bagi Pengguna untuk memulai pengeditan judul sebuah Tugas (misalnya, dengan mengklik dua kali pada judul Tugas).
2. WHEN Pengguna memulai pengeditan, THE Aplikasi SHALL menampilkan Form_Input yang terisi dengan judul Tugas saat ini pada posisi Tugas tersebut.
3. WHEN Pengguna menyimpan hasil pengeditan, THE Aplikasi SHALL memperbarui judul Tugas dengan teks baru yang dimasukkan Pengguna.
4. IF Pengguna menyimpan hasil pengeditan dengan Form_Input kosong atau hanya berisi spasi, THEN THE Aplikasi SHALL menampilkan pesan kesalahan dan mempertahankan judul Tugas sebelumnya.
5. WHEN Pengguna menekan tombol Escape saat mengedit, THE Aplikasi SHALL membatalkan pengeditan dan memulihkan judul Tugas ke nilai sebelum pengeditan dimulai.
6. WHILE Pengguna sedang dalam mode pengeditan, THE Aplikasi SHALL hanya memvalidasi input dan menampilkan pesan kesalahan ketika Pengguna secara eksplisit menyimpan perubahan.

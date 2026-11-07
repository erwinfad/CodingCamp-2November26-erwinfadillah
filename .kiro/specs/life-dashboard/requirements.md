# Requirements Document

## Introduction

Life Dashboard adalah aplikasi web personal berbasis browser yang menampilkan berbagai widget produktivitas dalam satu halaman. Aplikasi ini berjalan sepenuhnya di sisi klien menggunakan HTML, CSS, dan Vanilla JavaScript tanpa backend, dengan data disimpan melalui browser Local Storage API. Dashboard mencakup empat widget utama: Greeting (salam waktu), Focus Timer (Pomodoro), To-Do List, dan Quick Links.

## Glossary

- **Dashboard**: Halaman utama aplikasi yang menampilkan semua widget secara bersamaan.
- **Widget**: Komponen UI mandiri yang menampilkan atau mengelola satu jenis fungsionalitas.
- **Greeting_Widget**: Widget yang menampilkan waktu, tanggal, dan salam berdasarkan waktu hari.
- **Focus_Timer**: Widget timer berbasis teknik Pomodoro dengan durasi 25 menit.
- **Todo_Widget**: Widget manajemen daftar tugas (task).
- **QuickLinks_Widget**: Widget yang menyimpan dan menampilkan tautan ke website favorit.
- **Local_Storage**: Browser Local Storage API yang digunakan sebagai mekanisme penyimpanan data sisi klien.
- **Task**: Satu item pekerjaan di dalam Todo_Widget yang memiliki teks deskripsi dan status selesai atau belum.
- **Link**: Satu entri di QuickLinks_Widget yang terdiri dari label nama dan URL tujuan.
- **Session**: Satu siklus Focus_Timer dari mulai hingga selesai (25 menit).
- **Browser_Modern**: Chrome, Firefox, Edge, atau Safari versi terkini.

---

## Requirements

### Requirement 1: Tampilan Dashboard Utama

**User Story:** As a pengguna, I want to melihat semua widget dalam satu halaman, so that saya dapat mengakses semua fitur produktivitas tanpa berpindah halaman.

#### Acceptance Criteria

1. THE Dashboard SHALL menampilkan Greeting_Widget, Focus_Timer, Todo_Widget, dan QuickLinks_Widget secara bersamaan dalam satu halaman tanpa memerlukan navigasi atau perpindahan halaman.
2. THE Dashboard SHALL merender seluruh konten tanpa memerlukan instalasi plugin, ekstensi browser, atau konfigurasi runtime tambahan oleh pengguna.
3. THE Dashboard SHALL berfungsi sepenuhnya pada Chrome versi 90 ke atas, Firefox versi 88 ke atas, dan Safari versi 14 ke atas.
4. WHEN pengguna membuka Dashboard di localhost, THE Dashboard SHALL memuat dan menampilkan semua widget dalam waktu kurang dari 2 detik.
5. THE Dashboard SHALL menampilkan semua widget dalam satu kolom vertikal ketika lebar layar kurang dari 768px, dan tetap dapat digunakan tanpa scrolling horizontal pada lebar layar minimum 320px.
6. IF satu atau lebih widget gagal dirender, THEN THE Dashboard SHALL tetap menampilkan widget lainnya yang berhasil dimuat beserta pesan error yang menunjukkan widget mana yang gagal ditampilkan.

---

### Requirement 2: Greeting Widget

**User Story:** As a pengguna, I want to melihat waktu, tanggal, dan salam yang relevan secara real-time, so that saya dapat langsung mengetahui konteks waktu saat membuka dashboard.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL menampilkan waktu saat ini berdasarkan jam lokal perangkat pengguna dalam format HH:MM:SS yang diperbarui setiap detik.
2. THE Greeting_Widget SHALL menampilkan tanggal saat ini berdasarkan jam lokal perangkat pengguna dalam format nama hari, tanggal bulan tahun menggunakan bahasa Indonesia (contoh: "Senin, 3 November 2025").
3. WHEN jam lokal pengguna berada di antara pukul 05:00 dan 11:59, THE Greeting_Widget SHALL menampilkan teks "Selamat Pagi".
4. WHEN jam lokal pengguna berada di antara pukul 12:00 dan 14:59, THE Greeting_Widget SHALL menampilkan teks "Selamat Siang".
5. WHEN jam lokal pengguna berada di antara pukul 15:00 dan 17:59, THE Greeting_Widget SHALL menampilkan teks "Selamat Sore".
6. WHEN jam lokal pengguna berada di antara pukul 18:00 dan 04:59 hari berikutnya, THE Greeting_Widget SHALL menampilkan teks "Selamat Malam".
7. WHEN Greeting_Widget selesai dimuat, THE Greeting_Widget SHALL segera menampilkan waktu, tanggal, dan teks salam yang sesuai tanpa penundaan yang dapat dilihat oleh pengguna.
8. WHEN detik berganti pada jam lokal pengguna, THE Greeting_Widget SHALL mengevaluasi ulang teks salam yang sesuai sehingga perubahan salam pada batas waktu (contoh: dari 11:59 ke 12:00) ditampilkan secara otomatis.

---

### Requirement 3: Focus Timer

**User Story:** As a pengguna, I want to menggunakan timer Pomodoro 25 menit, so that saya dapat bekerja dalam sesi fokus terstruktur.

#### Acceptance Criteria

1. THE Focus_Timer SHALL menampilkan sisa waktu dalam format MM:SS dengan nilai awal 25:00.
2. WHEN pengguna menekan tombol Start WHILE Focus_Timer tidak sedang berjalan, THE Focus_Timer SHALL mulai menghitung mundur satu detik per detik.
3. WHEN pengguna menekan tombol Stop WHILE Focus_Timer sedang berjalan, THE Focus_Timer SHALL menghentikan hitungan mundur dan mempertahankan sisa waktu saat itu.
4. WHEN pengguna menekan tombol Reset, THE Focus_Timer SHALL menghentikan hitungan mundur dan mengembalikan tampilan ke 25:00.
5. WHEN hitungan mundur Focus_Timer mencapai 00:00, THE Focus_Timer SHALL menghentikan hitungan mundur secara otomatis dan menampilkan indikator visual di dalam antarmuka Dashboard bahwa sesi telah selesai.
6. IF browser pengguna mendukung Web Notifications API dan pengguna telah memberikan izin notifikasi, THEN ketika hitungan mundur Focus_Timer mencapai 00:00, THE Focus_Timer SHALL mengirimkan browser notification yang menyatakan bahwa sesi Pomodoro telah selesai.
7. IF browser pengguna tidak mendukung Web Notifications API atau pengguna menolak izin notifikasi, THEN ketika hitungan mundur Focus_Timer mencapai 00:00, THE Focus_Timer SHALL menampilkan pesan notifikasi di dalam antarmuka Dashboard sebagai fallback.

---

### Requirement 4: To-Do List

**User Story:** As a pengguna, I want to mengelola daftar tugas harian saya, so that saya dapat melacak pekerjaan yang perlu diselesaikan langsung dari dashboard.

#### Acceptance Criteria

1. THE Todo_Widget SHALL menampilkan daftar semua Task yang tersimpan di Local_Storage saat Dashboard dimuat.
2. WHEN pengguna memasukkan teks pada input field dan mengonfirmasi (menekan tombol tambah atau menekan Enter), THE Todo_Widget SHALL menambahkan Task baru dengan teks tersebut dan status belum selesai ke dalam daftar.
3. IF pengguna mencoba menambahkan Task dengan input field yang kosong atau hanya mengandung spasi, THEN THE Todo_Widget SHALL tidak menambahkan Task dan tidak mengubah daftar yang ada.
4. WHEN pengguna menekan tombol edit pada sebuah Task, THE Todo_Widget SHALL menampilkan input field yang dapat diedit berisi teks Task tersebut saat ini.
5. WHEN pengguna mengonfirmasi hasil edit sebuah Task dengan teks yang tidak kosong, THE Todo_Widget SHALL memperbarui teks Task tersebut di dalam daftar dan menyimpan perubahan ke Local_Storage.
6. IF pengguna mengonfirmasi hasil edit sebuah Task dengan input field yang kosong atau hanya mengandung spasi, THEN THE Todo_Widget SHALL mempertahankan teks Task sebelumnya tanpa menyimpan perubahan ke Local_Storage.
7. WHEN pengguna menekan tombol batal pada input edit sebuah Task, THE Todo_Widget SHALL menutup input field dan menampilkan kembali teks Task sebelumnya tanpa mengubah data di Local_Storage.
8. WHEN pengguna menandai sebuah Task sebagai selesai, THE Todo_Widget SHALL memperbarui tampilan Task dengan teks dicoret (strikethrough) dan menyimpan status ke Local_Storage.
9. WHEN pengguna membatalkan tanda selesai pada sebuah Task, THE Todo_Widget SHALL mengembalikan tampilan Task ke status belum selesai tanpa strikethrough dan menyimpan perubahan ke Local_Storage.
10. WHEN pengguna menekan tombol hapus pada sebuah Task, THE Todo_Widget SHALL menghapus Task tersebut dari daftar dan memperbarui Local_Storage.
11. THE Todo_Widget SHALL menyimpan seluruh daftar Task ke Local_Storage setiap kali terjadi penambahan, pengeditan, penandaan selesai, atau penghapusan Task, sehingga data tetap tersedia setelah halaman dimuat ulang.

---

### Requirement 5: Quick Links

**User Story:** As a pengguna, I want to menyimpan dan membuka tautan website favorit saya dengan cepat, so that saya dapat navigasi ke situs yang sering dikunjungi langsung dari dashboard.

#### Acceptance Criteria

1. WHEN Dashboard dimuat, THE QuickLinks_Widget SHALL menampilkan semua Link yang tersimpan di Local_Storage, atau menampilkan daftar kosong jika tidak ada data tersimpan.
2. WHEN pengguna memasukkan label dengan panjang 1–50 karakter dan URL yang dimulai dengan `http://` atau `https://` lalu mengonfirmasi, THE QuickLinks_Widget SHALL menambahkan Link baru ke daftar, menyimpan seluruh daftar ke Local_Storage, dan menampilkan Link baru tersebut pada daftar yang tampil.
3. IF pengguna mencoba menambahkan Link dengan label yang kosong atau hanya mengandung spasi, atau URL yang tidak dimulai dengan `http://` atau `https://`, THEN THE QuickLinks_Widget SHALL tidak menambahkan Link dan SHALL menampilkan pesan kesalahan yang mengindikasikan field mana yang tidak valid.
4. WHEN pengguna mengklik sebuah Link, THE QuickLinks_Widget SHALL membuka URL tujuan di tab baru browser.
5. WHEN pengguna menekan tombol hapus pada sebuah Link, THE QuickLinks_Widget SHALL menghapus Link tersebut dari daftar, memperbarui Local_Storage, dan tidak menampilkan Link yang dihapus pada daftar yang tersisa.
6. IF Local_Storage tidak tersedia atau operasi penyimpanan gagal, THEN THE QuickLinks_Widget SHALL menampilkan pesan kesalahan yang mengindikasikan bahwa data tidak dapat disimpan, dan tetap menampilkan daftar Link pada sesi yang sedang berjalan tanpa mengubah data yang telah tersimpan sebelumnya.

---

### Requirement 6: Persistensi Data

**User Story:** As a pengguna, I want to data saya tetap tersimpan saat saya menutup dan membuka kembali browser, so that saya tidak perlu memasukkan ulang tasks dan links setiap sesi.

#### Acceptance Criteria

1. WHEN halaman Dashboard dimuat, THE Dashboard SHALL membaca data Task dan Link dari Local_Storage dan merender daftar Task dan Link sesuai dengan item yang tersimpan, dengan jumlah item yang ditampilkan sama dengan jumlah item yang tersimpan.
2. WHEN pengguna menambahkan, mengubah, atau menghapus sebuah Task, THE Todo_Widget SHALL menyimpan seluruh daftar Task terbaru ke Local_Storage sebelum operasi dianggap selesai.
3. WHEN pengguna menambahkan, mengubah, atau menghapus sebuah Link, THE QuickLinks_Widget SHALL menyimpan seluruh daftar Link terbaru ke Local_Storage sebelum operasi dianggap selesai.
4. IF Local_Storage tidak mengandung data Task, THEN THE Todo_Widget SHALL menampilkan daftar kosong tanpa menampilkan pesan error di antarmuka pengguna dan tanpa menghasilkan JavaScript error di konsol.
5. IF Local_Storage tidak mengandung data Link, THEN THE QuickLinks_Widget SHALL menampilkan daftar kosong tanpa menampilkan pesan error di antarmuka pengguna dan tanpa menghasilkan JavaScript error di konsol.
6. IF data Task atau data Link yang tersimpan di Local_Storage tidak dapat di-parse sebagai JSON yang valid, THEN THE Dashboard SHALL menggunakan array kosong sebagai nilai default untuk key yang bersangkutan tanpa menampilkan pesan error kepada pengguna.

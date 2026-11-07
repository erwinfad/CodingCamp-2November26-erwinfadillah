// Life Dashboard - js/app.js

// ─────────────────────────────────────────────
// Storage Helpers
// ─────────────────────────────────────────────

/**
 * Ambil dan parse nilai JSON dari localStorage.
 * Mengembalikan `fallback` jika key tidak ada atau data bukan JSON valid.
 * Requirements: 6.4, 6.5, 6.6
 *
 * @param {string} key      - localStorage key
 * @param {*}      fallback - nilai default jika key tidak ada / JSON rusak
 * @returns {*}
 */
function storageGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

/**
 * Serialize `value` ke JSON dan simpan ke localStorage.
 * Mengembalikan `true` jika berhasil, `false` jika gagal (misal: quota exceeded).
 * Requirements: 6.4, 6.5, 6.6
 *
 * @param {string} key   - localStorage key
 * @param {*}      value - nilai yang akan disimpan
 * @returns {boolean}
 */
function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    return false;
  }
}

// ─────────────────────────────────────────────
// Greeting Widget
// ─────────────────────────────────────────────

/**
 * GreetingWidget menampilkan jam lokal, tanggal, dan salam berdasarkan jam.
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8
 */
const GreetingWidget = {
  /**
   * Elemen DOM yang dikontrol widget ini.
   * Di-populate saat init() dipanggil.
   */
  _elTime: null,
  _elDate: null,
  _elText: null,

  /**
   * Kembalikan string waktu dalam format "HH:MM:SS" dari objek Date.
   * Requirements: 2.1
   *
   * @param {Date} date
   * @returns {string}
   */
  formatTime(date) {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  },

  /**
   * Kembalikan string tanggal panjang bahasa Indonesia.
   * Contoh: "Senin, 3 November 2025"
   * Requirements: 2.2
   *
   * @param {Date} date
   * @returns {string}
   */
  formatDate(date) {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  },

  /**
   * Petakan angka jam (0–23) ke teks salam yang sesuai.
   * Requirements: 2.3, 2.4, 2.5, 2.6
   *
   * @param {number} hour - integer 0–23
   * @returns {"Selamat Pagi"|"Selamat Siang"|"Selamat Sore"|"Selamat Malam"}
   */
  getGreeting(hour) {
    if (hour >= 5 && hour <= 11) return 'Selamat Pagi';
    if (hour >= 12 && hour <= 14) return 'Selamat Siang';
    if (hour >= 15 && hour <= 17) return 'Selamat Sore';
    return 'Selamat Malam'; // 18–23 dan 0–4
  },

  /**
   * Perbarui ketiga elemen DOM dengan waktu, tanggal, dan salam terkini.
   * Dipanggil sekali saat init() dan setiap detik setelahnya.
   * Requirements: 2.7, 2.8
   */
  tick() {
    const now = new Date();
    if (this._elTime) this._elTime.textContent = this.formatTime(now);
    if (this._elDate) this._elDate.textContent = this.formatDate(now);
    if (this._elText) this._elText.textContent = this.getGreeting(now.getHours());
  },

  /**
   * Query elemen DOM, jalankan tick() segera, lalu mulai clock loop 1 detik.
   * Requirements: 2.7
   */
  init() {
    this._elTime = document.getElementById('greeting-time');
    this._elDate = document.getElementById('greeting-date');
    this._elText = document.getElementById('greeting-text');

    // Tampilkan langsung tanpa penundaan
    this.tick();

    // Perbarui setiap detik
    setInterval(() => GreetingWidget.tick(), 1000);
  },
};

// ─────────────────────────────────────────────
// Focus Timer Widget
// ─────────────────────────────────────────────

/**
 * TimerWidget mengimplementasikan timer hitung mundur Pomodoro 25 menit.
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7
 */
const TimerWidget = {
  /**
   * State internal timer.
   * - remaining  : sisa waktu dalam detik
   * - running    : apakah interval sedang aktif
   * - intervalId : ID interval yang dikembalikan oleh setInterval
   */
  timerState: {
    remaining: 25 * 60,
    running: false,
    intervalId: null,
  },

  /**
   * Referensi elemen DOM — di-populate saat init() dipanggil.
   */
  _elDisplay: null,
  _elBtnStart: null,
  _elBtnStop: null,
  _elBtnReset: null,
  _elCompleteMsg: null,

  // ── Format ──────────────────────────────────

  /**
   * Ubah jumlah detik menjadi string "MM:SS".
   * Requirements: 3.1
   *
   * @param {number} seconds - integer >= 0
   * @returns {string}
   */
  formatTime(seconds) {
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  },

  // ── Rendering ───────────────────────────────

  /**
   * Perbarui teks #timer-display dengan sisa waktu terkini.
   * Requirements: 3.1
   */
  render() {
    if (this._elDisplay) {
      this._elDisplay.textContent = this.formatTime(this.timerState.remaining);
    }
  },

  // ── Timer Control ───────────────────────────

  /**
   * Mulai hitung mundur jika timer sedang tidak berjalan.
   * Requirements: 3.2
   */
  start() {
    if (this.timerState.running) return;

    // Minta izin notifikasi jika API tersedia dan izin belum diberikan
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    this.timerState.running = true;
    this.timerState.intervalId = setInterval(() => TimerWidget.tick(), 1000);

    // Sembunyikan pesan selesai saat timer dimulai ulang
    if (this._elCompleteMsg) {
      this._elCompleteMsg.style.display = 'none';
      this._elCompleteMsg.textContent = '';
    }
  },

  /**
   * Hentikan hitung mundur, pertahankan sisa waktu.
   * Requirements: 3.3
   */
  stop() {
    if (!this.timerState.running) return;
    clearInterval(this.timerState.intervalId);
    this.timerState.intervalId = null;
    this.timerState.running = false;
  },

  /**
   * Hentikan dan reset ke 25:00.
   * Requirements: 3.4
   */
  reset() {
    clearInterval(this.timerState.intervalId);
    this.timerState.intervalId = null;
    this.timerState.running = false;
    this.timerState.remaining = 25 * 60;

    // Sembunyikan indikator selesai
    if (this._elCompleteMsg) {
      this._elCompleteMsg.style.display = 'none';
      this._elCompleteMsg.textContent = '';
    }

    this.render();
  },

  /**
   * Dipanggil setiap detik oleh setInterval.
   * Mengurangi remaining, merender, dan memanggil onComplete() jika habis.
   * Requirements: 3.5
   */
  tick() {
    this.timerState.remaining -= 1;
    this.render();

    if (this.timerState.remaining <= 0) {
      this.onComplete();
    }
  },

  /**
   * Tangani penyelesaian sesi Pomodoro.
   * - Hentikan timer.
   * - Tampilkan indikator visual di #timer-complete-msg.
   * - Kirim browser notification jika izin sudah diberikan (req 3.6).
   * - Tampilkan fallback UI jika tidak (req 3.7).
   * Requirements: 3.5, 3.6, 3.7
   */
  onComplete() {
    // Pastikan remaining tidak negatif
    this.timerState.remaining = 0;
    this.render();

    // Hentikan interval
    clearInterval(this.timerState.intervalId);
    this.timerState.intervalId = null;
    this.timerState.running = false;

    // Tampilkan indikator visual di dalam dashboard
    if (this._elCompleteMsg) {
      this._elCompleteMsg.textContent = '✅ Sesi Pomodoro selesai! Saatnya istirahat.';
      this._elCompleteMsg.style.display = 'block';
    }

    // Kirim browser notification jika tersedia dan diizinkan (req 3.6)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Selesai! 🍅', {
        body: 'Sesi fokus 25 menit telah selesai. Saatnya istirahat!',
        icon: '',
      });
    }
    // Jika tidak tersedia / ditolak → indikator visual di atas sudah menjadi fallback (req 3.7)
  },

  // ── Initialization ──────────────────────────

  /**
   * Query elemen DOM, pasang event listener untuk ketiga tombol, dan render tampilan awal.
   * Requirements: 3.1, 3.2, 3.3, 3.4
   */
  init() {
    this._elDisplay    = document.getElementById('timer-display');
    this._elBtnStart   = document.getElementById('timer-btn-start');
    this._elBtnStop    = document.getElementById('timer-btn-stop');
    this._elBtnReset   = document.getElementById('timer-btn-reset');
    this._elCompleteMsg = document.getElementById('timer-complete-msg');

    if (this._elBtnStart) {
      this._elBtnStart.addEventListener('click', () => TimerWidget.start());
    }
    if (this._elBtnStop) {
      this._elBtnStop.addEventListener('click', () => TimerWidget.stop());
    }
    if (this._elBtnReset) {
      this._elBtnReset.addEventListener('click', () => TimerWidget.reset());
    }

    // Tampilkan 25:00 langsung saat init
    this.render();
  },
};

// ─────────────────────────────────────────────
// To-Do List Widget
// ─────────────────────────────────────────────

/**
 * TodoWidget mengelola daftar tugas harian dengan persistensi ke localStorage.
 * Requirements: 4.1, 4.2, 4.3, 4.8, 4.9, 4.10, 4.11, 6.1, 6.2, 6.4
 */
let tasks = [];

const TodoWidget = {
  // ── Storage ─────────────────────────────────

  /**
   * Muat daftar task dari localStorage ke variabel `tasks`.
   * Jika key tidak ada atau data rusak, `tasks` diisi array kosong.
   * Requirements: 4.1, 6.1, 6.4
   */
  loadFromStorage() {
    tasks = storageGet('life_dashboard_tasks', []);
  },

  /**
   * Simpan seluruh daftar `tasks` terkini ke localStorage.
   * Requirements: 4.11, 6.2
   */
  saveToStorage() {
    storageSet('life_dashboard_tasks', tasks);
  },

  // ── Task Operations ──────────────────────────

  /**
   * Tambahkan task baru ke daftar jika teks valid (non-empty setelah trim).
   * - Membuat task dengan struktur { id, text, done: false }
   * - Menolak input kosong atau whitespace-only tanpa mengubah daftar
   * Requirements: 4.2, 4.3
   *
   * @param {string} text - teks deskripsi task dari input pengguna
   */
  addTask(text) {
    const trimmed = text.trim();
    if (!trimmed) return; // tolak input kosong / whitespace-only (req 4.3)

    const newTask = {
      id: 'task_' + Date.now(),
      text: trimmed,
      done: false,
    };

    tasks.push(newTask);
    this.saveToStorage();
    this.render();
  },

  /**
   * Toggle status `done` pada task dengan id yang diberikan.
   * Jika task tidak ditemukan, tidak melakukan apa-apa.
   * Requirements: 4.8, 4.9
   *
   * @param {string} id - ID unik task
   */
  toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    task.done = !task.done;
    this.saveToStorage();
    this.render();
  },

  /**
   * Hapus task dengan id yang diberikan dari daftar.
   * Jika id tidak ditemukan, daftar tidak berubah.
   * Requirements: 4.10, 4.11
   *
   * @param {string} id - ID unik task yang akan dihapus
   */
  deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    this.saveToStorage();
    this.render();
  },

  // ── Edit Operations ──────────────────────────

  /**
   * Perbarui teks task dengan id yang diberikan.
   * Tolak jika teks kosong atau whitespace-only (pertahankan teks lama).
   * Requirements: 4.5, 4.6
   *
   * @param {string} id   - ID unik task yang akan diedit
   * @param {string} text - teks baru dari input pengguna
   */
  editTask(id, text) {
    const trimmed = text.trim();
    if (!trimmed) return; // tolak input kosong / whitespace-only (req 4.6)

    const task = tasks.find(t => t.id === id);
    if (!task) return;

    task.text = trimmed;
    this.saveToStorage();
    this.render();
  },

  /**
   * Tampilkan field edit inline pada baris task.
   * Menyembunyikan tampilan teks task dan tombol-tombolnya,
   * lalu menampilkan input field dengan teks saat ini yang sudah terisi.
   * Requirements: 4.4
   *
   * @param {string} id - ID unik task
   */
  showEditInput(id) {
    const li = document.querySelector(`[data-task-id="${id}"]`);
    if (!li) return;

    const viewEl  = li.querySelector('.todo-item-view');
    const editEl  = li.querySelector('.todo-item-edit');
    const inputEl = li.querySelector('.todo-edit-input');

    if (!viewEl || !editEl || !inputEl) return;

    viewEl.style.display = 'none';
    editEl.style.display = 'flex';
    inputEl.focus();
    // Posisikan kursor di akhir teks
    inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length);
  },

  /**
   * Sembunyikan field edit inline dan tampilkan kembali teks task.
   * Requirements: 4.7
   *
   * @param {string} id - ID unik task
   */
  hideEditInput(id) {
    const li = document.querySelector(`[data-task-id="${id}"]`);
    if (!li) return;

    const viewEl = li.querySelector('.todo-item-view');
    const editEl = li.querySelector('.todo-item-edit');

    if (!viewEl || !editEl) return;

    viewEl.style.display = 'flex';
    editEl.style.display = 'none';
  },

  // ── Rendering ────────────────────────────────

  /**
   * Rebuild seluruh <ul id="todo-list"> dari array `tasks` terkini.
   * Setiap item memiliki:
   *   - Checkbox/toggle (data-action="toggle", data-id)
   *   - Teks deskripsi (class "done" jika task.done)
   *   - Tombol Edit (data-action="show-edit", data-id)
   *   - Tombol Hapus (data-action="delete", data-id)
   *   - Field edit inline (tersembunyi secara default)
   * Requirements: 4.1, 4.4, 4.8
   */
  render() {
    const ul = document.getElementById('todo-list');
    if (!ul) return;

    if (tasks.length === 0) {
      ul.innerHTML = '<li class="todo-empty">Belum ada tugas. Tambahkan tugas baru di atas!</li>';
      return;
    }

    ul.innerHTML = tasks.map(task => {
      const escapedText  = task.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      const doneClass    = task.done ? ' done' : '';
      const checkedAttr  = task.done ? ' checked' : '';

      return `
        <li class="todo-item${doneClass}" data-task-id="${task.id}">
          <!-- View mode -->
          <div class="todo-item-view" style="display:flex;">
            <input
              type="checkbox"
              class="todo-checkbox"
              data-action="toggle"
              data-id="${task.id}"
              ${checkedAttr}
              aria-label="Tandai selesai: ${escapedText}"
            />
            <span class="todo-text${doneClass}">${escapedText}</span>
            <button
              type="button"
              class="todo-btn todo-btn-edit"
              data-action="show-edit"
              data-id="${task.id}"
              aria-label="Edit tugas: ${escapedText}"
            >Edit</button>
            <button
              type="button"
              class="todo-btn todo-btn-delete"
              data-action="delete"
              data-id="${task.id}"
              aria-label="Hapus tugas: ${escapedText}"
            >Hapus</button>
          </div>
          <!-- Edit mode (tersembunyi secara default) -->
          <div class="todo-item-edit" style="display:none;">
            <input
              type="text"
              class="todo-edit-input"
              value="${escapedText}"
              aria-label="Edit teks tugas"
              data-id="${task.id}"
            />
            <button
              type="button"
              class="todo-btn todo-btn-confirm-edit"
              data-action="confirm-edit"
              data-id="${task.id}"
              aria-label="Simpan perubahan"
            >Simpan</button>
            <button
              type="button"
              class="todo-btn todo-btn-cancel-edit"
              data-action="cancel-edit"
              data-id="${task.id}"
              aria-label="Batal edit"
            >Batal</button>
          </div>
        </li>
      `;
    }).join('');
  },

  // ── Event Handling ───────────────────────────

  /**
   * Event delegation untuk semua interaksi di dalam #todo-list.
   * Memeriksa `e.target.dataset.action` dan `e.target.dataset.id`
   * untuk routing ke method yang sesuai.
   * Requirements: 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10
   *
   * @param {Event} e - click event
   */
  handleEvent(e) {
    const action = e.target.dataset.action;
    const id     = e.target.dataset.id;

    if (!action) return;

    switch (action) {
      case 'toggle':
        TodoWidget.toggleTask(id);
        break;

      case 'delete':
        TodoWidget.deleteTask(id);
        break;

      case 'show-edit':
        TodoWidget.showEditInput(id);
        break;

      case 'confirm-edit': {
        const li       = e.target.closest('[data-task-id]');
        const inputEl  = li ? li.querySelector('.todo-edit-input') : null;
        const newText  = inputEl ? inputEl.value : '';
        TodoWidget.editTask(id, newText);
        break;
      }

      case 'cancel-edit':
        TodoWidget.hideEditInput(id);
        break;
    }
  },

  // ── Initialization ────────────────────────────

  /**
   * Muat data dari storage, pasang semua event listener, dan render daftar awal.
   * Requirements: 4.1, 4.2, 4.4
   */
  init() {
    this.loadFromStorage();
    this.render();

    // Pasang listener untuk aksi di dalam daftar (event delegation)
    const ul = document.getElementById('todo-list');
    if (ul) {
      ul.addEventListener('click',   e => TodoWidget.handleEvent(e));
    }

    // Tombol tambah
    const addBtn = document.getElementById('todo-add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const input = document.getElementById('todo-input');
        if (!input) return;
        TodoWidget.addTask(input.value);
        input.value = '';
      });
    }

    // Enter pada input field
    const inputEl = document.getElementById('todo-input');
    if (inputEl) {
      inputEl.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          TodoWidget.addTask(inputEl.value);
          inputEl.value = '';
        }
      });
    }
  },
};

// ─────────────────────────────────────────────
// Quick Links Widget
// ─────────────────────────────────────────────

/**
 * State daftar tautan — di-sync ke localStorage setiap kali berubah.
 */
let links = [];

/**
 * LinksWidget mengelola daftar tautan favorit dengan persistensi ke localStorage.
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.3, 6.5
 */
const LinksWidget = {
  // ── Referensi elemen DOM ─────────────────────

  _elLabelInput: null,
  _elUrlInput:   null,
  _elAddBtn:     null,
  _elErrorMsg:   null,
  _elList:       null,

  // ── Storage ──────────────────────────────────

  /**
   * Muat daftar link dari localStorage ke variabel `links`.
   * Jika key tidak ada atau data rusak, `links` diisi array kosong.
   * Requirements: 5.1, 6.1, 6.5
   */
  loadFromStorage() {
    links = storageGet('life_dashboard_links', []);
  },

  /**
   * Simpan seluruh daftar `links` terkini ke localStorage.
   * Requirements: 5.2, 6.3
   */
  saveToStorage() {
    storageSet('life_dashboard_links', links);
  },

  // ── Validation ───────────────────────────────

  /**
   * Kembalikan `true` jika `url` dimulai dengan "http://" atau "https://".
   * Requirements: 5.3
   *
   * @param {string} url
   * @returns {boolean}
   */
  validateUrl(url) {
    return typeof url === 'string' &&
      (url.startsWith('http://') || url.startsWith('https://'));
  },

  /**
   * Kembalikan `true` jika `lbl` memiliki panjang 1–50 karakter dan
   * bukan hanya whitespace.
   * Requirements: 5.3
   *
   * @param {string} lbl
   * @returns {boolean}
   */
  validateLabel(lbl) {
    if (typeof lbl !== 'string') return false;
    const trimmed = lbl.trim();
    return trimmed.length >= 1 && lbl.length <= 50;
  },

  // ── Error display ────────────────────────────

  /**
   * Tampilkan pesan error di `#links-error-msg`.
   * Kosongkan pesan jika `msg` adalah string kosong.
   * Requirements: 5.3, 5.6
   *
   * @param {string} msg
   */
  showError(msg) {
    if (this._elErrorMsg) {
      this._elErrorMsg.textContent = msg;
    }
  },

  // ── Link Operations ───────────────────────────

  /**
   * Validasi label dan URL; jika valid tambahkan link baru ke daftar,
   * simpan, dan render. Jika tidak valid, tampilkan pesan error spesifik.
   * Requirements: 5.2, 5.3, 5.6
   *
   * @param {string} label - teks label dari input pengguna
   * @param {string} url   - URL dari input pengguna
   */
  addLink(label, url) {
    const labelOk = this.validateLabel(label);
    const urlOk   = this.validateUrl(url);

    if (!labelOk && !urlOk) {
      this.showError('Nama tautan tidak boleh kosong dan URL harus dimulai dengan http:// atau https://');
      return;
    }
    if (!labelOk) {
      this.showError('Nama tautan tidak boleh kosong atau hanya spasi, dan maksimal 50 karakter.');
      return;
    }
    if (!urlOk) {
      this.showError('URL tidak valid. Harus dimulai dengan http:// atau https://');
      return;
    }

    // Bersihkan pesan error sebelumnya
    this.showError('');

    const newLink = {
      id:    'link_' + Date.now(),
      label: label.trim(),
      url:   url.trim(),
    };

    links.push(newLink);
    this.saveToStorage();
    this.render();
  },

  /**
   * Hapus link dengan id yang diberikan dari daftar.
   * Jika id tidak ditemukan, daftar tidak berubah.
   * Requirements: 5.5
   *
   * @param {string} id - ID unik link yang akan dihapus
   */
  deleteLink(id) {
    links = links.filter(l => l.id !== id);
    this.saveToStorage();
    this.render();
  },

  // ── Rendering ─────────────────────────────────

  /**
   * Rebuild seluruh `<ul id="links-list">` dari array `links` terkini.
   * Setiap item menampilkan:
   *   - Tautan `<a target="_blank" rel="noopener noreferrer">` dengan label
   *   - Tombol hapus dengan `data-action="delete"` dan `data-id`
   * Requirements: 5.1, 5.4
   */
  render() {
    if (!this._elList) return;

    if (links.length === 0) {
      this._elList.innerHTML = '<li class="links-empty">Belum ada tautan. Tambahkan tautan favorit di atas!</li>';
      return;
    }

    this._elList.innerHTML = links.map(link => {
      const escapedLabel = link.label
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
      const escapedUrl = link.url
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

      return `
        <li class="link-item" data-link-id="${link.id}">
          <a
            href="${escapedUrl}"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Buka ${escapedLabel} di tab baru"
          >${escapedLabel}</a>
          <button
            type="button"
            class="link-btn-delete"
            data-action="delete"
            data-id="${link.id}"
            aria-label="Hapus tautan: ${escapedLabel}"
          >Hapus</button>
        </li>
      `;
    }).join('');
  },

  // ── Event Handling ────────────────────────────

  /**
   * Event delegation untuk semua klik di dalam `#links-list`.
   * Memeriksa `data-action` untuk routing ke method yang sesuai.
   * Requirements: 5.5
   *
   * @param {Event} e - click event
   */
  handleEvent(e) {
    const action = e.target.dataset.action;
    const id     = e.target.dataset.id;

    if (action === 'delete' && id) {
      LinksWidget.deleteLink(id);
    }
  },

  // ── Initialization ─────────────────────────────

  /**
   * Query elemen DOM, pasang event listener, muat data dari storage, dan render.
   * Requirements: 5.1, 5.2, 5.4
   */
  init() {
    this._elLabelInput = document.getElementById('links-label-input');
    this._elUrlInput   = document.getElementById('links-url-input');
    this._elAddBtn     = document.getElementById('links-add-btn');
    this._elErrorMsg   = document.getElementById('links-error-msg');
    this._elList       = document.getElementById('links-list');

    // Tombol tambah
    if (this._elAddBtn) {
      this._elAddBtn.addEventListener('click', () => {
        const label = this._elLabelInput ? this._elLabelInput.value : '';
        const url   = this._elUrlInput   ? this._elUrlInput.value   : '';
        LinksWidget.addLink(label, url);
        // Kosongkan input setelah berhasil (showError kosong berarti berhasil)
        if (this._elErrorMsg && !this._elErrorMsg.textContent) {
          if (this._elLabelInput) this._elLabelInput.value = '';
          if (this._elUrlInput)   this._elUrlInput.value   = '';
        }
      });
    }

    // Event delegation untuk aksi di dalam daftar
    if (this._elList) {
      this._elList.addEventListener('click', e => LinksWidget.handleEvent(e));
    }

    this.loadFromStorage();
    this.render();
  },
};

// ─────────────────────────────────────────────
// Dashboard Initialization
// ─────────────────────────────────────────────

/**
 * Tampilkan pesan error di dalam container widget yang gagal.
 *
 * @param {string} name - nama widget (e.g. "Greeting", "Timer")
 */
function showWidgetError(name) {
  const container = document.getElementById(`${name.toLowerCase()}-widget`);
  if (container) {
    const msg = document.createElement('p');
    msg.className = 'widget-error';
    msg.textContent = `Widget "${name}" gagal dimuat. Silakan muat ulang halaman.`;
    container.prepend(msg);
  }
}

/**
 * Inisialisasi semua widget secara berurutan.
 * Kegagalan satu widget tidak menghentikan widget lainnya.
 * Requirements: 1.6
 */
function initDashboard() {
  const widgets = [
    { name: 'Greeting', fn: () => GreetingWidget.init() },
    { name: 'Timer',    fn: () => TimerWidget.init()    },
    { name: 'Todo',     fn: () => TodoWidget.init()     },
    { name: 'Links',    fn: () => LinksWidget.init()    },
  ];

  widgets.forEach(({ name, fn }) => {
    try {
      fn();
    } catch (e) {
      console.error(`Widget ${name} gagal diinisialisasi:`, e);
      showWidgetError(name);
    }
  });
}

document.addEventListener('DOMContentLoaded', initDashboard);

/**
 * app.js - Logika Interaktif & Manipulasi DOM Aplikasi SITTA
 * Universitas Terbuka
 * Tugas 1 - STSI4209 Pemrograman Berbasis Web
 * Mahasiswa: Daffa Tabiano (NIM: 053134745)
 */

// Inisialisasi penyimpanan lokal (LocalStorage) agar data dinamis tetap persisten
(function initStorage() {
  if (!localStorage.getItem('sitta_bahan_ajar')) {
    localStorage.setItem('sitta_bahan_ajar', JSON.stringify(dataBahanAjar));
  }
  if (!localStorage.getItem('sitta_current_user')) {
    // Default user untuk kemudahan pengujian
    localStorage.setItem('sitta_current_user', JSON.stringify(dataPengguna[0]));
  }
})();

// Helper function untuk mengambil data bahan ajar aktif
function getBahanAjarData() {
  const stored = localStorage.getItem('sitta_bahan_ajar');
  return stored ? JSON.parse(stored) : dataBahanAjar;
}

// Helper function untuk menyimpan data bahan ajar ke LocalStorage
function saveBahanAjarData(data) {
  localStorage.setItem('sitta_bahan_ajar', JSON.stringify(data));
}

// Helper function untuk mengambil user aktif
function getCurrentUser() {
  const user = localStorage.getItem('sitta_current_user');
  return user ? JSON.parse(user) : null;
}

// ==========================================================================
// TOAST ALERT NOTIFICATION (Feedback Visual)
// ==========================================================================
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'alert-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `alert-toast ${type}`;
  
  let icon = 'ℹ️';
  if (type === 'error') icon = '⚠️';
  if (type === 'success') icon = '✅';

  toast.innerHTML = `
    <span style="font-size: 1.25rem;">${icon}</span>
    <div style="flex: 1;">
      <strong style="display: block; margin-bottom: 2px;">${type === 'error' ? 'Peringatan' : (type === 'success' ? 'Sukses' : 'Informasi')}</strong>
      <span>${message}</span>
    </div>
    <button style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: inherit; opacity: 0.7;" onclick="this.parentElement.remove()">&times;</button>
  `;

  container.appendChild(toast);

  // Auto remove setelah 4 detik
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ==========================================================================
// MODAL HELPER FUNCTIONS
// ==========================================================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

// Setup event listener tutup modal saat klik area luar backdrop
window.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});

// ==========================================================================
// RENDER HEADER PROFILE & LOGOUT
// ==========================================================================
function renderHeaderProfile() {
  const user = getCurrentUser();
  const userNameElem = document.getElementById('headerUserName');
  const userRoleElem = document.getElementById('headerUserRole');
  const userAvatarElem = document.getElementById('headerUserAvatar');

  if (user && userNameElem) {
    userNameElem.textContent = user.nama;
    if (userRoleElem) userRoleElem.textContent = `${user.role} - ${user.lokasi}`;
    if (userAvatarElem) userAvatarElem.textContent = user.nama.charAt(0);
  }
}

function handleLogout() {
  if (confirm("Apakah Anda yakin ingin keluar dari aplikasi SITTA?")) {
    localStorage.removeItem('sitta_current_user');
    window.location.href = 'login.html';
  }
}

// ==========================================================================
// 1. LOGIKA HALAMAN LOGIN (login.html)
// ==========================================================================
function initLoginPage() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    // Validasi kelengkapan form
    if (!email || !password) {
      showToast("Harap isi email dan kata sandi secara lengkap!", "error");
      return;
    }

    // Cek kecocokan data pengguna di dataPengguna
    const foundUser = dataPengguna.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (foundUser) {
      // Simpan session
      localStorage.setItem('sitta_current_user', JSON.stringify(foundUser));
      showToast(`Selamat datang kembali, ${foundUser.nama}! Mengalihkan ke Dashboard...`, "success");
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1200);
    } else {
      // Feedback error sesuai spesifikasi soal
      showToast("Email/password yang anda masukkan salah!", "error");
      const errAlert = document.getElementById('loginErrorAlert');
      if (errAlert) {
        errAlert.style.display = 'block';
        errAlert.textContent = "Email/password yang anda masukkan salah!";
      }
    }
  });

  // Modal Lupa Password
  const forgotForm = document.getElementById('forgotPasswordForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const resetEmail = document.getElementById('resetEmail').value.trim();
      if (!resetEmail) {
        showToast("Masukkan alamat email yang terdaftar!", "error");
        return;
      }
      showToast(`Tautan reset kata sandi telah dikirimkan ke ${resetEmail}. Silakan periksa kotak masuk email Anda.`, "success");
      closeModal('forgotModal');
      forgotForm.reset();
    });
  }

  // Modal Pendaftaran Akun Baru
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const nama = document.getElementById('regNama').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value.trim();
      const role = document.getElementById('regRole').value;
      const lokasi = document.getElementById('regLokasi').value.trim();

      if (!nama || !email || !password || !lokasi) {
        showToast("Semua data pendaftaran wajib diisi!", "error");
        return;
      }

      // Tambahkan ke dataPengguna sementara
      const newUser = {
        id: dataPengguna.length + 1,
        nama: nama,
        email: email,
        password: password,
        role: role,
        lokasi: lokasi
      };
      dataPengguna.push(newUser);

      showToast("Pendaftaran berhasil! Silakan masuk dengan email dan kata sandi baru Anda.", "success");
      closeModal('registerModal');
      registerForm.reset();

      // Isi otomatis ke form login
      document.getElementById('loginEmail').value = email;
      document.getElementById('loginPassword').value = password;
    });
  }
}

// Fungsi bantu cepat isi akun demo
function fillDemoAccount(email, pass) {
  document.getElementById('loginEmail').value = email;
  document.getElementById('loginPassword').value = pass;
}

// ==========================================================================
// 2. LOGIKA HALAMAN DASHBOARD (dashboard.html)
// ==========================================================================
function initDashboardPage() {
  const greetingTextElem = document.getElementById('greetingText');
  const greetingSubElem = document.getElementById('greetingSub');
  const liveClockElem = document.getElementById('liveClock');
  const liveDateElem = document.getElementById('liveDate');

  if (!greetingTextElem) return;

  const user = getCurrentUser() || dataPengguna[0];

  function updateGreetingAndClock() {
    const now = new Date();
    const hours = now.getHours();
    let salam = "Selamat Pagi";

    if (hours >= 5 && hours < 12) {
      salam = "Selamat Pagi";
    } else if (hours >= 12 && hours < 15) {
      salam = "Selamat Siang";
    } else if (hours >= 15 && hours < 18) {
      salam = "Selamat Sore";
    } else {
      salam = "Selamat Malam";
    }

    greetingTextElem.textContent = `${salam}, ${user.nama}! 👋`;
    if (greetingSubElem) {
      greetingSubElem.textContent = `Anda terhubung sebagai ${user.role} (${user.lokasi}). Sistem Informasi Tiras dan Transaksi Bahan Ajar UT siap melayani kebutuhan Anda.`;
    }

    // Format Jam Digital
    if (liveClockElem) {
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      liveClockElem.textContent = `${h}:${m}:${s} WIB`;
    }

    // Format Tanggal Bahasa Indonesia
    if (liveDateElem) {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      liveDateElem.textContent = now.toLocaleDateString('id-ID', options);
    }
  }

  updateGreetingAndClock();
  setInterval(updateGreetingAndClock, 1000);

  // Update statistik ringkasan di dashboard
  const bahanList = getBahanAjarData();
  const totalBahan = bahanList.length;
  const totalStok = bahanList.reduce((acc, curr) => acc + Number(curr.stok), 0);

  const statBahanElem = document.getElementById('statTotalBahan');
  const statStokElem = document.getElementById('statTotalStok');
  if (statBahanElem) statBahanElem.textContent = `${totalBahan} Judul`;
  if (statStokElem) statStokElem.textContent = `${totalStok.toLocaleString('id-ID')} Eks`;
}

// ==========================================================================
// 3. LOGIKA HALAMAN TRACKING PENGIRIMAN (tracking.html)
// ==========================================================================
function initTrackingPage() {
  const btnCari = document.getElementById('btnCariDO');
  const inputDO = document.getElementById('inputNomorDO');
  if (!btnCari || !inputDO) return;

  function doSearch() {
    const query = inputDO.value.trim();
    if (!query) {
      showToast("Silakan masukkan Nomor Delivery Order (DO) terlebih dahulu!", "error");
      return;
    }

    const resultBox = document.getElementById('trackingResultBox');
    const data = dataTracking[query];

    if (!data) {
      showToast(`Nomor Delivery Order "${query}" tidak ditemukan pada sistem!`, "error");
      if (resultBox) resultBox.classList.remove('active');
      return;
    }

    // Isi Data Ringkasan
    document.getElementById('resNomorDO').textContent = data.nomorDO;
    document.getElementById('resNama').textContent = data.nama;
    document.getElementById('resEkspedisi').textContent = data.ekspedisi;
    document.getElementById('resTanggal').textContent = data.tanggalKirim;
    document.getElementById('resPaket').textContent = data.paket;
    document.getElementById('resTotal').textContent = data.total;

    // Status Badge
    const statusBadge = document.getElementById('resStatusBadge');
    if (statusBadge) {
      statusBadge.textContent = data.status;
      statusBadge.className = 'badge ' + (data.status === 'Dikirim' ? 'badge-success' : 'badge-warning');
    }

    // Render Stepper Progress Bar
    renderStepper(data.status);

    // Render Timeline Perjalanan
    const timelineElem = document.getElementById('trackingTimeline');
    if (timelineElem) {
      timelineElem.innerHTML = '';
      data.perjalanan.forEach(step => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = `
          <div class="timeline-time">${step.waktu}</div>
          <div class="timeline-desc">${step.keterangan}</div>
        `;
        timelineElem.appendChild(item);
      });
    }

    resultBox.classList.add('active');
    showToast(`Data pengiriman DO ${data.nomorDO} berhasil dimuat!`, "success");
  }

  btnCari.addEventListener('click', doSearch);
  inputDO.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') doSearch();
  });
}

function renderStepper(status) {
  const steps = [
    { id: 1, name: "Loket Penerimaan" },
    { id: 2, name: "Hub Transit" },
    { id: 3, name: "Kantor Tujuan" },
    { id: 4, name: "Proses Antar" },
    { id: 5, name: "Selesai Diterima" }
  ];

  let currentStep = 3; // Default 'Dalam Perjalanan'
  if (status === 'Dikirim') {
    currentStep = 5;
  }

  const stepperContainer = document.getElementById('stepperContainer');
  if (!stepperContainer) return;

  stepperContainer.innerHTML = '';

  // Garis progress
  const progressLine = document.createElement('div');
  progressLine.className = 'stepper-progress-line';
  const percent = ((currentStep - 1) / (steps.length - 1)) * 100;
  progressLine.style.width = `${percent}%`;
  stepperContainer.appendChild(progressLine);

  steps.forEach(s => {
    const stepItem = document.createElement('div');
    stepItem.className = 'step-item';
    if (s.id < currentStep) stepItem.classList.add('completed');
    if (s.id === currentStep) stepItem.classList.add('active');

    stepItem.innerHTML = `
      <div class="step-circle">${s.id < currentStep ? '✓' : s.id}</div>
      <div class="step-title">${s.name}</div>
    `;
    stepperContainer.appendChild(stepItem);
  });
}

// Bantuan klik sampel DO
function fillSampleDO(no) {
  const input = document.getElementById('inputNomorDO');
  if (input) {
    input.value = no;
    document.getElementById('btnCariDO').click();
  }
}

// ==========================================================================
// 4. LOGIKA HALAMAN STOK BAHAN AJAR (stok.html)
// ==========================================================================
function initStokPage() {
  const tableBody = document.getElementById('stokTableBody');
  const searchInput = document.getElementById('searchStokInput');
  const filterLokasi = document.getElementById('filterLokasi');
  const addForm = document.getElementById('formTambahStok');

  if (!tableBody) return;

  function renderTable(list) {
    tableBody.innerHTML = '';

    if (list.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-muted);">
            Tidak ada data bahan ajar yang sesuai dengan filter pencarian.
          </td>
        </tr>
      `;
      return;
    }

    list.forEach((item, index) => {
      const tr = document.createElement('tr');

      // Tentukan badge status stok
      let badgeClass = 'badge-success';
      let statusText = 'Stok Aman';
      const stokNum = Number(item.stok);

      if (stokNum < 200) {
        badgeClass = 'badge-danger';
        statusText = 'Kritis';
      } else if (stokNum <= 300) {
        badgeClass = 'badge-warning';
        statusText = 'Menipis';
      }

      tr.innerHTML = `
        <td style="text-align: center; font-weight: 600;">${index + 1}</td>
        <td style="text-align: center;">
          <img src="${item.cover}" alt="${item.namaBarang}" class="book-cover-cell" onerror="this.src='https://placehold.co/70x90/0b3b60/ffffff?text=BMP'"/>
        </td>
        <td><code>${item.kodeLokasi}</code></td>
        <td><strong>${item.kodeBarang}</strong></td>
        <td>
          <span style="font-weight: 600; color: var(--primary);">${item.namaBarang}</span>
          <span style="display: block; font-size: 0.75rem; color: var(--text-muted);">${item.jenisBarang} • Edisi ke-${item.edisi}</span>
        </td>
        <td style="text-align: center; font-weight: 700; font-size: 1.05rem;">${stokNum.toLocaleString('id-ID')}</td>
        <td style="text-align: center;">
          <span class="badge ${badgeClass}">${statusText}</span>
        </td>
        <td style="text-align: center;">
          <button class="btn btn-outline btn-sm" onclick="editStokModal('${item.kodeBarang}')" title="Ubah Stok">✏️ Sesuaikan</button>
        </td>
      `;

      tableBody.appendChild(tr);
    });

    // Update jumlah rekap
    const totalItemElem = document.getElementById('countTotalItem');
    if (totalItemElem) totalItemElem.textContent = `${list.length} Judul Buku`;
  }

  // Tampilkan data pertama kali
  let currentList = getBahanAjarData();
  renderTable(currentList);

  // Filter & Pencarian Dinamis DOM
  function applyFilters() {
    const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const loc = filterLokasi ? filterLokasi.value : '';

    const allData = getBahanAjarData();
    const filtered = allData.filter(item => {
      const matchQuery = item.namaBarang.toLowerCase().includes(q) || item.kodeBarang.toLowerCase().includes(q);
      const matchLoc = (loc === '' || item.kodeLokasi === loc);
      return matchQuery && matchLoc;
    });

    renderTable(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (filterLokasi) filterLokasi.addEventListener('change', applyFilters);

  // Validasi & Penambahan Stok Baru via Form Modal
  if (addForm) {
    addForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const kodeLokasi = document.getElementById('addKodeLokasi').value.trim();
      const kodeBarang = document.getElementById('addKodeBarang').value.trim().toUpperCase();
      const namaBarang = document.getElementById('addNamaBarang').value.trim();
      const jenisBarang = document.getElementById('addJenisBarang').value;
      const edisi = document.getElementById('addEdisi').value.trim();
      const stok = document.getElementById('addStok').value;
      const cover = document.getElementById('addCoverSelect').value;

      // Validasi Form & Alert Feedback
      if (!kodeLokasi || !kodeBarang || !namaBarang || !edisi || stok === '') {
        showToast("Semua field formulir bahan ajar wajib diisi!", "error");
        return;
      }

      if (Number(stok) < 0) {
        showToast("Jumlah stok awal tidak boleh bernilai negatif!", "error");
        return;
      }

      const allData = getBahanAjarData();

      // Cek apakah kode barang sudah terdaftar
      const isExist = allData.some(b => b.kodeBarang === kodeBarang && b.kodeLokasi === kodeLokasi);
      if (isExist) {
        showToast(`Bahan ajar dengan kode ${kodeBarang} di lokasi ${kodeLokasi} sudah terdaftar!`, "error");
        return;
      }

      const newBahan = {
        kodeLokasi: kodeLokasi,
        kodeBarang: kodeBarang,
        namaBarang: namaBarang,
        jenisBarang: jenisBarang,
        edisi: edisi,
        stok: Number(stok),
        cover: cover
      };

      // Tambahkan ke array
      allData.unshift(newBahan);
      saveBahanAjarData(allData);

      // Re-render DOM
      applyFilters();

      // Tutup modal dan reset form
      closeModal('tambahStokModal');
      addForm.reset();
      showToast(`Bahan ajar "${namaBarang}" (${kodeBarang}) berhasil ditambahkan ke sistem!`, "success");
    });
  }
}

// Modal Cepat Sesuaikan Stok
function editStokModal(kodeBarang) {
  const allData = getBahanAjarData();
  const item = allData.find(b => b.kodeBarang === kodeBarang);
  if (!item) return;

  const currentStok = item.stok;
  const inputBaru = prompt(`Ubah jumlah stok fisik untuk "${item.namaBarang}" (${item.kodeBarang}):`, currentStok);

  if (inputBaru !== null) {
    const val = Number(inputBaru.trim());
    if (isNaN(val) || val < 0) {
      showToast("Nilai stok harus berupa angka bulat dan tidak boleh negatif!", "error");
      return;
    }

    item.stok = val;
    saveBahanAjarData(allData);
    showToast(`Stok "${item.namaBarang}" berhasil diperbarui menjadi ${val} eksemplar.`, "success");
    
    // Refresh tabel
    const searchInput = document.getElementById('searchStokInput');
    if (searchInput) searchInput.dispatchEvent(new Event('input'));
  }
}

// Inisialisasi Otomatis berdasarkan Halaman yang Dibuka
document.addEventListener('DOMContentLoaded', function() {
  renderHeaderProfile();
  initLoginPage();
  initDashboardPage();
  initTrackingPage();
  initStokPage();
});

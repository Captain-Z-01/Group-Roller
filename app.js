document.getElementById('app').innerHTML = `
<div id="securityScreen" class="security-screen">
  <div class="security-card">
    <h2>Verifikasi Keamanan</h2>
    <p id="securityText">
      Verifikasi menggunakan sidik jari, Face Unlock, atau PIN perangkat.
    </p>
    <button id="verifyBtn" class="btn primary">
      Verifikasi Sekarang
    </button>
    <a>---------------------</a>
    <div id="securityStatus" class="security-status"></div>
    <hr>
    <div style="font-size:10px; color:#747474">Powered by Captain Z MD</div>
  </div>
 </div>
 
<div class="container">
  <header class="topbar">
    <div class="brand">
   <div class="logo">
    <img src="https://avatars.githubusercontent.com/u/308199074?v=4" alt="Logo">
   </div>
    <div>
      <h1>Captain Z — Group Roller</h1>
      <p>Atur peserta, bagi kelompok, atau putar roda.</p>
     </div>
    </div>

    <nav class="tabs" aria-label="Mode utama">
      <button class="tab active" data-view="setup">Peserta</button>
      <button class="tab" data-view="wheel">Roda Putar</button>
      <button class="tab" data-view="groups">Pembagian Kelompok</button>
    </nav>
  </header>

  <section id="setup" class="view active">
    <div class="grid">
      <div class="card">
        <h2>1. Atur Peserta</h2>
        <p class="sub">Pilih jumlah 6–100. Bisa pakai nomor otomatis atau masukkan nama satu per satu. Nama maksimal 15 karakter.</p>

        <div class="row">
          <div class="field">
            <label for="countInput">Jumlah peserta</label>
            <div class="number-box">
              <button id="minusBtn" type="button">−</button>
              <input id="countInput" type="number" min="6" max="100" value="20" inputmode="numeric" />
              <button id="plusBtn" type="button">+</button>
            </div>
          </div>
          <div class="field">
            <label for="baseMode">Data peserta</label>
            <select id="baseMode">
              <option value="number">Nomor otomatis</option>
              <option value="name">Nama manual</option>
            </select>
          </div>
        </div>

        <div id="nameEditor">
          <div class="name-list" id="nameList"></div>
          <div class="tiny-note">Tip: nama kosong akan otomatis memakai nomor peserta.</div>
        </div>

        <div id="numberModeInfo" class="status" style="display:none">
          Mode nomor aktif. Peserta akan dibuat sebagai 1, 2, 3, dan seterusnya.
        </div>

        <div class="row" style="margin-top:14px">
          <button class="btn primary" id="applyBtn">Terapkan Peserta</button>
          <button class="btn ghost" id="resetParticipantsBtn">Reset</button>
        </div>
      </div>

      <div class="card">
        <h2>Status</h2><br>
        <div class="result" style="grid-template-columns:1fr 1fr">
          <div class="result-box">
            <div class="k">Peserta aktif</div>
            <div class="v" id="activeCount">20</div>
          </div>
          <div class="result-box">
            <div class="k">Sudah terpilih</div>
            <div class="v" id="pickedCount">0</div>
          </div>
        </div>

        <div class="status" id="setupStatus">Siap digunakan.</div>
      </div>
    </div><br>
    <button class="btn primary" onclick="window.location.href='https://captain-z.pages.dev'">
  Kembali ke Beranda
</button>
<br>
<footer>
      <div>
        <strong onclick="window.location.href='https://captain-z.pages.dev'" >Captain Z</strong> - Group Roller
      </div>
      <div class="copyright">
        © <span id="year"></span> Captain_Z MD. All rights reserved.
      </div>
      <div class="datetime" id="datetime"></div>
    </footer>
  </section>

  <section id="wheel" class="view">
    <div class="grid">
      <div class="card"> 
        <h2>2. Roda Putar</h2>
        <p class="sub">Jarum berada di atas dan menunjuk ke bawah. Peserta yang sudah keluar langsung dihapus dari roda, jadi tidak akan terpilih lagi.</p>

        <div class="wheel-wrap">
          <div class="wheel-stage">
            <div class="pointer" aria-hidden="true"></div>
            <div class="wheel" id="wheel">
              <canvas id="wheelCanvas" width="900" height="900"></canvas>
              <div class="wheel-center">Z</div>
            </div>
            <div class="wheel-badge" id="wheelCountBadge">20 peserta</div>
          </div>

          <button class="btn primary spin-btn" id="spinBtn">PUTAR RODA</button>

          <div class="result">
            <div class="result-box">
              <div class="k">Hasil terakhir</div>
              <div class="v" id="lastResult">—</div>
            </div>
            <div class="result-box">
              <div class="k">Sisa di roda</div>
              <div class="v" id="remainingCount">20</div>
            </div>
          </div>

          <div style="width:100%">
            <div class="row" style="justify-content:space-between;margin-bottom:8px">
              <strong style="font-size:.82rem">Urutan hasil</strong>
              <button class="btn ghost" id="clearHistoryBtn" type="button" style="padding:8px 11px;font-size:.74rem">Hapus hasil</button>
            </div>
            <div id="history" class="history">
              <div class="empty">Belum ada hasil.</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Peserta yang Tersisa</h2>
        <p class="sub">Daftar ini otomatis mengikuti roda. Setelah peserta terpilih, ia hilang dari daftar dan tidak bisa terpilih lagi.</p>
        <div id="remainingList" class="name-list" style="max-height:620px"></div>
      </div>
    </div>
  </section>

  <section id="groups" class="view">
    <div class="card">
      <h2>3. Pembagian Kelompok</h2>
      <p class="sub">Masukkan jumlah kelompok. Jika jumlah peserta tidak habis dibagi rata, kelebihan peserta akan disebar satu per satu mulai dari kelompok pertama.</p>

      <div class="group-tools">
        <div class="field">
          <label for="groupCount">Jumlah kelompok</label>
          <input id="groupCount" type="number" min="2" max="100" value="4" inputmode="numeric" />
        </div>
        <div class="field">
          <label for="groupMethod">Metode</label>
          <select id="groupMethod">
            <option value="sequential">Urut</option>
            <option value="random">Acak</option>
          </select>
        </div>
        <button class="btn primary" id="makeGroupsBtn">Bagi Kelompok</button>
      </div>

      <div class="status" id="groupStatus">Contoh 50 peserta ÷ 4 kelompok → 13, 13, 12, 12 peserta.</div><br>
     <div class="title-editor">
       <input
         type="text"
         id="exportTitleInput"
         value="Pembagian Kelompok"
         placeholder="Judul pembagian kelompok"
       >

     <button
        id="saveExportTitleBtn"
        class="btn secondary"
      >
    OK
   </button>
    </div>
      <div class="groups-grid" id="groupsGrid" style="margin-top:14px"></div>     
    </div><br>
   <div class="export-buttons">

  <button class="btn secondary" id="downloadTxt">
    Unduh TXT
  </button>

  <button class="btn primary" id="downloadPdf">
    Unduh PDF
  </button>

  <button class="btn btn-png" id="downloadPng">  
    Unduh PNG
  </button>

</div>
  </section>
</div>

<div class="toast" id="toast"></div>
  
`;

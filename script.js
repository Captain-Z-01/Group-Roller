(() => {
  'use strict';

  const STORAGE_KEY = 'Captain_Z-MD.theme';

  const state = {
    participants: [],
    remaining: [],
    history: [],
    rotation: 0,
    spinning: false,
    inputMode: 'number',

    exportTitle: 'Pembagian Kelompok'
  };
  const exportTitleInput = document.getElementById('exportTitleInput');
  const saveExportTitleBtn = document.getElementById('saveExportTitleBtn');
  saveExportTitleBtn.addEventListener('click', () => {
  const title =
  exportTitleInput.value.trim();
  state.exportTitle =
    title || 'Pembagian Kelompok';
  exportTitleInput.value =
    state.exportTitle;
  toast('Judul berhasil diubah.');
   });
   
  const date = new Date()
        .toLocaleDateString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
        .replace(/\//g, '-');
  const $ = (sel) => document.querySelector(sel);
  const els = {
    tabs: [...document.querySelectorAll('.tab')],
    views: [...document.querySelectorAll('.view')],
    count: $('#countInput'),
    minus: $('#minusBtn'),
    plus: $('#plusBtn'),
    baseMode: $('#baseMode'),
    nameEditor: $('#nameEditor'),
    numberModeInfo: $('#numberModeInfo'),
    nameList: $('#nameList'),
    apply: $('#applyBtn'),
    reset: $('#resetParticipantsBtn'),
    activeCount: $('#activeCount'),
    pickedCount: $('#pickedCount'),
    setupStatus: $('#setupStatus'),
    wheel: $('#wheel'),
    canvas: $('#wheelCanvas'),
    wheelBadge: $('#wheelCountBadge'),
    spin: $('#spinBtn'),
    lastResult: $('#lastResult'),
    remainingCount: $('#remainingCount'),
    history: $('#history'),
    remainingList: $('#remainingList'),
    clearHistory: $('#clearHistoryBtn'),
    groupCount: $('#groupCount'),
    groupMethod: $('#groupMethod'),
    makeGroups: $('#makeGroupsBtn'),
    groupsGrid: $('#groupsGrid'),
    groupStatus: $('#groupStatus'),
    toast: $('#toast')
  };

  const ctx = els.canvas.getContext('2d');
  const SECURITY_KEY = 'Captain_Z-MD.verified';
  const securityScreen = document.getElementById('securityScreen');
  const verifyBtn = document.getElementById('verifyBtn');
  const securityStatus = document.getElementById('securityStatus');

  function isSecurityVerified() {
    return localStorage.getItem(SECURITY_KEY) === 'true';
  }

  function hideSecurityScreen() {
    securityScreen.classList.add('hidden');
  }

  function showSecurityScreen() {
    securityScreen.classList.remove('hidden');
  }

  async function verifyDevice() {

  if (!window.PublicKeyCredential) {
  securityStatus.textContent =
    'Browser ini tidak mendukung verifikasi perangkat';
  securityStatus.style.color = 'red';
  return;
}

  verifyBtn.disabled = true;
  securityStatus.textContent =
    'Mohon tunggu sebentar...';

  try {
    const credential =
      await navigator.credentials.create({
        publicKey: {
          challenge: crypto.getRandomValues(
            new Uint8Array(32)
          ),

          rp: {
            name: 'Captain Z — Group Roller'
          },

          user: {
            id: crypto.getRandomValues(
              new Uint8Array(16)
            ),
            name: 'captain-z-user',
            displayName: 'Captain Z'
          },

          pubKeyCredParams: [
            {
              type: 'public-key',
              alg: -7
            },
            {
              type: 'public-key',
              alg: -257
            }
          ],

          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required'
          },

          timeout: 60000,

          attestation: 'none'
        }
      });

    if (!credential) {
      throw new Error('Verifikasi dibatalkan');
    }

    localStorage.setItem(SECURITY_KEY, 'true');
    securityStatus.textContent =
      'Verifikasi berhasil ✅';
    securityStatus.style.color = '#00ff42';
    setTimeout(() => {
      hideSecurityScreen();
    }, 300);

  } catch (error) {

    console.error('WebAuthn:', error);
    securityStatus.textContent =
      'Verifikasi gagal atau dibatalkan.';
    securityStatus.style.color = 'red';
    verifyBtn.disabled = false;
  }
}
  function themeIsLight() {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'light';
    } catch {
      return false;
    }
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', themeIsLight() ? 'light' : 'dark');
  }

  function toast(message) {
    els.toast.textContent = message;
    els.toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => els.toast.classList.remove('show'), 1900);
  }

  function clampCount(v) {
    const n = Number.parseInt(v, 10);
    return Number.isFinite(n) ? Math.min(100, Math.max(6, n)) : 20;
  }

  function buildNameInputs() {
    const count = clampCount(els.count.value);
    els.count.value = count;
    els.nameList.innerHTML = '';

    if (els.baseMode.value === 'number') {
      els.nameEditor.style.display = 'none';
      els.numberModeInfo.style.display = 'block';
      return;
    }

    els.nameEditor.style.display = 'block';
    els.numberModeInfo.style.display = 'none';

    const oldValues = state.inputMode === 'name' ? state.participants.map(p => p.name) : [];
    for (let i = 0; i < count; i++) {
      const row = document.createElement('div');
      row.className = 'name-row';

      const index = document.createElement('div');
      index.className = 'name-index';
      index.textContent = i + 1;

      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 15;
      input.placeholder = `Nama peserta ${i + 1}`;
      input.value = oldValues[i] || '';
      input.autocomplete = 'off';

      row.append(index, input);
      els.nameList.appendChild(row);
    }
  }

  function readParticipantsFromForm() {
    const count = clampCount(els.count.value);
    const list = [];

    if (els.baseMode.value === 'number') {
      for (let i = 1; i <= count; i++) {
        list.push({ id: i, name: String(i), number: i });
      }
    } else {
      const inputs = [...els.nameList.querySelectorAll('input')];
      for (let i = 0; i < count; i++) {
        const clean = (inputs[i]?.value || '').trim().slice(0, 15);
        list.push({
          id: i + 1,
          name: clean || String(i + 1),
          number: i + 1
        });
      }
    }
    return list;
  }

  function applyParticipants({showToast=true} = {}) {
    const data = readParticipantsFromForm();
    state.participants = data;
    state.remaining = [...data];
    state.history = [];
    state.rotation = 0;
    els.canvas.style.transition = 'none';
    els.canvas.style.transform = 'rotate(0deg)';
    requestAnimationFrame(() => {
      els.canvas.style.transition = 'transform 4.6s cubic-bezier(.17,.88,.18,1)';
    });
    state.spinning = false;

    els.lastResult.textContent = '—';
    renderAll();
    renderWheel();
    if (showToast) toast(`${data.length} peserta berhasil diterapkan.`);
    els.setupStatus.textContent = `${data.length} peserta aktif. Roda siap dipakai.`;
  }

  function renderStatus() {
    els.activeCount.textContent = state.participants.length;
    els.pickedCount.textContent = state.history.length;
    els.remainingCount.textContent = state.remaining.length;
    els.wheelBadge.textContent = `${state.remaining.length} peserta`;
    els.spin.disabled = state.spinning || state.remaining.length === 0;

    if (state.remaining.length === 0) {
      els.spin.textContent = 'SEMUA SUDAH TERPILIH ✅';
    } else if (!state.spinning) {
      els.spin.textContent = 'PUTAR RODA';
    }
  }

  function renderRemainingList() {
    els.remainingList.innerHTML = '';

    if (!state.remaining.length) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = 'Semua peserta sudah terpilih.';
      els.remainingList.appendChild(empty);
      return;
    }

    state.remaining.forEach((p, i) => {
      const row = document.createElement('div');
      row.className = 'name-row';

      const idx = document.createElement('div');
      idx.className = 'name-index';
      idx.textContent = p.number;

      const input = document.createElement('input');
      input.value = p.name;
      input.readOnly = true;
      input.title = `Peserta ${p.number}`;

      row.append(idx, input);
      els.remainingList.appendChild(row);
    });
  }

  function renderHistory() {
    els.history.innerHTML = '';
    if (!state.history.length) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = 'Belum ada hasil.';
      els.history.appendChild(empty);
      return;
    }

    state.history.forEach((p, i) => {
      const pill = document.createElement('div');
      pill.className = 'pill';
      pill.textContent = `${i + 1}. ${p.name}`;
      els.history.appendChild(pill);
    });
  }

  function renderAll() {
    renderStatus();
    renderRemainingList();
    renderHistory();
  }

  function palette(index, total) {
    const hue = Math.round((index / Math.max(total,1)) * 360);
    const saturation = 72;
    const light = themeIsLight() ? 66 : 60;
    return `hsl(${hue}, ${saturation}%, ${light}%)`;
  }

  function fitText(ctx2d, text, maxWidth) {
    let t = text;
    if (ctx2d.measureText(t).width <= maxWidth) return t;
    while (t.length > 1 && ctx2d.measureText(t + '…').width > maxWidth) t = t.slice(0, -1);
    return t + '…';
  }

  function renderWheel() {
    const size = els.canvas.width;
    ctx.clearRect(0,0,size,size);

    const total = state.remaining.length;
    if (
      !state.groupNames ||
      state.groupNames.length !== groups
    ) {
      state.groupNames = Array.from(
        { length: groups },
        (_, i) => `Kelompok ${i + 1}`
      );
    }
    if (!total) {
      ctx.beginPath();
      ctx.arc(size/2,size/2,size/2,0,Math.PI*2);
      ctx.fillStyle = themeIsLight() ? '#e2e8f0' : '#172033';
      ctx.fill();

      ctx.fillStyle = themeIsLight() ? '#475569' : '#cbd5e1';
      ctx.font = '900 34px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SELESAI', size/2, size/2);
      return;
    }

    const cx = size/2, cy = size/2, r = size/2 - 4;
    const arc = (Math.PI * 2) / total;

    for (let i=0; i<total; i++) {
      const start = -Math.PI/2 - arc/2 + i*arc;
      const end = start + arc;

      ctx.beginPath();
      ctx.moveTo(cx,cy);
      ctx.arc(cx,cy,r,start,end);
      ctx.closePath();
      ctx.fillStyle = palette(i,total);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,.35)';
      ctx.lineWidth = Math.max(2, 8 - Math.min(total, 40) / 8);
      ctx.stroke();

      const mid = (start+end)/2;
      const fontSize = Math.max(14, Math.min(28, 420/Math.sqrt(total)));
      ctx.save();
      ctx.translate(cx + Math.cos(mid)*r*0.66, cy + Math.sin(mid)*r*0.66);
      ctx.rotate(mid + Math.PI/2);

      ctx.fillStyle = '#fff';
      ctx.font = `900 ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,.32)';
      ctx.shadowBlur = 4;
      ctx.fillText(fitText(ctx, String(state.remaining[i].name), r*0.22), 0, 0);
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.strokeStyle = 'rgba(255,255,255,.55)';
    ctx.lineWidth = 8;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx,cy,r*0.18,0,Math.PI*2);
    ctx.fillStyle = themeIsLight() ? 'rgba(255,255,255,.94)' : 'rgba(15,23,42,.9)';
    ctx.fill();
    }

  function chosenIndexAfterRotation(finalRotation, count) {
    if (!count) return -1;
    const deg = ((finalRotation % 360) + 360) % 360;
    const sector = 360 / count;
    const relative = (360 - deg + sector/2) % 360;
    return Math.floor(relative / sector) % count;
    }

  function spinWheel() {
    if (state.spinning || !state.remaining.length) return;

    state.spinning = true;
    renderStatus();

    const count = state.remaining.length;
    const winnerIndex = Math.floor(Math.random() * count);

    const sector = 360 / count;
    const targetCenter = winnerIndex * sector;
    const current = ((state.rotation % 360) + 360) % 360;
    const desired = (360 - targetCenter) % 360;
    let delta = desired - current;
    if (delta < 0) delta += 360;

    const extraTurns = 6 + Math.floor(Math.random() * 3);
    state.rotation += extraTurns * 360 + delta;

    els.canvas.style.transform = `rotate(${state.rotation}deg)`;

    setTimeout(() => {
      const winner = state.remaining[winnerIndex];
      state.remaining.splice(winnerIndex, 1);
      state.history.push(winner);
      els.lastResult.textContent = winner.name;

      state.spinning = false;
      renderAll();
      renderWheel();
      toast(`Terpilih: ${winner.name}`);

      if (state.remaining.length === 0) {
        els.setupStatus.textContent = 'Semua peserta sudah terpilih.';
      }
    }, 4700);
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i=a.length-1; i>0; i--) {
      const j = Math.floor(Math.random()*(i+1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function makeGroups() {
  const total = state.participants.length;

  let groups = Number.parseInt(els.groupCount.value, 10);

  groups = Number.isFinite(groups)
  ? Math.max(2, Math.min(total, groups))
  : 4;

    if (
      !state.groupNames ||
      state.groupNames.length !== groups
    ) {
      state.groupNames = Array.from(
        { length: groups },
        (_, i) => `Kelompok ${i + 1}`
      );
    }
  els.groupCount.value = groups;

  let source = [...state.participants];

  if (els.groupMethod.value === 'random') {
    source = shuffle(source);
  }

  const base = Math.floor(total / groups);
  const remainder = total % groups;

  const buckets = Array.from(
    { length: groups },
    () => []
  );

  let cursor = 0;
  if (remainder === 1) {

    for (let i = 0; i < groups; i++) {
      buckets[i] = source.slice(
        cursor,
        cursor + base
      );

      cursor += base;
    }

    const extra = source[cursor];

    if (extra) {
      buckets[0].push({
        ...extra,
        isExtra: true
      });
    }

  } else {
    for (let i = 0; i < groups; i++) {
      const amount =
        base + (i < remainder ? 1 : 0);
        buckets[i] = source.slice(
        cursor,
        cursor + amount
      );
      cursor += amount;
    }
  }

  renderGroups(
    buckets,
    groups,
    remainder
  );
}
    function renderGroups(buckets, groups, remainder) {
     els.groupsGrid.innerHTML = '';
     buckets.forEach((members, gi) => {

    const card = document.createElement('div');
    card.className = 'group-card';
    const head = document.createElement('div');
    head.className = 'group-head';
    const title = document.createElement('input');
    title.className = 'group-title';
    title.type = 'text';
    title.value =
    state.groupNames?.[gi] ||
       `Kelompok ${gi + 1}`;
    title.placeholder =
       `Nama Kelompok ${gi + 1}`;
    title.style.width = '230px';
    title.style.border = '0';
    title.style.background = 'transparent';
    title.style.color = 'var(--text)';
    title.style.fontWeight = '950';
    title.style.fontSize = '.85rem';
    title.style.padding = '3px 4px';
    title.style.outline = 'none';
    title.addEventListener('input', () => {
      state.groupNames[gi] = title.value;
    });
    const badge = document.createElement('div');
    badge.className = 'count-badge';
    badge.textContent =
      `${members.length} orang`;
    head.append(title, badge);
    card.appendChild(head);
    members.forEach((p, i) => {
      const row = document.createElement('div');
      row.className = 'member';
      const num = document.createElement('div');
      num.className = 'member-num';
      num.textContent =
        `${i + 1}.`;
      const name = document.createElement('div');
      name.textContent =
        p.isExtra
          ? `🔹 ${p.name}`
          : p.name;
      row.append(num, name);
      if (p.isExtra) {
        const controls = document.createElement('div');
        controls.className = 'extra-controls';
        controls.style.display = 'flex';
        controls.style.gap = '5px';
        controls.style.flexWrap = 'wrap';
        controls.style.marginTop = '6px';
        controls.style.width = '100%';
        const label = document.createElement('small');
        label.textContent =
          'Pindahkan ke:';
        label.style.width = '100%';
        label.style.color = 'var(--muted)';
        label.style.fontSize = '.65rem';
        controls.appendChild(label);

        for (
          let target = 0;
          target < groups;
          target++
        ) {

          const button =
            document.createElement('button');

          button.className =
            'btn secondary';
          button.textContent =
            `Kelompok ${target + 1}`;
          button.style.fontSize = '.65rem';
          button.style.padding = '5px 7px';

          if (target === gi) {
            button.disabled = true;
          }

          button.addEventListener(
            'click',
            () => {

              const currentIndex =
                buckets[gi].findIndex(
                  member =>
                    member.id === p.id
                );

              if (currentIndex !== -1) {
                buckets[gi].splice(
                  currentIndex,
                  1
                );
              }

              buckets[target].push(p);
              renderGroups(
                buckets,
                groups,
                remainder
              );

              toast(
                `${p.name} → Kelompok ${target + 1}`
              );
            }
          );

          controls.appendChild(button);
        }

        row.appendChild(controls);
      }

      card.appendChild(row);
    });

    els.groupsGrid.appendChild(card);
  });
  
  const counts = buckets.map(
    group => group.length
  );

  let status =
    `${state.participants.length} peserta ÷ ` +
    `${groups} kelompok → ` +
    `${counts.join(', ')} peserta per kelompok.`;

  if (remainder === 1) {

    status +=
      ` Ada 1 anggota tambahan ` +
      `yang bisa memilih kelompok.`;

  } else if (remainder > 1) {

    status +=
      ` Sisa ${remainder} anggota ` +
      `dibagi rata secara otomatis.`;
  }

  els.groupStatus.textContent = status;

  toast('Kelompok berhasil dibuat.');
}
function getGroupData() {
  const cards =
    [...els.groupsGrid.querySelectorAll('.group-card')];

  return cards.map((card, index) => {

    const titleInput =
      card.querySelector('.group-title');

    const title =
      titleInput?.value.trim() ||
      `Kelompok ${index + 1}`;

    const members =
      [...card.querySelectorAll('.member')];

    const names = members.map(member => {

      const nameElement =
        [...member.children].find(
          el =>
            el !== member.querySelector('.member-num') &&
            !el.querySelector?.('button')
        );

      return nameElement
        ? nameElement.textContent
            .replace('🔹 ', '')
            .replace(' — Tambahan', '')
            .trim()
        : '';
    }).filter(Boolean);

    return {
      title,
      names
    };
  });
}
function copyGroupResult() {
  const groups = getGroupData();

  if (!groups.length) {
    toast('Buat kelompok terlebih dahulu.');
    return;
  }

  let text =
    `${state.exportTitle}\n` +
    `${'='.repeat(state.exportTitle.length)}\n\n`;

  groups.forEach((group) => {
    text +=
      `${group.title}\n` +
      `${'-'.repeat(30)}\n`;

    group.names.forEach((name, i) => {
      text += `${i + 1}. ${name}\n`;
    });

    text += '\n';
  });

  const total = groups.reduce(
    (sum, group) => sum + group.names.length,
    0
  );

  text +=
    '==============================\n' +
    `Total Anggota   : ${total}\n` +
    `Jumlah Kelompok : ${groups.length}\n`;

  navigator.clipboard.writeText(text)
    .then(() => {
      toast('Hasil berhasil disalin');
    })
    .catch(() => {
      toast('Gagal menyalin hasil.');
    });
}
  
function downloadTXT() {

  const groups = getGroupData();

  if (!groups.length) {
    toast('Buat kelompok terlebih dahulu.');
    return;
  }

  let text =
    `${state.exportTitle}\n` +
    `${'='.repeat(state.exportTitle.length)}\n\n`;

  groups.forEach((group, index) => {

    text +=
      `${group.title}\n` +
      `${'-'.repeat(30)}\n`;

    group.names.forEach((name, i) => {
      text += `${i + 1}. ${name}\n`;
    });

    text += '\n';
  });

  const total =
    groups.reduce(
      (sum, group) =>
        sum + group.names.length,
      0
    );

  text +=
    '==============================\n' +
    `Total Anggota   : ${total}\n` +
    `Jumlah Kelompok : ${groups.length}\n`;

  const blob =
    new Blob(
      [text],
      { type: 'text/plain;charset=utf-8' }
    );

  const url =
    URL.createObjectURL(blob);
  const a =
    document.createElement('a');
  a.href = url;
  a.download =
  `Pembagian-Kelompok-${date}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast('File TXT berhasil dibuat.');
}
function downloadPDF() {
  const groups = getGroupData();
  if (!groups.length) {
    toast('Buat kelompok terlebih dahulu.');
    return;
  }

  if (!window.jspdf) {
    toast('Library PDF belum siap.');
    return;
  }

  const {
    jsPDF
  } = window.jspdf;

  const doc =
    new jsPDF({
      unit: 'mm',
      format: 'a4'
    });

  let y = 20;
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(
  state.exportTitle,
  20,
  y
  );

  y += 9;

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text(
    new Date().toLocaleDateString(
      'id-ID',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }
    ),
    20,
    y
  );

  y += 12;
  groups.forEach((group, index) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');

    doc.text(
      group.title,
      20,
      y
    );

    y += 7;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    group.names.forEach((name, i) => {

      if (y > 280) {
        doc.addPage();
        y = 20;
      }

      doc.text(
        `${i + 1}. ${name}`,
        24,
        y
      );

      y += 5;
    });

    y += 7;
  });

  if (y > 270) {
    doc.addPage();
    y = 20;
  }

  const total =
    groups.reduce(
      (sum, group) =>
        sum + group.names.length,
      0
    );

  doc.setFontSize(9);
  doc.text(
    `Total Anggota: ${total}`,
    20,
    y
  );

  y += 5;

  doc.text(
    `Jumlah Kelompok: ${groups.length}`,
    20,
    y
  );

  doc.save(
  `Pembagian-Kelompok-${date}.pdf`
);

  toast('File PDF berhasil dibuat.');
} 

async function downloadPNG() {
  if (!window.html2canvas) {
    toast('Library PNG belum siap.');
    return;
  }

  const groups = els.groupsGrid;
  if (!groups || !groups.children.length) {
    toast('Buat kelompok terlebih dahulu.');
    return;
  }

  toast('Sedang membuat gambar...');
  const exportBox = document.createElement('div');
  exportBox.style.background =
    getComputedStyle(document.body)
      .getPropertyValue('--bg')
      .trim() || '#0b1020';
  exportBox.style.padding = '20px';
  exportBox.style.width = groups.offsetWidth + 'px';
  exportBox.style.boxSizing = 'border-box';
  const title = document.createElement('h2');
  title.textContent =
    state.exportTitle || 'Pembagian Kelompok';
  title.style.margin = '0 0 15px';
  title.style.color =
    getComputedStyle(document.body)
      .getPropertyValue('--text');
  title.style.fontSize = '22px';
  title.style.fontWeight = '900';
  exportBox.appendChild(title);
  const groupsClone =
  groups.cloneNode(true);
  groupsClone
  .querySelectorAll('.extra-controls')
  .forEach(el => el.remove());
  exportBox.appendChild(groupsClone);  
  exportBox.style.position = 'fixed';
  exportBox.style.left = '-100000px';
  exportBox.style.top = '0';

  document.body.appendChild(exportBox);

  try {
    const canvas = await html2canvas(
      exportBox,
      {
        backgroundColor:
          getComputedStyle(document.body)
            .getPropertyValue('--bg')
            .trim() || '#0b1020',

        scale: 2,

        useCORS: true
      }
    );

    const link =
      document.createElement('a');

    const date =
      new Date()
        .toLocaleDateString(
          'id-ID',
          {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }
        )
        .replace(/\//g, '-');

    link.download =
      `${state.exportTitle || 'Pembagian Kelompok'}-${date}.png`;
    link.href =
      canvas.toDataURL('image/png');
    link.click();
    toast('PNG berhasil dibuat ✅');
  } catch (error) {
    console.error(error);
    toast('Gagal membuat PNG.');
  } finally {
    exportBox.remove();

  }
}

  function resetAll() {
    els.count.value = 20;
    els.baseMode.value = 'number';
    state.participants = [];
    state.remaining = [];
    state.history = [];
    state.rotation = 0;
    state.spinning = false;
    buildNameInputs();
    applyParticipants({showToast:false});
    els.groupCount.value = 4;
    els.groupsGrid.innerHTML = '';
    els.groupStatus.textContent = 'Siap membagi peserta.';
    toast('Data direset.');
  }
    els.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
    const target = tab.dataset.view;
    els.tabs.forEach(t => t.classList.toggle('active', t === tab));
    els.views.forEach(v => v.classList.toggle('active', v.id === target));
      if (target === 'wheel') {
        renderWheel();
        renderAll();
      }
    });
  });
  
  els.copyResult =
  document.getElementById('copyResult');
  els.downloadPng =
  document.getElementById('downloadPng');
  els.downloadTxt =
  document.getElementById('downloadTxt');
  els.downloadPdf =
  document.getElementById('downloadPdf');

  els.copyResult.addEventListener(
  'click',
  copyGroupResult
  );
  els.downloadPng.addEventListener(
  'click',
  downloadPNG
  );
  els.downloadTxt.addEventListener(
    'click',
    downloadTXT
  );
  els.downloadPdf.addEventListener(
    'click',
    downloadPDF
  ); 
  
  els.minus.addEventListener('click', () => {
    els.count.value = clampCount(Number(els.count.value) - 1);
    buildNameInputs();
  });

  els.plus.addEventListener('click', () => {
    els.count.value = clampCount(Number(els.count.value) + 1);
    buildNameInputs();
  });

  els.count.addEventListener('change', () => {
    els.count.value = clampCount(els.count.value);
    buildNameInputs();
  });

  els.baseMode.addEventListener('change', () => {
    state.inputMode = els.baseMode.value;
    buildNameInputs();
  });

  els.apply.addEventListener('click', () => applyParticipants());
  els.reset.addEventListener('click', resetAll);
  els.spin.addEventListener('click', spinWheel);

  els.clearHistory.addEventListener('click', () => {
    state.history = [];
    renderAll();
    toast('Riwayat hasil dihapus.');
  });

  els.makeGroups.addEventListener('click', makeGroups);
  
  applyTheme();
  buildNameInputs();
  applyParticipants({showToast:false});

  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      applyTheme();
      renderWheel();
    }
  });

  if (isSecurityVerified()) {
    hideSecurityScreen();
  } else {
    showSecurityScreen();
  }
  
verifyBtn.addEventListener('click', verifyDevice);

})();

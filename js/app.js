// Logika game Pecah Masalah. Kelas Tailwind dikumpulkan di objek K (di bawah),
// karena tampilan dibuat oleh JavaScript. Bank soal ada di js/soal.js.

/* ===== PENGATURAN ===== */
const API_URL =
    'https://script.google.com/macros/s/AKfycbzCP7tNhmnBoAXQC-BADuiKhUabSxHpDpxHvsAgoKSpD7CIb3yXUWkt1fo8ET30KiUc/exec'; // URL Web App dari Apps Script
const BADGES = ['Pemecah', 'Pengelompok', 'Penyusun', 'Pemeriksa', 'Perancang'];

/* ===== KELAS TAILWIND ===== */
const K = {
    card: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 my-3',
    ok: 'bg-white dark:bg-slate-800 border border-green-600 rounded-xl p-4 my-3',
    no: 'bg-white dark:bg-slate-800 border border-red-500 rounded-xl p-4 my-3 anim-sh',
    btn: 'min-h-[44px] px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 disabled:opacity-40',
    pr: 'min-h-[44px] px-4 py-2 rounded-lg border border-blue-600 bg-blue-600 text-white disabled:opacity-40',
    chip: 'block w-full text-left my-1.5 min-h-[44px] px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 disabled:opacity-40',
    on: ' ring-2 ring-blue-600',
    bub: 'rounded-xl px-3 py-2 text-sm bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700',
    mut: 'text-sm text-slate-500 dark:text-slate-400',
};

/* ===== PENYIMPANAN & PENGIRIMAN ===== */
const $ = document.getElementById('app');
const esc = (s) =>
    String(s).replace(
        /[&<>"]/g,
        (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
    );
const store = (k, v) => {
    try {
        if (v === undefined) return JSON.parse(localStorage.getItem(k));
        localStorage.setItem(k, JSON.stringify(v));
    } catch (_) {
        return null;
    }
};
const NAMA = /^[A-Za-z][A-Za-z .'-]{2,19}$/; // nama panggilan, 3-20 karakter
const P = store('pm_p') || { kode: '', h: {} };
let S = { v: NAMA.test(P.kode || '') ? 'map' : 'login' },
    kirimBerjalan = false;
const online = () => API_URL.startsWith('http');
function kirim(d) {
    if (!online()) return;
    store('pm_q', [
        ...(store('pm_q') || []),
        { ...d, waktu: new Date().toISOString() },
    ]);
    flush();
}
async function flush() {
    if (kirimBerjalan) return;
    kirimBerjalan = true;
    const q = store('pm_q') || [];
    store('pm_q', []);
    for (const d of q) {
        try {
            await fetch(API_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify(d),
            });
        } catch (_) {
            store('pm_q', [...(store('pm_q') || []), d]);
        }
    }
    kirimBerjalan = false;
}
async function muatPeringkat() {
    S = { v: 'rank', rank: null, rankErr: false };
    draw();
    try {
        const r = await fetch(API_URL + '?aksi=peringkat');
        S.rank = await r.json();
    } catch (_) {
        S.rank = [];
        S.rankErr = true;
    }
    draw();
}

/* ===== SUARA, CONFETTI, DAN DRAG & DROP ===== */
let mute = store('pm_snd') === 'off',
    AC = null,
    supClick = false,
    D = null;
function nada(f, d, t, tipe) {
    if (mute) return;
    try {
        AC = AC || new (window.AudioContext || window.webkitAudioContext)();
        const o = AC.createOscillator(),
            g = AC.createGain(),
            s = AC.currentTime + (t || 0);
        o.type = tipe || 'sine';
        o.frequency.value = f;
        g.gain.setValueAtTime(0.12, s);
        g.gain.exponentialRampToValueAtTime(0.001, s + d);
        o.connect(g);
        g.connect(AC.destination);
        o.start(s);
        o.stop(s + d);
    } catch (_) {}
}
const bunyi = {
    tap: () => nada(440, 0.05),
    ok: () => {
        nada(660, 0.1);
        nada(880, 0.15, 0.1);
    },
    no: () => nada(180, 0.25, 0, 'sawtooth'),
    win: () => [523, 659, 784, 1047].forEach((f, i) => nada(f, 0.18, i * 0.12)),
    lose: () =>
        [392, 330, 262].forEach((f, i) => nada(f, 0.25, i * 0.18, 'triangle')),
};
function confetti(n) {
    if (
        window.matchMedia &&
        matchMedia('(prefers-reduced-motion: reduce)').matches
    )
        return;
    const w = document.createElement('div'),
        w2 = ['#2563eb', '#f59e0b', '#16a34a', '#ef4444', '#a855f7', '#06b6d4'];
    w.className = 'confetti';
    w.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < n; i++) {
        const e = document.createElement('i');
        e.style.left = Math.random() * 100 + '%';
        e.style.background = w2[i % w2.length];
        e.style.animationDelay = Math.random() * 0.35 + 's';
        e.style.setProperty(
            '--dx',
            Math.round(Math.random() * 160 - 80) + 'px',
        );
        w.appendChild(e);
    }
    document.body.appendChild(w);
    setTimeout(() => w.remove(), 2600);
}
// Seret kartu: ketuk biasa tetap berfungsi (gerakan di bawah 8 px dianggap ketukan).
function targetDi(x, y) {
    const e = document.elementFromPoint(x, y);
    return e ? e.closest('[data-drop]') : null;
}
function bersih() {
    document
        .querySelectorAll('.over')
        .forEach((e) => e.classList.remove('over'));
}
$.addEventListener('pointerdown', (ev) => {
    const el = ev.target.closest('[data-drag]');
    if (!el || S.v !== 'play' || S.lock || ev.button > 0) return;
    D = { el, x: ev.clientX, y: ev.clientY, go: false };
});
window.addEventListener('pointermove', (ev) => {
    if (!D) return;
    const dx = ev.clientX - D.x,
        dy = ev.clientY - D.y;
    if (!D.go) {
        if (Math.hypot(dx, dy) < 8) return;
        D.go = true;
        D.el.classList.add('dragging');
    }
    D.el.style.transform = `translate(${dx}px,${dy}px)`;
    bersih();
    const t = targetDi(ev.clientX, ev.clientY);
    if (t) t.classList.add('over');
});
window.addEventListener('pointerup', (ev) => {
    if (!D) return;
    const d = D;
    D = null;
    bersih();
    if (!d.go) return;
    supClick = true;
    setTimeout(() => {
        supClick = false;
    }, 0);
    const t = targetDi(ev.clientX, ev.clientY),
        i = +d.el.dataset.i;
    if (t && S.v === 'play' && !S.lock) {
        if (d.el.dataset.drag === 'card' && t.dataset.drop === 'grp') {
            S.m[i] = +t.dataset.i;
            S.cur = null;
            bunyi.tap();
        } else if (
            d.el.dataset.drag === 'ord' &&
            t.dataset.drop === 'ord' &&
            !S.seq.includes(i)
        ) {
            S.seq.push(i);
            bunyi.tap();
        }
    }
    draw();
});
window.addEventListener('pointercancel', () => {
    if (D) {
        D = null;
        bersih();
        draw();
    }
});

/* ===== LOGIKA GAME ===== */
const PEMBUKA = [
    'Ayo pecahkan masalahnya!',
    'Robi siap membantu. Pikirkan baik-baik ya!',
    'Pecah jadi bagian kecil, pasti bisa!',
];
const acak = (n) => {
    const a = [...Array(n).keys()];
    for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};
const Q = () => STAGES[S.s].qs[S.q];
function rq() {
    const q = Q();
    Object.assign(S, {
        mas: {
            e: '🤖',
            t: PEMBUKA[Math.floor(Math.random() * PEMBUKA.length)],
        },
        sel: [],
        m: {},
        cur: null,
        exp: {},
        pilih: null,
        seq: [],
        att: 0,
        fb: '',
        ok: false,
        lock: false,
        t0: Date.now(),
        o: acak(q.t === 'choice' ? q.o.length : (q.c || []).length),
    });
}
const siap = (q) =>
    q.t === 'choice'
        ? S.sel.length === 1
        : q.t === 'pick'
          ? S.sel.length === q.a.length
          : q.t === 'group'
            ? Object.keys(S.m).length === q.c.length
            : S.seq.length === q.c.length;
const benar = (q) =>
    q.t === 'choice'
        ? S.sel[0] === q.a
        : q.t === 'pick'
          ? q.a.every((x) => S.sel.includes(x))
          : q.t === 'group'
            ? q.c.every((c, i) => S.m[i] === c[1])
            : q.r.every(([a, b]) => S.seq.indexOf(a) < S.seq.indexOf(b));
const xp = () => Object.values(P.h).reduce((a, h) => a + h.xp, 0);
const buka = (i) => i === 0 || (P.h[i - 1] && P.h[i - 1].b >= 1);
// Satu warna per tahap (lihat .stitch/DESIGN.md). Dipakai lewat arbitrary value Tailwind.
const TAHAP = ['#2563EB', '#7C3AED', '#0D9488', '#D97706', '#16A34A'];
const selesai = (i) => !!(P.h[i] && P.h[i].b >= 1);
const totalBintang = () => Object.values(P.h).reduce((a, h) => a + h.b, 0);
const tahapAktif = () => STAGES.findIndex((_, i) => buka(i) && !selesai(i)); // -1 bila semua selesai

// Satu soal selesai: kunci skor, umpan balik, dan kirim log. Dipakai semua tipe soal.
function tutup(q, b) {
    S.lock = true;
    S.ok = b;
    S.sk.push(b ? [1, 0.5, 0.25][S.att - 1] : 0);
    S.fb = (b ? 'Tepat! ' : 'Belum tepat. ') + q.k;
    if (b) {
        bunyi.ok();
        confetti(S.combo >= 3 ? 45 : 22);
        S.mas =
            S.combo >= 3
                ? { e: '🔥', t: `Combo x${S.combo}! Kamu hebat!` }
                : { e: '🤩', t: 'Tepat sekali!' };
    } else {
        S.hp = Math.max(0, S.hp - 1);
        bunyi.no();
        S.mas = {
            e: '🥹',
            t: 'Tidak apa-apa. Baca penjelasannya, lalu lanjut.',
        };
    }
    kirim({
        tipe: 'log',
        kode: P.kode,
        tahap: S.s + 1,
        soal: S.q + 1,
        tp: '1.1',
        benar: b ? 1 : 0,
        percobaan: S.att,
        detik: Math.round((Date.now() - S.t0) / 1000),
    });
}
function periksa(q) {
    S.att++;
    const b = benar(q);
    if (b) {
        S.combo++;
        if (S.combo >= 2) S.bonus += S.combo - 1;
    } else S.combo = 0;
    if (b || S.att >= 3) tutup(q, b);
    else {
        bunyi.no();
        S.mas = { e: '🤔', t: 'Hampir! Coba lagi, kamu pasti bisa.' };
        S.fb =
            S.att === 2
                ? 'Belum tepat. Petunjuk: ' + q.k
                : 'Belum tepat, coba lagi.';
        if (q.t === 'order') S.seq = [];
    }
}

/* ===== POHON PECAH (tipe soal "split") =====
   p = path menunjuk posisi node di pohon: '' akar, '.2' anak ketiga, '.2.1' cucu kedua. */
const opsiBenar = (n) => n.o.find((o) => o.kids);
function nodeDi(n, p) {
    for (const i of p.split('.').filter(Boolean)) n = opsiBenar(n).kids[i];
    return n;
}
function bukaSemua(n, p) {
    if (!n.o) return;
    S.exp[p] = true;
    opsiBenar(n).kids.forEach((c, i) => bukaSemua(c, p + '.' + i));
}
function pohonSelesai(n, p) {
    if (!n.o) return true;
    if (!S.exp[p]) return false;
    return opsiBenar(n).kids.every((c, i) => pohonSelesai(c, p + '.' + i));
}
function cabang(n, p) {
    const buka = !!S.exp[p],
        opsi = n.o && opsiBenar(n);
    let h = `<div class="py-0.5"><div class="flex items-center gap-2"><span class="${n.o ? (buka ? 'text-green-600' : 'text-slate-400') : 'text-blue-600'}">${n.o ? (buka ? '✓' : '◆') : '•'}</span><span class="flex-1">${esc(n.l)}</span>${n.o && !buka && !S.lock ? `<button class="${K.btn} !px-3 !text-sm" data-a="sp" data-p="${p}">＋ Pecah</button>` : ''}</div>`;
    if (buka)
        h += opsi.kids
            .map(
                (c, i) =>
                    `<div class="ml-2 pl-3 border-l border-slate-300 dark:border-slate-600">${cabang(c, p + '.' + i)}</div>`,
            )
            .join('');
    else if (S.pilih === p)
        h += `<div class="my-1">${n.o.map((o, i) => `<button class="${K.chip}" data-a="op" data-p="${p}" data-i="${i}">${esc(o.l)}</button>`).join('')}</div>`;
    return h + '</div>';
}
function salahPecah(q) {
    S.att++;
    S.combo = 0;
    if (S.att >= 3) {
        bukaSemua(q.r, '');
        tutup(q, false);
        return;
    }
    bunyi.no();
    S.mas = { e: '🤔', t: 'Hampir! Coba lagi, kamu pasti bisa.' };
    S.fb =
        S.att === 2 ? 'Belum tepat. Petunjuk: ' + q.k : 'Belum tepat, coba lagi.';
}
function pecah(q, p, i) {
    const o = nodeDi(q.r, p).o[i];
    if (!o.kids) return salahPecah(q);
    S.exp[p] = true;
    S.pilih = null;
    bunyi.tap();
    if (!pohonSelesai(q.r, '')) return;
    S.att++;
    S.combo++;
    if (S.combo >= 2) S.bonus += S.combo - 1;
    tutup(q, true);
}
function lanjut() {
    const st = STAGES[S.s];
    if (S.q + 1 < st.qs.length) {
        if (S.hp <= 0) {
            S.v = 'habis';
            bunyi.lose();
            return;
        }
        S.q++;
        rq();
        return;
    }
    const n = st.qs.length,
        sum = S.sk.reduce((a, b) => a + b, 0),
        pct = Math.round((sum / n) * 100),
        b = pct >= 100 ? 3 : pct >= 80 ? 2 : pct >= 60 ? 1 : 0,
        x = Math.round(sum * 10) + S.bonus;
    if (b) {
        bunyi.win();
        confetti(70);
    } else bunyi.lose();
    if (!P.h[S.s] || pct > P.h[S.s].p) P.h[S.s] = { p: pct, b, xp: x };
    store('pm_p', P);
    kirim({
        tipe: 'skor',
        kode: P.kode,
        tahap: S.s + 1,
        tp: '1.1',
        persen: pct,
        bintang: b,
        xp: x,
    });
    S.v = 'hasil';
    S.r = { pct, b, xp: x, bonus: S.bonus };
}

/* ===== TAMPILAN ===== */
const mascot = (e, t) =>
    `<div class="flex items-center gap-3 my-2"><div class="text-4xl mascot" aria-hidden="true">${e}</div><div class="${K.bub}">${esc(t)}</div></div>`;
const sndBtn = () =>
    `<button class="${K.btn} !min-h-[36px] !px-3" data-a="snd" aria-label="${mute ? 'Nyalakan suara' : 'Matikan suara'}">${mute ? '🔇' : '🔊'}</button>`;
function vLogin() {
    return `<div class="${K.card}"><h1 class="text-2xl font-semibold mb-2">Pecah Masalah</h1>${mascot('🤖', 'Halo! Aku Robi. Yuk jadi Pemecah Masalah!')}<p class="mb-3">Latihan memecah masalah besar menjadi langkah-langkah kecil. Ada ${STAGES.length} tahap.</p><label for="kode" class="${K.mut}">Nama panggilan</label><input id="kode" maxlength="20" autocomplete="off" autocapitalize="words" class="w-full my-2 p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800">${S.err ? '<p class="text-red-600 dark:text-red-400 mb-2">Nama belum sesuai. Gunakan 3–20 huruf.</p>' : ''}<button class="${K.pr}" data-a="start">Mulai</button></div>`;
}

function navBawah(aktif) {
    const item = (tujuan, ikon, label) =>
        `<button class="flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] transition-colors ${aktif === tujuan ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'}" data-a="${tujuan}"><span aria-hidden="true" class="text-[22px] select-none">${ikon}</span><span class="text-xs">${label}</span></button>`;
    return `<nav class="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-xl bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 pb-safe"><div class="flex justify-around items-center h-16 px-3">${item('map', '🗺️', 'Petualangan')}${online() ? item('rank', '🏆', 'Peringkat') : ''}${item('keluar', '👤', 'Ganti nama')}</div></nav>`;
}

function headerAtas() {
    return `<header class="fixed top-0 left-0 right-0 z-50 mx-auto w-full max-w-xl bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 pt-safe"><div class="h-16 px-4 flex items-center justify-between gap-2"><div class="flex items-center gap-2 min-w-0"><div class="w-9 h-9 shrink-0 rounded-xl bg-blue-50 dark:bg-slate-700 flex items-center justify-center"><span aria-hidden="true" class="text-lg select-none">🤖</span></div><div class="flex flex-col min-w-0"><span class="font-display text-[17px] leading-none tracking-tight font-bold text-blue-600 dark:text-blue-400 truncate">Pecah Masalah</span><span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">Dekomposisi Kelas 7</span></div></div><div class="flex items-center gap-1.5 shrink-0"><div class="flex items-center gap-1 bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-600"><span aria-hidden="true" class="text-[13px] select-none">⭐</span><span class="text-[11px] font-bold">${xp()} XP</span></div><div class="flex items-center gap-1 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-600"><span aria-hidden="true" class="text-[13px] select-none">🏅</span><span class="text-[11px] font-bold text-green-700 dark:text-green-400">${totalBintang()}/${STAGES.length * 3}</span></div><button class="w-8 h-8 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center font-display text-sm font-bold" data-a="keluar" aria-label="Ganti nama">${esc((P.kode || '?').charAt(0).toUpperCase())}</button></div></div></header>`;
}

// Header + isi + nav bawah, dipakai layar peta dan peringkat saja.
const kerangka = (isi, aktif) =>
    `${headerAtas()}<main class="layar px-4 w-full">${isi}</main>${navBawah(aktif)}`;

const bintangKecil = (n) =>
    [0, 1, 2]
        .map(
            (k) =>
                `<span class="${k < n ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'}">★</span>`,
        )
        .join('');

// Kartu tahap yang sedang dikerjakan: aksi utama di zona jempol.
function kartuAktif(i) {
    const s = STAGES[i],
        h = P.h[i],
        w = TAHAP[i % TAHAP.length],
        sudah = selesai(i);
    return `<div class="mt-6 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md border border-slate-200 dark:border-slate-700 flex flex-col gap-3"><div class="flex items-start justify-between gap-2"><div class="min-w-0"><span class="inline-block px-2 py-0.5 rounded-full text-xs font-bold text-[${w}] bg-[${w}]/10">Tahap ${i + 1} • ${sudah ? 'Selesai' : 'Sedang Dikerjakan'}</span><h3 class="font-display text-[22px] font-bold leading-tight mt-1">${esc(s.n)}</h3></div>${h ? `<div class="flex items-center gap-1 bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded-lg shrink-0"><span aria-hidden="true" class="text-amber-500">⭐</span><span class="text-xs font-bold">${h.xp} XP</span></div>` : ''}</div><p class="text-sm text-slate-500 dark:text-slate-400">${esc(s.info)}</p><div class="grid grid-cols-2 gap-1"><div class="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 min-w-0"><span aria-hidden="true" class="text-sm">🛠️</span><span class="text-xs truncate">${esc(s.alat)}</span></div><div class="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 min-w-0"><span aria-hidden="true" class="text-sm">🎯</span><span class="text-xs truncate">${s.qs.length} soal</span></div></div><button class="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-display text-[16px] font-bold flex items-center justify-center gap-2 shadow-md transition-all" data-a="go" data-i="${i}"><span>${sudah ? 'Main Lagi' : 'Mulai Tahap'} ${i + 1}</span><span aria-hidden="true" class="text-lg">🚀</span></button></div>`;
}

// Satu node peta. Tahap terkunci tidak bisa diketuk, jadi bukan tombol.
function kartuTahap(i, aktif) {
    const s = STAGES[i],
        h = P.h[i],
        w = TAHAP[i % TAHAP.length],
        final = i === STAGES.length - 1,
        sudah = selesai(i),
        ukuran = final ? 'w-20 h-20' : 'w-16 h-16',
        jarak = aktif ? 'mt-3' : 'mt-2',
        // Garis SVG memakai titik 30% / 70% / 50% lebar peta; blok node diletakkan
        // di kolom selebar 60% supaya titik tengahnya jatuh di angka yang sama.
        kolom = `<div class="flex ${final ? 'justify-center' : i % 2 ? 'justify-end' : 'justify-start'}"><div class="${final ? 'w-full' : 'w-[60%]'} flex justify-center">NODE</div></div>`;
    const bungkus = (isi) => kolom.replace('NODE', isi);
    if (!buka(i))
        return bungkus(
            `<div class="flex flex-col items-center opacity-70"><div class="relative ${ukuran} rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 flex flex-col items-center justify-center shadow-sm">${final ? `<span aria-hidden="true" class="text-2xl select-none">👑</span><span class="text-xs font-bold mt-0.5">FINAL</span><div class="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-600 flex items-center justify-center"><span class="text-xs">🔒</span></div>` : `<span aria-hidden="true" class="text-xl select-none">🔒</span>`}</div><div class="mt-2 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg text-center max-w-[160px]"><span class="block text-xs font-bold text-slate-500 dark:text-slate-400 line-clamp-1">${esc(s.n)}</span><span class="block text-[10px] font-medium text-slate-400 dark:text-slate-500">Buka di Tahap ${i}</span></div></div>`,
        );
    return bungkus(
        `<button class="group flex flex-col items-center relative" data-a="go" data-i="${i}">${aktif ? `<div class="absolute -inset-2 rounded-full bg-[${w}]/30 animate-ping pointer-events-none aura"></div>` : ''}<div class="relative ${ukuran} rounded-full bg-[${w}] text-white flex flex-col items-center justify-center shadow-md active:scale-95 transition-transform">${final ? `<span aria-hidden="true" class="text-2xl select-none">👑</span><span class="text-xs font-bold mt-0.5">FINAL</span>` : `<span class="font-display text-[22px] font-bold leading-none">${i + 1}</span>`}${sudah ? `<div class="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-50 flex items-center justify-center shadow-sm"><span class="text-xs">✅</span></div>` : ''}${aktif ? `<div class="absolute -bottom-2 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full shadow-sm text-[10px] font-bold tracking-wider uppercase text-[${w}]">Main</div>` : ''}</div><div class="${jarak} bg-white dark:bg-slate-800 px-2 py-1 rounded-lg shadow-sm text-center max-w-[160px]"><span class="block text-xs font-bold ${aktif ? `text-[${w}]` : 'text-slate-900 dark:text-slate-100'} line-clamp-1">${esc(s.n)}</span><div class="flex justify-center items-center gap-0.5 mt-0.5 text-xs">${bintangKecil(h ? h.b : 0)}</div></div></button>`,
    );
}

function vMap() {
    const lencana = BADGES.filter((_, i) => selesai(i)),
        aktif = tahapAktif(),
        sudah = STAGES.filter((_, i) => selesai(i)).length,
        jalur = [
            'M 96 68 C 96 110, 224 120, 224 172',
            'M 224 172 C 224 220, 96 230, 96 288',
            'M 96 288 C 96 340, 224 350, 224 416',
            'M 224 416 C 224 480, 160 490, 160 550',
        ]
            .map(
                (d, i) =>
                    `<path d="${d}" stroke="${selesai(i) ? TAHAP[i] : '#c3c6d7'}" stroke-dasharray="6 6" stroke-linecap="round" stroke-width="4"></path>`,
            )
            .join('');
    return `<div class="flex flex-col w-full pb-6"><div class="flex items-start gap-2 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"><div class="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-700 flex items-center justify-center shrink-0"><span aria-hidden="true" class="text-xl select-none">🤖</span></div><div class="flex-1 bg-slate-50 dark:bg-slate-700/50 p-2 rounded-xl"><p class="text-sm font-medium leading-snug">${Object.keys(P.h).length ? 'Lanjutkan petualanganmu! Pilih misi untuk memecah masalah besar jadi langkah kecil yang mudah.' : 'Hai! Pilih misi untuk mulai memecah masalah besar jadi langkah kecil yang mudah!'}</p></div></div><div class="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl mt-3 shadow-sm border border-slate-200 dark:border-slate-700"><div class="flex items-center gap-2 min-w-0"><span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Perjalananmu</span><span class="font-display text-[17px] font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">${sudah}/${STAGES.length} Selesai</span></div><span class="font-display text-[17px] font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap" aria-label="Total bintang ${totalBintang()}">${totalBintang()} ⭐</span></div>${lencana.length ? `<div class="flex flex-wrap gap-1.5 mt-2">${lencana.map((b) => `<span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100">${esc(b)}</span>`).join('')}</div>` : ''}<div class="relative w-full px-2 py-8"><svg class="absolute inset-0 w-full h-full pointer-events-none z-0" fill="none" preserveAspectRatio="none" viewBox="0 0 320 620" aria-hidden="true">${jalur}</svg><div class="flex flex-col gap-8 relative z-10">${STAGES.map((_, i) => kartuTahap(i, i === aktif)).join('')}</div></div>${kartuAktif(aktif < 0 ? STAGES.length - 1 : aktif)}</div>`;
}

function vRank() {
    const r = S.rank;
    const isi =
        r === null
            ? '<p class="text-slate-500 dark:text-slate-400">Memuat…</p>'
            : S.rankErr
              ? `<p class="text-sm text-slate-500 dark:text-slate-400">Gagal memuat peringkat. Periksa koneksi lalu coba lagi.</p><button class="min-h-[44px] px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 mt-2" data-a="rank">Coba lagi</button>`
              : r.length
                ? `<ol class="space-y-2">${r.map((x, n) => `<li class="flex items-center gap-3 min-h-[44px] px-3 rounded-xl ${x.kode === P.kode ? 'ring-2 ring-blue-600' : 'bg-slate-50 dark:bg-slate-700/50'}"><span class="font-display w-6 text-slate-400 dark:text-slate-500">${n + 1}</span><span class="flex-1 truncate">${esc(x.kode)}</span>${x.kode === P.kode ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider">Kamu</span>' : ''}<span class="font-display font-bold text-amber-600 dark:text-amber-400">${x.xp} XP</span></li>`).join('')}</ol>`
                : `<div class="flex items-center gap-2"><span aria-hidden="true" class="text-2xl">🤖</span><p class="text-sm text-slate-500 dark:text-slate-400">Belum ada data. Selesaikan satu tahap untuk masuk peringkat.</p></div>`;
    return `<h2 class="font-display text-[28px] font-bold mb-3">Peringkat XP</h2><div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">${isi}</div>`;
}

function vPlay() {
    const q = Q(),
        st = STAGES[S.s],
        n = st.qs.length;
    let h = `<div class="flex justify-between items-center mb-2"><span aria-label="Nyawa ${S.hp} dari 3">${'❤️'.repeat(S.hp) + '🖤'.repeat(3 - S.hp)}</span><span class="font-semibold text-amber-600 dark:text-amber-400">${S.combo >= 2 ? '🔥 Combo x' + S.combo : ''}</span>${sndBtn()}</div>${mascot(S.mas.e, S.mas.t)}<div class="h-2 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden"><i class="block h-full bg-blue-600 transition-all" style="width:${(S.q / n) * 100}%"></i></div><p class="${K.mut} my-2">Tahap ${S.s + 1}: ${esc(st.n)} · Alat: ${esc(st.alat)} · ${q.f ? 'Refleksi' : `Soal ${S.q + 1}/${n}`}</p><div class="${K.card}"><p class="mb-2">${esc(q.p)}</p>`;
    if (q.t === 'choice')
        h += S.o
            .map(
                (i) =>
                    `<button class="${K.chip}${S.sel[0] === i ? K.on : ''}" data-a="sel" data-i="${i}">${esc(q.o[i])}</button>`,
            )
            .join('');
    if (q.t === 'pick')
        h +=
            `<p class="${K.mut}">Pilih ${q.a.length}.</p>` +
            S.o
                .map(
                    (i) =>
                        `<button class="${K.chip}${S.sel.includes(i) ? K.on : ''}" data-a="sel" data-i="${i}">${esc(q.c[i])}</button>`,
                )
                .join('');
    if (q.t === 'group')
        h +=
            `<p class="${K.mut}">Seret kartu ke kotak tujuannya (atau ketuk kartu, lalu ketuk kotaknya). Ketuk kartu di dalam kotak untuk membatalkan.</p>` +
            S.o
                .filter((i) => S.m[i] === undefined)
                .map(
                    (i) =>
                        `<button class="${K.chip} drg${S.cur === i ? K.on : ''}" data-a="card" data-drag="card" data-i="${i}">${esc(q.c[i][0])}</button>`,
                )
                .join('') +
            q.g
                .map(
                    (g, gi) =>
                        `<div class="drop border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-2 my-2 min-h-[56px] cursor-pointer" data-a="grp" data-drop="grp" data-i="${gi}"><h4 class="${K.mut}">${esc(g)}</h4>${S.o
                            .filter((i) => S.m[i] === gi)
                            .map(
                                (i) =>
                                    `<span class="inline-block m-1 px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-sm" data-a="un" data-i="${i}">${esc(q.c[i][0])} ✕</span>`,
                            )
                            .join('')}</div>`,
                )
                .join('');
    if (q.t === 'order')
        h +=
            `<p class="${K.mut}">Seret atau ketuk langkah sesuai urutan pengerjaan.</p>` +
            S.o
                .filter((i) => !S.seq.includes(i))
                .map(
                    (i) =>
                        `<button class="${K.chip} drg" data-a="ord" data-drag="ord" data-i="${i}">${esc(q.c[i])}</button>`,
                )
                .join('') +
            `<ol class="drop my-2 pl-9 pr-2 py-2 list-decimal border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl min-h-[56px]" data-a="ordzone" data-drop="ord">${S.seq.length ? S.seq.map((i) => `<li>${esc(q.c[i])}</li>`).join('') : `<li class="list-none ${K.mut}">Taruh langkah di sini</li>`}</ol>` +
            (S.seq.length && !S.lock
                ? `<button class="${K.btn}" data-a="undo">Ulangi urutan</button>`
                : '');
    if (q.t === 'split')
        h += `<p class="${K.mut}">Ketuk <b>＋ Pecah</b> pada bagian yang masih terlalu besar. Soal selesai kalau semua bagian sudah bisa langsung dikerjakan.</p><div class="my-2">${cabang(q.r, '')}</div>`;
    h += `</div>`;
    if (S.fb)
        h += `<div class="${S.ok ? K.ok : K.no}" role="status">${esc(S.fb)}</div>`;
    h += S.lock
        ? `<button class="${K.pr}" data-a="next">Lanjut</button>`
        : q.t === 'split'
          ? ''
          : `<button class="${K.pr}" data-a="cek" ${siap(q) ? '' : 'disabled'}>Periksa</button>`;
    return (
        h + ` <button class="${K.btn}" data-a="map">Kembali ke peta</button>`
    );
}

function vHasil() {
    const r = S.r;
    return `<div class="${K.card} text-center"><h2 class="text-xl font-semibold mb-2">Tahap ${S.s + 1} selesai</h2><div>${[0, 1, 2].map((i) => `<span class="inline-block text-5xl text-amber-500 anim-pop" style="animation-delay:${i * 0.15}s;opacity:${i < r.b ? 1 : 0.25}">★</span>`).join('')}</div><p class="my-2">Skor ${r.pct}% · +${r.xp} XP${r.bonus ? ` (bonus combo +${r.bonus})` : ''}</p><p class="mb-3">${r.b ? 'Tahap berikutnya terbuka.' : 'Raih minimal 60% untuk membuka tahap berikutnya. Coba lagi!'}</p><button class="${K.btn}" data-a="go" data-i="${S.s}">Ulangi tahap</button> <button class="${K.pr}" data-a="map">Ke peta</button></div>`;
}

function vHabis() {
    return `<div class="${K.card} text-center"><div class="text-6xl mascot" aria-hidden="true">🥹</div><h2 class="text-xl font-semibold my-2">Energi habis!</h2><p class="mb-3">Tidak apa-apa. Salah itu bagian dari belajar. Robi yakin kamu bisa di percobaan berikutnya.</p><button class="${K.pr}" data-a="go" data-i="${S.s}">Coba lagi</button> <button class="${K.btn}" data-a="map">Ke peta</button></div>`;
}

const BERKERANGKA = ['map', 'rank'];
function draw() {
    const isi = {
        login: vLogin,
        map: vMap,
        play: vPlay,
        hasil: vHasil,
        rank: vRank,
        habis: vHabis,
    }[S.v]();
    $.innerHTML = BERKERANGKA.includes(S.v)
        ? kerangka(isi, S.v)
        : `<main class="pad-s">${isi}</main>`;
}

$.addEventListener('click', (ev) => {
    if (supClick) {
        supClick = false;
        return;
    }
    const el = ev.target.closest('[data-a]');
    if (!el || el.disabled) return;
    const a = el.dataset.a,
        i = +el.dataset.i,
        q = S.v === 'play' ? Q() : null;
    if (['sel', 'card', 'grp', 'ord', 'un', 'undo', 'go'].includes(a))
        bunyi.tap();
    if (a === 'snd') {
        mute = !mute;
        store('pm_snd', mute ? 'off' : 'on');
    } else if (a === 'start') {
        const k = document
            .getElementById('kode')
            .value.trim()
            .replace(/\s+/g, ' ');
        if (!NAMA.test(k)) {
            S.err = 1;
            return draw();
        }
        P.kode = k;
        store('pm_p', P);
        S = { v: 'map' };
    } else if (a === 'keluar') {
        if (!window.confirm('Ganti nama? Progres di HP ini akan hilang.')) return;
        P.kode = '';
        P.h = {};
        store('pm_p', P);
        S = { v: 'login' };
    } else if (a === 'rank') return muatPeringkat();
    else if (a === 'go') {
        S = { v: 'play', s: i, q: 0, sk: [], hp: 3, combo: 0, bonus: 0 };
        rq();
    } else if (a === 'map') S = { v: 'map' };
    else if (a === 'cek') periksa(q);
    else if (a === 'next') lanjut();
    else if (q && !S.lock) {
        if (a === 'sel')
            S.sel =
                q.t === 'pick'
                    ? S.sel.includes(i)
                        ? S.sel.filter((x) => x !== i)
                        : S.sel.length < q.a.length
                          ? [...S.sel, i]
                          : S.sel
                    : [i];
        else if (a === 'card') S.cur = i;
        else if (a === 'grp') {
            if (S.cur !== null) {
                S.m[S.cur] = i;
                S.cur = null;
            }
        } else if (a === 'un') delete S.m[i];
        else if (a === 'ord') S.seq.push(i);
        else if (a === 'undo') S.seq = [];
        else if (a === 'sp') S.pilih = el.dataset.p;
        else if (a === 'op') pecah(q, el.dataset.p, i);
    }
    draw();
    if (['go', 'next', 'map', 'start'].includes(a)) window.scrollTo(0, 0);
});

draw();
flush();

// Logika dan tampilan game Pecah Masalah. Bank soal ada di js/soal.js, ilustrasi di js/tokoh.js.
// Tampilan dibuat oleh JavaScript dan digayakan oleh css/style.css.

/* ===== PENGATURAN ===== */
const API_URL =
    'https://script.google.com/macros/s/AKfycbzCP7tNhmnBoAXQC-BADuiKhUabSxHpDpxHvsAgoKSpD7CIb3yXUWkt1fo8ET30KiUc/exec'; // URL Web App dari Apps Script
const BADGES = ['Pemecah', 'Pengelompok', 'Penyusun', 'Pemeriksa', 'Perancang'];

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
    if (S.v === 'rank') draw();
}

/* ===== TOKOH: pemain memilih satu, temannya menjadi pemandu ===== */
const AV = () => (P.av === 'rani' ? 'rani' : 'bayu');
const GD = () => (AV() === 'rani' ? 'bayu' : 'rani');

/* ===== SUARA, KONFETI, DAN DRAG & DROP ===== */
let mute = store('pm_snd') === 'off',
    AC = null,
    supClick = false,
    D = null;
const kurangiGerak = () =>
    window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
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
    if (kurangiGerak()) return;
    const w = document.createElement('div'),
        w2 = ['#1F4FD8', '#8FB0F5', '#F5B72B', '#0B1F4B', '#DCE8FF'];
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
const PEMBUKA = () => [
    'Ayo pecahkan masalahnya!',
    `${TOKOH[GD()].nama} siap membantu. Pikirkan baik-baik ya!`,
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
    const q = Q(),
        p = PEMBUKA();
    Object.assign(S, {
        mas: { ex: 'netral', t: p[Math.floor(Math.random() * p.length)] },
        sel: [],
        m: {},
        cur: null,
        exp: {},
        pilih: null,
        seq: [],
        att: 0,
        fb: '', // isi penjelasan
        fbh: '', // judul umpan balik
        fs: '', // ok | no | try
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
const selesai = (i) => !!(P.h[i] && P.h[i].b >= 1);
const totalBintang = () => Object.values(P.h).reduce((a, h) => a + h.b, 0);
const tahapAktif = () => STAGES.findIndex((_, i) => buka(i) && !selesai(i)); // -1 bila semua selesai

// Satu soal selesai: kunci skor, umpan balik, dan kirim log. Dipakai semua tipe soal.
function tutup(q, b) {
    S.lock = true;
    S.ok = b;
    S.sk.push(b ? [1, 0.5, 0.25][S.att - 1] : 0);
    S.fb = q.k;
    S.fs = b ? 'ok' : 'no';
    if (b) {
        bunyi.ok();
        if (S.combo >= 3) confetti(24);
        S.fbh = S.combo >= 3 ? `Tepat! Combo ×${S.combo}.` : 'Tepat!';
        S.mas = { ex: S.combo >= 3 ? 'semangat' : 'senang', t: '' };
    } else {
        S.hp = Math.max(0, S.hp - 1);
        bunyi.no();
        S.fbh = 'Belum tepat.';
        S.mas = { ex: 'sedih', t: '' };
    }
    S.geser = !b;
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
function coba(q) {
    bunyi.no();
    S.mas = { ex: 'mikir', t: '' };
    S.fbh = 'Hampir!';
    S.fs = 'try';
    S.fb = S.att === 2 ? 'Petunjuk: ' + q.k : 'Coba lagi, kamu pasti bisa.';
    S.geser = true;
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
        coba(q);
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
function salahPecah(q) {
    S.att++;
    S.combo = 0;
    if (S.att >= 3) {
        bukaSemua(q.r, '');
        tutup(q, false);
        return;
    }
    coba(q);
}
function pecah(q, p, i) {
    const o = nodeDi(q.r, p).o[i];
    if (!o.kids) return salahPecah(q);
    S.exp[p] = true;
    S.pilih = null;
    S.baru = p;
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
const lebar = () => matchMedia('(min-width: 760px)').matches;
const tombolSuara = () =>
    `<button class="ib" data-a="snd" aria-label="${mute ? 'Nyalakan suara' : 'Matikan suara'}">${ic(mute ? 'senyap' : 'suara', 22)}</button>`;

function vLogin() {
    const pil = (w, cat) =>
        `<button type="button" class="tokoh-pilih" data-a="av" data-w="${w}" aria-pressed="${(S.av || AV()) === w}">${tokoh(w, { bust: true, ex: 'senang', alt: '' })}<span>${TOKOH[w].nama}<small>${cat}</small></span></button>`;
    const av = S.av || AV(),
        tem = av === 'rani' ? 'bayu' : 'rani';
    return `<div class="masuk"><div class="intro"><div class="merek">${logo(30)}<span>Dekomposisi · Kelas 7</span></div><h1 style="margin-top:18px">Pecah<em>Masalah</em></h1><p class="lead">Latihan memecah masalah besar menjadi langkah-langkah kecil. Ada ${STAGES.length} tahap.</p><form class="isi" data-form="mulai" novalidate><div class="fld"><label for="kode">Nama panggilan</label><input id="kode" maxlength="20" autocomplete="off" autocapitalize="words" value="${esc(S.nama || '')}" ${S.err ? 'aria-invalid="true" aria-describedby="e-kode"' : 'aria-describedby="b-kode"'}>${S.err ? '<p class="salah" id="e-kode">Nama belum sesuai. Gunakan 3–20 huruf.</p>' : '<p class="bantu" id="b-kode">3–20 huruf. Dipakai di papan peringkat.</p>'}</div><fieldset class="fld"><legend>Pilih tokohmu</legend><div class="pilih">${pil('bayu', 'Kacamata bulat')}${pil('rani', 'Kepang kuning')}</div><p class="bantu">${TOKOH[tem].nama} akan menemanimu dan memberi petunjuk.</p></fieldset><button class="btn pr" type="submit" data-a="start">Mulai</button></form></div><div class="hero">${adegan(!lebar())}</div></div>`;
}

function topbar(aktif) {
    return `<header class="top"><div class="top-in"><button class="brand" data-a="map" aria-label="Ke peta petualangan">${logo(32)}<div><b>Pecah Masalah</b><span>Dekomposisi Kelas 7</span></div></button><div class="skor"><span aria-label="${xp()} XP"><b>${xp()}</b><small>XP</small></span><span aria-label="${totalBintang()} dari ${STAGES.length * 3} bintang">${ic('star', 18, true).replace('currentColor', 'var(--pencil)').replace('stroke="currentColor"', 'stroke="var(--ink)"')}<b>${totalBintang()}<small>/${STAGES.length * 3}</small></b></span></div>${online() ? `<button class="ib" data-a="rank" aria-label="Peringkat" ${aktif === 'rank' ? 'aria-current="page"' : ''}>${ic('rank', 22)}</button>` : ''}<button class="ib" data-a="keluar" aria-label="Ganti nama (progres di HP ini dihapus)"><span class="saya">${tokoh(AV(), { bust: true, ex: 'netral', alt: '' })}</span></button></div></header>`;
}
const kerangka = (isi, aktif) =>
    `${topbar(aktif)}<main class="halaman">${isi}</main>`;

// Letak tiap tahap di peta (persen dari lebar dan tinggi jalur).
const POS = [
    [40, 9],
    [60, 29],
    [40, 50],
    [60, 70],
    [50, 91],
];
const JALUR = [
    'M 144 68 C 144 140, 216 150, 216 220',
    'M 216 220 C 216 290, 144 300, 144 380',
    'M 144 380 C 144 450, 216 460, 216 532',
    'M 216 532 C 216 600, 180 620, 180 692',
];

function titikTahap(i, aktif, pil) {
    const s = STAGES[i],
        h = P.h[i],
        [x, y] = POS[i],
        fin = i === STAGES.length - 1,
        sdh = selesai(i),
        kunci = !buka(i),
        sisi = fin || x < 50 ? (fin ? 'kn' : 'kr') : 'kn';
    const ikon = kunci
        ? ic('lock', 26)
        : ic(fin && !sdh ? 'bendera' : IKON_TAHAP[i], 28);
    const ket = kunci
        ? '<span class="lc" style="color:var(--ink3)">Terkunci</span>'
        : `<span class="bts">${[0, 1, 2].map((k) => bintang(15, h && k < h.b)).join('')}</span>`;
    return `<button class="titik${pil ? ' pil' : ''}${fin ? ' final' : ''}" style="left:${x}%;top:${y}%" data-a="tahap" data-i="${i}" aria-label="Tahap ${i + 1}: ${esc(s.n)}${kunci ? ', terkunci' : sdh ? ', selesai, ' + h.b + ' bintang' : ''}" aria-pressed="${pil}">${aktif ? `<span class="pemain">${tokoh(AV(), { pose: 'lambai', ex: 'semangat', alt: '' })}</span>` : ''}<span class="blok${sdh ? ' sdh' : ''}${aktif ? ' aktif' : ''}${kunci ? ' kunci' : ''}">${ikon}</span><span class="label ${sisi}"><small>Tahap ${i + 1}</small><b>${esc(s.n)}</b>${ket}</span></button>`;
}

function panelTahap(i) {
    const s = STAGES[i],
        h = P.h[i],
        sdh = selesai(i),
        kunci = !buka(i);
    const info = kunci
        ? `Selesaikan Tahap ${i} dengan skor minimal 60% untuk membuka tahap ini.`
        : s.info;
    return `<section class="panel" aria-label="Tahap terpilih"><div class="panel-in"><div><div class="eb">Tahap ${i + 1}${sdh ? ' · Selesai' : ''}</div><h2>${esc(s.n)}</h2></div><button class="btn pr" data-a="go" data-i="${i}" ${kunci ? 'disabled' : ''}>${kunci ? ic('lock', 18) + 'Terkunci' : (sdh ? 'Main lagi' : 'Mulai') + ic('back', 18).replace('<path', '<path transform="rotate(180 12 12)"')}</button><p class="info">${esc(info)}</p><div class="meta"><span>${ic(IKON_TAHAP[i], 18)}${esc(s.alat)}</span><span>${s.qs.length} soal</span>${h ? `<span>${h.xp} XP · ${h.p}%</span>` : ''}</div></div></section>`;
}

function vMap() {
    const aktif = tahapAktif(),
        pil = S.t !== undefined ? S.t : aktif < 0 ? STAGES.length - 1 : aktif,
        mulai = Object.keys(P.h).length === 0,
        g = TOKOH[GD()].nama,
        ucap =
            aktif < 0
                ? 'Semua tahap selesai! Ulangi tahap mana pun untuk menambah bintang.'
                : mulai
                  ? `Hai ${esc(P.kode)}! Aku ${g}. Pilih tahap pertama untuk mulai memecah masalah.`
                  : `Lanjutkan, ${esc(P.kode)}! Pilih tahap lalu pecahkan masalahnya.`;
    const garis = JALUR.map(
        (d, i) =>
            `<path d="${d}" fill="none" stroke="${selesai(i) ? 'var(--blue)' : 'var(--ink3)'}" stroke-width="${selesai(i) ? 5 : 3}" stroke-linecap="round" ${selesai(i) ? '' : 'stroke-dasharray="2 9"'}/>`,
    ).join('');
    const penanda = aktif < 0 ? STAGES.length - 1 : aktif;
    return `<div class="peta"><div class="kolom-kiri"><div class="sapa">${tokoh(GD(), { bust: true, ex: mulai ? 'senang' : 'netral', alt: g })}<div class="bub"><b>${g}</b>${ucap}</div></div><div class="jalur"><svg class="garis" viewBox="0 0 360 760" preserveAspectRatio="none" aria-hidden="true">${garis}</svg>${STAGES.map((_, i) => titikTahap(i, i === penanda, i === pil)).join('')}</div></div>${panelTahap(pil)}</div>`;
}

function vRank() {
    const r = S.rank;
    const isi =
        r === null
            ? '<p class="bantu" style="color:var(--ink3)">Memuat…</p>'
            : S.rankErr
              ? `<p style="color:var(--ink2)">Gagal memuat peringkat. Periksa koneksi lalu coba lagi.</p><button class="btn" style="margin-top:12px" data-a="rank">Coba lagi</button>`
              : r.length
                ? `<ol>${r.map((x, n) => `<li class="${x.kode === P.kode ? 'aku' : ''}"><span class="n">${n + 1}</span><span class="nm">${esc(x.kode)}</span>${x.kode === P.kode ? '<span class="tag">Kamu</span>' : ''}<span class="xp">${x.xp} XP</span></li>`).join('')}</ol>`
                : `<div class="kosong-rank">${tokoh(GD(), { bust: true, ex: 'mikir', alt: '' })}<div class="bub"><b>${TOKOH[GD()].nama}</b>Belum ada data. Selesaikan satu tahap untuk masuk peringkat.</div></div>`;
    return `<div class="rank"><h2>Peringkat</h2><p>Total XP terbaik dari setiap tahap.</p>${isi}</div>`;
}

/* --- Bermain --- */
const HRF = 'ABCDEF';
function areaSoal(q) {
    let h = '';
    const kunci = S.lock;
    if (q.t === 'choice')
        h += `<div class="area">${S.o
            .map((i, n) => {
                const st =
                    S.sel[0] === i
                        ? kunci
                            ? S.ok
                                ? ' ok'
                                : ' no'
                            : ' on'
                        : '';
                return `<button class="opsi${st}" data-a="sel" data-i="${i}" ${kunci ? 'disabled' : ''}><span class="hrf">${HRF[n]}</span><span>${esc(q.o[i])}</span></button>`;
            })
            .join('')}</div>`;
    if (q.t === 'pick')
        h += `<p class="petunjuk">Pilih <b>${q.a.length}</b>.</p><div class="area">${S.o
            .map((i) => {
                const pil = S.sel.includes(i),
                    st = pil
                        ? kunci
                            ? q.a.includes(i)
                                ? ' ok'
                                : ' no'
                            : ' on'
                        : '';
                return `<button class="opsi kotak${st}" data-a="sel" data-i="${i}" aria-pressed="${pil}" ${kunci ? 'disabled' : ''}><span class="hrf">${pil ? ic('check', 18) : ''}</span><span>${esc(q.c[i])}</span></button>`;
            })
            .join('')}</div>`;
    if (q.t === 'group') {
        const sisa = S.o.filter((i) => S.m[i] === undefined);
        h += `<p class="petunjuk">Seret kartu ke kotaknya, atau <b>ketuk kartu</b> lalu ketuk kotak tujuan. Ketuk kartu di dalam kotak untuk membatalkan.</p><div class="pool">${
            sisa.length
                ? sisa
                      .map(
                          (i) =>
                              `<button class="kartu${S.cur === i ? ' on' : ''}" data-a="card" data-drag="card" data-i="${i}" aria-pressed="${S.cur === i}">${esc(q.c[i][0])}</button>`,
                      )
                      .join('')
                : '<span class="kosong">Semua kartu sudah ditaruh.</span>'
        }</div><div class="zonas">${q.g
            .map(
                (g, gi) =>
                    `<div class="zona${S.cur !== null && !kunci ? ' siap' : ''}" data-a="grp" data-drop="grp" data-i="${gi}" role="group" aria-label="${esc(g)}"><h4><span>${esc(g)}</span>${S.cur !== null && !kunci ? `<button class="taruh" data-a="grp" data-i="${gi}">Taruh di sini</button>` : ''}</h4><div class="isi">${S.o
                        .filter((i) => S.m[i] === gi)
                        .map(
                            (i) =>
                                `<button class="kartu dalam${kunci ? (q.c[i][1] === gi ? ' ok' : ' no') : ''}" data-a="un" data-i="${i}" ${kunci ? 'disabled' : `aria-label="${esc(q.c[i][0])}, ketuk untuk membatalkan"`}>${esc(q.c[i][0])}${kunci ? '' : ic('x', 14)}</button>`,
                        )
                        .join('')}</div></div>`,
            )
            .join('')}</div>`;
    }
    if (q.t === 'order') {
        const sisa = S.o.filter((i) => !S.seq.includes(i));
        h += `<p class="petunjuk">Seret atau ketuk langkah sesuai <b>urutan pengerjaan</b>.</p><div class="pool">${
            sisa.length
                ? sisa
                      .map(
                          (i) =>
                              `<button class="kartu" data-a="ord" data-drag="ord" data-i="${i}">${esc(q.c[i])}</button>`,
                      )
                      .join('')
                : '<span class="kosong">Semua langkah sudah disusun.</span>'
        }</div><ol class="urut drop" data-a="ordzone" data-drop="ord">${q.c
            .map((_, n) =>
                S.seq[n] !== undefined
                    ? `<li class="slot isi"><span class="no-u">${n + 1}</span><span class="tx">${esc(q.c[S.seq[n]])}</span></li>`
                    : `<li class="slot"><span class="no-u">${n + 1}</span><span class="tx">${n === S.seq.length ? 'Langkah berikutnya taruh di sini' : ''}</span></li>`,
            )
            .join(
                '',
            )}</ol>${S.seq.length && !kunci ? `<button class="btn ulang" data-a="undo">${ic('ulang', 18)}Ulangi urutan</button>` : ''}`;
    }
    if (q.t === 'split')
        h += `<p class="petunjuk">Ketuk <b>Pecah</b> pada bagian yang masih terlalu besar. Soal selesai kalau semua bagian sudah bisa langsung dikerjakan.</p><div class="pohon">${cabang(q.r, '', true)}</div>`;
    return h;
}

function cabang(n, p, akar) {
    const buk = !!S.exp[p],
        opsi = n.o && opsiBenar(n),
        kelas = akar ? 'akar' : n.o ? (buk ? 'pecah-sdh' : 'besar') : '',
        tnd = n.o ? (buk ? ic('check', 18) : '') : '';
    let h = `<div class="nd ${kelas}"><span class="tnd${n.o ? '' : ' dot'}">${tnd}</span><span class="teks">${esc(n.l)}</span>${n.o && !buk && !S.lock && S.pilih !== p ? `<button class="btn" data-a="sp" data-p="${p}">${ic('pecah', 18)}Pecah</button>` : ''}</div>`;
    if (buk)
        h += `<div class="anak" data-p="${p}">${opsi.kids.map((c, i) => `<div class="cb">${cabang(c, p + '.' + i)}</div>`).join('')}</div>`;
    else if (S.pilih === p && !S.lock)
        h += `<div class="cara"><p>Pilih cara memecah</p>${n.o.map((o, i) => `<button class="opsi" data-a="op" data-p="${p}" data-i="${i}"><span>${esc(o.l)}</span></button>`).join('')}</div>`;
    return h;
}

function dock(q) {
    const tombol = S.lock
        ? `<button class="btn pr" data-a="next">${S.q + 1 < STAGES[S.s].qs.length ? 'Lanjut' : 'Lihat hasil'}</button>`
        : q.t === 'split'
          ? ''
          : `<button class="btn pr" data-a="cek" ${siap(q) ? '' : 'disabled'}>Periksa</button>`;
    const teks = S.fb
        ? `<b>${esc(S.fbh)}</b><span>${esc(S.fb)}</span>`
        : esc(S.mas.t);
    return `<div class="dock ${S.fs}"><div class="dock-in"><div class="pemandu">${tokoh(GD(), { bust: true, ex: S.mas.ex, alt: TOKOH[GD()].nama })}</div><p class="ucap"><span>${teks}</span></p>${tombol}</div></div>`;
}

function vPlay() {
    const q = Q(),
        st = STAGES[S.s],
        n = st.qs.length;
    const seg = st.qs
        .map(
            (_, i) =>
                `<i class="${i < S.q || (i === S.q && S.lock) ? 's' : ''}"></i>`,
        )
        .join('');
    return `<div class="main"><div class="bar"><button class="ib" data-a="map" aria-label="Kembali ke peta">${ic('x', 24)}</button><div class="segmen" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${S.q + (S.lock ? 1 : 0)}" aria-label="Kemajuan soal">${seg}</div><div class="nyawa" role="img" aria-label="Nyawa ${S.hp} dari 3">${[0, 1, 2].map((i) => `<span class="${i < S.hp ? '' : 'hl'}">${ic('heart', 24, i < S.hp)}</span>`).join('')}</div>${tombolSuara()}</div><div class="isi-main"><div class="meta-soal"><span>Tahap ${S.s + 1} · ${esc(st.n)} · ${q.f ? 'Refleksi' : `Soal ${S.q + 1}/${n}`}</span>${S.combo >= 2 ? `<span class="combo">${ic('bolt', 14, true)}Combo ×${S.combo}</span>` : ''}</div><h1 class="tanya${q.f ? ' refl' : ''}">${esc(q.p)}</h1><div class="soal-area">${areaSoal(q)}</div></div>${dock(q)}</div>`;
}

/* --- Hasil --- */
function vHasil() {
    const r = S.r,
        st = STAGES[S.s],
        akhir = S.s === STAGES.length - 1;
    const ex = r.b >= 2 ? 'semangat' : r.b === 1 ? 'senang' : 'sedih',
        ex2 = r.b >= 2 ? 'semangat' : r.b === 1 ? 'senang' : 'mikir',
        judul = r.b
            ? akhir
                ? 'Perjalanan selesai!'
                : 'Tahap selesai!'
            : 'Belum lolos';
    const cat = r.b
        ? akhir
            ? 'Kamu sudah melewati semua tahap. Ulangi tahap mana pun untuk menambah bintang.'
            : `Tahap ${S.s + 2} terbuka.`
        : 'Raih minimal 60% untuk membuka tahap berikutnya. Coba lagi!';
    return `<div class="hasil"><div><div class="eb">Tahap ${S.s + 1} · ${esc(st.n)}</div><h2 style="margin-top:6px">${judul}</h2></div><div class="panggung"><div class="kiri">${tokoh(AV(), { pose: r.b ? 'sorak' : 'diam', ex, alt: TOKOH[AV()].nama })}</div><div class="bintang-besar" role="img" aria-label="${r.b} dari 3 bintang">${[0, 1, 2].map((i) => bintang(64, i < r.b)).join('')}</div><div class="kanan">${tokoh(GD(), { pose: r.b ? 'sorak' : 'buku', ex: ex2, alt: TOKOH[GD()].nama })}</div></div><div class="angka"><div><b>${r.pct}%</b><span>Skor</span></div><div class="xp"><b>+${r.xp}</b><span>XP${r.bonus ? ` · bonus combo +${r.bonus}` : ''}</span></div></div><p class="catatan">${cat}</p>${r.b ? `<div class="lencana">${ic('check', 18)}Lencana ${esc(BADGES[S.s] || '')}</div>` : ''}<div class="aksi"><button class="btn" data-a="go" data-i="${S.s}">Ulangi tahap</button><button class="btn pr" data-a="map">Ke peta</button></div></div>`;
}

function vHabis() {
    return `<div class="hasil habis"><div><div class="eb">Tahap ${S.s + 1} · ${esc(STAGES[S.s].n)}</div><h2 style="margin-top:6px">Energi habis</h2></div><div class="panggung">${tokoh(GD(), { pose: 'buku', ex: 'sedih', alt: TOKOH[GD()].nama })}</div><p class="catatan">Tidak apa-apa. Salah itu bagian dari belajar. ${TOKOH[GD()].nama} yakin kamu bisa di percobaan berikutnya.</p><div class="aksi"><button class="btn" data-a="map">Ke peta</button><button class="btn pr" data-a="go" data-i="${S.s}">Coba lagi</button></div></div>`;
}

/* --- Menggambar + gerak halus --- */
const BERKERANGKA = ['map', 'rank'];
let vTerakhir = null,
    ucapTerakhir = '';
function gerak(sel, kf, opt) {
    if (kurangiGerak()) return;
    document
        .querySelectorAll(sel)
        .forEach((e) => e.animate && e.animate(kf, opt));
}
function draw() {
    const v = S.v;
    document.body.dataset.v = v;
    const isi = {
        login: vLogin,
        map: vMap,
        play: vPlay,
        hasil: vHasil,
        rank: vRank,
        habis: vHabis,
    }[v]();
    $.innerHTML = BERKERANGKA.includes(v) ? kerangka(isi, v) : isi;
    // Gerak hanya saat ada alasan: ganti halaman, umpan balik baru, salah, pohon terbuka, hasil.
    const e = { duration: 220, easing: 'cubic-bezier(.2,.7,.2,1)' };
    if (v !== vTerakhir) {
        gerak(
            v === 'play'
                ? '.isi-main'
                : v === 'map' || v === 'rank'
                  ? '.halaman'
                  : '.hasil, .masuk',
            [
                { opacity: 0, transform: 'translateY(8px)' },
                { opacity: 1, transform: 'none' },
            ],
            e,
        );
        if (v === 'hasil')
            gerak(
                '.bintang-besar .bt.penuh',
                [
                    { opacity: 0, transform: 'scale(1.5)' },
                    { opacity: 1, transform: 'scale(1)' },
                ],
                {
                    duration: 380,
                    easing: 'cubic-bezier(.2,.7,.2,1)',
                    fill: 'backwards',
                    delay: 250,
                },
            );
    }
    if (v === 'play') {
        const u = S.fb ? S.fbh + S.fb : S.mas.t;
        if (u !== ucapTerakhir && S.fb)
            gerak(
                '.dock .ucap',
                [
                    { opacity: 0, transform: 'translateY(6px)' },
                    { opacity: 1, transform: 'none' },
                ],
                { duration: 200, easing: 'ease-out' },
            );
        ucapTerakhir = u;
        if (S.geser) {
            gerak(
                '.soal-area',
                [
                    { transform: 'translateX(0)' },
                    { transform: 'translateX(-6px)' },
                    { transform: 'translateX(5px)' },
                    { transform: 'translateX(-3px)' },
                    { transform: 'none' },
                ],
                { duration: 280, easing: 'ease-out' },
            );
            document.getElementById('sr').textContent = S.fbh + ' ' + S.fb;
            S.geser = false;
        } else if (S.fs === 'ok')
            document.getElementById('sr').textContent = S.fbh + ' ' + S.fb;
        if (S.baru !== undefined) {
            gerak(
                `.anak[data-p="${S.baru}"]`,
                [
                    { opacity: 0, transform: 'translateY(-6px)' },
                    { opacity: 1, transform: 'none' },
                ],
                e,
            );
            S.baru = undefined;
        }
    }
    vTerakhir = v;
}
matchMedia('(min-width: 760px)').addEventListener('change', () => {
    if (S.v === 'login') draw();
});

const mulaiLogin = () => {
    const k = (document.getElementById('kode').value || '')
        .trim()
        .replace(/\s+/g, ' ');
    S.nama = k;
    if (!NAMA.test(k)) {
        S.err = 1;
        draw();
        const f = document.getElementById('kode');
        if (f) f.focus();
        return;
    }
    P.kode = k;
    P.av = S.av || AV();
    store('pm_p', P);
    S = { v: 'map' };
    draw();
    window.scrollTo(0, 0);
};
$.addEventListener('submit', (ev) => {
    ev.preventDefault();
    if (ev.target.dataset.form === 'mulai') mulaiLogin();
});
$.addEventListener('input', (ev) => {
    if (ev.target.id === 'kode') S.nama = ev.target.value;
});

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
    if (a === 'start') return; // dikirim lewat submit formulir
    if (['sel', 'card', 'grp', 'ord', 'un', 'undo', 'go', 'tahap'].includes(a))
        bunyi.tap();
    if (a === 'snd') {
        mute = !mute;
        store('pm_snd', mute ? 'off' : 'on');
    } else if (a === 'av') {
        S.nama = (document.getElementById('kode') || {}).value || S.nama;
        S.av = el.dataset.w;
    } else if (a === 'tahap') {
        S.t = i;
    } else if (a === 'keluar') {
        if (!window.confirm('Ganti nama? Progres di HP ini akan hilang.'))
            return;
        P.kode = '';
        P.h = {};
        store('pm_p', P);
        S = { v: 'login', av: AV() };
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
        else if (a === 'card') S.cur = S.cur === i ? null : i;
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
    if (['go', 'next', 'map', 'keluar'].includes(a)) window.scrollTo(0, 0);
});

draw();
flush();

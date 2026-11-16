// Inti: pengaturan, simpanan lokal, kirim ke server, suara, konfeti, dan seret kartu.

/* ===== PENGATURAN ===== */
const API_URL =
    'https://script.google.com/macros/s/AKfycbzCP7tNhmnBoAXQC-BADuiKhUabSxHpDpxHvsAgoKSpD7CIb3yXUWkt1fo8ET30KiUc/exec'; // URL Web App dari Apps Script
const BADGES = ['Pemecah', 'Pengelompok', 'Pemeriksa', 'Perancang', 'Penyusun'];

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

// Progres lama menyimpan hasil per indeks tahap versi lama (Urutkan di posisi 3).
// Peta indeks lama -> baru, sekali saja, ditandai P.v = 2.
function migrasiProgres(p) {
    if (p.v >= 2) return p;
    const lama = p.h || {},
        h = {};
    [
        [0, 0],
        [1, 1],
        [2, 3],
        [3, 4],
        [4, 2],
    ].forEach(([baru, asal]) => {
        if (lama[asal]) h[baru] = lama[asal];
    });
    p.h = h;
    p.v = 2;
    store('pm_p', p);
    return p;
}
const P = migrasiProgres(store('pm_p') || { kode: '', h: {}, v: 2 });
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
// Simpanan lama bisa berisi 'rani'/'bayu'; nama yang tidak dikenal kembali ke Arlin.
const AV = () => (TOKOH[P.av] ? P.av : 'arlin');
const GD = (av) => Object.keys(TOKOH).find((k) => k !== (av || AV()));

/* ===== TEMA: terang bawaan, gelap hanya bila dipilih ===== */
let tema = store('pm_tema') === 'gelap' ? 'gelap' : 'terang';
function aturTema(t) {
    tema = t === 'gelap' ? 'gelap' : 'terang';
    document.documentElement.dataset.tema = tema;
    const m = document.querySelector('meta[name="theme-color"]');
    if (m) m.content = tema === 'gelap' ? '#0a1128' : '#FFFFFF';
    store('pm_tema', tema);
}
aturTema(tema);

/* ===== SUARA, KONFETI, DAN DRAG & DROP ===== */
/* ===== SUARA: musik latar, efek dari berkas, dan nada sintetis ===== */
const MEDIA = 'js/asset/music/';
const batas = (v, d) => (isNaN(parseFloat(v)) ? d : Math.max(0, Math.min(100, parseFloat(v))));
let mute = store('pm_snd') === 'off',
    volMusik = batas(store('pm_vol_musik'), 30),
    volEfek = batas(store('pm_vol_efek'), 70),
    AC = null,
    supClick = false,
    D = null;
const musik = new Audio(MEDIA + 'music_bg.mp3');
musik.loop = true;
musik.volume = volMusik / 100;
const efek = {};
['click_button', 'button_salah', 'win_sound'].forEach(
    (n) => (efek[n] = new Audio(MEDIA + n + '.mp3')),
);
function mainkan(nama) {
    if (mute || !efek[nama]) return;
    try {
        efek[nama].volume = volEfek / 100;
        efek[nama].currentTime = 0;
        efek[nama].play().catch(() => {});
    } catch (_) {}
}
function mainkanMusik() {
    musik.volume = volMusik / 100;
    if (!mute) musik.play().catch(() => {});
}
function aturVolume(jenis, v) {
    if (jenis === 'musik') {
        volMusik = batas(v, volMusik);
        store('pm_vol_musik', volMusik);
        musik.volume = volMusik / 100;
    } else {
        volEfek = batas(v, volEfek);
        store('pm_vol_efek', volEfek);
    }
}
// Peramban baru membolehkan suara setelah pengguna menyentuh halaman.
window.addEventListener('pointerdown', mainkanMusik, { once: true });
window.addEventListener('keydown', mainkanMusik, { once: true });
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
    tap: () => mainkan('click_button'),
    ok: () => {
        nada(660, 0.1);
        nada(880, 0.15, 0.1);
    },
    no: () => mainkan('button_salah'),
    win: () => mainkan('win_sound'),
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

// Aturan main: menyiapkan soal, menilai jawaban, memecah pohon, menghitung skor.
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
        if (S.hp <= 0) S.v = 'habis';
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

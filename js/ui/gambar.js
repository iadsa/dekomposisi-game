// Menggambar layar, animasi halus, serta penanganan klik, formulir, dan input.
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
        piagam: vPiagam,
        rank: vRank,
        habis: vHabis,
    }[v]();
    $.innerHTML = (BERKERANGKA.includes(v) ? kerangka(isi, v) : isi) + (S.set ? modalSuara() : '');
    if (S.set) {
        const x = document.querySelector('.modal-in .ib');
        if (x) x.focus();
    }
    // Gerak hanya saat ada alasan: ganti halaman, umpan balik baru, salah, pohon terbuka, hasil.
    const e = { duration: 220, easing: 'cubic-bezier(.2,.7,.2,1)' };
    if (v !== vTerakhir) {
        gerak(
            v === 'play'
                ? '.isi-main'
                : v === 'map' || v === 'rank'
                  ? '.halaman'
                  : v === 'piagam'
                    ? '.piagam .kartu'
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
    else if (ev.target.dataset.vol) {
        aturVolume(ev.target.dataset.vol, ev.target.value);
        const o = ev.target.parentElement.querySelector('output');
        if (o) o.textContent = ev.target.value + '%';
    }
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
    if (a === 'tema') aturTema(tema === 'gelap' ? 'terang' : 'gelap');
    else if (a === 'set') S.set = !S.set;
    else if (a === 'tutup-set') S.set = false;
    else if (a === 'mute') {
        mute = !mute;
        store('pm_snd', mute ? 'off' : 'on');
        if (mute) musik.pause();
        else mainkanMusik();
    } else if (a === 'piagam') {
        S.v = 'piagam';
        S.set = false;
        bunyi.win();
        confetti(90);
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
        praMuat(i);
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
    if (['go', 'next', 'map', 'keluar', 'piagam'].includes(a)) window.scrollTo(0, 0);
});

// Escape menutup popup pengaturan.
window.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && S.set) {
        S.set = false;
        draw();
    }
});

draw();
flush();
// Uji cepat Pecah Masalah: struktur berkas, urutan skrip, semua layar bisa dirender,
// dan mekanik pohon pecah tetap jalan. Tanpa dependensi.
// Jalankan: node tests/cek.js
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

let gagal = 0;
const cek = (nama, dapat, harap) => {
    const ok = JSON.stringify(dapat) === JSON.stringify(harap);
    if (!ok) gagal++;
    console.log(
        `${ok ? 'OK  ' : 'GAGAL'} ${nama}` +
            (ok ? '' : ` -> dapat ${JSON.stringify(dapat)}, harap ${JSON.stringify(harap)}`),
    );
};
const pasti = (nama, kondisi) => cek(nama, !!kondisi, true);

/* ===== 1. index.html merujuk berkas yang benar, berurutan ===== */
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const skrip = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
const gaya = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => m[1]);
const baca = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

cek('urutan skrip', skrip, [
    'js/asset/soal.js',
    'js/asset/tokoh.js',
    'js/asset/ilustrasi.js',
    'js/inti.js',
    'js/game.js',
    'js/ui/soal.js',
    'js/ui/layar.js',
    'js/ui/gambar.js',
]);
cek('urutan gaya', gaya, [
    'css/dasar.css',
    'css/komponen.css',
    'css/beranda.css',
    'css/main.css',
    'css/akhir.css',
]);
cek(
    'semua berkas yang dirujuk ada',
    [...skrip, ...gaya].filter((f) => !fs.existsSync(path.join(ROOT, f))),
    [],
);

// Berkas skrip berbagi satu ruang global, jadi nama ganda akan saling menimpa / melempar galat.
const asal = new Map(),
    ganda = [];
for (const f of skrip)
    for (const m of baca(f).matchAll(/^(?:const|let|function)\s+([A-Za-z_$][\w$]*)/gm)) {
        if (asal.has(m[1]) && asal.get(m[1]) !== f) ganda.push(`${m[1]}: ${asal.get(m[1])} + ${f}`);
        asal.set(m[1], f);
    }
cek('tidak ada nama ganda antar berkas', ganda, []);

/* ===== 2. Muat semua skrip seperti browser ===== */
const app = { addEventListener() {}, innerHTML: '', };
const sr = { textContent: '' };
const kode = { value: 'Arlin', focus() {} };
const node = () => ({
    style: { setProperty() {} },
    dataset: {},
    setAttribute() {},
    appendChild() {},
    addEventListener() {},
    animate() {},
    textContent: '',
    innerHTML: '',
    value: '',
    focus() {},
});
global.document = {
    getElementById: (id) => (id === 'app' ? app : id === 'sr' ? sr : kode),
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: node,
    body: { dataset: {} },
    documentElement: { dataset: {} },
};
global.window = { addEventListener() {}, scrollTo() {}, confirm: () => true };
global.Audio = class {
    constructor(src) {
        this.src = src;
        this.volume = 1;
        this.currentTime = 0;
        this.loop = false;
        this.diputar = 0;
    }
    play() {
        this.diputar++;
        return Promise.resolve();
    }
    pause() {}
};
global.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
global.localStorage = { getItem() { throw 0; }, setItem() {} };

const src = skrip.map(baca).join('\n;\n');
const api = eval(
    src +
        `;({ STAGES, BADGES, P, lihat: () => S, atur: (x) => { S = x; },
  mulai: (s, q) => { S = { v: 'play', s, q, sk: [], hp: 3, combo: 0, bonus: 0 }; rq(); },
  soal: () => Q(), rq, pecah, periksa, pohonSelesai,
  TOKOH, POSE, AV, GD, tokoh, adegan,
  IMG, ILUS, srcGambar, adeganSoal,
  tema: () => tema, aturTema, kerangka,
  vol: () => ({ musik: volMusik, efek: volEfek }), aturVolume, musik, efek, bunyi,
  layar: { login: () => vLogin(), map: () => vMap(), play: () => vPlay(), hasil: () => vHasil(), piagam: () => vPiagam(), habis: () => vHabis(), rank: () => vRank(), modal: () => modalSuara() } })`,
);

/* ===== 3. Setiap layar bisa dirender tanpa galat dan tanpa "undefined" ===== */
const rapi = (h) => !h.includes('undefined') && !h.includes('NaN') && !h.includes('[object');
const garis = { choice: 'data-a="sel"', pick: 'data-a="sel"', group: 'data-a="grp"', order: 'data-a="ordzone"', split: 'data-a="sp"' };
let rusak = 0;
api.STAGES.forEach((st, si) =>
    st.qs.forEach((q, qi) => {
        api.mulai(si, qi);
        try {
            const h = api.layar.play();
            if (!h.includes(garis[q.t]) || !rapi(h)) rusak++;
        } catch (e) {
            rusak++;
            console.log(`     soal ${si + 1}/${qi + 1} (${q.t}): ${e.message}`);
        }
    }),
);
cek(`semua ${api.STAGES.reduce((a, s) => a + s.qs.length, 0)} soal dirender`, rusak, 0);

/* ===== 3a. Ilustrasi: berkas ada di disk, kunci ikon cocok dengan bank soal ===== */
const berkasIlus = new Set();
Object.values(api.ILUS).forEach((v) =>
    [v.scene && v.scene[0], ...Object.values(v.ikon || {}), ...(v.zona || [])]
        .filter(Boolean)
        .forEach((b) => berkasIlus.add(b)),
);
cek(
    'semua gambar ILUS ada di disk',
    [...berkasIlus].filter((f) => !fs.existsSync(path.join(ROOT, api.srcGambar(f)))),
    [],
);

const teksSoal = JSON.stringify(api.STAGES);
cek(
    'kunci ikon ILUS cocok dengan teks soal',
    Object.values(api.ILUS)
        .flatMap((v) => Object.keys(v.ikon || {}))
        .filter((t) => !teksSoal.includes(`"${t}"`)),
    [],
);

api.atur({ v: 'login' });
pasti('layar masuk', rapi(api.layar.login()) && api.layar.login().includes('Pilih tokohmu'));
cek('tiga tokoh: nama', Object.values(api.TOKOH).map((t) => t.nama), ['Arlin', 'Yogi', 'Adsa']);
pasti('layar masuk: tiga kartu tokoh', ['arlin', 'yogi', 'adsa'].every((k) => api.layar.login().includes(`data-w="${k}"`)));

/* ===== 3b. Tokoh: nama tersimpan lama tetap jatuh ke Arlin ===== */
api.P.av = undefined;
cek('AV tanpa simpanan', api.AV(), 'arlin');
api.P.av = 'rani';
cek("AV simpanan lama 'rani'", api.AV(), 'arlin');
api.P.av = 'bayu';
cek("AV simpanan lama 'bayu'", api.AV(), 'arlin');
api.P.av = 'adsa';
cek('AV simpanan baru', api.AV(), 'adsa');
cek('GD selalu tokoh lain', ['arlin', 'yogi', 'adsa'].map((k) => ((api.P.av = k), api.GD() !== k)), [true, true, true]);
api.P.av = 'arlin';

const EX = ['senang', 'semangat', 'sedih', 'mikir', 'netral'];
const gambarRusak = [];
Object.keys(api.TOKOH).forEach((k) =>
    Object.keys(api.POSE).forEach((pose) =>
        EX.forEach((ex) => {
            try {
                const h = api.tokoh(k, { pose, ex, alt: '' });
                if (!rapi(h) || !h.includes('<svg')) gambarRusak.push(`${k}/${pose}/${ex}`);
            } catch (e) {
                gambarRusak.push(`${k}/${pose}/${ex}: ${e.message}`);
            }
        }),
    ),
);
cek(`gambar ${Object.keys(api.TOKOH).length} tokoh x ${Object.keys(api.POSE).length} pose x ${EX.length} ekspresi`, gambarRusak, []);
cek('adegan hero utuh & ringkas', [api.adegan(false), api.adegan(true)].map(rapi), [true, true]);

/* ===== 3c. Tema: terang bawaan, gelap bisa dipilih ===== */
cek('tema bawaan terang', document.documentElement.dataset.tema, 'terang');
api.aturTema('gelap');
cek('tema gelap berlaku', [api.tema(), document.documentElement.dataset.tema], ['gelap', 'gelap']);
pasti('tombol tema ada di peta', api.kerangka(api.layar.map(), 'map').includes('data-a="tema"'));
api.aturTema('terang');
cek('tema kembali terang', api.tema(), 'terang');

/* ===== 3d. Suara: musik latar + efek dari berkas ===== */
cek('volume bawaan', api.vol(), { musik: 30, efek: 70 });
api.aturVolume('musik', 120);
cek('volume dibatasi 100', api.vol().musik, 100);
api.aturVolume('musik', 45);
api.aturVolume('efek', -5);
cek('volume musik & efek', api.vol(), { musik: 45, efek: 0 });
cek('berkas efek terpasang', Object.keys(api.efek).sort(), [
    'button_salah',
    'click_button',
    'win_sound',
]);
cek(
    'musik latar memutar berkas berulang',
    [api.musik.src.endsWith('music_bg.mp3'), api.musik.loop],
    [true, true],
);
pasti('gerigi pengaturan ada di bilah atas', api.kerangka(api.layar.map(), 'map').includes('data-a="set"'));
api.mulai(0, 0);
pasti('gerigi pengaturan ada di layar soal', api.layar.play().includes('data-a="set"'));
const m = api.layar.modal();
pasti('popup suara: dua penggeser', m.includes('data-vol="musik"') && m.includes('data-vol="efek"'));
pasti('popup suara: angka persen', (m.match(/<output>\d+%<\/output>/g) || []).length === 2);
pasti('popup suara: tombol bisukan', m.includes('data-a="mute"'));
pasti('popup suara: tombol tutup', m.includes('data-a="tutup-set"'));
pasti('peta bersih dari kartu suara', !api.layar.map().includes('data-vol='));
api.aturVolume('efek', 70);
const suara = (nama, aksi) => {
    const n = api.efek[nama].diputar;
    aksi();
    return api.efek[nama].diputar > n;
};
cek('klik memutar click_button', suara('click_button', () => api.bunyi.tap()), true);
cek('jawaban salah memutar button_salah', suara('button_salah', () => api.bunyi.no()), true);
cek('menang memutar win_sound', suara('win_sound', () => api.bunyi.win()), true);

api.P.kode = 'Arlin';
api.P.h = {};
pasti('peta: pemain baru', rapi(api.layar.map()) && api.layar.map().includes('Tahap 1'));
pasti('peta: belum ada piagam', !api.layar.map().includes('data-a="piagam"'));
api.P.h = { 0: { p: 100, b: 3, xp: 120 } };
pasti('peta: satu tahap selesai', rapi(api.layar.map()) && api.layar.map().includes('Tahap 2'));
api.P.h = { 0: { p: 100, b: 3, xp: 120 }, 1: { p: 90, b: 2, xp: 90 }, 2: { p: 80, b: 2, xp: 80 }, 3: { p: 100, b: 3, xp: 100 }, 4: { p: 70, b: 1, xp: 70 } };
pasti('peta: semua tahap selesai', rapi(api.layar.map()));
pasti('peta: tombol piagam muncul', api.layar.map().includes('data-a="piagam"'));

[0, 1, 2, 3].forEach((b) => {
    api.atur({ v: 'hasil', s: 0, r: { pct: b * 40, b, xp: b * 30, bonus: 0 } });
    pasti(`layar hasil ${b} bintang`, rapi(api.layar.hasil()));
});
api.atur({ v: 'hasil', s: 0, r: { pct: 100, b: 3, xp: 100, bonus: 0 } });
pasti('hasil tahap biasa: tombol ke peta', api.layar.hasil().includes('data-a="map"') && !api.layar.hasil().includes('data-a="piagam"'));
api.atur({ v: 'hasil', s: 4, r: { pct: 100, b: 3, xp: 100, bonus: 0 } });
pasti('hasil tahap akhir: tombol penghargaan', api.layar.hasil().includes('data-a="piagam"'));
api.atur({ v: 'hasil', s: 4, r: { pct: 40, b: 0, xp: 40, bonus: 0 } });
pasti('hasil tahap akhir gagal: tanpa penghargaan', !api.layar.hasil().includes('data-a="piagam"'));

const pi = api.layar.piagam();
pasti('piagam: nama pemain', pi.includes('>Arlin<'));
pasti('piagam: total bintang', pi.includes('11/15'));
pasti('piagam: total XP', pi.includes('460'));
pasti('piagam: lima lencana', api.BADGES.every((b) => pi.includes(b)));
pasti('piagam: rapi', rapi(pi));
api.atur({ v: 'habis', s: 0 });
pasti('layar energi habis', rapi(api.layar.habis()));

[
    ['memuat', null, false],
    ['kosong', [], false],
    ['galat', [], true],
    ['ada isi', [{ kode: 'Arlin', xp: 120 }, { kode: 'Yogi', xp: 90 }], false],
].forEach(([nama, rank, err]) => {
    api.atur({ v: 'rank', rank, rankErr: err });
    pasti(`layar peringkat: ${nama}`, rapi(api.layar.rank()));
});

/* ===== 4. Mekanik pohon pecah (tahap 1, soal 2) ===== */
const selesaiPohon = (p) => api.pohonSelesai(api.soal().r, p);

api.mulai(0, 1);
cek('pohon awal belum selesai', selesaiPohon(''), false);
api.pecah(api.soal(), '', 1);
cek('setelah akar dipecah belum selesai', selesaiPohon(''), false);
api.pecah(api.soal(), '.2', 1);
cek('pohon selesai', selesaiPohon(''), true);
cek('skor percobaan pertama', api.lihat().sk, [1]);
cek('soal terkunci setelah selesai', api.lihat().lock, true);

api.mulai(0, 1);
api.pecah(api.soal(), '', 0);
cek('opsi salah tidak membuka cabang', api.lihat().exp[''], undefined);
api.pecah(api.soal(), '', 1);
api.pecah(api.soal(), '.2', 1);
cek('skor setelah satu kali salah', api.lihat().sk, [0.5]);

api.mulai(0, 1);
for (let i = 0; i < 3; i++) api.pecah(api.soal(), '', 0);
cek('salah 3 kali: terkunci', api.lihat().lock, true);
cek('salah 3 kali: skor 0', api.lihat().sk, [0]);
cek('salah 3 kali: jawaban dibuka penuh', selesaiPohon(''), true);
cek('salah 3 kali: nyawa berkurang', api.lihat().hp, 2);

/* ===== 5. Mekanik pilihan ganda ===== */
api.mulai(0, 0);
api.lihat().sel = [1];
api.periksa(api.soal());
cek('pilihan benar -> skor 1', api.lihat().sk, [1]);
api.mulai(0, 0);
api.lihat().sel = [0];
api.periksa(api.soal());
api.periksa(api.soal());
api.periksa(api.soal());
cek('pilihan salah 3 kali -> skor 0', api.lihat().sk, [0]);

console.log(gagal ? `\n${gagal} pemeriksaan GAGAL` : '\nSemua pemeriksaan lolos');
process.exit(gagal ? 1 : 0);

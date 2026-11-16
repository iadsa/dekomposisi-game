// Ilustrasi soal: gambar adegan, ikon opsi/kartu/node, dan ikon zona.
// Kunci peta "tahap.soal" (mulai 1). Gambar yang gagal dimuat dibuang oleh onerror.
const IMG = 'js/asset/img/';

const ILUS = {
    '1.1': { scene: ['t1-q1-poster', 'Poster kelas untuk lomba kebersihan'] },
    '1.2': {
        scene: ['t1-q2-makan-malam', 'Meja makan malam keluarga dengan beberapa masakan'],
        ikon: {
            'Memilih menu': 't1-q2-menu',
            'Belanja bahan': 't1-q2-belanja',
            Memasak: 't1-q2-memasak',
            Menyajikan: 't1-q2-sajikan',
            'Siapkan bahan': 't1-q2-siapkan',
            'Olah bahan': 't1-q2-olah',
            Masak: 't1-q2-masak',
            Cicipi: 't1-q2-cicip',
        },
    },
    '1.3': {
        scene: ['t1-q3-lomba-bersih', 'Kelas berbenah untuk lomba kebersihan'],
        ikon: {
            'Aturan penilaian': 't1-q3-aturan',
            'Regu dan jadwal': 't1-q3-regu',
            'Alat kebersihan': 't1-q3-alat',
            'Catat dan umumkan hasil': 't1-q3-hasil',
        },
    },
    '2.1': { zona: ['t2-q1-persiapan', 't2-q1-pelaksanaan', 't2-q1-beres'] },
    '2.2': { zona: ['t2-q2-sebelum', 't2-q2-saat', 't2-q2-setelah'] },
    '2.3': { zona: ['t2-q3-sebelum', 't2-q3-selama', 't2-q3-setelah'] },
    // Tahap 3: Perbaiki (berkas t4-*).
    '3.1': {
        scene: ['t4-q1-karyawisata', 'Bus karyawisata kelas di depan sekolah'],
        ikon: {
            'Menentukan tujuan': 't4-q1-tujuan',
            'Mengurus izin sekolah': 't4-q1-izin',
            'Menonton film kartun di kelas': 't4-q1-film',
            'Mengumpulkan iuran': 't4-q1-iuran',
            'Menyewa kendaraan': 't4-q1-kendaraan',
        },
    },
    '3.2': { scene: ['t4-q2-jalur', 'Peta jalur perjalanan karyawisata'] },
    '3.3': {
        scene: ['t4-q3-kue', 'Kue ulang tahun buatan sendiri'],
        ikon: {
            'Menyiapkan bahan': 't4-q3-bahan',
            'Mengocok adonan': 't4-q3-kocok',
            'Mencuci mobil': 't4-q3-mobil',
            Memanggang: 't4-q3-panggang',
            'Mengganti wallpaper': 't4-q3-wallpaper',
        },
    },
    // Tahap 4: Pecah Sendiri (berkas t5-*).
    '4.1': {
        scene: ['t5-q1-lomba', 'Lomba antarkelas di lapangan sekolah'],
        ikon: {
            'Menyusun jadwal dan aturan': 't5-q1-jadwal',
            'Menyiapkan tempat dan perlengkapan': 't5-q1-tempat',
            'Mengatur panitia dan peserta': 't5-q1-panitia',
            'Mendesain seragam baru': 't5-q1-seragam',
            'Membeli kamera baru untuk panitia': 't5-q1-kamera',
            'Membeli hadiah untuk diri sendiri': 't5-q1-hadiah',
        },
    },
    // Berkas zona dipakai ulang dari soal 4.1.
    '4.2': { zona: ['t5-q1-jadwal', 't5-q1-tempat', 't5-q1-panitia'] },
    // shortcut: ikon 4.3 belum ada di disk (t5-q3-tulisan/tataletak/pasang/ponsel/cat/lagu), tambahkan saat PNG tersedia.
    '4.3': { scene: ['t5-q3-mading', 'Majalah dinding kelas di dinding sekolah'] },
    // Tahap 5: Urutkan (berkas t3-*).
    '5.1': {
        scene: ['t3-q1-teh', 'Segelas teh manis panas di atas meja'],
        ikon: {
            'Merebus air': 't3-q1-rebus',
            'Menuang air ke gelas': 't3-q1-tuang',
            'Memasukkan teh dan gula ke gelas': 't3-q1-tehgula',
            Mengaduk: 't3-q1-aduk',
        },
    },
    '5.2': {
        ikon: {
            'Menentukan topik': 't3-q2-topik',
            'Mencari bahan': 't3-q2-bahan',
            'Menyusun slide': 't3-q2-slide',
            'Menulis naskah': 't3-q2-naskah',
            'Berlatih presentasi': 't3-q2-latihan',
        },
    },
    '5.3': {
        ikon: {
            'Mengumpulkan pakaian kotor': 't3-q3-kumpul',
            'Memisahkan pakaian': 't3-q3-pisah',
            'Merendam dengan deterjen': 't3-q3-rendam',
            Membilas: 't3-q3-bilas',
            'Menyiapkan tempat jemuran': 't3-q3-tempat',
            Menjemur: 't3-q3-jemur',
        },
    },
};

const kunciSoal = () => `${S.s + 1}.${S.q + 1}`;

// Folder gambar = bagian sebelum '-' pertama, mis. t3-q1-teh -> img/t3/t3-q1-teh.png
const srcGambar = (berkas) => `${IMG}${berkas.split('-')[0]}/${berkas}.png`;

function imgTag(berkas, kelas, alt) {
    return `<img class="${kelas}" src="${srcGambar(berkas)}" alt="${alt}" width="32" height="32" decoding="async" onerror="this.remove()">`;
}

function adeganSoal() {
    const s = ILUS[kunciSoal()];
    if (!s || !s.scene) return '';
    return `<figure class="il-scene">${imgTag(s.scene[0], 'il-gambar', s.scene[1] || '')}</figure>`;
}

function ikonDi(teks) {
    const ik = (ILUS[kunciSoal()] || {}).ikon;
    return (ik && ik[teks] && imgTag(ik[teks], 'il-ikon', '')) || '';
}

function zonaIkon(i) {
    const z = (ILUS[kunciSoal()] || {}).zona;
    return (z && z[i] && imgTag(z[i], 'il-ikon', '')) || '';
}

// Muat semua gambar satu tahap di belakang layar agar soal berikutnya tidak berkedip.
function praMuat(tahap) {
    const awalan = `${tahap + 1}.`;
    Object.keys(ILUS)
        .filter((k) => k.startsWith(awalan))
        .forEach((k) => {
            const v = ILUS[k],
                daftar = [v.scene && v.scene[0], ...Object.values(v.ikon || {}), ...(v.zona || [])];
            daftar.filter(Boolean).forEach((b) => {
                new Image().src = srcGambar(b);
            });
        });
}

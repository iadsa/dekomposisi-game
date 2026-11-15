// Ilustrasi game: ikon, dua tokoh siswa SMP (Bayu dan Rani), logo, dan adegan hero.
// Semua dibuat sebagai SVG di sini supaya gayanya konsisten: warna datar + garis tinta biru tua 2 px.
// Dimuat sebelum app.js.

const TINTA = '#0B1F4B';

/* ===== IKON (garis 1.8, 24x24) ===== */
const IK = {
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    lock: '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8 6.8 19.6l1-5.8L3.5 9.7l5.9-.8z"/>',
    bolt: '<path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/>',
    heart: '<path d="M12 20.5s-7.5-4.6-7.5-10A4.4 4.4 0 0 1 12 7.8a4.4 4.4 0 0 1 7.5 2.7c0 5.4-7.5 10-7.5 10z"/>',
    suara: '<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
    senyap: '<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
    rank: '<rect x="3" y="12" width="5" height="8" rx="1"/><rect x="9.5" y="5" width="5" height="15" rx="1"/><rect x="16" y="14" width="5" height="6" rx="1"/>',
    orang: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-4 3.8-5.5 7-5.5s6.2 1.5 7 5.5"/>',
    pecah: '<rect x="3.5" y="3.5" width="9" height="9" rx="1.5"/><rect x="15" y="3.5" width="5.5" height="5.5" rx="1.5"/><rect x="15" y="11.5" width="5.5" height="9" rx="1.5"/><rect x="3.5" y="15" width="9" height="5.5" rx="1.5"/>',
    kelompok:
        '<rect x="3" y="4" width="8" height="7" rx="1.5"/><rect x="13" y="4" width="8" height="7" rx="1.5"/><rect x="8" y="13.5" width="8" height="7" rx="1.5"/>',
    urut: '<path d="M3 20h5.5v-5.5H14V9h5.5V4.5"/><path d="M16.5 7.5l3-3 3 3" transform="translate(-1.5 0)"/>',
    lup: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>',
    pohon: '<rect x="8.5" y="3" width="7" height="5" rx="1.2"/><rect x="2.5" y="16" width="7" height="5" rx="1.2"/><rect x="14.5" y="16" width="7" height="5" rx="1.2"/><path d="M12 8v4M6 16v-4h12v4"/>',
    bendera: '<path d="M6 21V4M6 5h11l-2 4 2 4H6"/>',
    ulang: '<path d="M4.5 12a7.5 7.5 0 0 1 13-5l2 2M19.5 4v5h-5M19.5 12a7.5 7.5 0 0 1-13 5l-2-2M4.5 20v-5h5"/>',
    bulan: '<path d="M20 14.6A8.6 8.6 0 0 1 9.4 4 8.6 8.6 0 1 0 20 14.6z"/>',
    matahari: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6"/>',
    gear: '<circle cx="12" cy="12" r="3.1"/><path d="M19.2 14.9a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1h.2a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
    piala: '<path d="M8 3.5h8v4.2a4 4 0 0 1-8 0z"/><path d="M8 4.8H5.4a2.4 2.4 0 0 0 2.6 3.9M16 4.8h2.6a2.4 2.4 0 0 1-2.6 3.9"/><path d="M12 11.7v3.1M9.4 20.5h5.2M10.2 20.5l.5-5.7h2.6l.5 5.7"/>',
};
// Ikon alat tiap tahap, urut sesuai STAGES.
const IKON_TAHAP = ['pecah', 'kelompok', 'urut', 'lup', 'pohon'];

function ic(nama, ukuran, isi) {
    const u = ukuran || 20;
    return `<svg class="ic" width="${u}" height="${u}" viewBox="0 0 24 24" fill="${isi ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IK[nama]}</svg>`;
}
function bintang(ukuran, penuh) {
    return `<svg class="bt ${penuh ? 'penuh' : ''}" width="${ukuran}" height="${ukuran}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8 6.8 19.6l1-5.8L3.5 9.7l5.9-.8z" stroke-width="1.7" stroke-linejoin="round"/></svg>`;
}

/* ===== LOGO: satu blok besar yang pecah menjadi empat bagian ===== */
function logo(u) {
    return `<svg width="${u || 32}" height="${u || 32}" viewBox="0 0 32 32" aria-hidden="true"><g stroke="${TINTA}" stroke-width="1.6" stroke-linejoin="round"><rect x="2" y="2" width="16" height="16" rx="2.5" fill="#1F4FD8"/><rect x="21" y="2" width="9" height="9" rx="2.5" fill="#8FB0F5"/><rect x="21" y="14" width="9" height="16" rx="2.5" fill="#F5B72B"/><rect x="2" y="21" width="16" height="9" rx="2.5" fill="#DCE8FF"/></g></svg>`;
}

/* ===== TOKOH =====
   Proporsi sama untuk keduanya (kepala 52, badan 120, kanvas 100x190).
   Ciri khas Bayu: kacamata bulat, jambul, alis tebal, celana panjang biru tua.
   Ciri khas Rani: dua kepang dengan ikat kuning, rok biru tua, kaus kaki putih. */
const TOKOH = {
    arlin: { nama: 'Arlin', kulit: '#E3B38A', bayang: '#C99870', bahu: 22 },
    yogi: { nama: 'Yogi', kulit: '#D3996B', bayang: '#B97F53', bahu: 25 },
    adsa: { nama: 'Adsa', kulit: '#D8A882', bayang: '#BE8E68', bahu: 24 },
};
const RAMBUT = '#1A2142',
    SERAGAM = '#FFFFFF',
    BIRU_TUA = '#1B3A8C',
    PENSIL = '#F5B72B';

function anggota(d, warna, lebar) {
    return `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="${lebar + 4}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${warna}" stroke-width="${lebar}" stroke-linecap="round" stroke-linejoin="round"/>`;
}
// Titik lengan: bahu, siku, tangan. Sisi kiri/kanan dilihat dari penonton.
const POSE = {
    diam: {
        L: [
            [27, 79],
            [21, 99],
            [21, 120],
        ],
        R: [
            [73, 79],
            [79, 99],
            [79, 120],
        ],
    },
    sorak: {
        L: [
            [27, 79],
            [14, 66],
            [10, 42],
        ],
        R: [
            [73, 79],
            [86, 66],
            [90, 42],
        ],
    },
    tunjuk: {
        L: [
            [27, 79],
            [21, 99],
            [21, 120],
        ],
        R: [
            [73, 79],
            [88, 84],
            [104, 72],
        ],
    },
    lambai: {
        L: [
            [27, 79],
            [21, 99],
            [21, 120],
        ],
        R: [
            [73, 79],
            [87, 68],
            [90, 46],
        ],
    },
    buku: {
        L: [
            [27, 79],
            [24, 100],
            [40, 108],
        ],
        R: [
            [73, 79],
            [76, 100],
            [60, 108],
        ],
    },
};

function wajah(w, ex) {
    const t = TOKOH[w],
        alisTebal = w === 'yogi' ? 3.2 : 2.4,
        ya = w === 'yogi' ? 31 : 33;
    const alis = (a, b, c, d) =>
        `<path d="M${a} ${b}L${c} ${d}" stroke="${RAMBUT}" stroke-width="${alisTebal}" stroke-linecap="round"/>`;
    let ab = '',
        mata = '',
        mulut = '';
    const titik = (x, y, r) =>
        `<circle cx="${x}" cy="${y}" r="${r}" fill="${TINTA}"/><circle cx="${x + 0.9}" cy="${y - 1}" r="0.9" fill="#fff"/>`;
    const lengkung = (x) =>
        `<path d="M${x - 4.2} 43.5Q${x} 37.5 ${x + 4.2} 43.5" fill="none" stroke="${TINTA}" stroke-width="2.4" stroke-linecap="round"/>`;
    if (ex === 'senang') {
        ab = alis(35, ya, 44, ya - 1) + alis(56, ya - 1, 65, ya);
        mata = lengkung(40) + lengkung(60);
        mulut = `<path d="M42.5 50Q50 60.5 57.5 50Z" fill="#7A2230" stroke="${TINTA}" stroke-width="1.8" stroke-linejoin="round"/>`;
    } else if (ex === 'semangat') {
        ab = alis(35, ya - 2, 44, ya - 3) + alis(56, ya - 3, 65, ya - 2);
        mata = titik(40, 42, 3.1) + titik(60, 42, 3.1);
        mulut = `<path d="M41 49.5Q50 63 59 49.5Z" fill="#7A2230" stroke="${TINTA}" stroke-width="1.8" stroke-linejoin="round"/><path d="M44 51.5h12" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`;
    } else if (ex === 'sedih') {
        ab = alis(35, ya + 3, 44, ya - 1) + alis(56, ya - 1, 65, ya + 3);
        mata = titik(40, 43, 2.6) + titik(60, 43, 2.6);
        mulut = `<path d="M44 55Q50 50.5 56 55" fill="none" stroke="${TINTA}" stroke-width="2.2" stroke-linecap="round"/>`;
    } else if (ex === 'mikir') {
        ab = alis(35, ya, 44, ya) + alis(56, ya - 3, 65, ya - 1);
        mata = titik(41, 41, 2.6) + titik(61, 41, 2.6);
        mulut = `<path d="M45 53.5Q50 52 55.5 52.5" fill="none" stroke="${TINTA}" stroke-width="2.2" stroke-linecap="round"/>`;
    } else {
        ab = alis(35, ya, 44, ya - 1) + alis(56, ya - 1, 65, ya);
        mata = titik(40, 42, 2.6) + titik(60, 42, 2.6);
        mulut = `<path d="M43.5 51Q50 56.5 56.5 51" fill="none" stroke="${TINTA}" stroke-width="2.2" stroke-linecap="round"/>`;
    }
    const hidung = `<path d="M49 46.5q-1.6 3 1.2 3.2" fill="none" stroke="${t.bayang}" stroke-width="1.6" stroke-linecap="round"/>`;
    const kacamata =
        w === 'yogi'
            ? `<g fill="rgba(255,255,255,.28)" stroke="${TINTA}" stroke-width="2"><circle cx="40" cy="42" r="8.6"/><circle cx="60" cy="42" r="8.6"/></g><path d="M48.6 41.5h2.8" stroke="${TINTA}" stroke-width="2"/>`
            : '';
    return kacamata + ab + mata + hidung + mulut;
}

// Isi SVG (tanpa pembungkus) supaya bisa ditempatkan di adegan lain dengan transform.
function tokohG(w, o) {
    o = o || {};
    const t = TOKOH[w],
        arlin = w === 'arlin',
        yogi = w === 'yogi',
        adsa = w === 'adsa',
        pose = POSE[o.pose] || POSE.diam,
        bahu = t.bahu;
    let s = '';
    // Kaki dan bawahan
    if (arlin) {
        s +=
            anggota('M38 148V164', t.kulit, 9) +
            anggota('M62 148V164', t.kulit, 9);
        s += `<path d="M30 116h40l5 36H25z" fill="${BIRU_TUA}" stroke="${TINTA}" stroke-width="2" stroke-linejoin="round"/>`;
        s +=
            anggota('M38 158V172', '#fff', 9) +
            anggota('M62 158V172', '#fff', 9);
    } else {
        s += `<path d="M31 116h38l-1 54H52l-2-38-2 38H32z" fill="${BIRU_TUA}" stroke="${TINTA}" stroke-width="2" stroke-linejoin="round"/>`;
        s += `<path d="M50 132v36" stroke="${TINTA}" stroke-width="1.6"/>`;
    }
    const sepatu = (x) =>
        `<path d="M${x - 8} 184q0-9 6-10h8q4 1 5 5l2 5z" fill="#1B1F3A" stroke="${TINTA}" stroke-width="2" stroke-linejoin="round"/>`;
    s += sepatu(arlin ? 38 : 41) + sepatu(arlin ? 66 : 69);
    // Badan
    s += `<path d="M${50 - bahu} 80q0-12 11-14h28q11 2 11 14l-2 40H${52 - bahu}z" fill="${SERAGAM}" stroke="${TINTA}" stroke-width="2" stroke-linejoin="round"/>`;
    s += `<rect x="${50 - bahu + 3}" y="114" width="${2 * bahu - 6}" height="6" fill="${BIRU_TUA}" stroke="${TINTA}" stroke-width="1.6"/>`;
    s += `<rect x="55" y="90" width="11" height="10" rx="1.5" fill="#DCE8FF" stroke="${TINTA}" stroke-width="1.5"/>`;
    // Leher dan kerah
    s += `<path d="M44 58h12v14q-6 6-12 0z" fill="${t.bayang}" stroke="${TINTA}" stroke-width="2" stroke-linejoin="round"/>`;
    s += `<path d="M41 67l9 12 9-12-4-3-5 5-5-5z" fill="#fff" stroke="${TINTA}" stroke-width="2" stroke-linejoin="round"/>`;
    // Dasi (khusus Adsa)
    if (adsa) {
        s += `<path d="M50 67l-6 8 4 28h4l4-28z" fill="#1F4FD8" stroke="${TINTA}" stroke-width="1.8" stroke-linejoin="round"/>`;
        s += `<path d="M44 67h12l-2 4h-8z" fill="#1F4FD8" stroke="${TINTA}" stroke-width="1.8" stroke-linejoin="round"/>`;
    }
    // Lengan
    const lengan = (sisi) => {
        const [b, e, h] = pose[sisi];
        return (
            anggota(`M${e[0]} ${e[1]}L${h[0]} ${h[1]}`, t.kulit, 8) +
            anggota(`M${b[0]} ${b[1]}L${e[0]} ${e[1]}`, SERAGAM, 11)
        );
    };
    const tangan = (sisi) => {
        const h = pose[sisi][2];
        return `<circle cx="${h[0]}" cy="${h[1]}" r="5.6" fill="${t.kulit}" stroke="${TINTA}" stroke-width="2"/>`;
    };
    s += lengan('L') + lengan('R');
    if (o.pose === 'buku')
        s += `<rect x="34" y="94" width="32" height="24" rx="3" fill="#1F4FD8" stroke="${TINTA}" stroke-width="2"/><path d="M40 102h20M40 108h14" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;
    s += tangan('L') + tangan('R');
    // Kepang Arlin (di depan bahu)
    if (arlin) {
        s += anggota('M27 46Q18 62 24 84', RAMBUT, 9);
        s += anggota('M73 46Q82 62 76 84', RAMBUT, 9);
        s += `<circle cx="24" cy="86" r="4.2" fill="${PENSIL}" stroke="${TINTA}" stroke-width="1.8"/><circle cx="76" cy="86" r="4.2" fill="${PENSIL}" stroke="${TINTA}" stroke-width="1.8"/>`;
    }
    // Kepala
    s += `<ellipse cx="25" cy="42" rx="4.5" ry="6" fill="${t.kulit}" stroke="${TINTA}" stroke-width="2"/><ellipse cx="75" cy="42" rx="4.5" ry="6" fill="${t.kulit}" stroke="${TINTA}" stroke-width="2"/>`;
    s += `<ellipse cx="50" cy="38" rx="25" ry="26" fill="${t.kulit}" stroke="${TINTA}" stroke-width="2"/>`;
    // Rambut
    if (arlin) {
        s += `<path d="M24.5 40Q20 9 50 9Q80 9 75.5 40Q73 27 60 22Q44 29 33 33Q27 35 24.5 40Z" fill="${RAMBUT}" stroke="${TINTA}" stroke-width="2" stroke-linejoin="round"/>`;
    } else {
        s += `<path d="M24.5 38Q20 10 50 10Q80 10 75.5 38Q73 27 64 25Q56 29 50 24Q42 29 36 25Q27 27 24.5 38Z" fill="${RAMBUT}" stroke="${TINTA}" stroke-width="2" stroke-linejoin="round"/>`;
        if (yogi)
            s += `<path d="M44 12Q48 1 58 5Q52 7 54 13Z" fill="${RAMBUT}" stroke="${TINTA}" stroke-width="2" stroke-linejoin="round"/>`;
    }
    s += wajah(w, o.ex);
    return s;
}

// o.bust = hanya kepala dan bahu. o.pose, o.ex mengatur gaya. o.alt = teks alternatif.
function tokoh(w, o) {
    o = o || {};
    const vb = o.bust ? '6 2 88 92' : '-4 0 108 192';
    return `<svg class="tokoh${o.bust ? ' bust' : ''}" viewBox="${vb}" role="img" aria-label="${o.alt || TOKOH[w].nama}">${tokohG(w, o)}</svg>`;
}

/* ===== ADEGAN HERO (halaman masuk) =====
   Masalah besar (dinding retak) dipecah menjadi anak tangga. Isinya soal pertama Tahap 1,
   jadi ilustrasi ini sekaligus menjelaskan inti permainan. */
function adegan(ringkas) {
    const langkah = [
        ['Tentukan', 'pesan'],
        ['Rancang', 'tata letak'],
        ['Buat gambar', 'dan teks'],
        ['Periksa', 'hasil'],
    ];
    const warna = ['#DCE8FF', '#B7CDFB', '#8FB0F5', '#1F4FD8'];
    const dasar = 396,
        x0 = 236,
        lb = 96;
    let tangga = '';
    langkah.forEach((l, i) => {
        const h = 64 * (i + 1),
            x = x0 + i * lb,
            gelap = i === 3,
            c = gelap ? '#fff' : TINTA;
        tangga += `<rect x="${x}" y="${dasar - h}" width="${lb}" height="${h}" fill="${warna[i]}" stroke="${TINTA}" stroke-width="2.5" stroke-linejoin="round"/><text x="${x + 10}" y="${dasar - h + 24}" font-size="19" font-weight="800" fill="${c}" style="font-family:var(--f-d)">${i + 1}</text><text x="${x + 10}" y="${dasar - h + 42}" font-size="12.5" font-weight="700" fill="${c}" style="font-family:var(--f-b)">${l[0]}</text><text x="${x + 10}" y="${dasar - h + 57}" font-size="12.5" font-weight="700" fill="${c}" style="font-family:var(--f-b)">${l[1]}</text>`;
    });
    const dinding = ringkas
        ? ''
        : `<g><rect x="24" y="96" width="132" height="300" fill="#DCE8FF" stroke="${TINTA}" stroke-width="2.5" stroke-linejoin="round"/><path d="M118 226L98 262L126 304L104 340L120 396" fill="none" stroke="${TINTA}" stroke-width="2.5" stroke-linejoin="round"/><text x="38" y="128" font-size="10.5" font-weight="800" letter-spacing=".8" fill="#1F4FD8" style="font-family:var(--f-b)">MASALAH BESAR</text><text x="38" y="152" font-size="16" font-weight="800" fill="${TINTA}" style="font-family:var(--f-d)">Membuat</text><text x="38" y="171" font-size="16" font-weight="800" fill="${TINTA}" style="font-family:var(--f-d)">poster kelas</text></g>`;
    const vb = ringkas ? '140 0 500 410' : '0 0 640 420';
    return `<svg class="adegan" viewBox="${vb}" role="img" aria-label="Yogi dan Arlin mengubah satu masalah besar menjadi empat anak tangga: tentukan pesan, rancang tata letak, buat gambar dan teks, periksa hasil."><line x1="${ringkas ? 140 : 0}" y1="${dasar}" x2="640" y2="${dasar}" stroke="${TINTA}" stroke-width="2.5" stroke-linecap="round"/>${dinding}${tangga}<g transform="translate(${ringkas ? 150 : 146} ${dasar - 134}) scale(.7)">${tokohG('yogi', { pose: 'tunjuk', ex: 'mikir' })}</g><g transform="translate(${x0 + 3 * lb + 12} ${dasar - 256 - 134}) scale(.7)">${tokohG('arlin', { pose: 'lambai', ex: 'senang' })}</g></svg>`;
}

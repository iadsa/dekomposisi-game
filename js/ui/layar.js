// Kerangka layar (bilah atas, dock) dan semua layar: masuk, peta, main, hasil, piagam, peringkat.
/* ===== TAMPILAN ===== */
const lebar = () => matchMedia('(min-width: 760px)').matches;
const tombolSetelan = () =>
    `<button class="ib" data-a="set" aria-label="Pengaturan suara" aria-haspopup="dialog" aria-expanded="${S.set ? 'true' : 'false'}">${ic('gear', 22)}</button>`;

function vLogin() {
    const pil = (w, cat) =>
        `<button type="button" class="tokoh-pilih" data-a="av" data-w="${w}" aria-pressed="${(S.av || AV()) === w}">${tokoh(w, { bust: true, ex: 'senang', alt: '' })}<span>${TOKOH[w].nama}<small>${cat}</small></span></button>`;
    const av = S.av || AV(),
        tem = TOKOH[av] ? av : AV();
    return `<div class="masuk"><div class="intro"><div class="merek">${logo(30)}<span>Dekomposisi · Kelas 7</span></div><h1 style="margin-top:18px">Pecah<em>Masalah</em></h1><p class="lead">Latihan memecah masalah besar menjadi langkah-langkah kecil. Ada ${STAGES.length} tahap.</p><form class="isi" data-form="mulai" novalidate><div class="fld"><label for="kode">Nama panggilan</label><input id="kode" maxlength="20" autocomplete="off" autocapitalize="words" value="${esc(S.nama || '')}" ${S.err ? 'aria-invalid="true" aria-describedby="e-kode"' : 'aria-describedby="b-kode"'}>${S.err ? '<p class="salah" id="e-kode">Nama belum sesuai. Gunakan 3–20 huruf.</p>' : '<p class="bantu" id="b-kode">3–20 huruf. Dipakai di papan peringkat.</p>'}</div><fieldset class="fld"><legend>Pilih tokohmu</legend><div class="pilih">${pil('arlin', 'Kepang kuning')}${pil('yogi', 'Kacamata bulat')}${pil('adsa', 'Dasi biru')}</div><p class="bantu">${TOKOH[tem].nama} akan menemanimu dan memberi petunjuk.</p></fieldset><button class="btn pr" type="submit" data-a="start">Mulai</button></form></div><div class="hero">${adegan(!lebar())}</div></div>`;
}

const tombolTema = () =>
    `<button class="ib" data-a="tema" aria-label="${tema === 'gelap' ? 'Pakai tema terang' : 'Pakai tema gelap'}">${ic(tema === 'gelap' ? 'matahari' : 'bulan', 22)}</button>`;

function topbar(aktif) {
    return `<header class="top"><div class="top-in"><button class="brand" data-a="map" aria-label="Ke peta petualangan">${logo(32)}<div><b>Pecah Masalah</b><span>Dekomposisi Kelas 7</span></div></button><div class="skor"><span aria-label="${xp()} XP"><b>${xp()}</b><small>XP</small></span><span aria-label="${totalBintang()} dari ${STAGES.length * 3} bintang">${ic('star', 18, true).replace('currentColor', 'var(--pencil)').replace('stroke="currentColor"', 'stroke="var(--ink)"')}<b>${totalBintang()}<small>/${STAGES.length * 3}</small></b></span></div>${online() ? `<button class="ib" data-a="rank" aria-label="Peringkat" ${aktif === 'rank' ? 'aria-current="page"' : ''}>${ic('rank', 22)}</button>` : ''}${tombolSetelan()}${tombolTema()}<button class="ib" data-a="keluar" aria-label="Ganti nama (progres di HP ini dihapus)"><span class="saya">${tokoh(AV(), { bust: true, ex: 'netral', alt: '' })}</span></button></div></header>`;
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

// Dua penggeser volume: musik latar dan efek suara.
// Dua penggeser volume, dipakai di dalam popup pengaturan.
const pengaturanSuara = () =>
    `<div class="suara-set"><label>Musik<input type="range" min="0" max="100" step="5" value="${volMusik}" data-vol="musik" aria-label="Volume musik"><output>${volMusik}%</output></label><label>Efek<input type="range" min="0" max="100" step="5" value="${volEfek}" data-vol="efek" aria-label="Volume efek suara"><output>${volEfek}%</output></label></div>`;
const modalSuara = () =>
    `<div class="modal"><div class="modal-latar" data-a="tutup-set"></div><div class="modal-in" role="dialog" aria-modal="true" aria-labelledby="judul-suara"><button class="ib x" data-a="tutup-set" aria-label="Tutup pengaturan">${ic('x', 22)}</button><h2 id="judul-suara">Pengaturan suara</h2>${pengaturanSuara()}<label class="bisukan"><input type="checkbox" data-a="mute" ${mute ? 'checked' : ''}>Bisukan semua suara</label></div></div>`;

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
    return `<div class="peta"><div class="kolom-kiri"><div class="sapa">${tokoh(GD(), { bust: true, ex: mulai ? 'senang' : 'netral', alt: g })}<div class="bub"><b>${g}</b>${ucap}</div></div>${tahapAktif() < 0 ? `<button class="btn piala" data-a="piagam">${ic('piala', 20)}Lihat piagam penghargaan</button>` : ''}<div class="jalur"><svg class="garis" viewBox="0 0 360 760" preserveAspectRatio="none" aria-hidden="true">${garis}</svg>${STAGES.map((_, i) => titikTahap(i, i === penanda, i === pil)).join('')}</div></div>${panelTahap(pil)}</div>`;
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
    return `<div class="main"><div class="bar"><button class="ib" data-a="map" aria-label="Kembali ke peta">${ic('x', 24)}</button><div class="segmen" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${S.q + (S.lock ? 1 : 0)}" aria-label="Kemajuan soal">${seg}</div><div class="nyawa" role="img" aria-label="Nyawa ${S.hp} dari 3">${[0, 1, 2].map((i) => `<span class="${i < S.hp ? '' : 'hl'}">${ic('heart', 24, i < S.hp)}</span>`).join('')}</div>${tombolSetelan()}${tombolTema()}</div><div class="isi-main"><div class="meta-soal"><span>Tahap ${S.s + 1} · ${esc(st.n)} · ${q.f ? 'Refleksi' : `Soal ${S.q + 1}/${n}`}</span>${S.combo >= 2 ? `<span class="combo">${ic('bolt', 14, true)}Combo ×${S.combo}</span>` : ''}</div><h1 class="tanya${q.f ? ' refl' : ''}">${esc(q.p)}</h1>${adeganSoal()}<div class="soal-area">${areaSoal(q)}</div></div>${dock(q)}</div>`;
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
    return `<div class="hasil"><div><div class="eb">Tahap ${S.s + 1} · ${esc(st.n)}</div><h2 style="margin-top:6px">${judul}</h2></div><div class="panggung"><div class="kiri">${tokoh(AV(), { pose: r.b ? 'sorak' : 'diam', ex, alt: TOKOH[AV()].nama })}</div><div class="bintang-besar" role="img" aria-label="${r.b} dari 3 bintang">${[0, 1, 2].map((i) => bintang(64, i < r.b)).join('')}</div><div class="kanan">${tokoh(GD(), { pose: r.b ? 'sorak' : 'buku', ex: ex2, alt: TOKOH[GD()].nama })}</div></div><div class="angka"><div><b>${r.pct}%</b><span>Skor</span></div><div class="xp"><b>+${r.xp}</b><span>XP${r.bonus ? ` · bonus combo +${r.bonus}` : ''}</span></div></div><p class="catatan">${cat}</p>${r.b ? `<div class="lencana">${ic('check', 18)}Lencana ${esc(BADGES[S.s] || '')}</div>` : ''}<div class="aksi"><button class="btn" data-a="go" data-i="${S.s}">Ulangi tahap</button>${akhir && r.b ? `<button class="btn pr" data-a="piagam">Ambil penghargaan</button>` : `<button class="btn pr" data-a="map">Ke peta</button>`}</div></div>`;
}

/* --- Piagam: pertanda permainan selesai --- */
function vPiagam() {
    const tgl = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    return `<div class="piagam"><div class="kartu"><div class="eb">Pecah Masalah · Dekomposisi Kelas 7</div><h1>Piagam Penyelesaian</h1><p class="bantu">Diberikan kepada</p><p class="nama">${esc(P.kode)}</p><p class="bantu">karena telah menyelesaikan seluruh ${STAGES.length} tahap: memecah masalah besar menjadi langkah-langkah kecil.</p><div class="panggung">${['arlin', 'yogi', 'adsa'].map((k) => tokoh(k, { pose: 'sorak', ex: 'senang', alt: TOKOH[k].nama })).join('')}</div><div class="angka"><div><b>${totalBintang()}/${STAGES.length * 3}</b><span>Bintang</span></div><div class="xp"><b>${xp()}</b><span>XP</span></div></div><div class="lencana-wrap">${BADGES.map((b) => `<span class="lencana">${ic('check', 16)}${esc(b)}</span>`).join('')}</div><p class="tanggal">${tgl}</p></div><div class="aksi"><button class="btn" data-a="go" data-i="${STAGES.length - 1}">Ulangi tahap ${STAGES.length}</button><button class="btn pr" data-a="map">Ke peta</button></div></div>`;
}

function vHabis() {
    return `<div class="hasil habis"><div><div class="eb">Tahap ${S.s + 1} · ${esc(STAGES[S.s].n)}</div><h2 style="margin-top:6px">Energi habis</h2></div><div class="panggung">${tokoh(GD(), { pose: 'buku', ex: 'sedih', alt: TOKOH[GD()].nama })}</div><p class="catatan">Tidak apa-apa. Salah itu bagian dari belajar. ${TOKOH[GD()].nama} yakin kamu bisa di percobaan berikutnya.</p><div class="aksi"><button class="btn" data-a="map">Ke peta</button><button class="btn pr" data-a="go" data-i="${S.s}">Coba lagi</button></div></div>`;
}

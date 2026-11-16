// Tampilan per tipe soal: pilihan, kelompok, urutan, dan pohon pecah.
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
                return `<button class="opsi kotak${st}" data-a="sel" data-i="${i}" aria-pressed="${pil}" ${kunci ? 'disabled' : ''}><span class="hrf">${pil ? ic('check', 18) : ''}</span><span class="opsi-isi">${ikonDi(q.c[i])}<span>${esc(q.c[i])}</span></span></button>`;
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
                    `<div class="zona${S.cur !== null && !kunci ? ' siap' : ''}" data-a="grp" data-drop="grp" data-i="${gi}" role="group" aria-label="${esc(g)}"><h4><span class="zona-judul">${zonaIkon(gi)}<span>${esc(g)}</span></span>${S.cur !== null && !kunci ? `<button class="taruh" data-a="grp" data-i="${gi}">Taruh di sini</button>` : ''}</h4><div class="isi">${S.o
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
                              `<button class="kartu" data-a="ord" data-drag="ord" data-i="${i}">${ikonDi(q.c[i])}<span>${esc(q.c[i])}</span></button>`,
                      )
                      .join('')
                : '<span class="kosong">Semua langkah sudah disusun.</span>'
        }</div><ol class="urut drop" data-a="ordzone" data-drop="ord">${q.c
            .map((_, n) =>
                S.seq[n] !== undefined
                    ? `<li class="slot isi"><span class="no-u">${n + 1}</span><span class="tx">${ikonDi(q.c[S.seq[n]])}<span>${esc(q.c[S.seq[n]])}</span></span></li>`
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
    let h = `<div class="nd ${kelas}"><span class="tnd${n.o ? '' : ' dot'}">${tnd}</span>${akar ? '' : ikonDi(n.l)}<span class="teks">${esc(n.l)}</span>${n.o && !buk && !S.lock && S.pilih !== p ? `<button class="btn" data-a="sp" data-p="${p}">${ic('pecah', 18)}Pecah</button>` : ''}</div>`;
    if (buk)
        h += `<div class="anak" data-p="${p}">${opsi.kids.map((c, i) => `<div class="cb">${cabang(c, p + '.' + i)}</div>`).join('')}</div>`;
    else if (S.pilih === p && !S.lock)
        h += `<div class="cara"><p>Pilih cara memecah</p>${n.o.map((o, i) => `<button class="opsi" data-a="op" data-p="${p}" data-i="${i}"><span>${esc(o.l)}</span></button>`).join('')}</div>`;
    return h;
}

# Pecah Masalah — Dekomposisi Kelas 7

Permainan edukasi berbasis web untuk melatih **kemampuan dekomposisi** (memecah masalah besar menjadi langkah-langkah kecil) bagi siswa kelas 7. Dibangun dengan HTML/CSS/JavaScript murni (tanpa framework, tanpa build step), sehingga dapat dibuka langsung dengan double-click pada `index.html`.

## Fitur utama

- **5 tahap berurutan**: Kenali → Kelompokkan → Perbaiki → Pecah Sendiri → Urutkan.
- **5 tipe soal**: pilihan ganda (`choice`), pilih banyak (`pick`), pengelompokan (`group`), pengurutan (`order`), dan pecah pohon (`split`).
- **Ilustrasi per soal**: gambar adegan + ikon opsi/zona/node dari `js/asset/img/` (61 PNG; 6 ikon tahap 4.3 menyusul).
- **3 tokoh** (Arlin, Yogi, Adsa) dengan proporsi identik (kepala 52, badan 120, kanvas 100×190).
- **Tema terang/gelap** (default terang, opt-in gelap), tersimpan di `localStorage`.
- **Audio**: musik latar `music_bg.mp3` (loop, volume 0–100%) + 3 SFX (`click_button`, `button_salah`, `win_sound`) dengan volume terpisah.
- **Penghargaan (piagam)** setelah menyelesaikan seluruh tahap.
- **Papan peringkat** (online, via Google Apps Script / Google Sheets).
- **Penyimpanan progres lokal** (nama, avatar, skor, XP, bintang) di `localStorage`.

## Cara menjalankan

Tidak perlu instalasi atau build. Cukup buka `index.html` di peramban (Chrome/Edge/Firefox). Untuk pengalaman penuh (audio autoplay, papan peringkat), jalankan dari server lokal atau host statis.

```bash
# Contoh server lokal (opsional)
python -m http.server 8000
# lalu buka http://localhost:8000
```

## Struktur proyek

```
.
├── index.html              # kerangka halaman; memuat 5 CSS + 7 JS (urutan load-bearing)
├── Code.gs                 # backend Google Apps Script (papan peringkat)
├── css/
│   ├── dasar.css           # token warna/typografi (terang & gelap)
│   ├── komponen.css        # tombol, bilah atas, modal, bubble, popup
│   ├── beranda.css         # masuk, peta, tokoh pilih, piala
│   ├── main.css            # layar main (soal, dock, nyawa, segmen)
│   └── akhir.css           # hasil, habis, peringkat, konfeti, piagam
├── js/
│   ├── asset/
│   │   ├── soal.js         # bank soal STAGES (jangan ubah konten tanpa alasan)
│   │   ├── tokoh.js        # ikon SVG, tokoh (Arlin/Yogi/Adsa), adegan hero
│   │   ├── ilustrasi.js     # peta ILUS: gambar adegan, ikon opsi/zona/node
│   │   ├── img/            # t1..t5/*.png (67 ilustrasi; 6 berkas 4.3 belum ada)
│   │   └── music/          # music_bg.mp3, click_button.mp3, button_salah.mp3, win_sound.mp3
│   ├── inti.js             # state global (P, S), audio, tema, AV/GD, store, confetti
│   ├── game.js             # logika soal: pecah, periksa, tutup, lanjut, skor
│   └── ui/
│       ├── soal.js         # areaSoal, dock, benar, siap
│       ├── layar.js        # vLogin, vMap, vPlay, vHasil, vPiagam, vHabis, vRank, modalSuara
│       └── gambar.js       # draw(), event handler, animasi, Escape
└── tests/
    └── cek.js              # suite uji (node tests/cek.js)
```

### Urutan skrip (load-bearing)

`soal.js` → `tokoh.js` → `ilustrasi.js` → `inti.js` → `game.js` → `ui/soal.js` → `ui/layar.js` → `ui/gambar.js`

`gambar.js` terakhir karena memanggil `draw()` pada load. Jangan ubah urutan.

## Arsitektur singkat

- **State**: `P` (progres pemain, persisten di `localStorage` sebagai `pm_p`) dan `S` (state layar aktif, sementara).
- **Render**: fungsi `draw()` di `gambar.js` merender `$.innerHTML` berdasarkan `S.v` (`login`, `map`, `play`, `hasil`, `piagam`, `habis`, `rank`).
- **Audio**: `musik` (looping) + `efek` (3 SFX). Volume disimpan `pm_vol_musik` (default 30) dan `pm_vol_efek` (default 70). Musik mulai pada gesture pertama (aturan autoplay browser).
- **Tema**: atribut `data-tema` pada `<html>` (`terang`/`gelap`), disimpan `pm_tema`.
- **Tokoh**: `TOKOH` (kunci `arlin`/`yogi`/`adsa`). Nilai simpanan lama (`rani`/`bayu`) otomatis jatuh ke `arlin`. `AV()` = tokoh pemain, `GD()` = tokoh pendamping (berbeda).

## Mekanik permainan

- Setiap soal memberi **3 kesempatan** (`S.att`). Salah 3× → soal gagal, **1 nyawa hilang** (dari 3).
- Jika nyawa habis di tengah tahap → layar "Energi habis".
- Skor per soal: benar percobaan 1 = 1, percobaan 2 = 0.5, percobaan 3 = 0.25; gagal = 0.
- Bintang tahap: ≥100% = 3, ≥80% = 2, ≥60% = 1, <60% = 0.
- XP = `round(sum × 10) + bonus combo`.
- Tahap terbuka jika tahap sebelumnya lulus (bintang ≥ 1).
- Setelah semua 5 tahap lulus → tombol "Ambil penghargaan" → layar piagam.
- Progres lama (susunan tahap sebelum Urutkan dipindah ke akhir) dimigrasikan sekali saat `pm_p` dimuat, ditandai `P.v = 2`.

## Pengaturan suara (popup)

- Ikon gerigi di bilah atas dan bar layar soal membuka **popup** pengaturan.
- Isi: slider Musik, slider Efek (dengan angka %), checkbox "Bisukan semua suara", tombol tutup.
- Tutup via tombol X, klik latar gelap, atau tombol **Escape**.
- Volume berlaku langsung dan tersimpan (`pm_vol_musik`, `pm_vol_efek`).
- Peta tetap bersih (tidak ada kartu slider).

## Penghargaan (piagam)

- Muncul setelah tahap 5 lulus: tombol "Ambil penghargaan" di layar hasil.
- Kartu sertifikat: nama pemain, tanggal, total bintang (x/15), XP, 5 lencana (Pemecah, Pengelompok, Pemeriksa, Perancang, Penyusun), tiga tokoh bersorak, konfeti + `win_sound`.
- Bisa dibuka lagi dari peta ("Lihat piagam penghargaan") bila semua tahap selesai.
- Tanpa cetak/unduh (hanya di layar).

## Papan peringkat (online)

1. Buat Google Sheet baru.
2. **Extensions → Apps Script**, tempel isi `Code.gs`.
3. **Deploy → New deployment → Web app** (Execute as: Me; Who has access: Anyone).
4. Salin URL Web App, set ke `API_URL` di `index.html` (konstanta).
5. Setiap perubahan kode, buat deployment baru (Manage deployments → edit → New version).

Endpoint: `POST` (log/skor) dan `GET ?aksi=peringkat` (top 10).

## Ilustrasi soal

- Semua dipetakan di `js/asset/ilustrasi.js` pada konstanta `ILUS`, berkunci `"tahap.soal"` (mulai 1).
- Berkas PNG ada di `js/asset/img/t1..t5/`; `srcGambar()` menyusun subfolder dari awalan nama (`t3-q1-teh` → `img/t3/t3-q1-teh.png`).
- Tiga jenis pemakaian: `scene` = gambar adegan di bawah judul soal, `ikon` = ikon opsi pick, kartu/slot order, dan node pohon, `zona` = ikon judul kotak pada soal group.
- `praMuat(tahap)` memuat gambar satu tahap di belakang layar saat tombol mulai diklik.
- Gambar yang gagal dimuat langsung dibuang lewat `onerror`, jadi permainan tetap jalan bila berkas hilang.
- Soal refleksi (`x.4`) tidak memakai gambar. Ikon soal 4.3 menunggu 6 berkas `t5-q3-*` yang belum ada.
- Menambah gambar: taruh PNG di folder tahapnya, tambah satu baris di `ILUS`. Tes memeriksa semua berkas ILUS ada di disk dan setiap kunci `ikon` cocok persis dengan teks di `soal.js`.

## Pengujian

```bash
node tests/cek.js          # suite uji (75 pemeriksaan)
node --check js/**/*.js    # cek sintaks semua berkas JS
```

Suite memuat semua skrip seperti browser (urutan sama) dan menguji: render semua 20 soal, 5 layar, 3 tokoh × 5 pose × 5 ekspresi, tema, audio (volume, batas 0–100, 3 berkas efek, loop musik), popup suara, piagam, ilustrasi soal, mekanik pohon pecah, dll.

## Konvensi & catatan pengembangan

- **Tanpa JSX, ES modules, atau build step** — `file://` harus tetap berfungsi.
- **Urutan skrip & gaya load-bearing** — lihat `index.html`.
- Warna: `#RRGGBB` atau `#RRGGBBAA`.
- Koordinat: unit halaman (1 unit = 1 px @100% zoom), x ke kanan, y ke bawah. Anak auto-layout diatur via layout/gap/padding, bukan koordinat.
- Jangan ubah mekanik, bank soal (`soal.js`), atau `Code.gs` tanpa alasan kuat.
- Tema default terang; gelap opt-in via toggle (preferensi `pm_tema`).
- Volume: `pm_vol_musik` (default 30), `pm_vol_efek` (default 70), dibatasi 0–100.

## Lisensi & kredit

Proyek pendidikan. Audio dan aset milik proyek (lihat `js/asset/music/` dan `js/asset/img/`).
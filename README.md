# Pecah Masalah — Dekomposisi Kelas 7

Permainan edukasi berbasis web untuk melatih **kemampuan dekomposisi** (memecah masalah besar menjadi langkah-langkah kecil) bagi siswa kelas 7. Dibangun dengan HTML/CSS/JavaScript murni (tanpa framework, tanpa build step), sehingga dapat dibuka langsung dengan double-click pada `index.html`.

## Fitur utama

- **5 tahap berurutan**: Kenali → Kelompokkan → Urutkan → Perbaiki → Pecah Sendiri.
- **5 tipe soal**: pilihan ganda (`choice`), pilih banyak (`pick`), pengelompokan (`group`), pengurutan (`order`), dan pecah pohon (`split`).
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
│   ├── aset/
│   │   ├── soal.js         # bank soal STAGES (jangan ubah konten tanpa alasan)
│   │   ├── tokoh.js        # ikon SVG, tokoh (Arlin/Yogi/Adsa), adegan hero
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

`soal.js` → `tokoh.js` → `inti.js` → `game.js` → `ui/soal.js` → `ui/layar.js` → `ui/gambar.js`

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

## Pengaturan suara (popup)

- Ikon gerigi di bilah atas dan bar layar soal membuka **popup** pengaturan.
- Isi: slider Musik, slider Efek (dengan angka %), checkbox "Bisukan semua suara", tombol tutup.
- Tutup via tombol X, klik latar gelap, atau tombol **Escape**.
- Volume berlaku langsung dan tersimpan (`pm_vol_musik`, `pm_vol_efek`).
- Peta tetap bersih (tidak ada kartu slider).

## Penghargaan (piagam)

- Muncul setelah tahap 5 lulus: tombol "Ambil penghargaan" di layar hasil.
- Kartu sertifikat: nama pemain, tanggal, total bintang (x/15), XP, 5 lencana, tiga tokoh bersorak, konfeti + `win_sound`.
- Bisa dibuka lagi dari peta ("Lihat piagam penghargaan") bila semua tahap selesai.
- Tanpa cetak/unduh (hanya di layar).

## Papan peringkat (online)

1. Buat Google Sheet baru.
2. **Extensions → Apps Script**, tempel isi `Code.gs`.
3. **Deploy → New deployment → Web app** (Execute as: Me; Who has access: Anyone).
4. Salin URL Web App, set ke `API_URL` di `index.html` (konstanta).
5. Setiap perubahan kode, buat deployment baru (Manage deployments → edit → New version).

Endpoint: `POST` (log/skor) dan `GET ?aksi=peringkat` (top 10).

## Pengujian

```bash
node tests/cek.js          # suite uji (71 pemeriksaan)
node --check js/**/*.js    # cek sintaks semua berkas JS
```

Suite memuat semua skrip seperti browser (urutan sama) dan menguji: render semua 20 soal, 5 layar, 3 tokoh × 5 pose × 5 ekspresi, tema, audio (volume, batas 0–100, 3 berkas efek, loop musik), popup suara, piagam, mekanik pohon pecah, dll.

## Konvensi & catatan pengembangan

- **Tanpa JSX, ES modules, atau build step** — `file://` harus tetap berfungsi.
- **Urutan skrip & gaya load-bearing** — lihat `index.html`.
- Warna: `#RRGGBB` atau `#RRGGBBAA`.
- Koordinat: unit halaman (1 unit = 1 px @100% zoom), x ke kanan, y ke bawah. Anak auto-layout diatur via layout/gap/padding, bukan koordinat.
- Jangan ubah mekanik, bank soal (`soal.js`), atau `Code.gs` tanpa alasan kuat.
- Tema default terang; gelap opt-in via toggle (preferensi `pm_tema`).
- Volume: `pm_vol_musik` (default 30), `pm_vol_efek` (default 70), dibatasi 0–100.

## Lisensi & kredit

Proyek pendidikan. Audio dan aset milik proyek (lihat `js/aset/music/`).
EOF
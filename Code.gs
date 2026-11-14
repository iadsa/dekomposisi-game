// Pecah Masalah: penyimpan data dan papan peringkat (Google Apps Script).
// Pasang: Google Sheets > Extensions > Apps Script > tempel kode ini.
// Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
// Salin URL Web App ke konstanta API_URL di index.html.
// Setiap kali kode diubah, buat deployment baru (atau Manage deployments > edit > New version).

const KOLOM = {
  Log:  ["waktu","kode","tahap","soal","tp","benar","percobaan","detik"],
  Skor: ["waktu","kode","tahap","tp","persen","bintang","xp"]
};

const aman = v => /^[=+\-@]/.test(String(v)) ? "'" + v : v; // cegah formula injection
const json = s => ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.JSON);

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const nama = d.tipe === "skor" ? "Skor" : d.tipe === "log" ? "Log" : null;
    if (!nama) return ContentService.createTextOutput("ERR tipe");
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(nama) || ss.insertSheet(nama);
    if (sh.getLastRow() === 0) {
      sh.appendRow(KOLOM[nama]);
      sh.getRange("B:B").setNumberFormat("@"); // kode siswa tetap berupa teks (mis. 07)
    }
    sh.appendRow(KOLOM[nama].map(k => aman(d[k] === undefined ? "" : d[k])));
    CacheService.getScriptCache().remove("rank");
    return ContentService.createTextOutput("OK");
  } catch (err) {
    return ContentService.createTextOutput("ERR " + err);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  if (e && e.parameter && e.parameter.aksi === "peringkat") {
    const cache = CacheService.getScriptCache();
    const c = cache.get("rank");
    if (c) return json(c);
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Skor");
    const terbaik = {};
    if (sh && sh.getLastRow() > 1) {
      sh.getRange(2, 1, sh.getLastRow() - 1, 7).getValues().forEach(r => {
        const k = r[1] + "|" + r[2];                       // kode + tahap
        const xp = Number(r[6]) || 0;
        if (!(k in terbaik) || xp > terbaik[k].xp) terbaik[k] = { kode: String(r[1]), xp: xp };
      });
    }
    const total = {};
    Object.values(terbaik).forEach(b => { total[b.kode] = (total[b.kode] || 0) + b.xp; });
    const out = JSON.stringify(
      Object.keys(total).map(k => ({ kode: k, xp: total[k] })).sort((a, b) => b.xp - a.xp).slice(0, 10)
    );
    cache.put("rank", out, 30);
    return json(out);
  }
  return ContentService.createTextOutput("Pecah Masalah API aktif");
}

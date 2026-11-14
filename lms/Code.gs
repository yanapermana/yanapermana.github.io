/**
 * Backend LMS TKJ Kelas XI: database di Google Spreadsheet.
 * Pasang lewat Extensions > Apps Script pada spreadsheet Anda.
 */

// ===== EDIT DUA BARIS INI: akun guru (satu-satunya, hak akses penuh) =====
const GURU_USER = 'guru';
const GURU_PASS = 'ganti-sandi-ini';
// =========================================================================

const AK = ['username', 'nama', 'kelas', 'salt', 'hash', 'dibuat'];
const KM = ['username', 'nama', 'kelas', 'kemajuan_persen', 'skor_pg_bab1', 'cek_tp_benar', 'terakhir_aktif', 'data'];

function setup() { sh('Akun', AK); sh('Kemajuan', KM); }  // jalankan sekali untuk memberi izin

function sh(name, head) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(name);
  if (!s) {
    s = ss.insertSheet(name);
    s.appendRow(head);
    s.setFrozenRows(1);
    s.getRange('A:A').setNumberFormat('@');
    if (name === 'Akun') s.getRange('D:E').setNumberFormat('@');
    if (name === 'Kemajuan') s.getRange('H:H').setNumberFormat('@');
  }
  return s;
}
function hx(b) { return b.map(x => (x < 0 ? x + 256 : x).toString(16).padStart(2, '0')).join(''); }
function sha(t) { return hx(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, t, Utilities.Charset.UTF_8)); }
function secret() {
  const P = PropertiesService.getScriptProperties();
  let s = P.getProperty('S');
  if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); P.setProperty('S', s); }
  return s;
}
function tokFor(id, h) { return sha(id + '|' + h + '|' + secret()); }
function find(s, u) {
  const v = s.getDataRange().getValues();
  for (let i = 1; i < v.length; i++) if (String(v[i][0]) === u) return { i: i + 1, r: v[i] };
  return null;
}
function auth(q, A) {
  const u = String(q.u || '').toLowerCase();
  if (u === GURU_USER.toLowerCase() || (u === 'guru' && q.tok)) {
    const gh = sha('guru|' + GURU_USER + '|' + GURU_PASS);
    const ok = q.p != null ? (u === GURU_USER.toLowerCase() && q.p === GURU_PASS) : q.tok === tokFor('guru', gh);
    return ok ? { role: 'guru', id: 'guru', nama: 'Guru TKJ', kelas: '', tok: tokFor('guru', gh) } : null;
  }
  const row = find(A, u);
  if (!row) return null;
  const h = String(row.r[4]);
  const ok = q.p != null ? sha(row.r[3] + ':' + q.p) === h : q.tok === tokFor(u, h);
  return ok ? { role: 'siswa', id: u, nama: row.r[1], kelas: row.r[2], tok: tokFor(u, h) } : null;
}
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function doGet() { return out({ ok: true, msg: 'LMS TKJ aktif' }); }
function doPost(e) {
  const L = LockService.getScriptLock();
  L.waitLock(20000);
  try { return out(run(JSON.parse(e.postData.contents))); }
  catch (x) { return out({ ok: false, err: 'Terjadi kesalahan server.' }); }
  finally { L.releaseLock(); }
}
function run(q) {
  const A = sh('Akun', AK), K = sh('Kemajuan', KM);
  if (q.a === 'reg') {
    const u = String(q.u || '').toLowerCase();
    if (!/^[a-z0-9][a-z0-9_-]{2,19}$/.test(u) || u === GURU_USER.toLowerCase() || u === 'guru') return { ok: false, err: 'Username tidak valid atau tidak tersedia.' };
    if (String(q.p || '').length < 6 || !q.n || !q.k) return { ok: false, err: 'Data belum lengkap.' };
    if (find(A, u)) return { ok: false, err: 'Username sudah dipakai. Pilih yang lain.' };
    const sl = Utilities.getUuid();
    A.appendRow([u, String(q.n).slice(0, 80), String(q.k).slice(0, 30), sl, sha(sl + ':' + q.p), new Date()]);
    return { ok: true };
  }
  const u = auth(q, A);
  if (!u) return { ok: false, err: q.p != null ? 'Username atau password salah.' : 'Sesi tidak valid. Silakan masuk lagi.' };
  if (q.a === 'login') {
    let d = null;
    if (u.role === 'siswa') { const r = find(K, u.id); if (r) { try { d = JSON.parse(r.r[7]); } catch (e) {} } }
    return { ok: true, user: u, data: d };
  }
  if (q.a === 'prog' && u.role === 'siswa') {
    const d = q.d || {};
    const row = [u.id, u.nama, u.kelas, +d.pct || 0, isFinite(+d.skor) ? +d.skor : -1, +d.tpk || 0, new Date(), JSON.stringify(d.data || {}).slice(0, 45000)];
    const r = find(K, u.id);
    if (r) K.getRange(r.i, 1, 1, 8).setValues([row]); else K.appendRow(row);
    return { ok: true };
  }
  if (u.role !== 'guru') return { ok: false, err: 'Akses ditolak.' };
  if (q.a === 'list') {
    const ak = A.getDataRange().getValues().slice(1), m = {};
    K.getDataRange().getValues().slice(1).forEach(r => m[String(r[0])] = r);
    return { ok: true, rows: ak.map(r => { const p = m[String(r[0])] || []; return { u: String(r[0]), n: r[1], k: r[2], pct: +p[3] || 0, skor: (p[4] === '' || p[4] == null) ? -1 : +p[4], tpk: +p[5] || 0, t: p[6] instanceof Date ? p[6].getTime() : 0 }; }) };
  }
  if (q.a === 'reset') {
    const t = String(q.t || ''), row = find(A, t);
    if (!row || String(q.np || '').length < 6) return { ok: false, err: 'Data tidak valid.' };
    const sl = Utilities.getUuid();
    A.getRange(row.i, 4, 1, 2).setValues([[sl, sha(sl + ':' + q.np)]]);
    return { ok: true };
  }
  if (q.a === 'del') {
    const t = String(q.t || ''), r1 = find(A, t);
    if (r1) A.deleteRow(r1.i);
    const r2 = find(K, t);
    if (r2) K.deleteRow(r2.i);
    return { ok: true };
  }
  return { ok: false, err: 'Perintah tidak dikenal.' };
}

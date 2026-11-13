/**
 * ============================================================================
 * APLIKASI INVENTARIS BARANG KELUAR MASUK - GOOGLE APPS SCRIPT (BACKEND)
 * ============================================================================
 * Fitur:
 * 1. Setup Otomatis Database Spreadsheet (Sheet: Barang, Transaksi, Pengaturan)
 * 2. Autentikasi Password Custom
 * 3. CRUD Master Data Barang (Kode, Nama, Kategori, Stok Awal, Satuan, Lokasi Rak)
 * 4. Pencatatan Barang Masuk & Keluar dengan Kalkulasi Stok Real-time
 * 5. Ringkasan Dashboard & Riwayat Transaksi
 */

// Nama properti untuk menyimpan ID Spreadsheet secara otomatis setelah setup dijalankan
const PROP_SPREADSHEET_ID = 'INVENTORY_SPREADSHEET_ID';

/**
 * Fungsi utama untuk merender halaman web (index.html)
 */
function doGet(e) {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Sistem Inventaris Barang')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * ============================================================================
 * 1. FUNGSI SETUP DATABASE (JALANKAN SEKALI DI EDITOR APPS SCRIPT)
 * ============================================================================
 * Cara menjalankan: Pilih fungsi 'setupDatabase' di toolbar atas lalu klik 'Run'.
 */
function setupDatabase() {
  try {
    const scriptProps = PropertiesService.getScriptProperties();
    let ssId = scriptProps.getProperty(PROP_SPREADSHEET_ID);
    let ss;

    if (ssId) {
      try {
        ss = SpreadsheetApp.openById(ssId);
        Logger.log('Spreadsheet sudah ada: ' + ss.getUrl());
      } catch (err) {
        ss = null;
      }
    }

    // Jika belum ada, buat Spreadsheet baru
    if (!ss) {
      ss = SpreadsheetApp.create('Database_Inventaris_Barang_' + new Date().getFullYear());
      ssId = ss.getId();
      scriptProps.setProperty(PROP_SPREADSHEET_ID, ssId);
      Logger.log('Spreadsheet baru berhasil dibuat!');
    }

    // 1. Setup Sheet "Barang" (Master Data)
    let sheetBarang = ss.getSheetByName('Barang');
    if (!sheetBarang) {
      // Gunakan sheet default pertama jika masih bernama Sheet1
      const firstSheet = ss.getSheets()[0];
      if (firstSheet && firstSheet.getName() === 'Sheet1') {
        sheetBarang = firstSheet.setName('Barang');
      } else {
        sheetBarang = ss.insertSheet('Barang');
      }
      
      const headersBarang = [
        'Kode Barang', 
        'Nama Barang', 
        'Kategori', 
        'Stok Awal', 
        'Total Masuk', 
        'Total Keluar', 
        'Stok Akhir', 
        'Satuan', 
        'Lokasi Rak',
        'Terakhir Update'
      ];
      sheetBarang.getRange(1, 1, 1, headersBarang.length).setValues([headersBarang]);
      sheetBarang.getRange(1, 1, 1, headersBarang.length)
        .setBackground('#1e293b')
        .setFontColor('#ffffff')
        .setFontWeight('bold');
      sheetBarang.setFrozenRows(1);

      // Tambahkan 1 contoh data awal
      const sampleBarang = [
        ['BRG-001', 'Kertas HVS A4 80gr', 'ATK', 50, 0, 0, 50, 'Rim', 'Rak A-01', new Date()],
        ['BRG-002', 'Tinta Printer Hitam', 'Elektronik', 15, 0, 0, 15, 'Botol', 'Rak B-02', new Date()]
      ];
      sheetBarang.getRange(2, 1, sampleBarang.length, headersBarang.length).setValues(sampleBarang);
    }

    // 2. Setup Sheet "Transaksi" (Log Barang Masuk & Keluar)
    let sheetTransaksi = ss.getSheetByName('Transaksi');
    if (!sheetTransaksi) {
      sheetTransaksi = ss.insertSheet('Transaksi');
      const headersTransaksi = [
        'ID Transaksi', 
        'Tanggal', 
        'Jenis', // MASUK / KELUAR
        'Kode Barang', 
        'Nama Barang', 
        'Jumlah', 
        'Satuan',
        'Keterangan / PIC'
      ];
      sheetTransaksi.getRange(1, 1, 1, headersTransaksi.length).setValues([headersTransaksi]);
      sheetTransaksi.getRange(1, 1, 1, headersTransaksi.length)
        .setBackground('#1e293b')
        .setFontColor('#ffffff')
        .setFontWeight('bold');
      sheetTransaksi.setFrozenRows(1);
    }

    // 3. Setup Sheet "Pengaturan" (Menyimpan Password Custom)
    let sheetPengaturan = ss.getSheetByName('Pengaturan');
    if (!sheetPengaturan) {
      sheetPengaturan = ss.insertSheet('Pengaturan');
      sheetPengaturan.getRange('A1:B2').setValues([
        ['Parameter', 'Nilai'],
        ['APP_PASSWORD', 'admin123'] // Password default, bisa diubah langsung di sheet atau via aplikasi
      ]);
      sheetPengaturan.getRange('A1:B1')
        .setBackground('#1e293b')
        .setFontColor('#ffffff')
        .setFontWeight('bold');
    }

    Logger.log('====================================================');
    Logger.log('SETUP DATABASE BERHASIL!');
    Logger.log('URL Spreadsheet: ' + ss.getUrl());
    Logger.log('Password Default Login: admin123');
    Logger.log('====================================================');
    
    return {
      success: true,
      url: ss.getUrl(),
      message: 'Database berhasil disiapkan! URL: ' + ss.getUrl()
    };

  } catch (error) {
    Logger.log('Error Setup Database: ' + error.toString());
    throw new Error('Gagal membuat database: ' + error.message);
  }
}

/**
 * Helper untuk mendapatkan instance Spreadsheet aktif
 */
function getSpreadsheet() {
  const ssId = PropertiesService.getScriptProperties().getProperty(PROP_SPREADSHEET_ID);
  if (!ssId) {
    // Otomatis jalankan setup jika belum pernah disetup
    setupDatabase();
    const newId = PropertiesService.getScriptProperties().getProperty(PROP_SPREADSHEET_ID);
    return SpreadsheetApp.openById(newId);
  }
  return SpreadsheetApp.openById(ssId);
}

/**
 * ============================================================================
 * 2. SISTEM AUTENTIKASI (LOGIN PASSWORD CUSTOM)
 * ============================================================================
 */
function verifyPassword(inputPassword) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Pengaturan');
    if (!sheet) throw new Error('Sheet Pengaturan tidak ditemukan.');

    const data = sheet.getDataRange().getValues();
    let validPassword = 'admin123';

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === 'APP_PASSWORD') {
        validPassword = String(data[i][1]).trim();
        break;
      }
    }

    if (String(inputPassword).trim() === validPassword) {
      return { success: true, message: 'Login berhasil!' };
    } else {
      return { success: false, message: 'Password salah! Silakan coba lagi.' };
    }
  } catch (error) {
    return { success: false, message: 'Error sistem: ' + error.message };
  }
}

/**
 * Mengubah password login custom
 */
function changeAppPassword(oldPassword, newPassword) {
  try {
    const auth = verifyPassword(oldPassword);
    if (!auth.success) {
      return { success: false, message: 'Password lama tidak sesuai.' };
    }
    if (!newPassword || newPassword.length < 4) {
      return { success: false, message: 'Password baru minimal 4 karakter.' };
    }

    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Pengaturan');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === 'APP_PASSWORD') {
        sheet.getRange(i + 1, 2).setValue(String(newPassword).trim());
        return { success: true, message: 'Password berhasil diperbarui!' };
      }
    }
    
    sheet.appendRow(['APP_PASSWORD', String(newPassword).trim()]);
    return { success: true, message: 'Password berhasil disimpan!' };
  } catch (error) {
    return { success: false, message: 'Gagal mengubah password: ' + error.message };
  }
}

/**
 * ============================================================================
 * 3. AMBIL SEMUA DATA UNTUK DASHBOARD, BARANG, & TRANSAKSI
 * ============================================================================
 */
function getInitialData() {
  try {
    const ss = getSpreadsheet();
    
    // Ambil Data Barang
    const sheetBarang = ss.getSheetByName('Barang');
    const rawBarang = sheetBarang.getDataRange().getValues();
    const daftarBarang = [];

    for (let i = 1; i < rawBarang.length; i++) {
      if (rawBarang[i][0] !== '') {
        daftarBarang.push({
          rowIndex: i + 1,
          kode: String(rawBarang[i][0]),
          nama: String(rawBarang[i][1]),
          kategori: String(rawBarang[i][2]),
          stokAwal: Number(rawBarang[i][3]) || 0,
          totalMasuk: Number(rawBarang[i][4]) || 0,
          totalKeluar: Number(rawBarang[i][5]) || 0,
          stokAkhir: Number(rawBarang[i][6]) || 0,
          satuan: String(rawBarang[i][7]),
          lokasiRak: String(rawBarang[i][8]),
          lastUpdate: rawBarang[i][9] ? Utilities.formatDate(new Date(rawBarang[i][9]), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm') : '-'
        });
      }
    }

    // Ambil Data Transaksi
    const sheetTransaksi = ss.getSheetByName('Transaksi');
    const rawTransaksi = sheetTransaksi.getDataRange().getValues();
    const daftarTransaksi = [];

    // Ambil dari baris terbaru ke terlama
    for (let i = rawTransaksi.length - 1; i >= 1; i--) {
      if (rawTransaksi[i][0] !== '') {
        let tglStr = rawTransaksi[i][1];
        if (tglStr instanceof Date) {
          tglStr = Utilities.formatDate(tglStr, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
        }
        daftarTransaksi.push({
          id: String(rawTransaksi[i][0]),
          tanggal: String(tglStr),
          jenis: String(rawTransaksi[i][2]),
          kodeBarang: String(rawTransaksi[i][3]),
          namaBarang: String(rawTransaksi[i][4]),
          jumlah: Number(rawTransaksi[i][5]) || 0,
          satuan: String(rawTransaksi[i][6]),
          keterangan: String(rawTransaksi[i][7])
        });
      }
    }

    return {
      success: true,
      spreadsheetUrl: ss.getUrl(),
      barang: daftarBarang,
      transaksi: daftarTransaksi
    };
  } catch (error) {
    return { success: false, message: 'Gagal memuat data: ' + error.message };
  }
}

/**
 * ============================================================================
 * 4. MANAJEMEN DAFTAR BARANG (TAMBAH, EDIT, HAPUS)
 * ============================================================================
 */
function saveBarang(data, isEdit) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Barang');
    const values = sheet.getDataRange().getValues();

    const kode = String(data.kode).trim().toUpperCase();
    const nama = String(data.nama).trim();
    const kategori = String(data.kategori).trim();
    const stokAwal = Number(data.stokAwal) || 0;
    const satuan = String(data.satuan).trim();
    const lokasiRak = String(data.lokasiRak).trim();

    if (!kode || !nama) {
      return { success: false, message: 'Kode Barang dan Nama Barang wajib diisi!' };
    }

    // Cek duplikasi kode barang
    let existingRow = -1;
    for (let i = 1; i < values.length; i++) {
      if (String(values[i][0]).trim().toUpperCase() === kode) {
        existingRow = i + 1;
        break;
      }
    }

    if (!isEdit) {
      if (existingRow !== -1) {
        return { success: false, message: 'Kode Barang "' + kode + '" sudah terdaftar!' };
      }
      // Tambah baru: [Kode, Nama, Kategori, Stok Awal, Total Masuk, Total Keluar, Stok Akhir, Satuan, Lokasi Rak, Update]
      sheet.appendRow([
        kode,
        nama,
        kategori,
        stokAwal,
        0,
        0,
        stokAwal,
        satuan,
        lokasiRak,
        new Date()
      ]);
      return { success: true, message: 'Barang baru berhasil ditambahkan!' };
    } else {
      if (existingRow === -1) {
        return { success: false, message: 'Data barang tidak ditemukan untuk diperbarui.' };
      }
      const currentMasuk = Number(values[existingRow - 1][4]) || 0;
      const currentKeluar = Number(values[existingRow - 1][5]) || 0;
      const newStokAkhir = stokAwal + currentMasuk - currentKeluar;

      if (newStokAkhir < 0) {
        return { success: false, message: 'Stok awal tidak valid karena menyebabkan stok akhir minus (' + newStokAkhir + ').' };
      }

      sheet.getRange(existingRow, 2, 1, 9).setValues([[
        nama,
        kategori,
        stokAwal,
        currentMasuk,
        currentKeluar,
        newStokAkhir,
        satuan,
        lokasiRak,
        new Date()
      ]]);
      return { success: true, message: 'Data barang berhasil diperbarui!' };
    }
  } catch (error) {
    return { success: false, message: 'Terjadi kesalahan: ' + error.message };
  } finally {
    lock.releaseLock();
  }
}

function deleteBarang(kodeBarang) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Barang');
    const values = sheet.getDataRange().getValues();
    const targetKode = String(kodeBarang).trim().toUpperCase();

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][0]).trim().toUpperCase() === targetKode) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'Barang berhasil dihapus.' };
      }
    }
    return { success: false, message: 'Barang tidak ditemukan.' };
  } catch (error) {
    return { success: false, message: 'Gagal menghapus barang: ' + error.message };
  } finally {
    lock.releaseLock();
  }
}

/**
 * ============================================================================
 * 5. PENCATATAN TRANSAKSI BARANG MASUK & KELUAR
 * ============================================================================
 */
function recordTransaction(txData) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const ss = getSpreadsheet();
    const sheetBarang = ss.getSheetByName('Barang');
    const sheetTransaksi = ss.getSheetByName('Transaksi');

    const jenis = String(txData.jenis).toUpperCase(); // 'MASUK' atau 'KELUAR'
    const kode = String(txData.kodeBarang).trim().toUpperCase();
    const jumlah = Number(txData.jumlah);
    const keterangan = String(txData.keterangan || '-').trim();
    const tanggalInput = txData.tanggal ? new Date(txData.tanggal) : new Date();

    if (!kode || isNaN(jumlah) || jumlah <= 0) {
      return { success: false, message: 'Pilih barang dan masukkan jumlah lebih dari 0.' };
    }

    // Cari barang di master data
    const barangValues = sheetBarang.getDataRange().getValues();
    let targetRow = -1;
    let namaBarang = '';
    let satuan = '';
    let stokAwal = 0;
    let totalMasuk = 0;
    let totalKeluar = 0;
    let stokAkhir = 0;

    for (let i = 1; i < barangValues.length; i++) {
      if (String(barangValues[i][0]).trim().toUpperCase() === kode) {
        targetRow = i + 1;
        namaBarang = String(barangValues[i][1]);
        stokAwal = Number(barangValues[i][3]) || 0;
        totalMasuk = Number(barangValues[i][4]) || 0;
        totalKeluar = Number(barangValues[i][5]) || 0;
        stokAkhir = Number(barangValues[i][6]) || 0;
        satuan = String(barangValues[i][7]);
        break;
      }
    }

    if (targetRow === -1) {
      return { success: false, message: 'Kode barang tidak ditemukan di Master Data!' };
    }

    // Validasi stok untuk barang keluar
    if (jenis === 'KELUAR') {
      if (jumlah > stokAkhir) {
        return { 
          success: false, 
          message: 'Stok tidak mencukupi! Stok tersedia saat ini: ' + stokAkhir + ' ' + satuan 
        };
      }
      totalKeluar += jumlah;
    } else if (jenis === 'MASUK') {
      totalMasuk += jumlah;
    } else {
      return { success: false, message: 'Jenis transaksi tidak valid.' };
    }

    const newStokAkhir = stokAwal + totalMasuk - totalKeluar;

    // 1. Update stok di sheet Barang
    sheetBarang.getRange(targetRow, 5, 1, 3).setValues([[totalMasuk, totalKeluar, newStokAkhir]]);
    sheetBarang.getRange(targetRow, 10).setValue(new Date());

    // 2. Catat riwayat ke sheet Transaksi
    const idTransaksi = (jenis === 'MASUK' ? 'IN-' : 'OUT-') + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyMMddHHmmss');
    sheetTransaksi.appendRow([
      idTransaksi,
      tanggalInput,
      jenis,
      kode,
      namaBarang,
      jumlah,
      satuan,
      keterangan
    ]);

    return { 
      success: true, 
      message: 'Transaksi Barang ' + (jenis === 'MASUK' ? 'Masuk' : 'Keluar') + ' berhasil disimpan!' 
    };

  } catch (error) {
    return { success: false, message: 'Gagal menyimpan transaksi: ' + error.message };
  } finally {
    lock.releaseLock();
  }
}
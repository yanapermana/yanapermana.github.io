# Gemini
Gem Baru

# Nama
Mata Pelajaran Konsentrasi Keahlian Teknik Komputer Jaringan

# Deskripsi
Aplikasi LMS

# Instruction
Nama Guru: Yana Permana, S.Pd
Nama Sekolah: SMK Al-Irsyad Tegal
Nama Kepala Sekolah: Raushan FIkry Adam, Lc.,MIRKH
Kelas: XI
Jurusan: Teknik Komputer Jaringan
Mata Pelajaran: Teknik Komputer Jaringan

# Knowledge
* file prota
* file ringkasan materi buku sumber
* file soal evaluasi

Save Gem
Start Chat

Buatkan buku pegangan siswa untuk pembelajaran mandiri beserta evaluasinya dalam bentuk Bab 1, simpan dalam pdf

# CLAUDE
New Projecct
Nama
LMS Teknik Komputer Jaringan
Description
Learning Management System

New Chat
Saya ingin menjadikan file yang saya kirim ini menjadi LMS agar anak mudah belajar mandiri di rumah, buat dalam bentuk file HTML
Upload Bab1.pdf

Ganti file html menjadi index.html
LMS ini berisi tentang pembelajaran mandiri selama satu tahun pelajaran sebagaimana file prota yang saya kirim kemudian ubah login menjadi 2 login, login siswa dan login guru.
Upload Prota.pdf

- Untuk login hanya menggunakan username dan password saja
- username dan password yang bikin guru, siswa juga bisa mendaftar (ada menu daftar untuk siswa). login guru single user, login siswa multi user. guru mendapat hak akses penuh.

Buatkan database dengan google spreadsheet

output Code.gs
output index.html

"""
Cara memasang (sekitar 5 menit):

Buat Google Spreadsheet baru, lalu buka Extensions > Apps Script.
Tempel isi Code.gs. Ubah dua baris di bagian atas, GURU_USER dan GURU_PASS, sesuai username dan password guru yang Bapak/Ibu inginkan.
Pilih fungsi setup, klik Run, lalu setujui izin yang diminta. Sheet Akun dan Kemajuan akan dibuat otomatis.
Klik Deploy > New deployment > Web app. Isi Execute as: Me dan Who has access: Anyone. Salin URL yang berakhiran /exec.
Buka index.html, cari baris const SHEETS_URL='';, tempel URL tadi di antara tanda kutip, lalu unggah file ke hosting.

Cara kerjanya:

Akun siswa (username, nama, kelas, password) masuk ke sheet Akun. Password disimpan dalam bentuk hash dengan salt.
Kemajuan, skor, dan waktu aktif siswa masuk ke sheet Kemajuan. Bapak/Ibu bisa langsung membukanya di Google Sheets untuk diurutkan, difilter, atau diunduh.
Siswa bisa login dari HP atau komputer mana pun dan melanjutkan dari bagian terakhir.
Akun guru hanya satu dan ditulis di Apps Script, sehingga tidak bisa dibuat siswa. Dasbor guru bisa melihat semua siswa, mereset password, dan menghapus akun.
Kalau mengubah Code.gs setelah deploy, pilih Manage deployments > Edit > New version agar perubahan berlaku.

Catatan:

Jangan membagikan isi Code.gs yang sudah berisi password guru.
Google membatasi jumlah panggilan Apps Script harian. Untuk satu sekolah ini cukup, tetapi kalau ratusan siswa belajar bersamaan, pemakaian bisa melambat.
Jawaban uraian siswa tetap tersimpan di perangkat masing-masing. Yang ikut terbawa ke spreadsheet adalah kemajuan, jawaban pilihan ganda, dan cek pemahaman.
"""


Buka index.html, cari baris const SHEETS_URL='';,
https://script.google.com/macros/s/AKfycbwOS9pY851p_k4bclbq_F5ik9F_ItZ60ghjAoNFmxIYmdIDiEn0h5XBbj-Epyg8UB7l3A/exec

Download index.html
Upload ke netlify.app

https://luminous-elf-880779.netlify.app/
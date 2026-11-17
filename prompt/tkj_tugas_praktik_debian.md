----------------------------------------------------------------
Buatkan website dengan css bootstrap agar responsif, title website "Tugas Praktik Debian", konten website berisi:

<pre>
Alat dan Bahan:
- VirtualBox
- Debian VDI

Navigasi dan Manajemen Berkas (File & Directory)

# clear
• pwd (Print Working Directory): Menampilkan lokasi direktori tempat Anda berada saat ini.
# pwd

• ls (List): Melihat daftar file dan folder di direktori aktif.
	• ls -a: Menampilkan seluruh file, termasuk file tersembunyi (hidden files).
	• ls -la: Menampilkan file secara detail beserta izin akses (permissions) dan ukurannya.
# ls
# ls -a
# la -la

• cd (Change Directory): Berpindah ke direktori lain.
	• cd ..: Mundur satu tingkat ke direktori di atasnya.
	• cd ~: Kembali ke direktori home pengguna.
# cd ..
# cd ~

• mkdir (Make Directory): Membuat folder baru (contoh: mkdir nama_folder).
# mkdir namakamu
# ls namakamu

• rmdir: Menghapus folder yang kosong.
# rmdir namakamu

• touch: Membuat file kosong baru (contoh: touch file.txt).
# touch namakamu.txt
# ls

• cat: Menampilkan isi dari suatu file teks.
# echo "aku kelas xi" >> namakamu.txt
# cat namakamu.txt

• cp (Copy): Menyalin file atau folder (contoh: cp file.txt /lokasi/tujuan).
# cp namakamu.txt fileinidisalin.txt
# ls

• mv (Move): Memindahkan atau mengganti nama (rename) file/folder (contoh: mv lama.txt baru.txt).
# mv namakamu.txt namabaru.txt

• rm (Remove): Menghapus file.
	• rm -r: Menghapus folder beserta seluruh isinya secara rekursif.
# rm namabaru.txt
# mkdir folderbaru
# rm -r folderbaru
# ls

2. Manajemen Hak Akses dan Pengguna (Permissions & Users)

• su (Switch User): Masuk ke akun pengguna lain atau beralih ke akun root (administrator).
# su

• sudo: Menjalankan perintah dengan hak akses sementara sebagai root.
# sudo su
# whoami

• chmod: Mengubah hak akses (permissions) pada file atau direktori.
# mkdir namafolderkamu
# chmod 777 namafolderkamu
# ls -lah

• chown: Mengubah kepemilikan (ownership) file atau direktori.
# useradd -m namakamu
# sudo usermod -aG sudo namakamu
# chown namakamu:namakamu namafolderkamu
# ls -lah

3. Informasi Sistem dan Jaringan

• ip a atau ifconfig: Mengecek alamat IP dan konfigurasi antarmuka jaringan (network interface).
# ip a
# ifconfig

• ping <alamat>: Menguji koneksi jaringan ke komputer atau situs lain (contoh: ping google.com).
# ping 8.8.8.8

• df -h: Melihat kapasitas dan penggunaan ruang penyimpanan (disk space) pada hard disk.
# df -h

• free -h: Memeriksa penggunaan memori RAM.
# free -h

• top atau htop: Memantau proses sistem dan penggunaan CPU secara real-time.
# top

• reboot: Mulai ulang (restart) sistem.
• shutdown -h now: Mematikan komputer atau server saat itu juga.

4. Manajemen Paket (APT Debian)

Debian menggunakan Advanced Package Tool (apt) untuk menginstal, memperbarui, dan menghapus aplikasi:
• apt update: Memperbarui daftar repositori paket dari server Debian.
• apt upgrade: Meningkatkan versi paket-paket yang sudah terinstal ke versi terbaru.
• apt install <nama_paket>: Menginstal aplikasi atau paket baru (contoh: apt install nginx).
• apt remove <nama_paket>: Menghapus aplikasi yang terinstal.
</pre>

Menu navigasi brand "Yana Permana"
Menu navigasi berisi link:
- <a href="https://yanapermana.github.io">Home</a>
- <a href="https://yanapermana.github.io/jadwal.html">Jadwal</a>
- <a href="https://yanapermana.github.io/modul/index.html">Modul</a>

Tambahkan button:
back ke halaman sebelumnya
to top ke bagian atas website
Buat tema website dengan warna orange dan putih
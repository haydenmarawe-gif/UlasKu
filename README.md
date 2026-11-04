# UlasKu – sistem kartu NFC/QR Google Review

## Cara kerja
Tiap kartu punya KODE unik 6 karakter, misalnya ZWA82G. Alamat kartu: https://DOMAIN-ANDA/r/ZWA82G
- Alamat itu ditulis ke chip NFC dan dicetak jadi QR di kartu yang sama.
- Kartu belum aktif: pelanggan diarahkan ke halaman aktivasi (isi nama bisnis, link review, PIN).
- Kartu sudah aktif: langsung dialihkan ke link Google Review bisnis tersebut.
- Link review bisa diganti kapan saja lewat /kelola-kartu, tanpa menulis ulang chip NFC.

## Deploy (sekali saja, gratis)
1. Upload folder ini ke GitHub, lalu Import di vercel.com.
2. Di Vercel: Storage > Create > Upstash Redis (Marketplace), sambungkan ke project ini.
3. Settings > Environment Variables: tambah ADMIN_KEY (password panjang buatan Anda). Redeploy.
4. Buka https://DOMAIN-ANDA/admin, masukkan ADMIN_KEY, buat kode (mis. 50 kartu).

## Produksi kartu
1. Klik "Unduh CSV": berisi kode dan URL tiap kartu.
2. Tulis URL ke chip NFC satu per satu dengan aplikasi NFC Tools (Write > Add a record > URL). Pilih NTAG213/215.
3. Cetak lembar QR (tombol Cetak) atau kirim QR ke percetakan. Pastikan kode di QR sama dengan kode di chip kartu itu.
4. Tes: tap kartu, harus muncul halaman aktivasi.

## Halaman
- / : website jualan kartu (tombol WhatsApp 0896-6976-1721, harga 1/5/10 kartu)
- /aktivasi?code=KODE : aktivasi kartu
- /kelola-kartu : ubah data kartu (kode + PIN)
- /admin : buat kode massal (ADMIN_KEY)

# Panduan Pengembangan — Katalog Properti Statis

Website ini murni HTML, CSS, dan JavaScript (tanpa framework, tanpa build tool). Semua data properti disimpan di satu file `properti.json`. Tidak ada backend — mengedit data cukup dengan mengedit file JSON lalu upload ulang.

## 1. Struktur File

```
katalog-properti/
├── index.html      # Halaman katalog (grid semua properti)
├── detail.html     # Halaman detail generik, dipakai ulang untuk semua properti
├── app.js          # Logika katalog: fetch data, render kartu, filter, pencarian
├── detail.js       # Logika detail: baca ?id= dari URL, render galeri/spek/peta/CTA
├── style.css       # Semua styling
└── properti.json   # Sumber data — satu-satunya file yang perlu sering diedit
```

Tidak ada database, tidak ada server. `properti.json` adalah "database" kamu.

## 2. Menjalankan di Komputer Sendiri

Karena `fetch()` butuh diakses lewat HTTP (bukan `file://`), jalankan local server sederhana di dalam folder proyek:

```bash
# Python 3
python -m http.server 8000

# atau Node.js (tanpa install)
npx serve .
```

Buka `http://localhost:8000` di browser. Membuka `index.html` langsung lewat double-click tidak akan berhasil memuat data karena browser memblokir `fetch()` dari `file://`.

## 3. Menambah Properti Baru

Buka `properti.json`, cari array `"produk"`, tambahkan objek baru mengikuti format ini:

```json
{
  "id": "prop005",
  "nama": "Rumah Baru Jalan Solo",
  "kategori": "Rumah",
  "status": "Dijual",
  "harga": 890000000,
  "stok": true,
  "lokasi": {
    "alamat": "Jl. Solo KM 8, Yogyakarta",
    "lat": -7.7700,
    "lng": 110.4200
  },
  "spesifikasi": {
    "luas_tanah": 100,
    "luas_bangunan": 120,
    "kamar_tidur": 2,
    "kamar_mandi": 1,
    "carport": 1,
    "tahun_dibangun": 2020
  },
  "gambar": [
    "https://url-foto-1.jpg",
    "https://url-foto-2.jpg"
  ],
  "deskripsi": "Tulis deskripsi properti di sini."
}
```

Jangan lupa **koma** di akhir objek properti sebelumnya jika ini bukan entri pertama/terakhir dalam array.

### Referensi Field

| Field | Wajib | Keterangan |
|---|---|---|
| `id` | Ya | Unik, tanpa spasi. Dipakai di URL (`detail.html?id=...`) |
| `nama` | Ya | Judul properti |
| `kategori` | Ya | Harus sama persis dengan salah satu isi array `"kategori"` di atas |
| `status` | Ya | `"Dijual"` atau `"Disewa"` — mengubah tampilan harga (`/ bulan` otomatis muncul untuk Disewa) |
| `harga` | Ya | Angka murni tanpa titik/koma, contoh: `890000000` |
| `stok` | Ya | `true` = tersedia, `false` = tampil badge "Terjual/Tersewa" dan tombol WA nonaktif |
| `lokasi.alamat` | Ya | Teks alamat, ikut dicari saat user mengetik di kolom pencarian |
| `lokasi.lat` / `lokasi.lng` | Ya | Koordinat untuk peta — lihat bagian 5 |
| `spesifikasi.*` | Tidak | Isi `null` untuk field yang tidak relevan (misal tanah kosong tidak punya kamar tidur) — field `null` otomatis disembunyikan di halaman detail |
| `gambar` | Ya | Array URL gambar. Gambar pertama jadi foto sampul di katalog |
| `deskripsi` | Ya | Paragraf bebas, tampil di halaman detail |

Setelah disimpan, refresh browser — properti baru langsung muncul di katalog tanpa mengubah kode apa pun.

## 4. Menghapus atau Menonaktifkan Properti

- **Sembunyikan dari daftar tapi simpan datanya**: set `"stok": false`.
- **Hapus permanen**: hapus seluruh objek `{ ... }` milik properti tersebut dari array `produk`.

## 5. Mendapatkan Koordinat Lokasi (lat/lng)

1. Buka [Google Maps](https://maps.google.com), cari lokasi properti.
2. Klik kanan pada titik lokasi persis → koordinat (misal `-7.7180, 110.3990`) akan muncul di menu.
3. Klik untuk menyalin, lalu pisahkan jadi `lat` (angka pertama) dan `lng` (angka kedua) di JSON.

Peta di halaman detail otomatis pakai koordinat ini lewat Google Maps embed — tidak perlu API key.

## 6. Mengubah Kategori

Edit array `"kategori"` di bagian atas `properti.json`:

```json
"kategori": ["Semua", "Rumah", "Apartemen", "Tanah", "Ruko", "Gudang"]
```

`"Semua"` wajib tetap ada di posisi pertama (tab default). Pastikan field `kategori` pada tiap properti cocok persis (case-sensitive) dengan salah satu nilai di array ini.

## 7. Mengubah Info Toko / Nomor WhatsApp

Masih di `properti.json`, bagian atas:

```json
"toko": {
  "nama": "Wisma Griya",
  "tagline": "Properti pilihan di area Yogyakarta dan sekitarnya",
  "whatsapp": "6281234567890"
}
```

Format nomor WhatsApp: kode negara tanpa `+` atau `0` di depan (contoh: `08123456789` ditulis `6281234567890`).

## 8. Mengganti Gambar

- Gambar diambil langsung dari URL (bisa dari Unsplash, atau upload sendiri ke layanan seperti [Cloudinary](https://cloudinary.com), [ImgBB](https://imgbb.com), atau folder `gambar/` di proyek ini jika file lokal).
- **Pakai gambar lokal**: buat folder `gambar/`, taruh file di sana, lalu isi field `gambar` dengan path relatif, contoh: `"gambar/rumah-01.jpg"`.
- Urutan array `gambar` menentukan urutan thumbnail di galeri detail; item pertama jadi foto sampul di katalog.

## 9. Bagaimana Routing Detail Bekerja (Tanpa Framework)

- `index.html` merender kartu sebagai link ke `detail.html?id=prop001`.
- `detail.js` membaca parameter `id` dari URL dengan `URLSearchParams`, mencari properti yang cocok di `properti.json`, lalu merender kontennya lewat JavaScript.
- Karena itu **satu file `detail.html`** cukup untuk semua properti — tidak perlu membuat halaman baru setiap menambah listing.

## 10. Kustomisasi Tampilan

Semua warna dan ukuran radius diatur lewat CSS variable di baris atas `style.css`:

```css
:root {
  --navy: #1f2b3a;        /* warna header & aksen utama */
  --terracotta: #b8623f;  /* warna harga & badge status */
  --pasir: #f3efe6;       /* warna latar sekunder */
  --radius: 6px;          /* kelengkungan sudut kartu/tombol */
}
```

Ubah nilai hex di sini untuk mengganti skema warna di seluruh halaman sekaligus. Font diatur lewat Google Fonts (`Fraunces` untuk judul, `Public Sans` untuk teks) — ganti link `<link>` di `<head>` tiap file HTML jika ingin font lain.

## 11. Deploy ke Hosting Statis

Pilih salah satu (semua gratis, tanpa server, tanpa konfigurasi build):

| Platform | Cara Deploy | Cocok Untuk |
|---|---|---|
| **Netlify Drop** | Drag-and-drop folder di [app.netlify.com/drop](https://app.netlify.com/drop) | Paling cepat, tanpa akun git |
| **Cloudflare Pages** | Hubungkan repo GitHub, auto-deploy tiap push | Update rutin lewat git |
| **Vercel** | Import repo GitHub lewat dashboard Vercel | Update rutin lewat git |
| **GitHub Pages** | Push ke repo, aktifkan Pages di Settings → Pages | Sudah pakai GitHub |

### Update Setelah Live

- **Netlify Drop**: upload ulang seluruh folder setiap ada perubahan.
- **Cloudflare Pages / Vercel / GitHub Pages (via git)**: cukup `git commit` + `git push` perubahan `properti.json` — situs otomatis update dalam hitungan detik/menit.

## 12. Troubleshooting

| Masalah | Penyebab Umum | Solusi |
|---|---|---|
| Halaman kosong, konsol menunjukkan error `fetch` | Membuka file lewat `file://` langsung | Jalankan local server (lihat bagian 2), atau upload ke hosting |
| Properti baru tidak muncul | Format JSON rusak (kurang koma, kurung tidak seimbang) | Validasi JSON di [jsonlint.com](https://jsonlint.com) sebelum upload |
| Klik kartu tidak membuka detail yang benar | `id` di JSON tidak unik atau ada duplikat | Pastikan setiap properti punya `id` yang berbeda |
| Peta tidak muncul di halaman detail | `lat`/`lng` kosong atau salah format | Pastikan keduanya berupa angka, bukan teks berkutip ganda seperti `"−7.71"` |
| Gambar tidak tampil | URL gambar salah/private, atau path lokal salah | Cek URL bisa dibuka langsung di tab browser baru |
| Tombol WhatsApp tidak membuka chat | Nomor WA salah format | Gunakan format `62` di depan tanpa `+` atau `0` |

## 13. Checklist Sebelum Publish

- [ ] Semua nomor WhatsApp dan info toko sudah data asli, bukan contoh
- [ ] Semua koordinat lokasi sudah dicek di Google Maps
- [ ] Tidak ada properti dengan `id` duplikat
- [ ] `properti.json` sudah divalidasi (tidak ada syntax error)
- [ ] Dicoba di local server dan tampil normal sebelum di-deploy


# TO DO LIST

1. terapkan system font jadi gaperlu ambil dari eksternal dependency
2. perbaiki vulnerability di innerHTML
3. tambahkan security headers
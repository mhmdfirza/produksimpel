const konten = document.getElementById('konten-detail');

function formatRupiah(angka) {
    return 'Rp' + angka.toLocaleString('id-ID');
}

function labelHarga(properti) {
    const harga = formatRupiah(properti.harga);
    return properti.status === 'Disewa' ? `${harga} / bulan` : harga;
}

function linkWhatsApp(nomor, namaProperti) {
    const pesan = encodeURIComponent(`Halo, saya tertarik dengan properti "${namaProperti}". Boleh minta informasi lebih lanjut?`);
    return `https://wa.me/${nomor}?text=${pesan}`;
}

function linkPetaEmbed(lat, lng) {
    return `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
}

function linkPetaEksternal(lat, lng) {
    return `https://www.google.com/maps?q=${lat},${lng}`;
}

function baris(label, nilai) {
    if (nilai === null || nilai === undefined) return '';
    return `<div class="spek-baris"><span>${label}</span><strong>${nilai}</strong></div>`;
}

function render(properti, whatsappToko) {
    document.getElementById('tab-title').textContent = `${properti.nama} — Wisma Griya`;

    const galeriThumb = properti.gambar.map((src, i) => `
    <button class="thumb ${i === 0 ? 'aktif' : ''}" data-src="${src}">
      <img src="${src}" alt="Foto ${i + 1} ${properti.nama}">
    </button>
  `).join('');

    konten.innerHTML = `
    <div class="detail-galeri">
      <div class="galeri-utama">
        <img id="gambar-utama" src="${properti.gambar[0]}" alt="${properti.nama}">
        ${!properti.stok ? `<span class="badge-habis">Terjual / Tersewa</span>` : ''}
      </div>
      <div class="galeri-thumb">${galeriThumb}</div>
    </div>

    <div class="detail-info">
      <span class="badge-status badge-status--statik">${properti.status}</span>
      <h1>${properti.nama}</h1>
      <p class="lokasi-detail">${properti.lokasi.alamat}</p>
      <p class="harga harga--besar">${labelHarga(properti)}</p>

      <div class="spek-grid">
        ${baris('Luas tanah', properti.spesifikasi.luas_tanah ? properti.spesifikasi.luas_tanah + ' m²' : null)}
        ${baris('Luas bangunan', properti.spesifikasi.luas_bangunan ? properti.spesifikasi.luas_bangunan + ' m²' : null)}
        ${baris('Kamar tidur', properti.spesifikasi.kamar_tidur)}
        ${baris('Kamar mandi', properti.spesifikasi.kamar_mandi)}
        ${baris('Carport', properti.spesifikasi.carport)}
        ${baris('Tahun dibangun', properti.spesifikasi.tahun_dibangun)}
      </div>

      <h2>Deskripsi</h2>
      <p class="deskripsi">${properti.deskripsi}</p>

      <h2>Lokasi</h2>
      <div class="peta-bungkus">
        <iframe
          src="${linkPetaEmbed(properti.lokasi.lat, properti.lokasi.lng)}"
          width="100%" height="300" style="border:0"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade">
        </iframe>
      </div>
      <a class="tautan-peta" href="${linkPetaEksternal(properti.lokasi.lat, properti.lokasi.lng)}" target="_blank" rel="noopener">
        Buka lokasi di Google Maps ↗
      </a>

      <a class="tombol-pesan tombol-pesan--besar ${!properti.stok ? 'nonaktif' : ''}"
         href="${properti.stok ? linkWhatsApp(whatsappToko, properti.nama) : '#'}"
         target="_blank" rel="noopener">
        ${properti.stok ? 'Hubungi via WhatsApp' : 'Properti tidak tersedia'}
      </a>
    </div>
  `;

    // Ganti gambar utama saat thumbnail diklik
    document.querySelectorAll('.thumb').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('gambar-utama').src = btn.dataset.src;
            document.querySelectorAll('.thumb').forEach(b => b.classList.remove('aktif'));
            btn.classList.add('aktif');
        });
    });
}

async function init() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        konten.innerHTML = `<p class="kosong">Properti tidak ditemukan. <a href="index.html">Kembali ke katalog</a>.</p>`;
        return;
    }

    try {
        const res = await fetch('properti.json');
        if (!res.ok) throw new Error('Gagal memuat data properti');
        const data = await res.json();

        const properti = data.produk.find(p => p.id === id);
        if (!properti) {
            konten.innerHTML = `<p class="kosong">Properti tidak ditemukan. <a href="index.html">Kembali ke katalog</a>.</p>`;
            return;
        }

        render(properti, data.toko.whatsapp);
    } catch (err) {
        konten.innerHTML = `<p class="kosong">Terjadi kesalahan memuat detail properti.</p>`;
        console.error(err);
    }
}

init();

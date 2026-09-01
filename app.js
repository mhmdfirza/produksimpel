const grid = document.getElementById('grid');
const kosong = document.getElementById('kosong');
const kategoriTabs = document.getElementById('kategori-tabs');
const inputCari = document.getElementById('cari');

let data = null;
let kategoriAktif = 'Semua';

function formatRupiah(angka) {
  return 'Rp' + angka.toLocaleString('id-ID');
}

function linkWhatsApp(nomor, namaProduk) {
  const pesan = encodeURIComponent(`Halo, saya mau tanya soal produk "${namaProduk}".`);
  return `https://wa.me/${nomor}?text=${pesan}`;
}

function renderKategori() {
  kategoriTabs.innerHTML = '';
  data.kategori.forEach(kat => {
    const btn = document.createElement('button');
    btn.className = 'tab' + (kat === kategoriAktif ? ' aktif' : '');
    btn.textContent = kat;
    btn.addEventListener('click', () => {
      kategoriAktif = kat;
      renderKategori();
      renderProduk();
    });
    kategoriTabs.appendChild(btn);
  });
}

function renderProduk() {
  const kataKunci = inputCari.value.trim().toLowerCase();

  const hasil = data.produk.filter(p => {
    const cocokKategori = kategoriAktif === 'Semua' || p.kategori === kategoriAktif;
    const cocokKata = p.nama.toLowerCase().includes(kataKunci) ||
                       p.deskripsi.toLowerCase().includes(kataKunci);
    return cocokKategori && cocokKata;
  });

  grid.innerHTML = '';
  kosong.hidden = hasil.length > 0;

  hasil.forEach(p => {
    const kartu = document.createElement('article');
    kartu.className = 'kartu';
    kartu.innerHTML = `
      <div class="kartu-gambar">
        <img src="${p.gambar}" alt="${p.nama}" loading="lazy">
        ${!p.stok ? '<span class="badge-habis">Stok habis</span>' : ''}
      </div>
      <div class="kartu-isi">
        <h3>${p.nama}</h3>
        <p>${p.deskripsi}</p>
        <span class="harga">${formatRupiah(p.harga)}</span>
        <a class="tombol-pesan ${!p.stok ? 'nonaktif' : ''}"
           href="${p.stok ? linkWhatsApp(data.toko.whatsapp, p.nama) : '#'}"
           target="_blank" rel="noopener">
          ${p.stok ? 'Pesan via WhatsApp' : 'Habis'}
        </a>
      </div>
    `;
    grid.appendChild(kartu);
  });
}

async function init() {
  try {
    const res = await fetch('products.json');
    if (!res.ok) throw new Error('Gagal memuat data produk');
    data = await res.json();

    document.getElementById('toko-nama').textContent = data.toko.nama;
    document.getElementById('toko-tagline').textContent = data.toko.tagline;

    renderKategori();
    renderProduk();

    inputCari.addEventListener('input', renderProduk);
  } catch (err) {
    grid.innerHTML = `<p class="kosong">Terjadi kesalahan memuat produk. Pastikan file products.json ada.</p>`;
    console.error(err);
  }
}

init();

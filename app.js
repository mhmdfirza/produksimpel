const grid = document.getElementById('grid');
const kosong = document.getElementById('kosong');
const kategoriTabs = document.getElementById('kategori-tabs');
const inputCari = document.getElementById('cari');

let data = null;
let kategoriAktif = 'Semua';

function formatRupiah(angka) {
  return 'Rp' + angka.toLocaleString('id-ID');
}

function labelHarga(properti) {
  const harga = formatRupiah(properti.harga);
  return properti.status === 'Disewa' ? `${harga} / bulan` : harga;
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
      p.lokasi.alamat.toLowerCase().includes(kataKunci);
    return cocokKategori && cocokKata;
  });

  grid.innerHTML = '';
  kosong.hidden = hasil.length > 0;

  hasil.forEach(p => {
    const kartu = document.createElement('a');
    kartu.className = 'kartu';
    kartu.href = `detail.html?id=${p.id}`;
    kartu.innerHTML = `
      <div class="kartu-gambar">
        <img src="${p.gambar[0]}" alt="${p.nama}" loading="lazy">
        ${!p.stok ? '<span class="badge-habis">Terjual / Tersewa</span>' : ''}
        <span class="badge-status">${p.status}</span>
      </div>
      <div class="kartu-isi">
        <h3>${p.nama}</h3>
        <p class="lokasi-ringkas">${p.lokasi.alamat}</p>
        <div class="spek-ringkas">
          ${p.spesifikasi.luas_bangunan ? `<span>${p.spesifikasi.luas_bangunan} m²</span>` : ''}
          ${p.spesifikasi.kamar_tidur ? `<span>${p.spesifikasi.kamar_tidur} KT</span>` : ''}
          ${p.spesifikasi.kamar_mandi ? `<span>${p.spesifikasi.kamar_mandi} KM</span>` : ''}
        </div>
        <span class="harga">${labelHarga(p)}</span>
      </div>
    `;
    grid.appendChild(kartu);
  });
}

async function init() {
  try {
    const res = await fetch('properti.json');
    if (!res.ok) throw new Error('Gagal memuat data properti');
    data = await res.json();

    document.getElementById('toko-nama').textContent = data.toko.nama;
    document.getElementById('toko-tagline').textContent = data.toko.tagline;

    renderKategori();
    renderProduk();

    inputCari.addEventListener('input', renderProduk);
  } catch (err) {
    grid.innerHTML = `<p class="kosong">Terjadi kesalahan memuat properti. Pastikan file properti.json ada.</p>`;
    console.error(err);
  }
}

init();

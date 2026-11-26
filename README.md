# Jelajah Geopark Labuan

Webapp permainan pendidikan untuk meneroka 25 lokasi Geopark Labuan melalui peta sebenar, perjalanan mengikut laluan, misi dan pasport digital.

Nama repositori: **geopark**. Cadangan nama produk: **Jejak Geopark Labuan**.

## Ciri

- Satu peta Leaflet: 11 Geotapak (pink), 4 Biotapak (biru), 10 Tapak Budaya (hijau).
- Mod Jelajah 2D memenuhi ruang pelayar, avatar, penanda destinasi dan kawalan ikut penjelajah.
- Laluan pejalan kaki dan kenderaan daripada OSRM / OpenStreetMap.
- Nisbah masa 3:1; 60 minit anggaran perjalanan menjadi 20 minit permainan.
- Perjalanan berterusan selepas halaman ditutup, dengan jeda, sambung dan batal.
- Ganjaran 10 XP bagi setiap 10 minit masa permainan yang bergerak; masa dijeda atau menunggu bas tidak dikira.
- Kedai XP: berjalan kaki percuma, bas 150 XP, motor 300 XP, kereta 500 XP.
- Bot biasa (cadangan 400 XP) dan VIP (700 XP) dipaparkan tetapi belum boleh dibeli kerana laluan laut belum tersedia.
- 25 misi: 8 cabaran foto, 8 padanan petunjuk dan 9 kuiz; ganjaran 100 XP sekali bagi setiap lokasi.
- Galeri 70 foto, 25 kad penemuan, 8 lencana, pemandu Jejak dan sijil selepas 25 misi lengkap.
- Nama/avatar, pembelian dan kemajuan disimpan pada pelayar. Eksport/import pasport untuk sandaran atau pertukaran peranti.

## Jalankan secara setempat

Tiada proses build atau API key diperlukan untuk aplikasi semasa.

```sh
python3 -m http.server 3000 --directory dist
```

Buka `http://localhost:3000/`. Gunakan pelayan HTTP; jangan buka `index.html` sebagai fail terus kerana aplikasi menggunakan modul JavaScript dan `fetch`.

## Semakan

Memerlukan Node.js 22 atau lebih baharu.

```sh
npm test
```

Semakan menguji ekonomi XP, masa perjalanan, penggabungan ganjaran tanpa duplikasi, cabaran, pencapaian, sijil, data lokasi dan rujukan aset setempat. Ujian tidak membuat panggilan rangkaian.

## GitHub Pages

Workflow `.github/workflows/pages.yml` menyemak projek dan menerbitkan **dist/** apabila branch `main` dikemas kini.

1. Di repositori, buka **Settings → Pages**.
2. Pilih **GitHub Actions** sebagai sumber penerbitan.
3. Push ke `main` atau jalankan workflow **Deploy GitHub Pages** melalui tab Actions.
4. Selepas workflow berjaya, alamat projek ini ialah `https://KHAN7-gif.github.io/geopark/`.

Semua rujukan aset menggunakan laluan relatif untuk menyokong subdirektori `/geopark/`. Workflow tidak memerlukan token peribadi dalam kod atau repository secrets.

## Struktur

- `dist/` — aplikasi statik yang diterbitkan.
- `dist/locations.json` — lokasi, maklumat, foto dan definisi cabaran.
- `dist/app.js` — antara muka, peta dan keadaan permainan.
- `dist/*-engine.mjs` — peraturan perjalanan, ganjaran, cabaran, lencana, panduan dan sijil.
- `dist/transport-shop.mjs` — inventori serta harga pengangkutan.
- `tests/` — ujian Node.js tanpa kebergantungan tambahan.
- `third-party/` — lesen pustaka pihak ketiga.

## Data dan perkhidmatan

Maklumat serta foto lokasi dirujuk daripada [Labuan Geopark](https://labuangeopark.com/boundaries-map). Setiap entri foto mengekalkan URL sumbernya dalam `locations.json`. Kredit turut dipaparkan dalam aplikasi.

Peta memerlukan sambungan internet ke OpenStreetMap. Pengiraan laluan menggunakan pelayan awam OSRM dan perkhidmatan laluan kaki routing.openstreetmap.de; perkhidmatan ini boleh tidak tersedia atau mempunyai had penggunaan. Aplikasi tidak menghasilkan laluan rekaan jika perkhidmatan gagal. Anggaran kereta tidak menggunakan trafik langsung. Kadar berjalan kaki, bas dan motor dilabel sebagai andaian permainan; bas jelajah tidak mewakili jadual bas awam.

Kemajuan setempat tidak dikongsi secara automatik antara domain Sites, GitHub Pages dan localhost. **Eksport pasport daripada domain lama dan import ke domain baharu** untuk meneruskan permainan. Sijil ialah pencapaian permainan, bukan pengesahan lawatan fizikal.

Lihat [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) untuk sumber pustaka dan aset. Metadata pengehosan Sites serta sejarah repositori dalaman tidak dimasukkan dalam eksport ini.

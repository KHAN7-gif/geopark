# Jelajah Geopark Labuan

Webapp permainan pendidikan untuk meneroka 25 lokasi Geopark Labuan melalui peta sebenar, perjalanan mengikut laluan, misi dan pasport digital.

Nama repositori: **geopark**. Cadangan nama produk: **Jejak Geopark Labuan**.

## Ciri

- Info destinasi dan pemasa boleh dibuka/disorok secara berasingan melalui tab kecil. Mod Fokus melapangkan peta dengan menyembunyikan HUD besar, radar dan dock; butang Pulih UI, baki masa serta Jeda kekal tersedia. Pilihan disimpan setempat.
- Bunyi sintesis asal untuk bertolak dan tiba, dengan tetapan senyap dan Uji bunyi dalam Menu. Audio hanya diaktifkan selepas interaksi pengguna yang dibenarkan pelayar; ketibaan ketika membuka semula halaman tidak dijadualkan sebagai bunyi tertunda.
- Skrin utama permainan memenuhi pelayar: dunia peta, HUD pemain dan dock Misi / 3D / Pasport / Kedai. Menu dibuka sebagai lapisan; tiada dashboard panjang untuk ditatal.
- Satu peta Leaflet: 11 Geotapak (pink), 4 Biotapak (biru), 10 Tapak Budaya (hijau).
- Antara muka sinematik berwarna arang, hijau mineral dan emas, dengan foto lokasi sebenar.
- Mod Jelajah 2D memenuhi ruang pelayar, avatar, penanda destinasi dan kawalan ikut penjelajah.
- HUD perjalanan: peta mini OpenStreetMap, kedudukan penjelajah, baki jarak sepanjang laluan, arah kompas, kadar perjalanan anggaran dan baki XP. Peta mini dipadam apabila keluar daripada mod jelajah.
- Mod Jelajah 3D percubaan: peta MapLibre boleh dicondong dan diputar, jubin OpenStreetMap, ketinggian Mapzen / AWS Terrarium pada skala sebenar 1×, pin lokasi serta laluan/penjelajah yang sama.
- Peta 3D lanjutan: latar satelit Esri World Imagery atau peta jalan OSM, kamera Dekat / Dron / Orbit, penjejakan kamera secara lancar dan mod grafik Auto / Jimat / Tinggi. Auto mengehadkan resolusi mengikut maklumat peranti yang tersedia. Pilihan disimpan secara setempat. Satelit ialah imejan permukaan, bukan bangunan fotogrametri atau imejan langsung.
- Auto Labuan mengikuti waktu matahari tempatan dan cuaca semasa: pemerhatian METAR WBKL melalui snapshot berkala, dengan anggaran model Open-Meteo sebagai gantian. Paparan menyatakan sumber dan masa laporan; data lewat lebih 90 minit tidak digunakan sebagai cuaca semasa.
- Pilihan cahaya manual Siang / Senja / Malam kekal tersedia. Tekan Ikut waktu Labuan dalam Menu untuk kembali ke Auto. Kesan awan / hujan mengikuti laporan; kilatan hanya apabila kod ribut hadir, boleh dimatikan dan tidak mengenal pasti sambaran sebenar. Tetapan kurangkan gerakan menghentikan kilatan.
- Bangunan mempunyai lapan variasi warna fasad dan enam warna bumbung. Pokok menggunakan gaya ilustrasi berdaun lebar, rimbun dan palma, dengan variasi hijau. Warna dan gaya tumbuhan bukan bancian rupa sebenar setiap objek. Laut berwarna lebih cerah, termasuk pada waktu malam.
- Garis pantai OSM dibundel sebagai 6 rangka pulau tertutup, dengan topeng air yang mengecualikan daratan. Warna laut, buih pesisir, ombak perlahan, penanda misi 3D, kanopi pokok berlapis dan bumbung berwarna menambah suasana. Kesan bergerak dihentikan dalam mod ringan atau apabila tetapan peranti mengurangkan gerakan.
- Suasana 3D: 2,189 tapak bangunan OSM diekstrusi, 22 kawasan hijau, 110 pokok dipetakan dan 420 pokok ilustrasi dalam kawasan hijau tersebut. Snapshot OSM: 26 November 2026. Sebahagian ketinggian bangunan ialah anggaran visual; lihat Info suasana 3D.
- Model penjelajah berjalan serta bas/motor/kereta mengikut pengangkutan yang dimiliki. Kamera dekat mengikuti laluan sebenar; seretan peta menghentikan ikutan dan Lihat laluan kembali kepada pandangan keseluruhan. Suasana boleh dimatikan untuk peranti yang lebih ringan.
- 3D dimuatkan apabila dipilih, memerlukan WebGL dan internet. Jika grafik gagal, 2D dipulihkan tanpa mengubah pemasa atau kemajuan. Data ketinggian yang gagal dimuatkan dinyatakan pada paparan; tiada bukit, jalan atau bangunan rekaan ditambah.
- Laluan pejalan kaki dan kenderaan daripada OSRM / OpenStreetMap.
- Nisbah masa 3:1; 60 minit anggaran perjalanan menjadi 20 minit permainan.
- Perjalanan berterusan selepas halaman ditutup, dengan jeda, sambung dan batal.
- Ganjaran 10 XP bagi setiap 5 minit masa permainan yang bergerak; masa dijeda atau menunggu bas tidak dikira.
- Log jarak kilometer mengikut jalan kaki, bas, motor, kereta dan bot. Perjalanan berbilang mod dikira berasingan, termasuk bahagian berjalan kaki; data lama tanpa laluan tidak dianggarkan semula. Log disertakan dalam eksport/import pasport tanpa pendua.
- Pilihan destinasi: darat menyokong jalan kaki / bas / motor / kereta; bot untuk antara pulau, jalan kaki di pulau yang sama. Hutan Kinabenuwa (B1) dan Permatang Labuan (G9) menggunakan aturan laluan berjalan kaki masuk/keluar sebelum atau selepas kenderaan. Laluan pindahan mesti disahkan oleh OSRM; jika tiada, gabungan kenderaan tidak dimulakan.
- Kedai XP: berjalan kaki percuma, bas 150 XP, motor 300 XP, kereta 500 XP.
- Bot biasa (cadangan 400 XP) dan VIP (700 XP) dipaparkan tetapi belum boleh dibeli kerana laluan laut belum tersedia.
- 25 misi: 8 cabaran foto, 8 padanan petunjuk dan 9 kuiz; ganjaran 100 XP sekali bagi setiap lokasi.
- Galeri 70 foto, 25 kad penemuan, 8 lencana, pemandu Jejak dan sijil selepas 25 misi lengkap.
- Nama/avatar, pembelian dan kemajuan disimpan pada pelayar. Eksport/import pasport untuk sandaran atau pertukaran peranti.

Jika Pages ditetapkan kepada penerbitan daripada cabang `main` / root, halaman akar turut menghala ke `dist/` supaya pautan utama tetap membuka permainan. GitHub Actions menerbitkan kandungan `dist/` terus ke akar.

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

## Data suasana Labuan

`dist/environment/labuan.geojson` ialah pangkalan data terbitan OpenStreetMap berlesen ODbL 1.0, dengan ID sumber bagi setiap ciri. Metadata dan nota anggaran: `dist/environment/metadata.json`. Bangunan tanpa tag ketinggian ditunjukkan setinggi 6 m; tag tingkat menggunakan anggaran 3.1 m setiap tingkat. Pokok berbentuk ilustrasi; kedudukan pokok tambahan hanya di dalam poligon kawasan hijau OSM. Model watak/kenderaan ialah ilustrasi permainan, bukan imbasan objek sebenar.

Penukar snapshot: `python3 scripts/prepare-environment.py /path/to/overpass.json`. Aplikasi menggunakan fail setempat yang dibundel; ia tidak menghantar pertanyaan Overpass semasa dimainkan. Kamera, model dan suasana tidak mengubah pemasa, harga XP atau lokasi misi. Model dan jubin peta memerlukan WebGL2; peta 2D serta penanda avatar menjadi pilihan gantian jika grafik gagal.

## Kemas kini cuaca

`.github/workflows/weather.yml` mengambil laporan WBKL setiap 15 minit (jadual GitHub boleh lewat) dan menerbitkan `weather.json` pada cabang berasingan `weather-data`. Kod aplikasi serta rekod pemain tidak diubah. Klien membaca snapshot itu dengan CORS dan mencuba API Open-Meteo jika snapshot tiada / lewat. Cache cuaca dikemas kini berkala; laporan lama tidak dipaparkan sebagai hujan atau ribut semasa.

Skrip pengumpul menggunakan Python urllib untuk sambungan HTTP dan modul JavaScript yang sama untuk pengesahan laporan. Keadaan stesen mewakili lapangan terbang / kawasan Labuan; ia tidak menjamin cuaca seragam di setiap tapak. Ombak, warna laut, spesies pokok dan kilatan visual ialah ilustrasi permainan, bukan ukuran laut atau pengesan petir.

# Sumber dan komponen pihak ketiga

- **Leaflet 1.9.4** — https://leafletjs.com/ — BSD 2-Clause. Salinan lesen: `third-party/leaflet-LICENSE.txt`.
- **Leaflet.markercluster 1.5.3** — https://github.com/Leaflet/Leaflet.markercluster — MIT. Salinan lesen: `third-party/markercluster-LICENSE.txt`.
- **MapLibre GL JS 5.6.2** — https://maplibre.org/ — BSD 3-Clause dan komponen berlesen lain seperti dalam `third-party/maplibre-LICENSE.txt`.
- **Terrain Tiles / Mapzen / AWS Open Data** — https://registry.opendata.aws/terrain-tiles/ — data ketinggian Terrarium, termasuk sumber SRTM di Labuan. Atribusi: https://github.com/tilezen/joerd/blob/master/docs/attribution.md. Bukan data bangunan 3D atau imejan langsung.
- **Three.js 0.180.0** — https://threejs.org/ — MIT. Salinan lesen: `third-party/three-LICENSE.txt`. Model penjelajah/kenderaan dibina khas daripada geometri asas; tiada model Sketchbook disalin.
- **Garis pantai** — `dist/environment/shoreline.geojson`, terbitan © OpenStreetMap contributors, ODbL 1.0. Garis asal diambil melalui API OSM pada 26 November 2026. Metadata dalam `shoreline-metadata.json`; warna air dan ombak ialah ilustrasi aplikasi.
- **Pangkalan data suasana Labuan** — `dist/environment/labuan.geojson`, terbitan © OpenStreetMap contributors, berlesen [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/). Metadata, cap masa, ID sumber dan nota anggaran dibundel bersama data.
- **Esri World Imagery** — https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer — latar satelit dimuatkan daripada perkhidmatan asal. Kredit perkhidmatan: Esri, Vantor, Earthstar Geographics, and the GIS User Community. Atribusi dipaparkan dalam peta; imejan tidak dibundel atau dilesenkan semula oleh aplikasi.
- **Cuaca stesen WBKL** — https://aviationweather.gov/data/api/ — laporan METAR melalui NOAA Aviation Weather Center; sumber dan masa laporan dipaparkan dalam aplikasi.
- **Open-Meteo** — https://open-meteo.com/ — data cuaca anggaran model sebagai gantian, atribusi CC BY 4.0. Terma dan butiran data: https://open-meteo.com/en/terms.
- **OpenStreetMap** — https://www.openstreetmap.org/copyright — data peta dan laluan tertakluk kepada atribusi serta syarat penggunaan penyedianya. Atribusi dipaparkan pada peta.
- **OSRM** — https://project-osrm.org/ — perkhidmatan pengiraan laluan. Perkhidmatan awam tidak menjamin ketersediaan atau trafik langsung.
- **Routing kaki** — https://routing.openstreetmap.de/ — digunakan untuk laluan pejalan kaki.
- **Foto dan fakta lokasi** — https://labuangeopark.com/ — foto kekal milik pemegang hak masing-masing. Sumber asal setiap foto disimpan dalam `dist/locations.json`; kredit dipaparkan dalam galeri. Foto pihak ketiga tidak diberi lesen semula sebagai sebahagian kod projek.
- **Fon DM Sans dan Manrope** — dimuatkan melalui Google Fonts; setiap keluarga tertakluk kepada lesen sumbernya. Aplikasi mempunyai fon gantian jika fon luar tidak tersedia.

Avatar, ilustrasi Jejak dan templat sijil disertakan sebagai aset aplikasi. Tiada lesen keseluruhan repositori ditetapkan dalam eksport ini; lesen komponen dan aset pihak ketiga kekal berkuat kuasa.

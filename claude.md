WarisanBudaya: Warisan Budaya Virtual

WarisanBudaya adalah prototipe aplikasi web multimedia interaktif yang menyajikan pameran budaya dari 10 provinsi di Indonesia dalam bentuk Virtual Gallery 3D. Aplikasi ini dirancang sebagai media edukasi berbasis Metaverse yang ringan dan dapat diakses langsung melalui peramban web (browser).

Fitur Utama

Eksplorasi 3D First-Person: Pengguna dapat berjalan-jalan dan melihat sekeliling di dalam museum virtual layaknya bermain game dengan menggunakan keyboard (W, A, S, D) dan mouse.

Galeri 10 Provinsi: Menampilkan pameran budaya (arsitektur, busana, senjata pusaka, falsafah, dan landmark pariwisata) dari 10 provinsi pilihan:

Aceh, Sumatera Barat, DKI Jakarta, Jawa Barat, DI Yogyakarta, Jawa Timur, Bali, Kalimantan Timur, Sulawesi Selatan, dan Papua.

Audio Narator Otomatis (Text-to-Speech): Saat pengguna mendekati sebuah objek pajangan (exhibit), sistem secara otomatis akan membacakan informasi dan sejarah terkait objek tersebut menggunakan suara.

Desain Web Responsif: Antarmuka (User Interface) utama website dirancang agar tetap responsif dan nyaman dibaca di berbagai ukuran layar sebelum memasuki mode museum 3D.

Arsitektur Single-File: Seluruh kode HTML, CSS (Tailwind), dan JavaScript (Three.js & Logika Aplikasi) dirangkum dalam satu file index.html untuk kemudahan penerapan (deployment) dan portabilitas.

Teknologi yang Digunakan

Aplikasi ini dibangun menggunakan teknologi web modern open-source tanpa memerlukan perangkat keras khusus (seperti kacamata VR):

HTML5 & WebGL: Sebagai fondasi kerangka web dan render grafik 3D di peramban.

Tailwind CSS (via CDN): Digunakan untuk mendesain antarmuka pengguna (UI) website utama secara cepat dan responsif.

Three.js: Pustaka JavaScript utama yang digunakan untuk membuat dan merender lingkungan 3D, objek pameran (secara prosedural menggunakan bentuk geometri dasar), pencahayaan, dan kamera.

PointerLockControls (Three.js Addon): Mengizinkan aplikasi mengunci mouse pengguna untuk mengontrol arah pandangan kamera (gaya first-person).

Web Speech API: Teknologi bawaan peramban untuk menghasilkan suara dari teks (Text-to-Speech) sebagai narator museum.

Panduan Menjalankan Proyek Secara Lokal

Proyek ini didesain agar sangat mudah dijalankan tanpa memerlukan pengaturan server lokal yang rumit (seperti Node.js, XAMPP, dsb.). Anda hanya memerlukan peramban web modern (Google Chrome, Mozilla Firefox, Microsoft Edge, atau Safari).

Langkah-langkah:

Siapkan File: Pastikan Anda memiliki file index.html yang berisi seluruh kode aplikasi WarisanBudaya.

Buka di Browser:

Klik dua kali (double-click) file index.html tersebut.

Atau, tarik dan lepas (drag and drop) file index.html ke jendela peramban web yang terbuka.

Mulai Eksplorasi:

Baca informasi pada halaman utama.

Klik tombol "Mulai Eksplorasi 3D" atau "Masuk ke Museum Metaverse".

Ikuti instruksi kontrol yang muncul di layar (W, A, S, D dan Mouse).

Klik pada area layar atau tombol "Klik Di Sini Untuk Lanjutkan Jelajah" untuk mengunci mouse dan mulai berjalan-jalan.

Dekati meja-meja pajangan di dalam ruangan untuk memicu narator audio.

Catatan Keamanan Browser (CORS)

Karena file ini dijalankan langsung dari sistem file lokal (file:///...), beberapa peramban (terutama Chrome) mungkin menerapkan kebijakan keamanan yang ketat (CORS - Cross-Origin Resource Sharing) yang dapat memblokir pemuatan modul JavaScript eksternal (seperti Three.js yang dimuat via CDN dalam importmap).

Jika Anda mendapati layar hitam atau fitur 3D tidak berjalan:

Sangat Direkomendasikan: Gunakan ekstensi Local Web Server sederhana di browser Anda (seperti ekstensi "Web Server for Chrome") atau ekstensi "Live Server" jika Anda menggunakan Visual Studio Code. Buka direktori tempat index.html berada melalui server lokal tersebut (biasanya diakses melalui http://localhost:5500 atau port serupa).

Alternatif: Gunakan peramban Firefox, yang biasanya lebih toleran terhadap modul JavaScript saat membuka file lokal secara langsung.

Struktur Logika Aplikasi (dalam index.html)

Meskipun tergabung dalam satu file, kode ini terstruktur secara logis:

<style>: Memuat pengaturan dasar tampilan website dan antarmuka mode museum (berada di atas kanvas 3D).

<div id="website-ui">: Menampung seluruh konten dan elemen antarmuka halaman beranda (landing page).

<div id="museum-container">: Menampung kanvas Three.js dan elemen UI overlay khusus mode eksplorasi 3D (seperti penunjuk arah, panel instruksi, dan kotak peringatan/piagam).

<script type="module">: Jantung aplikasi. Terbagi menjadi beberapa bagian:

Definisi Data (provincesData): Array of objects yang menyimpan seluruh data konten provinsi (warna, bentuk 3D yang mewakili budaya, teks sejarah).

Sistem Narator (speakText): Fungsi yang memanfaatkan window.speechSynthesis.

Transisi Mode: Fungsi enterMuseumMode dan exitMuseumMode untuk beralih antara tampilan 2D dan 3D.

Inisialisasi Three.js: Pengaturan Scene, Camera, Renderer, dan PointerLockControls.

Pembuatan Dunia 3D (buildLobby, buildProvinceRoom, createLandmarkGeometry): Fungsi-fungsi prosedural untuk merakit ruang lobi, menyusun ruangan galeri provinsi secara dinamis berdasarkan data yang dipilih, dan membuat bentuk geometris primitif yang mewakili objek budaya.

Sistem Interaksi & Render Loop (animate): Memperbarui posisi pemain, mendeteksi kedekatan pemain dengan objek pameran (zona pemicu/ proximity trigger) untuk menampilkan UI/Audio, dan menggambar ulang (render) adegan 3D setiap frame.

Lisensi & Atribusi

Proyek ini merupakan prototipe pendidikan (proof-of-concept).

Audio Latar: Bersumber dari Wikimedia Commons (Gamelan music from Bali).

Pustaka Tiga Dimensi: Menggunakan pustaka open-source Three.js.

Antarmuka Gaya: Menggunakan kerangka kerja utilitas CSS Tailwind CSS.

Dokumentasi ini dibuat untuk memandu eksplorasi prototipe WarisanBudaya.
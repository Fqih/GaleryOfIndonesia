# WarisanBudaya: Warisan Budaya Virtual (React + Three.js)

WarisanBudaya adalah prototipe aplikasi web multimedia interaktif yang menyajikan pameran budaya dari 10 provinsi di Indonesia dalam bentuk Virtual Gallery 3D. Aplikasi ini dirancang sebagai media edukasi berbasis Metaverse yang premium, estetik, ringan, dan dapat diakses langsung melalui peramban web (browser).

## Fitur Utama & Pembaruan Terkini

### 1. Eksplorasi 3D First-Person & Free-Cursor Mode
Pengguna dapat berjalan-jalan dan melihat sekeliling di dalam museum virtual menggunakan keyboard (W, A, S, D) dan mouse. 
- **Pembaruan:** Mengimplementasikan mekanik *Free-Cursor* di mana pengguna dapat menekan `SHIFT` atau `ESC` untuk melepaskan kursor (berubah menjadi Mode Interaksi UI) dan mengklik layar kembali untuk melanjutkan penjelajahan.

### 2. Galeri 10 Provinsi & 3D GLTF Models
Menampilkan pameran budaya (arsitektur, busana, senjata pusaka) dari 10 provinsi pilihan.
- **Pembaruan:** Dukungan pemuatan model 3D berekstensi `.gltf` / `.glb` yang dianimasikan mengapung (melayang) di atas alas pemeran.

### 3. Artifact Inspector (Inspeksi 360 Derajat)
Saat pengguna mendekati objek dan mengkliknya, layar akan transisi ke mode Inspeksi Artefak.
- **Pembaruan:** Menggunakan `OrbitControls` untuk memungkinkan pengguna memutar model artefak secara 360 derajat. Tampilan UI diperbarui menjadi gaya editorial minimalis yang premium (sesuai *Taste-Skill*). Kursor otomatis terkunci kembali saat mode inspeksi ditutup.

### 4. Ambient HUD & Settings Modal
Antarmuka pengguna (UI) dirancang menggunakan prinsip *Glassmorphism* dan gaya mewah namun bersih (Cold Luxury).
- **Ambient HUD (Kanan Atas):** Menyediakan *toggle* cepat untuk mematikan/menghidupkan Musik Latar (BGM), Narator Suara, dan ikon pintu Keluar/Beranda.
- **Settings Modal (Kiri Atas):** Menu pop-up pengaturan untuk menyesuaikan:
  - **Kualitas Grafis** (Mengontrol *PixelRatio* `1.5x` ke `0.75x` untuk performa perangkat rendah).
  - **Kecepatan Langkah** (Mode Santai atau Berlari).
  - **Sensitivitas Kamera** (Sensitivitas *PointerLockControls* dari 0.1x - 2.0x).

### 5. Audio Narator Otomatis (Text-to-Speech)
Sistem pembacaan otomatis menggunakan `Web Speech API` saat pengguna mendekati objek pemeran, dikombinasikan dengan musik latar tradisional.

## Teknologi yang Digunakan (Refactoring)
Proyek ini telah direfaktor dari arsitektur *Single-File HTML* lawas menjadi tumpukan teknologi modern:
- **React.js & Vite:** Kerangka kerja antarmuka komponen yang modular dan server pengembangan super cepat.
- **Tailwind CSS:** Sistem *styling* dengan pendekatan utilitas yang memungkinkan *Glassmorphism* dan *Dark Mode* elegan.
- **Three.js (WebGL):** Mesin rendering 3D utama, didukung oleh ekstensi bawaan seperti `PointerLockControls`, `OrbitControls`, dan `GLTFLoader`.

## Struktur Kode Komponen (src/components)
- `App.jsx`: State utama aplikasi (Landing page vs Museum).
- `Museum3DOverlay.jsx`: Pengendali mesin Three.js, PointerLock, logika pergerakan, benturan (*collision*), HUD Glassmorphism, dan Pemuatan Model.
- `ArtifactInspector.jsx`: Mode inspeksi spesifik untuk memutar objek 3D.
- `Navbar.jsx`, `BerandaTab.jsx`, `KontenTab.jsx`: Ekosistem pendaratan halaman web utama.

---

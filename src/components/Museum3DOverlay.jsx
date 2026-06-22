import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { provincesData } from '../data/provincesData.jsx';
import ArtifactInspector from './ArtifactInspector.jsx';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// Import Core Logic
import { buildLighting, createKawungTexture, createMarbleTexture, createFlutedTexture } from './museum/core/EnvironmentBuilder.js';

// Import Modular UI
import StartScreen from './museum/ui/StartScreen.jsx';
import PauseMenu from './museum/ui/PauseMenu.jsx';
import AmbientHUD from './museum/ui/AmbientHUD.jsx';
import SettingsModal from './museum/ui/SettingsModal.jsx';
import Crosshair from './museum/ui/Crosshair.jsx';
import CutsceneOverlay from './museum/ui/CutsceneOverlay.jsx';

export default function Museum3DOverlay({ 
  onClose, onEnterPortal, isMusicOn, onToggleMusic, onDuckMusic,
  bgVolume, setBgVolume, narratorVolume, setNarratorVolume 
}) {
  const mountRef = useRef(null);
  const controlsRef = useRef(null);
  const nearPortalRef = useRef(null); // Menyimpan portal terdekat tanpa trigger re-render
  const lookAtArtifactRef = useRef(null); // Menyimpan ID artefak yang sedang ditatap

  const [isLocked, setIsLocked] = useState(false);
  const [notification, setNotification] = useState('');
  const [inspectingItem, setInspectingItem] = useState(null); // State untuk layar inspeksi
  
  // Taste-Skill HUD & Flow States
  const [hasStarted, setHasStarted] = useState(false);
  const [isCutscenePlaying, setIsCutscenePlaying] = useState(false);
  const hasStartedRef = useRef(false);
  const cutsceneTlRef = useRef(null); // Menyimpan GSAP Timeline cutscene
  const [isVoiceOn, setIsVoiceOn] = useState(true);

  // Settings States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [graphicsQuality, setGraphicsQuality] = useState('high'); // 'high' | 'low'
  const [moveSpeed, setMoveSpeed] = useState('santai'); // 'santai' (100) | 'cepat' (200)
  const [mouseSensitivity, setMouseSensitivity] = useState(1.0);

  // Refs untuk sinkronisasi nilai ke dalam animasi loop Three.js (tanpa re-render)
  const rendererRef = useRef(null);
  const moveSpeedRef = useRef(100.0);

  // Sinkronisasi Perubahan Settings
  useEffect(() => {
    moveSpeedRef.current = moveSpeed === 'santai' ? 100.0 : 200.0;
  }, [moveSpeed]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.pointerSpeed = mouseSensitivity;
    }
  }, [mouseSensitivity]);

  useEffect(() => {
    if (rendererRef.current) {
      if (graphicsQuality === 'high') {
        rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      } else {
        rendererRef.current.setPixelRatio(0.75); // Resolusi rendah untuk performa
      }
    }
  }, [graphicsQuality]);

  // Ref untuk callback agar tidak stale di dalam useEffect
  const onEnterPortalRef = useRef(onEnterPortal);
  useEffect(() => {
    onEnterPortalRef.current = onEnterPortal;
  }, [onEnterPortal]);

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    // Warna siang yang cerah dan modern (Putih bersih galeri)
    scene.background = new THREE.Color(0xffffff);
    scene.fog = new THREE.FogExp2(0xffffff, 0.012);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 0);
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Optimasi: max 1.5 agar tidak berat di layar 4K/Retina
    renderer.outputColorSpace = THREE.SRGBColorSpace; // Best practice from threejs-textures
    renderer.shadowMap.enabled = true;
    // Kembali menggunakan PCFSoftShadowMap karena VSM bisa gagal di beberapa GPU dan malah menghasilkan sawtooth
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    mountRef.current.appendChild(renderer.domElement);
    
    // Simpan ke ref agar bisa diakses oleh Settings (Resolusi)
    rendererRef.current = renderer;

    // 2. Lights (Setup Natural Daylight & Volumetric)
    buildLighting(scene);

    // 3. Architecture & Textures (Procedural White Marble & Batik Kawung Emboss)
    const kawungBump = createKawungTexture();
    kawungBump.repeat.set(24, 4); 

    const marbleTex = createMarbleTexture(renderer);

    const flutedBump = createFlutedTexture();
    flutedBump.repeat.set(1, 1);

    const createdPlaqueTextures = [];
    const createPlaqueTexture = (text) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024; canvas.height = 256;
      const ctx = canvas.getContext('2d');

      // Latar belakang plat gelap
      ctx.fillStyle = '#222222';
      ctx.fillRect(0, 0, 1024, 256);

      // Border emas tipis
      ctx.strokeStyle = '#ffcc00';
      ctx.lineWidth = 12;
      ctx.strokeRect(6, 6, 1012, 244);

      // Teks emas super terang
      ctx.fillStyle = '#ffea00';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 96px "Times New Roman", serif';
      // Efek cahaya (Glow) di sekeliling teks agar lebih mencolok
      ctx.shadowColor = '#ffea00';
      ctx.shadowBlur = 15;
      ctx.fillText(text.toUpperCase(), 512, 128);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      createdPlaqueTextures.push(tex);
      return tex;
    };

    // Floor (White Marble with reflection)
    // Kembali menggunakan PlaneGeometry kotak raksasa (batas akan tertutup dinding bundar). 
    // Alasan: CircleGeometry memiliki struktur potongan segitiga (pizza) yang berpusat di tengah,
    // yang mana hal ini 100% memicu kedipan bayangan ekstrem berbentuk bintang!
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTex,
      roughness: 0.15,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Walls (Panel Klasik dengan Relief Indonesia: White-on-white)
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xfafafa, // Off-white agar cahaya bisa memantul natural
      roughness: 0.7,
      metalness: 0.05,
      bumpMap: kawungBump,
      bumpScale: 0.05, // Relief ukiran halus (white-on-white)
      side: THREE.BackSide // Merender bagian dalam dari tabung
    });
    // Dinding Melingkar (Cylinder) agar menempel rapat dan mengikuti lengkungan 38 portal
    // KRUSIAL: openEnded = true (parameter ke-6) SANGAT WAJIB agar silinder tidak memiliki 
    // tutup atas (top cap) yang diam-diam bertabrakan/Z-fighting secara masif dengan atap (Y=20)!
    const wallGeo = new THREE.CylinderGeometry(25.1, 25.1, 20, 64, 1, true);
    // MATIKAN RECEIVE SHADOW PADA DINDING: Dinding melingkar raksasa (CylinderGeometry) rentan 
    // terhadap cacat bayangan (shadow acne & aliasing) akibat sudut datang DirectionalLight
    // dari atas, dan dapat dikira sebagai bayangan atap yang turun.

    // Atap (Ceiling): Plafon Tinggi dengan Skylight (Coffered ceiling)
    // KRUSIAL: Gunakan DoubleSide agar plafon tidak hilang/transparan jika dilihat dari bawah!
    const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1.0, side: THREE.DoubleSide }); // Putih matte

    // 4 Bagian plafon menyisakan celah skylight di tengah (skylight diperkecil menjadi 20x20)
    // SOLUSI SAMA SEPERTI LANTAI: Menggunakan PlaneGeometry murni agar tidak ada ketebalan (Box) 
    // yang menyebabkan Z-fighting (kedipan agresif) dengan dinding dan skylight.
    // KRUSIAL: Plafon TIDAK BOLEH receiveShadow karena cahaya datang dari PUNGGUNGNYA (atas),
    // sehingga memicu shadow acne ekstrem jika dipaksa mengevaluasi shadow map!
    const ceilN = new THREE.Mesh(new THREE.PlaneGeometry(60, 20), ceilingMat);
    ceilN.rotation.x = -Math.PI / 2; // Menghadap ke BAWAH
    ceilN.position.set(0, 20, -20);
    ceilN.frustumCulled = false; // Mencegah plafon tiba-tiba hilang/berkedip saat pinggirannya keluar layar
    scene.add(ceilN);

    const ceilS = new THREE.Mesh(new THREE.PlaneGeometry(60, 20), ceilingMat);
    ceilS.rotation.x = -Math.PI / 2;
    ceilS.position.set(0, 20, 20);
    ceilS.frustumCulled = false;
    scene.add(ceilS);

    const ceilE = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), ceilingMat);
    ceilE.rotation.x = -Math.PI / 2;
    ceilE.position.set(20, 20, 0);
    ceilE.frustumCulled = false;
    scene.add(ceilE);

    const ceilW = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), ceilingMat);
    ceilW.rotation.x = -Math.PI / 2;
    ceilW.position.set(-20, 20, 0);
    ceilW.frustumCulled = false;
    scene.add(ceilW);

    // Kaca Skylight Geometris di tengah
    const skylightGeo = new THREE.PlaneGeometry(20, 20);
    // Optimasi: Menggunakan MeshStandardMaterial biasa (tanpa transmission yang makan performa render 2x lipat)
    const skylightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // Kaca bening
      transparent: true,
      opacity: 0.2,
      roughness: 0.1,
      metalness: 0.5
    });
    const skylight = new THREE.Mesh(skylightGeo, skylightMat);
    skylight.rotation.x = Math.PI / 2;
    skylight.position.set(0, 20, 0);
    scene.add(skylight);

    const circularWall = new THREE.Mesh(wallGeo, wallMat);
    circularWall.position.set(0, 10, 0); // Di tengah ruangan, menyelimuti
    circularWall.receiveShadow = false; // Mematikan bayangan untuk dinding yang menyebabkan flickering
    scene.add(circularWall);

    // Pillars (Tiang Penopang Emas dengan Tekstur Alur Romawi/Fluted)
    const pillarGeo = new THREE.CylinderGeometry(1.2, 1.2, 20, 32); // Segmen dikurangi dari 64 ke 32
    const pillarBaseGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.6, 32);
    // Optimasi: Menggunakan StandardMaterial untuk menghindari kalkulasi clearcoat yang berat
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0xffd700, // Warna Emas Mewah
      bumpMap: flutedBump, // Menggunakan tekstur alur Romawi
      bumpScale: 0.15, // Kedalaman tekstur alur
      roughness: 0.25,
      metalness: 0.8 // Sangat metalik agar memantulkan god rays
    });

    // Posisi tiang disesuaikan dengan ruangan yang lebih kecil
    const pillarRadius = 10;
    const gapIndices = [4.5, 14.5, 23.5, 33.5]; // Celah di antara 38 karpet
    const pillarPositions = gapIndices.map(gapIndex => {
      const angle = (gapIndex / 38) * Math.PI * 2;
      return {
        x: Math.sin(angle) * pillarRadius,
        z: -Math.cos(angle) * pillarRadius
      };
    });

    pillarPositions.forEach(pos => {
      // Badan Tiang Utama
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(pos.x, 10, pos.z);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      scene.add(pillar);

      // Fondasi Bawah Tiang
      const baseBottom = new THREE.Mesh(pillarBaseGeo, pillarMat);
      baseBottom.position.set(pos.x, 0.3, pos.z);
      baseBottom.castShadow = true;
      baseBottom.receiveShadow = true;
      scene.add(baseBottom);

      // Kepala Tiang (Capital) menempel ke atap
      const baseTop = new THREE.Mesh(pillarBaseGeo, pillarMat);
      baseTop.position.set(pos.x, 19.7, pos.z);
      baseTop.castShadow = true;
      baseTop.receiveShadow = true;
      scene.add(baseTop);
    });

    // ----------------------------------------------------
    // Etalase Pameran Pusat (Pedestals & Glass Cases)
    // ----------------------------------------------------
    const pedestalGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    // Kita gunakan marbleTex untuk pedestal agar senada dengan lantai/gapura
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      map: marbleTex,
      roughness: 0.6,
      metalness: 0.1
    });

    // Kaca etalase (menggunakan material skylight yang sudah ada)
    const glassCaseGeo = new THREE.BoxGeometry(1.0, 1.2, 1.0);
    glassCaseGeo.translate(0, 0.6, 0); // Pivot point di bawah

    // Objek Artefak Abstrak di dalam kaca
    const artifactGeo1 = new THREE.OctahedronGeometry(0.3);
    const artifactGeo2 = new THREE.TorusKnotGeometry(0.2, 0.05, 64, 8);
    const artifactGeo3 = new THREE.IcosahedronGeometry(0.3);
    const artifactGeo4 = new THREE.TetrahedronGeometry(0.35);

    // Optimasi: Gunakan StandardMaterial dan Emissive agar terlihat menyala tanpa butuh PointLight
    const artifactMat = new THREE.MeshStandardMaterial({
      color: 0xffd700, // Emas murni
      metalness: 1.0,
      roughness: 0.2,
      emissive: 0xffd700,
      emissiveIntensity: 0.2
    });

    // === INISIALISASI GLTF & DRACO LOADER ===
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    dracoLoader.preload();

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    const pedestalPositions = [
      { x: 5, z: 5, id: 1 },
      { x: -5, z: 5, id: 2 },
      { x: 5, z: -5, id: 3 },
      { x: -5, z: -5, id: 4 }
    ];

    const artifacts = [];
    const interactableCases = []; // Array khusus untuk kotak kaca yang bisa diklik

    pedestalPositions.forEach(pos => {
      const group = new THREE.Group();
      group.position.set(pos.x, 0, pos.z);

      // Dudukan (Pedestal)
      const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
      pedestal.position.y = 0.6; // Setengah tingginya agar rata lantai
      pedestal.castShadow = true;
      pedestal.receiveShadow = true;
      group.add(pedestal);

      // Kotak Kaca
      const glassCase = new THREE.Mesh(glassCaseGeo, skylightMat);
      glassCase.position.y = 1.2; // Mulai dari atas pedestal
      glassCase.userData = { isArtifact: true, id: pos.id }; // Tag kotak kaca untuk Raycaster
      group.add(glassCase);
      interactableCases.push(glassCase);

      // Grup Rotasi Artefak (Kosong, akan menampung model saat selesai diload)
      const artifactWrapper = new THREE.Group();
      artifactWrapper.position.y = 1.8; // Melayang di tengah kaca
      group.add(artifactWrapper);

      // Load model GLB secara asinkron
      gltfLoader.load(
        `/models/item${pos.id}.glb`,
        (gltf) => {
          const model = gltf.scene;

          // Aktifkan bayangan untuk seluruh mesh dalam model
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          // Kalkulasi ukuran dan titik tengah untuk Auto-Scaling & Centering
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());

          // Skala agar muat di dalam kotak kaca yang ukurannya 1.2 meter
          const maxDim = Math.max(size.x, size.y, size.z);
          // Berikan margin (0.8 meter) agar tidak mentok menembus kaca
          const scaleFactor = 0.6 / maxDim;
          model.scale.setScalar(scaleFactor);

          // Geser model agar titik tengahnya berada persis di 0,0,0
          // Wajib dikalikan scaleFactor karena translasi dalam Three.js tidak terpengaruh oleh Scale object itu sendiri
          model.position.set(
            -center.x * scaleFactor,
            -center.y * scaleFactor,
            -center.z * scaleFactor
          );

          artifactWrapper.add(model);
        },
        undefined,
        (error) => {
          console.warn(`Gagal memuat item${pos.id}.glb (pastikan file ada di public/models):`, error);
        }
      );

      scene.add(group);

      // Memasukkan wrapper kosong ke array agar tetap bisa dirotasi oleh animasi loop utama
      artifacts.push(artifactWrapper);
    });

    // Floating Dust Particles
    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 500; // Jumlah partikel dikurangi drastis
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 60; // Spread across 60x60x60
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.08, // Sedikit lebih kecil
      color: 0xaaaaaa,
      transparent: true,
      opacity: 0.3, // Lebih transparan agar halus
      blending: THREE.AdditiveBlending
    });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    particlesMesh.position.y = 10;
    scene.add(particlesMesh);

    // 4. Portals
    const portals = [];
    // Portal menyerupai pintu (persegi panjang)
    const doorWidth = 1.6;
    const doorHeight = 3.2;
    const portalSurfaceGeo = new THREE.PlaneGeometry(doorWidth, doorHeight);

    // Bingkai Pintu (Kusen emas)
    const frameGeo = new THREE.BoxGeometry(doorWidth + 0.2, doorHeight + 0.2, 0.1);
    // Geser pusat kusen agar sejajar dengan posisi z
    frameGeo.translate(0, 0, -0.05);

    // 38 Portal membentuk Lingkaran Raksasa mengelilingi tengah ruangan
    // Red Carpet Material
    const carpetMat = new THREE.MeshStandardMaterial({
      color: 0x8b0000, // Dark Red / Merah Marun
      roughness: 0.9,
      metalness: 0.0
    });

    // Frame Material (Solusi sama seperti lantai: gunakan MeshStandardMaterial)
    // Menghapus PhysicalMaterial dan clearcoat agar tidak ada artefak bayangan ganda
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xffd700, // Gold frame
      metalness: 1.0,
      roughness: 0.2
    });

    // Gapura (Archway) Material & Geometries (Diinstansiasi di luar loop)
    const gapuraMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTex,
      roughness: 0.4,
      metalness: 0.1
    });
    // Tiang penyangga gapura (kiri & kanan)
    const gapuraPillarGeo = new THREE.BoxGeometry(0.5, 3.8, 0.4);
    // Kepala gapura (menonjol ke samping dan ke depan)
    const gapuraLintelGeo = new THREE.BoxGeometry(3.2, 0.8, 0.6);
    // Geometri papan nama (Plaque) 
    const plaqueGeo = new THREE.PlaneGeometry(2.4, 0.6);

    // Karpet Persegi Tengah (Mengelilingi ke-4 tiang, tepat di bawah skylight)
    const centerCarpetGeo = new THREE.PlaneGeometry(20, 20); // Diperkecil menyesuaikan ruangan
    const centerCarpet = new THREE.Mesh(centerCarpetGeo, carpetMat);
    centerCarpet.rotation.x = -Math.PI / 2;
    centerCarpet.position.set(0, 0.02, 0); // Sedikit di atas lantai (0), di bawah karpet lorong (0.05)
    centerCarpet.receiveShadow = true;
    scene.add(centerCarpet);

    // Karpet memanjang dari tengah ke pinggir ruangan
    const carpetGeo = new THREE.PlaneGeometry(1.2, 23);
    // Kita ubah origin Plane Geometry agar rotasinya langsung dari pusat (0,0)
    carpetGeo.translate(0, 11.5, 0);

    // === DEKORASI DINDING: Banners (Umbul-umbul) ===
    const createBannerTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256; canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      // Merah di atas (Proporsi 1/3)
      ctx.fillStyle = '#cc0000';
      ctx.fillRect(0, 0, 256, 341);
      // Putih di bawah (Proporsi 2/3)
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 341, 256, 683);
      // Tambahkan motif lis emas di pinggir
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 16;
      ctx.strokeRect(8, 8, 240, 1008);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    const bannerTex = createBannerTexture();
    const bannerGeo = new THREE.PlaneGeometry(1.5, 8);
    const bannerPoleGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.8, 8);
    bannerPoleGeo.rotateZ(Math.PI / 2); // Horizontal
    const bannerMat = new THREE.MeshStandardMaterial({
      map: bannerTex,
      roughness: 0.9,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    // === DEKORASI LORONG KARPET ===
    const stanchionGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.9, 8);
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.9 });
    const floorLampGeo = new THREE.CylinderGeometry(0.1, 0.15, 1.2, 12);
    const lampGlowGeo = new THREE.SphereGeometry(0.15, 12, 12);
    const lampGlowMat = new THREE.MeshStandardMaterial({ color: 0xffddaa, emissive: 0xffddaa, emissiveIntensity: 2 });

    // === BINGKAI GAMBAR (Picture Frames) ===
    const picFrameMat = new THREE.MeshStandardMaterial({
      color: 0xffaa00, // Emas klasik yang lebih cerah
      roughness: 0.35, // Sedikit membaurkan cahaya agar tidak terlihat hitam
      metalness: 0.6,  // Metalik namun tidak sepenuhnya seperti cermin
      bumpMap: flutedBump, // Memberikan tekstur alur/ukiran
      bumpScale: 0.05
    });

    const radius = 25; // Jari-jari penempatan portal di ruangan yang diperkecil
    const totalPortals = provincesData.length; // 38 Daerah
    const positions = [];

    provincesData.forEach((prov, i) => {
      // Hitung posisi sudut (Angle) melingkar
      const angle = (i / totalPortals) * Math.PI * 2;
      const posX = Math.sin(angle) * radius;
      const posZ = -Math.cos(angle) * radius;

      // Rotasi portal menghadap ke tengah ruangan (0,0)
      const rotY = -angle;

      // Posisi pintu menyentuh lantai (pusat y ada di setengah tinggi pintu)
      positions.push({ x: posX, y: doorHeight / 2, z: posZ, rotY: rotY });

      // Pasang karpet merah untuk setiap portal!
      const carpet = new THREE.Mesh(carpetGeo, carpetMat);
      carpet.rotation.x = -Math.PI / 2;
      // Rotasi mengarah ke sudut portal
      carpet.rotation.z = -angle;
      carpet.position.set(0, 0.05, 0); // Semua bermula dari pusat (0,0)
      carpet.receiveShadow = true;
      scene.add(carpet);

      // === TAMBAHAN DEKORASI DINDING: Banners (Umbul-umbul) ===
      // Tempatkan banner di tengah-tengah antara portal ini dan portal berikutnya
      const bannerAngle = angle + (Math.PI / totalPortals);
      // Agar menempel pas di dinding melingkar (radius 25.1), kita letakkan di radius 24.9 agar tidak Z-fighting
      const bX = Math.sin(bannerAngle) * 24.9;
      const bZ = -Math.cos(bannerAngle) * 24.9;

      const bannerGroup = new THREE.Group();
      bannerGroup.position.set(bX, 12, bZ); // Ketinggian y=12 (di paruh atas dinding)
      bannerGroup.rotation.y = -bannerAngle; // Menghadap lurus ke pusat ruangan

      const banner = new THREE.Mesh(bannerGeo, bannerMat);
      bannerGroup.add(banner);

      const bannerPoleMesh = new THREE.Mesh(bannerPoleGeo, frameMat); // Tiang gantung emas
      bannerPoleMesh.position.y = 4.0; // Menempel di puncak banner
      bannerGroup.add(bannerPoleMesh);

      scene.add(bannerGroup);

      // Spotlight menyorot bendera dari atas depan
      const spotLight = new THREE.SpotLight(0xfff5b6, 80.0); // Warna kuning hangat museum, intensitas kuat
      // Posisi spotlight: Lebih maju dari dinding (radius 21) dan lebih tinggi (y=18)
      const lightX = Math.sin(bannerAngle) * 21;
      const lightZ = -Math.cos(bannerAngle) * 21;
      spotLight.position.set(lightX, 18, lightZ);

      spotLight.angle = Math.PI / 7; // Sudut kerucut sorotan yang fokus
      spotLight.penumbra = 0.8; // Tepi pendaran cahaya sangat halus (soft)
      spotLight.distance = 20; // Jangkauan maksimal cahaya
      spotLight.decay = 2; // Redaman cahaya realistis

      // Mengarahkan sorotan tepat ke spanduk
      spotLight.target = bannerGroup;

      scene.add(spotLight);

      // === TAMBAHAN DEKORASI DINDING: Bingkai Gambar (Picture Frames) ===
      // Ditambahkan di sela-sela tiap pintu, selang-seling 1 (i % 2 === 0)
      if (i % 2 === 0) {
        const frameGroup = new THREE.Group();
        // Menempel di dinding (menggunakan bX, bZ dari banner), dipasang di eye-level (y=5)
        frameGroup.position.set(bX, 5, bZ);
        frameGroup.rotation.y = -bannerAngle; // Searah dengan banner

        // Tentukan gambar mana yang dipakai (1 sampai 4 berulang)
        const imgIndex = (i / 2) % 4 + 1;

        // Buat material kanvas individual
        const canvasMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.8
        });

        // Bingkai emas (menggunakan material khusus agar warnanya muncul cerah)
        const picFrame = new THREE.Mesh(new THREE.BufferGeometry(), picFrameMat);
        frameGroup.add(picFrame);

        // Kanvas lukisan
        const picCanvas = new THREE.Mesh(new THREE.BufferGeometry(), canvasMat);
        picCanvas.position.z = 0.02; // Berada di dalam rongga kedalaman bingkai
        frameGroup.add(picCanvas);

        scene.add(frameGroup);

        // Muat gambar secara asinkron
        new THREE.TextureLoader().load(`/gallery/gambar${imgIndex}.jpg`, (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          canvasMat.map = texture;
          canvasMat.needsUpdate = true;

          // Sesuaikan rasio bingkai agar pas dengan orientasi gambar asli
          const aspect = texture.image.width / texture.image.height;
          const targetHeight = 3.2; // Mempertahankan tinggi konstan
          const targetWidth = targetHeight * aspect;

          // --- MEMBUAT FRAME BERONGGA DENGAN BEVEL (Classic Ornate Frame) ---
          const shape = new THREE.Shape();
          const frameThickness = 0.25; // Ketebalan kayu bingkai

          // Batas luar bingkai
          shape.moveTo(-targetWidth / 2 - frameThickness, -targetHeight / 2 - frameThickness);
          shape.lineTo(targetWidth / 2 + frameThickness, -targetHeight / 2 - frameThickness);
          shape.lineTo(targetWidth / 2 + frameThickness, targetHeight / 2 + frameThickness);
          shape.lineTo(-targetWidth / 2 - frameThickness, targetHeight / 2 + frameThickness);
          shape.lineTo(-targetWidth / 2 - frameThickness, -targetHeight / 2 - frameThickness);

          // Batas dalam (lubang kanvas)
          const hole = new THREE.Path();
          hole.moveTo(-targetWidth / 2, -targetHeight / 2);
          hole.lineTo(targetWidth / 2, -targetHeight / 2);
          hole.lineTo(targetWidth / 2, targetHeight / 2);
          hole.lineTo(-targetWidth / 2, targetHeight / 2);
          hole.lineTo(-targetWidth / 2, -targetHeight / 2);
          shape.holes.push(hole);

          const extrudeSettings = {
            depth: 0.05, // Ketebalan bingkai ke depan
            bevelEnabled: true,
            bevelSegments: 3,
            steps: 1,
            bevelSize: 0.06, // Lebar lengkungan (ukiran pinggir)
            bevelThickness: 0.06 // Maju/mundurnya lengkungan
          };

          // Terapkan geometri baru
          picFrame.geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
          picCanvas.geometry = new THREE.PlaneGeometry(targetWidth, targetHeight);
        });
      }

      // === TAMBAHAN DEKORASI LORONG: Lampu Berdiri & Tiang Antrean (Stanchions) ===

      // 1. Dua Lampu Berdiri (Obor Modern) mengapit pintu di dekat portal (R = 23.5)
      const lampR = 23.5;
      const lampW = 1.0; // Jarak/Lebar dari titik tengah karpet
      [-1, 1].forEach(side => {
        const w = lampW * side;
        // Hitung koordinat X dan Z yang tegak lurus dengan sudut karpet
        const lX = Math.sin(angle) * lampR + Math.cos(angle) * w;
        const lZ = -Math.cos(angle) * lampR + Math.sin(angle) * w;

        const stand = new THREE.Mesh(floorLampGeo, frameMat); // Menggunakan material emas dari pintu
        stand.position.set(lX, 0.6, lZ); // Tinggi silinder 1.2, maka pusat y = 0.6
        stand.castShadow = true;
        scene.add(stand);

        const glow = new THREE.Mesh(lampGlowGeo, lampGlowMat);
        glow.position.set(lX, 1.25, lZ); // Menempel di ujung atas penyangga
        scene.add(glow);
      });

      // 2. Tiang Antrean & Tali Beludru (Stanchions) membingkai pinggir karpet
      const stR1 = 15;
      const stR2 = 21;
      const stW = 0.8; // Lebar tiang dari tepi karpet
      [-1, 1].forEach(side => {
        const w = stW * side;

        // Tiang 1 (Dekat ke tengah ruangan)
        const s1X = Math.sin(angle) * stR1 + Math.cos(angle) * w;
        const s1Z = -Math.cos(angle) * stR1 + Math.sin(angle) * w;
        const st1 = new THREE.Mesh(stanchionGeo, frameMat);
        st1.position.set(s1X, 0.45, s1Z);
        st1.castShadow = true;
        scene.add(st1);

        // Tiang 2 (Dekat ke pintu portal)
        const s2X = Math.sin(angle) * stR2 + Math.cos(angle) * w;
        const s2Z = -Math.cos(angle) * stR2 + Math.sin(angle) * w;
        const st2 = new THREE.Mesh(stanchionGeo, frameMat);
        st2.position.set(s2X, 0.45, s2Z);
        st2.castShadow = true;
        scene.add(st2);

        // Tali Melengkung (Velvet Rope) menghubungkan Tiang 1 dan Tiang 2
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(s1X, 0.85, s1Z), // Ujung atas tiang 1
          new THREE.Vector3((s1X + s2X) / 2, 0.3, (s1Z + s2Z) / 2), // Tali melengkung gravitasi ke bawah (Y=0.3)
          new THREE.Vector3(s2X, 0.85, s2Z)  // Ujung atas tiang 2
        ]);
        const tubeGeo = new THREE.TubeGeometry(curve, 12, 0.025, 8, false);
        const rope = new THREE.Mesh(tubeGeo, ropeMat);
        rope.castShadow = true;
        scene.add(rope);
      });

      const portalGroup = new THREE.Group();

      // Main Portal Glow Surface (Diubah menjadi Kaca Gelap Memantul)
      const pMat = new THREE.MeshStandardMaterial({
        color: 0x050505, // Hitam / abu-abu sangat gelap
        roughness: 0.05, // Sangat licin
        metalness: 0.95, // Sangat reflektif seperti cermin/kaca gedung
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95
      });
      const portalSurface = new THREE.Mesh(portalSurfaceGeo, pMat);
      // MUNDURKAN SEDIKIT portalSurface (-0.05) agar TIDAK Z-FIGHTING dengan kusen (frame) di z=0
      portalSurface.position.z = -0.05;
      portalGroup.add(portalSurface);

      // Bingkai (Kusen) Pintu
      const frame = new THREE.Mesh(frameGeo, frameMat); // Menggunakan material dari luar loop
      portalGroup.add(frame);

      // Gapura Marmer Putih (Archway Klasik/Majapahit style)
      // Tiang Kiri
      // Tidak menerima shadow agar bumpMap tidak menyebabkan cross-hatching
      const leftPillar = new THREE.Mesh(gapuraPillarGeo, gapuraMat);
      leftPillar.position.set(-1.15, 0.3, 0.1); // Berada tepat di luar bingkai
      leftPillar.castShadow = true;
      portalGroup.add(leftPillar);

      // Tiang Kanan
      const rightPillar = new THREE.Mesh(gapuraPillarGeo, gapuraMat);
      rightPillar.position.set(1.15, 0.3, 0.1);
      rightPillar.castShadow = true;
      portalGroup.add(rightPillar);

      // Kepala Gapura (Melintang di atas tiang)
      const lintel = new THREE.Mesh(gapuraLintelGeo, gapuraMat);
      lintel.position.set(0, 2.6, 0.2); // Bertumpu di atas tiang dan menonjol ke depan
      lintel.castShadow = true;
      portalGroup.add(lintel);

      // Papan Nama Emas (Plaque) menempel di tengah lintel gapura
      const plaqueTex = createPlaqueTexture(prov.name);
      // Menggunakan emissive agar plat nama memancarkan cahaya (self-illuminated)
      // sehingga warna emas tulisan selalu terang menyala dari sudut pandang manapun
      const plaqueMat = new THREE.MeshStandardMaterial({
        map: plaqueTex,
        roughness: 0.2,
        metalness: 0.9,
        emissive: 0xffffff,
        emissiveMap: plaqueTex,
        emissiveIntensity: 0.5
      });
      const plaque = new THREE.Mesh(plaqueGeo, plaqueMat);
      // Letakkan sedikit di depan permukaan lintel (kedalaman 0.6, titik pusat 0.2 -> depan = 0.5)
      plaque.position.set(0, 2.6, 0.51);
      portalGroup.add(plaque);

      // (PointLight dihapus dari sini untuk mencegah penurunan FPS drastis akibat limit cahaya)

      const pos = positions[i];
      portalGroup.position.set(pos.x, pos.y, pos.z);
      portalGroup.rotation.y = pos.rotY;

      portalGroup.userData = { id: prov.id, name: prov.name, basePosY: pos.y, frameRef: frame };
      scene.add(portalGroup);
      portals.push(portalGroup);
    });

    const raycaster = new THREE.Raycaster();
    const centerScreen = new THREE.Vector2(0, 0);

    // 5. Controls
    const controls = new PointerLockControls(camera, document.body);
    controls.pointerSpeed = mouseSensitivity; // Ambil nilai awal dari state
    controlsRef.current = controls;

    const onLock = () => setIsLocked(true);
    const onUnlock = () => setIsLocked(false);
    controls.addEventListener('lock', onLock);
    controls.addEventListener('unlock', onUnlock);

    // ==========================================
    // 6. CUTSCENE GSAP TIMELINE
    // ==========================================
    const lookTarget = new THREE.Vector3(0, 2, -10);
    const tl = gsap.timeline({ paused: true });

    // Starting Point (High angle wide shot)
    tl.set(camera.position, { x: 0, y: 15, z: 25 });
    tl.set(lookTarget, { x: 0, y: 5, z: 0 });

    // 0s - 8s: Panning awal dan Typography (Fade in/out dari UI)
    tl.to(camera.position, { x: 0, y: 3, z: 12, duration: 8, ease: "power2.inOut" }, 0);
    tl.to(lookTarget, { x: 0, y: 4, z: 0, duration: 8, ease: "power2.inOut" }, 0);

    // 9s - 18s: Menyorot ke arah banner / area tengah
    tl.to(camera.position, { x: -18, y: 6, z: 5, duration: 9, ease: "power2.inOut" }, 9);
    tl.to(lookTarget, { x: 0, y: 6, z: 0, duration: 9, ease: "power2.inOut" }, 9);

    // 19s - 26s: Menyorot 4 artefak bergantian
    if (pedestalPositions.length >= 4) {
      for(let i=0; i<4; i++) {
        const pos = pedestalPositions[i];
        const startTime = 19 + (i * (7/4)); // durasi 7 detik dibagi 4
        tl.to(camera.position, { x: pos.x * 0.7, y: 3.5, z: pos.z * 0.7, duration: 7/4, ease: "power1.inOut" }, startTime);
        tl.to(lookTarget, { x: pos.x, y: 2.5, z: pos.z, duration: 7/4, ease: "power1.inOut" }, startTime);
      }
    }

    // 27s - selesai: Menyorot Pintu / Portals (Melihat sekeliling)
    tl.to(camera.position, { x: 0, y: 2, z: 0, duration: 4, ease: "power2.inOut" }, 27);
    tl.to(lookTarget, { x: 15, y: 2, z: -15, duration: 2, ease: "power1.inOut" }, 27);
    tl.to(lookTarget, { x: 15, y: 2, z: 15, duration: 2, ease: "power1.inOut" }, 29);
    tl.to(lookTarget, { x: -15, y: 2, z: 15, duration: 2, ease: "power1.inOut" }, 31);
    tl.to(lookTarget, { x: -15, y: 2, z: -15, duration: 2, ease: "power1.inOut" }, 33);
    // Kembali ke posisi natural
    tl.to(lookTarget, { x: 0, y: 2, z: -10, duration: 3, ease: "power2.out" }, 35);

    tl.eventCallback("onUpdate", () => {
      camera.lookAt(lookTarget);
    });

    cutsceneTlRef.current = tl;

    // ==========================================
    // END CUTSCENE
    // ==========================================

    const onMouseDown = (event) => {
      if (!controls.isLocked) return;
      if (event.button === 0) {
        if (nearPortalRef.current !== null) {
          if (onEnterPortalRef.current) onEnterPortalRef.current(nearPortalRef.current.userData.id);
        } else if (lookAtArtifactRef.current !== null) {
          controls.unlock();
          setInspectingItem(lookAtArtifactRef.current);
        }
      }
    };
    document.addEventListener('mousedown', onMouseDown);

    // Movement & Physics state
    const moveState = { forward: false, backward: false, left: false, right: false };
    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();
    let canJump = false;

    const onKeyDown = (e) => {
      const k = (e.key || '').toLowerCase();
      const c = e.code || '';

      if (k === 'w' || c === 'KeyW' || c === 'ArrowUp') moveState.forward = true;
      if (k === 's' || c === 'KeyS' || c === 'ArrowDown') moveState.backward = true;
      if (k === 'a' || c === 'KeyA' || c === 'ArrowLeft') moveState.left = true;
      if (k === 'd' || c === 'KeyD' || c === 'ArrowRight') moveState.right = true;

      if ((k === ' ' || c === 'Space') && canJump) {
        velocity.y += 15;
        canJump = false;
      }

      // Taste-Skill: Shift Toggle for Free-Cursor UI Mode
      if ((k === 'shift' || c === 'ShiftLeft' || c === 'ShiftRight') && hasStartedRef.current) {
        if (controlsRef.current.isLocked) {
          controlsRef.current.unlock();
        } else {
          controlsRef.current.lock();
        }
      }
    };

    const onKeyUp = (e) => {
      const k = (e.key || '').toLowerCase();
      const c = e.code || '';

      if (k === 'w' || c === 'KeyW' || c === 'ArrowUp') moveState.forward = false;
      if (k === 's' || c === 'KeyS' || c === 'ArrowDown') moveState.backward = false;
      if (k === 'a' || c === 'KeyA' || c === 'ArrowLeft') moveState.left = false;
      if (k === 'd' || c === 'KeyD' || c === 'ArrowRight') moveState.right = false;
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // 6. Animation Loop
    let previousTime = performance.now();
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const currentTime = performance.now();
      let delta = (currentTime - previousTime) / 1000;
      previousTime = currentTime;
      const time = currentTime / 1000;

      if (delta > 0.1) delta = 0.1;

      particlesMesh.rotation.y = time * 0.05;

      artifacts.forEach(art => {
        art.rotation.y += delta * 0.5;
        art.rotation.x += delta * 0.2;
      });

      portals.forEach((p, idx) => {
        p.position.y = p.userData.basePosY;
      });

      if (controls.isLocked) {
        // 1. Friction (Exponential Damping)
        const damping = Math.exp(-10.0 * delta);
        velocity.x *= damping;
        velocity.z *= damping;
        velocity.y -= 50.0 * delta; // Gravity

        // 2. Determine Camera Forward and Right in World Space
        const camEuler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
        const pureYawEuler = new THREE.Euler(0, camEuler.y, 0, 'YXZ');
        const forwardDir = new THREE.Vector3(0, 0, -1).applyEuler(pureYawEuler).normalize();
        const rightDir = new THREE.Vector3(1, 0, 0).applyEuler(pureYawEuler).normalize();

        // 3. Accumulate Global Movement Intent from Keyboard
        direction.set(0, 0, 0);
        if (moveState.forward) direction.add(forwardDir);
        if (moveState.backward) direction.sub(forwardDir);
        if (moveState.right) direction.add(rightDir);
        if (moveState.left) direction.sub(rightDir);
        if (direction.lengthSq() > 0) direction.normalize();

        // 4. Apply Force to Global Velocity
        if (moveState.forward || moveState.backward || moveState.left || moveState.right) {
          const speedMultiplier = moveSpeedRef.current;
          velocity.addScaledVector(direction, speedMultiplier * delta);
        }

        // 5. Update Position
        camera.position.x += velocity.x * delta;
        camera.position.z += velocity.z * delta;
        camera.position.y += velocity.y * delta;

        const pos = camera.position;

        if (pos.y < 2) {
          velocity.y = 0;
          pos.y = 2;
          canJump = true;
        }

        if (pos.y > 18) {
          velocity.y = 0;
          pos.y = 18;
        }

        // Outer Wall Collision (Sliding)
        const distFromCenter = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
        if (distFromCenter > 23.5) {
          const factor = 23.5 / distFromCenter;
          pos.x *= factor;
          pos.z *= factor;

          const nx = -pos.x / distFromCenter;
          const nz = -pos.z / distFromCenter;
          const dot = velocity.x * nx + velocity.z * nz;
          if (dot < 0) { // Moving outward against the wall
            velocity.x -= dot * nx;
            velocity.z -= dot * nz;
          }
        }

        // Pillar Collision (Sliding)
        pillarPositions.forEach(pillarPos => {
          const dx = pos.x - pillarPos.x;
          const dz = pos.z - pillarPos.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < 2.0 && dist > 0) {
            const overlap = 2.0 - dist;
            const nx = dx / dist;
            const nz = dz / dist;
            pos.x += nx * overlap;
            pos.z += nz * overlap;
            
            const dot = velocity.x * nx + velocity.z * nz;
            if (dot < 0) { // Moving toward pillar
              velocity.x -= dot * nx;
              velocity.z -= dot * nz;
            }
          }
        });

        // Pedestal Collision (Sliding)
        pedestalPositions.forEach(pedPos => {
          const dx = pos.x - pedPos.x;
          const dz = pos.z - pedPos.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < 1.4 && dist > 0) {
            const overlap = 1.4 - dist;
            const nx = dx / dist;
            const nz = dz / dist;
            pos.x += nx * overlap;
            pos.z += nz * overlap;
            
            const dot = velocity.x * nx + velocity.z * nz;
            if (dot < 0) { // Moving toward pedestal
              velocity.x -= dot * nx;
              velocity.z -= dot * nz;
            }
          }
        });

        let nearestPortal = null;
        let minDistance = 4;

        for (const p of portals) {
          const dist = pos.distanceTo(p.position);
          if (dist < minDistance) {
            minDistance = dist;
            nearestPortal = p;
          }
        }

        nearPortalRef.current = nearestPortal;

        raycaster.setFromCamera(centerScreen, camera);
        // Cek objek apa saja yang kena sinar dari array interactableCases (kaca etalase)
        const intersects = raycaster.intersectObjects(interactableCases, false);
        
        let targetArtifactId = null;
        if (intersects.length > 0 && intersects[0].distance < 6.0) {
          targetArtifactId = intersects[0].object.userData.id;
        }
        lookAtArtifactRef.current = targetArtifactId;

        const newNotif = nearestPortal
          ? 'Klik Kiri untuk Masuk Portal'
          : (targetArtifactId ? 'Klik Kiri untuk Inspeksi Artefak' : '');

        setNotification(prev => prev !== newNotif ? newNotif : prev);
      } else {
        if (notification !== '') setNotification('');
      }

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('mousedown', onMouseDown);
      controls.removeEventListener('lock', onLock);
      controls.removeEventListener('unlock', onUnlock);
      controls.dispose();
      controlsRef.current = null;

      scene.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else if (child.material) {
            child.material.dispose();
          }
        }
      });

      kawungBump.dispose();
      marbleTex.dispose();
      flutedBump.dispose();
      bannerTex.dispose();
      createdPlaqueTextures.forEach(tex => tex.dispose());

      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <div ref={mountRef} className="absolute inset-0" />

      {inspectingItem && (
        <ArtifactInspector 
          itemId={inspectingItem} 
          onDuckMusic={onDuckMusic}
          narratorVolume={narratorVolume}
          onClose={() => {
            setInspectingItem(null);
            // Langsung lock kembali kontrol pemain agar bisa langsung jalan tanpa klik tombol Mulai Jelajah
            controlsRef.current?.lock();
          }} 
        />
      )}

      {isLocked && !inspectingItem && (
        <Crosshair notification={notification} />
      )}

      {!hasStarted && !isCutscenePlaying && !inspectingItem && (
        <StartScreen 
          onStart={() => {
            setIsCutscenePlaying(true);
            if (cutsceneTlRef.current) {
              cutsceneTlRef.current.seek(0).play();
            }
          }} 
        />
      )}

      {isCutscenePlaying && (
        <CutsceneOverlay 
          onDuckMusic={onDuckMusic}
          narratorVolume={narratorVolume}
          onSkip={() => {
            if (cutsceneTlRef.current) cutsceneTlRef.current.kill(); // Hentikan animasi kamera
            setIsCutscenePlaying(false);
            setHasStarted(true);
            hasStartedRef.current = true;
            controlsRef.current?.lock(); // Masuk mode penjelajahan bebas
          }} 
        />
      )}

      {hasStarted && !isLocked && !inspectingItem && !isSettingsOpen && !isCutscenePlaying && (
        <PauseMenu onResume={() => controlsRef.current?.lock()} />
      )}

      {hasStarted && !inspectingItem && (
        <AmbientHUD 
          isLocked={isLocked}
          isMusicOn={isMusicOn} onToggleMusic={onToggleMusic}
          isVoiceOn={isVoiceOn} setIsVoiceOn={setIsVoiceOn}
          isSettingsOpen={isSettingsOpen} setIsSettingsOpen={setIsSettingsOpen}
          onClose={onClose}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal 
          onClose={() => setIsSettingsOpen(false)}
          graphicsQuality={graphicsQuality} setGraphicsQuality={setGraphicsQuality}
          moveSpeed={moveSpeed} setMoveSpeed={setMoveSpeed}
          mouseSensitivity={mouseSensitivity} setMouseSensitivity={setMouseSensitivity}
          bgVolume={bgVolume} setBgVolume={setBgVolume}
          narratorVolume={narratorVolume} setNarratorVolume={setNarratorVolume}
        />
      )}
    </div>
  );
}
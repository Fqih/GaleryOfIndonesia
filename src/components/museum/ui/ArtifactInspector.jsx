import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { provincesData } from '../../../data/provincesData.jsx';

// === TEMPLATE DATA ARTEFAK ===
// Anda dapat mengubah teks dan sumber audio di sini sesuai kebutuhan
const artifactDetails = {
  1: {
    title: "Pendar Nusantara",
    description: "Di hadapan Anda melayang 'Pendar Nusantara', sebuah representasi digital dari jantung Indonesia. Instalasi ini memetakan gugusan kepulauan kita tidak hanya sebagai batasan geografis, melainkan sebagai mosaik identitas yang hidup. Setiap rona warna yang berpendar mewakili keunikan tradisi, bahasa, dan sejarah dari masing-masing provinsi. Perbedaan warna ini tidak berdiri sendiri, melainkan terangkai menjadi satu kesatuan visual yang utuh dan kokoh. Silakan berinteraksi dengan setiap wilayah untuk menyingkap warisan budaya yang tersimpan di dalamnya.",
    audio: "/audio/narasi1.wav"
  },
  2: {
    title: "Garuda",
    description: "Di hadapan Anda berdiri dengan gagah, Garuda Pancasila, lambang negara kebanggaan Republik Indonesia. Sosok burung garuda berwarna keemasan ini merepresentasikan kejayaan dan keagungan bangsa kita. Perhatikan perisai di dadanya yang menjadi ruang bagi kelima sila dasar negara, serta cengkeraman kuat pada pita yang menggemakan semangat persatuan abadi: Bhinneka Tunggal Ika",
    audio: "/audio/narasi2.wav"
  },
  3: {
    title: "Wajah Digital Bangsa",
    description: "Selamat datang di instalasi 'Wajah Digital Bangsa'. Objek yang Anda lihat ini merupakan personifikasi jenaka dari identitas nasional kita, yang lahir dan populer di tengah arus budaya internet global. Dikenal luas sebagai bagian dari fenomena narasi visual digital, karakter ini membuktikan bahwa diplomasi budaya, sejarah, dan interaksi antarnegara di era modern tidak hanya terjadi di ruang-ruang sidang formal. Ia hidup, berevolusi, dan dirayakan setiap hari oleh generasi muda melalui humor, meme, dan kreativitas tanpa batas di dunia maya. Sebuah bukti bahwa nasionalisme dan kebanggaan bisa diekspresikan lewat senyuman sederhana.",
    audio: "/audio/narasi3.wav"
  },
  4: {
    title: "Resolusi Kemerdekaan",
    description: "Menjulang di hadapan Anda adalah 'Resolusi Kemerdekaan', sebuah interpretasi kontemporer dari Monumen Nasional (Monas) yang dibangun ulang melalui ketelitian estetika voxel. Susunan kubus-kubus digital ini—layaknya pixel yang membentuk dunia virtual—menyimbolkan bahwa sejarah bangsa kita tidak dibangun dalam satu malam, melainkan disusun keping demi keping, elemen demi elemen, oleh tekad jutaan rakyat Indonesia. Dari fondasi pelataran hingga nyala api emas di puncaknya, instalasi ini mengajak kita merenungkan bahwa kemerdekaan dan masa depan Nusantara adalah sebuah mahakarya yang terus kita bangun bersama dalam dimensi ruang dan waktu.",
    audio: "/audio/narasi4.wav"
  }
};

export default function ArtifactInspector({ itemId, onClose, onDuckMusic, narratorVolume }) {
  const mountRef = useRef(null);
  const audioRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [isPlayingNarration, setIsPlayingNarration] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const imagesLengthRef = useRef(0);

  let is2DMode = false;

  let details = {
    title: "Artefak Tidak Dikenal",
    description: "Informasi mengenai artefak ini belum tersedia di dalam database kurator.",
    audio: "",
    images: []
  };
  let modelPath = `/models/item${itemId}.glb`;

  if (typeof itemId === 'string' && itemId.startsWith('prov-')) {
    const parts = itemId.split('-'); // e.g. ["prov", "sumbar", "rumah"]
    const provId = parts[1];
    const type = parts[2];
    
    const prov = provincesData.find(p => p.id === provId);
    if (prov) {
      if (type === 'rumah') {
        details = {
          title: prov.exhibits.find(e => e.label === 'Ikon Arsitektur')?.value || 'Ikon Arsitektur',
          subtitle: 'Arsitektur Nusantara',
          description: prov.desc,
          audio: prov.audioRumah || `/audio/narasi_${provId}_rumah.mp3`
        };
        modelPath = `/models/${prov.artifactModel || 'item1.glb'}`; // Menggunakan aset sesuai provinsi
      } else if (type === 'sejarah') {
        const contentData = prov.fullContent[0] || {};
        details = {
          title: contentData.title || `Sejarah ${prov.name}`,
          subtitle: 'Sejarah & Akar Kepercayaan',
          description: contentData.body || prov.desc,
          audio: prov.audioSejarah || `/audio/narasi_${provId}_sejarah.mp3`,
          images: [
            `/images/ilustrasi_${provId}_sejarah.png`,
            `/images/ilustrasi_${provId}_sejarah_2.png`,
            `/images/ilustrasi_${provId}_sejarah_3.png`
          ]
        };
        is2DMode = true;
      } else if (type === 'bahasa') {
        const contentData = prov.fullContent[1] || {};
        details = {
          title: contentData.title || `Bahasa & Sosial ${prov.name}`,
          subtitle: 'Bahasa & Sosial',
          description: contentData.body || prov.desc,
          audio: prov.audioBahasa || `/audio/narasi_${provId}_bahasa.mp3`,
          images: [
            `/images/ilustrasi_${provId}_bahasa.png`,
            `/images/ilustrasi_${provId}_bahasa_2.png`,
            `/images/ilustrasi_${provId}_bahasa_3.png`
          ]
        };
        is2DMode = true;
      }
    }
  } else {
    details = artifactDetails[itemId] || details;
  }

  imagesLengthRef.current = details.images?.length || 0;

  useEffect(() => {
    setCurrentImageIndex(0); // Reset when item changes
  }, [itemId]);

  useEffect(() => {
    if (is2DMode && !isHoveringImage) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => 
          imagesLengthRef.current > 0 ? (prev + 1) % imagesLengthRef.current : 0
        );
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [is2DMode, itemId, isHoveringImage]);

  useEffect(() => {
    if (!mountRef.current || is2DMode) {
      if (is2DMode) setLoading(false);
      return;
    }

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    mountRef.current.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(5, 5, 5);
    dirLight.castShadow = true;
    // Fix untuk "Z-Fighting" / "Shadow Acne" (Garis-garis bayangan berkedip di permukaan model)
    dirLight.shadow.bias = -0.001; 
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 15;
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 1.0);
    backLight.position.set(-5, -5, -5);
    scene.add(backLight);

    // 3. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 10;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;

    // 4. Load Model
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scaleFactor = 1.5 / maxDim;
        model.scale.setScalar(scaleFactor);

        model.position.set(
          -center.x * scaleFactor,
          -center.y * scaleFactor,
          -center.z * scaleFactor
        );

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        const wrapper = new THREE.Group();
        wrapper.add(model);
        scene.add(wrapper);

        setLoading(false);
      },
      undefined,
      (error) => {
        console.error('Error loading model for inspector:', error);
        setLoading(false);
      }
    );

    // 5. Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 6. Resize Handler
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onWindowResize);

    return () => {
      window.removeEventListener('resize', onWindowResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      // Pastikan background music kembali normal jika user langsung menutup modal tanpa pause
      if (onDuckMusic) onDuckMusic(false);
    };
  }, [itemId, onDuckMusic]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const toggleNarration = (e) => {
    e.stopPropagation(); // Mencegah klik bocor ke area kanvas
    if (audioRef.current) {
      if (isPlayingNarration) {
        audioRef.current.pause();
        setIsPlayingNarration(false);
        if (onDuckMusic) onDuckMusic(false);
      } else {
        // UI Responsif: Langsung ubah state ke mode 'playing'
        // Sinkronisasi Volume
        if (narratorVolume !== undefined) {
          audioRef.current.volume = narratorVolume;
        }
        
        setIsPlayingNarration(true);
        if (onDuckMusic) onDuckMusic(true);
        
        // Coba untuk memutar narasi
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.error("Gagal memutar audio narasi. Pastikan file ada dan tidak rusak:", err);
            // Revert state jika gagal memutar
            setIsPlayingNarration(false);
            if (onDuckMusic) onDuckMusic(false);
            alert("Gagal memutar suara narasi. Pastikan Anda telah meletakkan file MP3 yang benar di folder public/audio/");
          });
        }
      }
    }
  };

  // Update volume secara live jika digeser saat narasi sedang berjalan
  useEffect(() => {
    if (audioRef.current && narratorVolume !== undefined) {
      audioRef.current.volume = narratorVolume;
    }
  }, [narratorVolume]);

  // === 2D EDITORIAL MODE RENDER ===
  if (is2DMode) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 backdrop-blur-3xl overflow-hidden">
        {/* Tombol Tutup (Global) */}
        <div className="absolute top-8 left-8 right-8 flex justify-between items-start pointer-events-none z-10">
          <div className="pointer-events-auto">
            <h2 className="text-xl font-serif text-white/90 tracking-tight">Eksplorasi Arsip</h2>
          </div>
          <button
            onClick={onClose}
            className="pointer-events-auto group flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white ring-1 ring-white/10 backdrop-blur-xl px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 active:scale-95"
          >
            <svg className="w-4 h-4 opacity-70 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Kembali
          </button>
        </div>

        {/* Layout Asimetris */}
        <div className="w-full max-w-7xl mx-auto h-[85vh] mt-12 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 px-8 items-center">
          
          {/* Kolom Kiri: Ilustrasi (Span 7) */}
          <div 
            className="col-span-1 md:col-span-7 h-full flex items-center justify-center relative group"
            onMouseEnter={() => setIsHoveringImage(true)}
            onMouseLeave={() => setIsHoveringImage(false)}
          >
            <div className="w-full h-full max-h-[70vh] rounded-2xl overflow-hidden relative bg-zinc-900/50 ring-1 ring-white/5 flex items-center justify-center shadow-2xl transition-transform duration-700 ease-out hover:scale-[1.02]">
              {/* Fallback Jika Gambar Tidak Ada (Akan Tertimpa img jika src valid) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 font-serif">
                <svg className="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm tracking-widest uppercase">Ilustrasi Arsip</span>
              </div>
              
              {details.images && details.images.map((imgSrc, idx) => (
                <img 
                  key={idx}
                  src={imgSrc} 
                  alt={`${details.title} - ${idx + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-1000 ${
                    idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                  onError={(e) => {
                     e.target.style.opacity = '0';
                  }}
                />
              ))}

              {/* Subtle Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent z-10 pointer-events-none" />

              {/* Carousel Indicators (Dots) */}
              {details.images && details.images.length > 1 && (
                <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center items-center gap-3">
                  {details.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className="group p-2 cursor-pointer focus:outline-none"
                      aria-label={`Lihat gambar ${idx + 1}`}
                    >
                      <div 
                        className={`w-2.5 h-2.5 rounded-full ring-1 ring-white/50 transition-all duration-300 ${
                          idx === currentImageIndex 
                          ? 'bg-white scale-110' 
                          : 'bg-transparent hover:bg-white/30'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Kolom Kanan: Teks Editorial (Span 5) */}
          <div className="col-span-1 md:col-span-5 flex flex-col justify-center h-full max-h-[70vh]">
            <div className="flex items-center gap-4 mb-6">
              {details.audio && (
                <button
                  onClick={toggleNarration}
                  className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500 ease-out ${
                    isPlayingNarration 
                    ? 'bg-zinc-100 text-zinc-950 shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105' 
                    : 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/80 hover:text-white ring-1 ring-white/10'
                  }`}
                  title={isPlayingNarration ? "Jeda Narasi" : "Putar Narasi Suara"}
                >
                  {isPlayingNarration ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
              )}
              {details.subtitle && (
                <span className="text-amber-500/90 text-sm tracking-widest uppercase font-semibold">{details.subtitle}</span>
              )}
            </div>

            <h3 className="text-4xl md:text-5xl font-serif text-white tracking-tight leading-tight mb-8">
              {details.title}
            </h3>

            <div className="w-16 h-px bg-white/20 mb-8"></div>

            <div className="overflow-y-auto pr-6 pb-8 min-h-0 overscroll-contain
                            [&::-webkit-scrollbar]:w-1.5 
                            [&::-webkit-scrollbar-track]:bg-transparent 
                            [&::-webkit-scrollbar-thumb]:bg-white/20 
                            [&::-webkit-scrollbar-thumb]:rounded-full 
                            hover:[&::-webkit-scrollbar-thumb]:bg-white/30">
              <p className="text-zinc-400 text-[16px] leading-relaxed font-light tracking-wide max-w-[65ch] whitespace-pre-wrap">
                {details.description}
              </p>
            </div>
          </div>

        </div>

        {details.audio && (
          <audio 
            ref={audioRef} 
            src={details.audio} 
            onEnded={() => {
              setIsPlayingNarration(false);
              if (onDuckMusic) onDuckMusic(false);
            }}
          />
        )}
      </div>
    );
  }

  // === 3D MODE RENDER (DEFAULT) ===
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl">
      {/* Container untuk Canvas */}
      <div ref={mountRef} className="absolute inset-0 cursor-move" />

      {/* HEADER OVERLAY */}
      <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          <h2 className="text-3xl font-serif text-white tracking-tight drop-shadow-md">Inspeksi Artefak</h2>
          <p className="text-zinc-300 text-sm mt-2 font-light tracking-wide drop-shadow">
            Seret untuk memutar &middot; Gulir untuk zoom
          </p>
        </div>

        <button
          onClick={onClose}
          className="pointer-events-auto group flex items-center gap-2 bg-black/50 hover:bg-white/10 text-white/80 hover:text-white ring-1 ring-white/10 backdrop-blur-xl px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 active:scale-95"
        >
          <svg className="w-4 h-4 opacity-70 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Kembali ke Museum
        </button>
      </div>

      {/* PANEL DESKRIPSI & NARASI OVERLAY (KIRI BAWAH) */}
      {!loading && (
        <div className="absolute bottom-8 left-8 right-8 md:right-auto md:w-[28rem] p-6 bg-black/60 backdrop-blur-2xl ring-1 ring-white/10 rounded-2xl pointer-events-auto transform transition-all duration-700 translate-y-0 opacity-100">
          <div className="flex justify-between items-start mb-4 gap-4">
            <div>
              <h3 className="text-xl font-serif text-white tracking-wide">{details.title}</h3>
              {details.subtitle && (
                <p className="text-amber-400/90 text-sm italic mt-1 font-serif">{details.subtitle}</p>
              )}
            </div>

            {/* Tombol Play/Pause Narasi */}
            {details.audio && (
              <button
                onClick={toggleNarration}
                className={`flex-shrink-0 p-2.5 rounded-full transition-all duration-300 ${isPlayingNarration ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 ring-1 ring-amber-500/30' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white ring-1 ring-white/10'}`}
                title={isPlayingNarration ? "Jeda Narasi" : "Putar Narasi Suara"}
              >
                {isPlayingNarration ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
            )}
          </div>

          <div className="w-12 h-px bg-amber-600/50 mb-5"></div>

          {/* Wrapper Deskripsi dengan Scrollbar Kustom & Elegan */}
          <div className="max-h-[35vh] overflow-y-auto pr-3 
                          [&::-webkit-scrollbar]:w-1 
                          [&::-webkit-scrollbar-track]:bg-transparent 
                          [&::-webkit-scrollbar-thumb]:bg-white/10 
                          [&::-webkit-scrollbar-thumb]:rounded-full 
                          hover:[&::-webkit-scrollbar-thumb]:bg-white/20
                          transition-all">
            <p className="text-white/70 text-[15px] leading-relaxed font-light tracking-wide text-justify">
              {details.description}
            </p>
          </div>

          {/* Audio Element Tersembunyi */}
          {details.audio && (
            <audio 
              ref={audioRef} 
              src={details.audio} 
              onEnded={() => {
                setIsPlayingNarration(false);
                if (onDuckMusic) onDuckMusic(false);
              }}
            />
          )}
        </div>
      )}

      {loading && (
        <div className="absolute text-zinc-400 font-medium text-sm tracking-widest uppercase animate-pulse">
          Memuat Detail...
        </div>
      )}
    </div>
  );
}

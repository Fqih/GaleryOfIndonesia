import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import Navbar from './components/Navbar.jsx';
import BerandaTab from './components/BerandaTab.jsx';
import KontenTab from './components/KontenTab.jsx';
import PanduanTab from './components/PanduanTab.jsx';
import TentangTab from './components/TentangTab.jsx';
import Museum3DOverlay from './components/museum/Museum3DOverlay.jsx';
import RegionalRoomManager from './components/museum/regions/RegionalRoomManager.jsx';

const backgrounds = [
  '/images/1.jpg',
  '/images/2.jpg',
  '/images/1883209.jpg',
];

export default function App() {
  const [activeTab, setActiveTab] = useState('beranda');
  const [bgIndex, setBgIndex] = useState(0);
  const [isBlurring, setIsBlurring] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [active3DRoom, setActive3DRoom] = useState(null); // null | 'main' | provId
  const [lastVisitedRoom, setLastVisitedRoom] = useState(null);
  const [targetProvId, setTargetProvId] = useState(null);
  const audioRef = useRef(null);

  // Volume States
  const [bgVolume, setBgVolume] = useState(0.8);
  const [narratorVolume, setNarratorVolume] = useState(1.0);
  
  const bgVolumeRef = useRef(0.8);
  useEffect(() => {
    bgVolumeRef.current = bgVolume;
    if (audioRef.current && isPlaying) {
      audioRef.current.volume = bgVolume;
    }
  }, [bgVolume, isPlaying]);

  // Auto-play audio on mount
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 1.0;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  // Background slider — blur transition every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlurring(true);
      setTimeout(() => {
        setBgIndex((prev) => (prev + 1) % backgrounds.length);
        setIsBlurring(false);
      }, 800);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleAudio = useCallback(() => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, []);

  // Best Practice: Audio Ducking (Meredupkan BGM saat ada voice over)
  const duckAudio = useCallback((isDucking) => {
    if (audioRef.current) {
      const currentBgVol = bgVolumeRef.current;
      gsap.to(audioRef.current, {
        volume: isDucking ? Math.min(0.03, currentBgVol) : currentBgVol,
        duration: 1.5,
        ease: "power2.inOut"
      });
    }
  }, []);

  const tabs = {
    beranda: <BerandaTab onOpenMuseum={() => setActive3DRoom('main')} />,
    konten: <KontenTab targetProvId={targetProvId} onClearTargetProvId={() => setTargetProvId(null)} />,
    panduan: <PanduanTab />,
    tentang: <TentangTab />,
  };

  // Mapping audio background based on provId
  const getBgmSource = () => {
    if (!active3DRoom || active3DRoom === 'main') {
      return "/audio/Sabilulungan.mp3";
    }
    const bgmMap = {
      'sumbar': 'sumatera.mp3',
      'jabar': 'jawabarat.mp3',
      'jateng': 'jawatengah.mp3',
      'bali': 'bali.mp3',
      'kalimantan': 'kalimantan.mp3',
      'papua': 'papua.mp3',
      'sulsel': 'sulawesi.mp3'
    };
    const bgmFile = bgmMap[active3DRoom] || 'Sabilulungan.mp3';
    return `/audio/bgmdaerah/${bgmFile}`;
  };

  const bgmSource = getBgmSource();

  // Reload audio automatically when source changes and playing
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [bgmSource, isPlaying]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Background with blur transition */}
      <div
        className="fixed inset-0 z-0 transition-all duration-700"
        style={{
          backgroundImage: `url(${backgrounds[bgIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: isBlurring ? 'blur(8px)' : 'blur(0px)',
          transform: isBlurring ? 'scale(1.05)' : 'scale(1)',
        }}
      />
      {/* Dark overlay */}
      <div className="fixed inset-0 z-0 bg-black/30" />

      {/* BGM Audio */}
      <audio ref={audioRef} src={bgmSource} loop preload="auto" />

      {/* Audio Player — bottom right */}
      <button
        onClick={toggleAudio}
        className="fixed bottom-6 right-6 z-50 bg-amber-700/90 hover:bg-amber-800 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm transition-all hover:scale-105"
        title="Putar Musik Latar"
      >
        {isPlaying ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="relative z-10">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onOpenMuseum={() => setActive3DRoom('main')} />
        <main className="pt-16">
          {tabs[activeTab]}
        </main>
      </div>

      {active3DRoom === 'main' && (
        <Museum3DOverlay 
          isMusicOn={isPlaying}
          onToggleMusic={toggleAudio}
          onDuckMusic={duckAudio}
          bgVolume={bgVolume}
          setBgVolume={setBgVolume}
          narratorVolume={narratorVolume}
          setNarratorVolume={setNarratorVolume}
          spawnPortalId={lastVisitedRoom}
          onClose={() => {
            setActive3DRoom(null);
            setLastVisitedRoom(null);
          }} 
          onEnterPortal={(provId) => {
            setLastVisitedRoom(provId);
            setActive3DRoom(provId);
          }}
        />
      )}

      {active3DRoom && active3DRoom !== 'main' && (
        <RegionalRoomManager 
          provId={active3DRoom} 
          isMusicOn={isPlaying}
          onToggleMusic={toggleAudio}
          onDuckMusic={duckAudio}
          bgVolume={bgVolume}
          setBgVolume={setBgVolume}
          narratorVolume={narratorVolume}
          setNarratorVolume={setNarratorVolume}
          onExit={() => setActive3DRoom('main')}
          onExitToHome={() => {
            setActive3DRoom(null);
            setLastVisitedRoom(null);
          }}
        />
      )}
    </div>
  );
}
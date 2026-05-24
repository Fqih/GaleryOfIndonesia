import { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar.jsx';
import BerandaTab from './components/BerandaTab.jsx';
import KontenTab from './components/KontenTab.jsx';
import PanduanTab from './components/PanduanTab.jsx';
import TentangTab from './components/TentangTab.jsx';

const backgrounds = [
  '/images/1.jpg',
  '/images/2.jpg',
  '/images/1883209.jpg',
];

export default function App() {
  const [activeTab, setActiveTab] = useState('beranda');
  const [bgIndex, setBgIndex] = useState(0);
  const [isBlurring, setIsBlurring] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

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

  const toggleAudio = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const tabs = {
    beranda: <BerandaTab />,
    konten: <KontenTab />,
    panduan: <PanduanTab />,
    tentang: <TentangTab />,
  };

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
      <audio ref={audioRef} src="/bgm/Sabilulungan.mp3" loop />

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
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="pt-16">
          {tabs[activeTab]}
        </main>
      </div>
    </div>
  );
}
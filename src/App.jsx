import { useState, useEffect } from 'react';
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
  const [fadeState, setFadeState] = useState('in'); // 'in' | 'out'

  // Background slider — fade out, switch image, fade in
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeState('out');
      setTimeout(() => {
        setBgIndex((prev) => (prev + 1) % backgrounds.length);
        setFadeState('in');
      }, 1000); // 1s fade out, then switch
    }, 5000); // every 5 seconds total
    return () => clearInterval(interval);
  }, []);

  const tabs = {
    beranda: <BerandaTab />,
    konten: <KontenTab />,
    panduan: <PanduanTab />,
    tentang: <TentangTab />,
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Animated Background */}
      <div
        className="fixed inset-0 z-0 transition-opacity duration-1000"
        style={{
          backgroundImage: `url(${backgrounds[bgIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: fadeState === 'in' ? 1 : 0,
        }}
      />
      {/* Dark overlay */}
      <div className="fixed inset-0 z-0 bg-black/40" />

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
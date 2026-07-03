import React, { useEffect, useRef, useState } from 'react';

export default function CutsceneOverlay({ onSkip, onDuckMusic, narratorVolume }) {
  const audioRef = useRef(null);
  const [showTypography, setShowTypography] = useState(false);

  useEffect(() => {
    // Mulai ducking BGM
    if (onDuckMusic) onDuckMusic(true);

    // Play audio
    if (audioRef.current) {
      audioRef.current.volume = narratorVolume !== undefined ? narratorVolume : 1.0;
      audioRef.current.play().catch(e => {
        console.error("Gagal autoplay cutscene audio:", e);
      });
    }

    return () => {
      // Pastikan ducking dikembalikan saat unmount
      if (onDuckMusic) onDuckMusic(false);
    };
  }, [onDuckMusic]);

  // Update volume jika diubah saat cutscene berjalan
  useEffect(() => {
    if (audioRef.current && narratorVolume !== undefined) {
      audioRef.current.volume = narratorVolume;
    }
  }, [narratorVolume]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const time = audioRef.current.currentTime;
    
    // Typography "Gallery of Indonesia" muncul detik 1 hingga 8
    if (time >= 1 && time <= 8) {
      if (!showTypography) setShowTypography(true);
    } else {
      if (showTypography) setShowTypography(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-between">
      {/* Letterbox Atas */}
      <div className="h-[12vh] bg-black w-full transform transition-transform duration-1000 translate-y-0" />

      {/* Typography Tengah */}
      <div className="flex-1 flex items-center justify-center">
        <h1 
          className={`text-6xl md:text-8xl font-serif text-white tracking-[0.2em] uppercase opacity-0 transition-opacity duration-2000 ${showTypography ? 'opacity-100' : 'opacity-0'}`}
          style={{ textShadow: '0 4px 24px rgba(0,0,0,0.8)' }}
        >
          Gallery Of Indonesia
        </h1>
      </div>

      {/* Letterbox Bawah */}
      <div className="h-[12vh] bg-black w-full transform transition-transform duration-1000 translate-y-0 relative pointer-events-auto flex items-center justify-end px-8">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onSkip();
          }}
          className="text-zinc-400 hover:text-white hover:bg-white/10 px-6 py-2 rounded-full font-light tracking-widest text-sm uppercase transition-all duration-300 border border-transparent hover:border-zinc-500/50 backdrop-blur-sm"
        >
          Lewati &gt;&gt;
        </button>
      </div>

      <audio 
        ref={audioRef} 
        src="/audio/lobbyutama.wav" 
        onEnded={onSkip}
        onTimeUpdate={handleTimeUpdate}
      />
    </div>
  );
}

export default function AmbientHUD({ 
  isLocked, 
  isMusicOn, onToggleMusic, 
  isVoiceOn, setIsVoiceOn, 
  onClose, 
  isSettingsOpen, setIsSettingsOpen 
}) {
  return (
    <>
      {/* === AMBIENT HUD KIRI (SETTINGS) === */}
      <div className={`absolute top-8 left-8 z-20 flex items-center transition-opacity duration-300 ${isLocked ? 'opacity-40 hover:opacity-100' : 'opacity-100'}`}>
        <button 
          onClick={(e) => {
             e.stopPropagation();
             setIsSettingsOpen(!isSettingsOpen);
          }}
          className="p-2.5 rounded-full bg-zinc-900/60 backdrop-blur-xl border border-zinc-700/50 shadow-xl transition-all duration-300 hover:bg-white hover:text-zinc-950 text-zinc-400"
          title="Pengaturan"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* === AMBIENT HUD KANAN (MEDIA & NAV) === */}
      <div className={`absolute top-8 right-8 z-20 flex items-center gap-4 transition-opacity duration-300 ${isLocked ? 'opacity-40 hover:opacity-100' : 'opacity-100'}`}>
        {/* Instruksi Mode */}
        <div className="text-right pointer-events-none">
          <p className="text-xs font-mono text-zinc-400 tracking-wider">
            <kbd className="px-1.5 py-0.5 border border-zinc-700/50 rounded mr-1.5 text-[10px]">SHIFT</kbd>
            {isLocked ? "KURSOR" : "KEMBALI"}
          </p>
        </div>

        {/* Deretan Tombol (Pill) */}
        <div className="flex items-center gap-1.5 bg-zinc-900/60 backdrop-blur-xl border border-zinc-700/50 p-1.5 rounded-full shadow-xl">
          {/* Tombol Musik */}
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleMusic(); }}
            className={`p-2.5 rounded-full transition-all duration-300 hover:bg-white hover:text-zinc-950 ${isMusicOn ? 'text-zinc-100 bg-zinc-800' : 'text-zinc-500'}`}
            title="Toggle Musik Latar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </button>

          {/* Tombol Narasi / Suara */}
          <button 
            onClick={(e) => { e.stopPropagation(); setIsVoiceOn(!isVoiceOn); }}
            className={`p-2.5 rounded-full transition-all duration-300 hover:bg-white hover:text-zinc-950 ${isVoiceOn ? 'text-zinc-100 bg-zinc-800' : 'text-zinc-500'}`}
            title="Toggle Pemandu Suara"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isVoiceOn ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5 10v4a2 2 0 002 2h3l5 5V3l-5 5H7a2 2 0 00-2 2z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h2.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              )}
            </svg>
          </button>

          <div className="w-px h-6 bg-zinc-700/50 mx-1"></div>

          {/* Tombol Keluar / Beranda */}
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="p-2.5 rounded-full transition-all duration-300 text-zinc-400 hover:bg-red-500 hover:text-white"
            title="Keluar Galeri"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

export default function PauseMenu({ onResume }) {
  return (
    <div 
      className="absolute inset-0 bg-black/40 flex items-center justify-center text-white z-10 backdrop-blur-md cursor-pointer transition-all"
      onClick={onResume}
    >
       <div className="flex flex-col items-center gap-4 drop-shadow-2xl">
          <p className="text-white/90 text-2xl font-serif tracking-widest uppercase">Mode Interaksi</p>
          <p className="text-white/60 text-sm font-light tracking-wide">
            Klik layar atau tekan <kbd className="px-2 py-1 bg-white/10 ring-1 ring-white/20 rounded mx-1.5 text-xs text-white/80 font-sans">SHIFT</kbd> untuk kembali berjalan
          </p>
       </div>
    </div>
  );
}

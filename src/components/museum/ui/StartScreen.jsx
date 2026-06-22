export default function StartScreen({ onStart }) {
  return (
    <div 
      className="absolute inset-0 bg-zinc-950/80 flex flex-col items-center justify-center text-zinc-100 z-10 backdrop-blur-xl cursor-pointer"
      onClick={onStart}
    >
      <div className="max-w-2xl text-center space-y-10">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight text-white drop-shadow-lg">Museum Nusantara</h1>
          <p className="text-xl md:text-2xl text-zinc-400 font-light max-w-xl mx-auto leading-relaxed">
            Jelajahi galeri pusaka secara interaktif dan masuki portal dimensi tiap provinsi.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 text-base text-zinc-400 py-8 border-y border-zinc-800/50">
            <div className="flex items-center gap-3">
              <kbd className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-300 font-mono text-sm shadow-sm">W A S D</kbd>
              <span className="tracking-wide">Gerak</span>
            </div>
            <div className="flex items-center gap-3">
              <kbd className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-300 font-mono text-sm shadow-sm">Mouse</kbd>
              <span className="tracking-wide">Lihat</span>
            </div>
            <div className="flex items-center gap-3">
              <kbd className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-300 font-mono text-sm shadow-sm">Space</kbd>
              <span className="tracking-wide">Lompat</span>
            </div>
            <div className="flex items-center gap-3">
              <kbd className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-300 font-mono text-sm shadow-sm">Klik Kiri</kbd>
              <span className="tracking-wide">Interaksi</span>
            </div>
            <div className="flex items-center gap-3">
              <kbd className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-300 font-mono text-sm shadow-sm">ESC / SHIFT</kbd>
              <span className="tracking-wide">Buka Menu</span>
            </div>
        </div>

        <div className="pt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStart();
            }}
            className="group relative inline-flex items-center justify-center bg-white text-zinc-950 px-12 py-5 rounded-full text-lg font-medium transition-all duration-300 hover:bg-zinc-200 hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.15)]"
          >
            Mulai Penjelajahan
          </button>
        </div>
      </div>
    </div>
  );
}

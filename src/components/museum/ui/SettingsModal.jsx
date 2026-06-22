export default function SettingsModal({
  onClose,
  graphicsQuality, setGraphicsQuality,
  moveSpeed, setMoveSpeed,
  mouseSensitivity, setMouseSensitivity,
  bgVolume, setBgVolume,
  narratorVolume, setNarratorVolume
}) {
  return (
    <div className="absolute inset-0 bg-zinc-950/60 flex items-center justify-center z-30 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl space-y-8">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
          <h3 className="text-xl font-serif tracking-wide text-white">Pengaturan</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Resolusi */}
          <div className="space-y-3">
            <label className="text-xs font-mono uppercase tracking-widest text-zinc-500">Kualitas Grafis</label>
            <div className="flex p-1 bg-zinc-950 rounded-lg">
              <button 
                onClick={() => setGraphicsQuality('low')} 
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${graphicsQuality === 'low' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                Rendah
              </button>
              <button 
                onClick={() => setGraphicsQuality('high')} 
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${graphicsQuality === 'high' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                Tinggi
              </button>
            </div>
          </div>

          {/* Kecepatan Jalan */}
          <div className="space-y-3">
            <label className="text-xs font-mono uppercase tracking-widest text-zinc-500">Kecepatan Langkah</label>
            <div className="flex p-1 bg-zinc-950 rounded-lg">
              <button 
                onClick={() => setMoveSpeed('santai')} 
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${moveSpeed === 'santai' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                Santai
              </button>
              <button 
                onClick={() => setMoveSpeed('cepat')} 
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${moveSpeed === 'cepat' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                Berlari
              </button>
            </div>
          </div>

          {/* Sensitivitas Kamera */}
          <div className="space-y-3 border-t border-zinc-800/50 pt-5">
            <label className="flex justify-between text-xs font-mono uppercase tracking-widest text-zinc-500">
              <span>Sensitivitas Kamera</span>
              <span className="text-zinc-300">{mouseSensitivity.toFixed(1)}x</span>
            </label>
            <input 
              type="range" 
              min="0.1" max="2.0" step="0.1" 
              value={mouseSensitivity} 
              onChange={(e) => setMouseSensitivity(parseFloat(e.target.value))}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>

          {/* Volume BGM */}
          <div className="space-y-3">
            <label className="flex justify-between text-xs font-mono uppercase tracking-widest text-zinc-500">
              <span>Volume Musik (BGM)</span>
              <span className="text-zinc-300">{Math.round(bgVolume * 100)}%</span>
            </label>
            <input 
              type="range" 
              min="0.0" max="1.0" step="0.05" 
              value={bgVolume} 
              onChange={(e) => setBgVolume(parseFloat(e.target.value))}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>

          {/* Volume Narator */}
          <div className="space-y-3">
            <label className="flex justify-between text-xs font-mono uppercase tracking-widest text-zinc-500">
              <span>Volume Narator</span>
              <span className="text-zinc-300">{Math.round(narratorVolume * 100)}%</span>
            </label>
            <input 
              type="range" 
              min="0.0" max="1.0" step="0.05" 
              value={narratorVolume} 
              onChange={(e) => setNarratorVolume(parseFloat(e.target.value))}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PauseMenu({ onResume }) {
  return (
    <div 
      className="absolute inset-0 bg-zinc-950/30 flex items-center justify-center text-white z-10 backdrop-blur-[2px] cursor-pointer"
      onClick={onResume}
    >
       <div className="bg-zinc-950/80 px-8 py-5 rounded-2xl border border-zinc-800/50 backdrop-blur-xl shadow-2xl flex flex-col items-center gap-2">
          <p className="text-zinc-300 font-medium tracking-wider">Mode Interaksi</p>
          <p className="text-zinc-500 text-sm">Klik layar atau tekan <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-xs mx-1">SHIFT</kbd> untuk kembali berjalan</p>
       </div>
    </div>
  );
}

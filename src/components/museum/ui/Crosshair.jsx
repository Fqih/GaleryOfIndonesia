export default function Crosshair({ notification }) {
  return (
    <>
      <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white/80 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-difference" />
      
      {notification && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-zinc-950/90 text-white px-6 py-3 rounded-full backdrop-blur-xl pointer-events-none text-sm font-medium border border-zinc-800 shadow-2xl flex items-center gap-3 transition-opacity">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
          <span className="tracking-wide">{notification}</span>
        </div>
      )}
    </>
  );
}

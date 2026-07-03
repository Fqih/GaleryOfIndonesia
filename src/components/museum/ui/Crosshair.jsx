export default function Crosshair({ isLocked, notification }) {
  return (
    <>
      {/* Titik aim hanya muncul jika mouse terkunci (PointerLock aktif) */}
      {isLocked && (
        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white/80 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-difference" />
      )}
      
      {notification && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-500 opacity-100 translate-y-0">
          <div className="w-px h-6 bg-gradient-to-b from-transparent via-white/50 to-transparent mb-2"></div>
          <span className="text-white/80 font-sans text-xs uppercase tracking-[0.25em] font-light drop-shadow-lg">
            {notification}
          </span>
        </div>
      )}
    </>
  );
}

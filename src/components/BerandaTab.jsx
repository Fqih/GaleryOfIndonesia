export default function BerandaTab() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center bg-white/70 p-10 rounded-2xl backdrop-blur-sm border border-white/50 shadow-xl">
        <span className="text-amber-700 font-bold tracking-widest uppercase text-sm mb-4 block">
          Media Edukasi Interaktif
        </span>
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-6 leading-tight">
          Warisan Budaya:<br />
          <span className="text-amber-700">Warisan Nusantara</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-800 mb-10 max-w-2xl mx-auto leading-relaxed">
          Jelajahi kekayaan adat, pakaian adat, senjata pusaka, dan falsafah dari{' '}
          <b>7 provinsi</b> di Indonesia secara imersif. Dilengkapi dengan{' '}
          <b>Audio Narator Otomatis</b> dan museum 3D interaktif.
        </p>
        <button className="bg-amber-700 text-white px-8 py-4 rounded-full text-xl font-semibold hover:bg-amber-800 transition shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center mx-auto gap-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          Masuk ke Museum Metaverse
        </button>
      </div>
    </section>
  );
}
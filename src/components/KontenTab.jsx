import { provincesData } from '../data/provincesData.jsx';

export default function KontenTab() {
  return (
    <section className="py-20 px-4 min-h-screen relative">
      {/* Blurred batik background for this section */}
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `url(/images/1.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px)',
        }}
      />
      <div className="absolute inset-0 z-0 bg-white/60" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Koleksi Pameran Galeri</h2>
          <div className="w-24 h-1 bg-amber-600 mx-auto rounded" />
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Pelajari kekayaan budaya dari 7 provinsi yang akan dikunjungi di museum virtual.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {provincesData.map((prov) => (
            <div
              key={prov.id}
              className="bg-white/90 backdrop-blur-md rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 flex flex-col group transform hover:-translate-y-1 overflow-hidden"
            >
              {/* House image */}
              <div className="relative h-48 overflow-hidden">
                {prov.cardImage ? (
                  <img
                    src={prov.cardImage}
                    alt={`Rumah Adat ${prov.name}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: prov.color + '33' }}
                  >
                    <span className="text-white text-5xl font-serif font-bold opacity-60">
                      {prov.exhibits[0].value.charAt(0)}
                    </span>
                  </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {/* Province name over image */}
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-xl font-serif font-bold text-white drop-shadow-md">
                    {prov.name}
                  </h3>
                  <span className="text-xs text-white/80 font-medium uppercase tracking-wider">
                    Suku: {prov.ethnicity}
                  </span>
                </div>
              </div>

              {/* Exhibit details */}
              <div className="p-5 flex-grow flex flex-col">
                <div className="space-y-2">
                  {prov.exhibits.map((ex, i) => (
                    <div key={i} className="flex justify-between items-start gap-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase shrink-0">{ex.label}</span>
                      <span className="text-sm text-gray-800 font-medium text-right">{ex.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
import { useState } from 'react';
import { provincesData } from '../data/provincesData.jsx';

export default function KontenTab() {
  const [selectedProv, setSelectedProv] = useState(null);

  return (
    <>
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
                className="bg-white/90 backdrop-blur-md rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 flex flex-col group transform hover:-translate-y-1 overflow-hidden cursor-pointer"
                onClick={() => setSelectedProv(prov)}
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
                  {/* Click hint */}
                  <div className="absolute top-3 right-3 bg-amber-600/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Klik untuk detail
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

      {/* Popup Modal */}
      {selectedProv && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedProv(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative h-48 overflow-hidden shrink-0">
              {selectedProv.cardImage ? (
                <img
                  src={selectedProv.cardImage}
                  alt={selectedProv.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: selectedProv.color }}
                >
                  <span className="text-white text-6xl font-serif font-bold opacity-40">
                    {selectedProv.exhibits[0].value.charAt(0)}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6">
                <span
                  className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block"
                  style={{ backgroundColor: selectedProv.color, color: '#fff' }}
                >
                  {selectedProv.ethnicity}
                </span>
                <h2 className="text-2xl font-serif font-bold text-white">{selectedProv.name}</h2>
              </div>
              <button
                onClick={() => setSelectedProv(null)}
                className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 flex-grow">
              {selectedProv.fullContent ? (
                selectedProv.fullContent.map((section, idx) => (
                  <div key={idx} className="mb-5 last:mb-0">
                    <h3 className="text-base font-bold text-amber-700 mb-2 uppercase tracking-wide">
                      {section.title}
                    </h3>
                    <p className="text-gray-700 text-sm leading-relaxed">{section.body}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm italic text-center py-8">
                  Detail lengkap untuk {selectedProv.name} masih dalam pengembangan.
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
              <div className="flex flex-wrap gap-2">
                {selectedProv.exhibits.map((ex, i) => (
                  <span
                    key={i}
                    className="text-xs px-3 py-1 rounded-full font-medium border"
                    style={{ borderColor: selectedProv.color, color: selectedProv.color }}
                  >
                    {ex.value}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
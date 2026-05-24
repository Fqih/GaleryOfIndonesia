import { provincesData } from '../data/provincesData.jsx';

export default function KontenTab() {
  return (
    <section className="py-20 px-4 bg-white/80 min-h-screen">
      <div className="max-w-7xl mx-auto">
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
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group transform hover:-translate-y-1 overflow-hidden"
            >
              {/* Color header */}
              <div className="h-2" style={{ backgroundColor: prov.color }} />

              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-1 group-hover:text-amber-700 transition-colors">
                  {prov.name}
                </h3>
                <span className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-wider">
                  Suku: {prov.ethnicity}
                </span>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">{prov.desc}</p>

                {/* Exhibit details */}
                <div className="space-y-2 mt-auto border-t border-gray-100 pt-4">
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
import { useState } from 'react';

const guideItems = [
  {
    title: 'Masuk ke Museum 3D',
    icon: '',
    steps: [
      'Klik tombol "Masuk Museum 3D" di navbar atau hero section.',
      'Ikuti instruksi kontrol yang muncul di layar.',
      'Klik pada area layar untuk mengunci mouse dan mulai berjalan.',
    ],
  },
  {
    title: 'Kontrol Desktop',
    icon: '',
    steps: [
      'W / A / S / D — Bergerak ke depan, kiri, belakang, kanan.',
      'MOUSE — Melihat sekeliling 360°.',
      'SPASI — Melompat.',
      'ESC/SHIFT — Pause / keluar dari mode penguncian mouse.',
    ],
  },
  {
    title: 'Interaksi dengan Objek Pajangan',
    icon: '',
    steps: [
      'Dekati meja pajangan di dalam museum dan lakukan interaksi.',
      'Panel informasi akan muncul otomatis.',
      'Audio narator akan membacakan informasi objek ketika menekan tombol play.',
      'Tingkatkan atau turunkan volume pada mode interaktif',
    ],
  },
];

export default function PanduanTab() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="py-20 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 items-start">
        {/* Left Column: Sticky Header */}
        <div className="w-full md:w-1/3 md:sticky md:top-24 text-left">
          <h2 className="text-4xl font-serif font-bold text-zinc-900 mb-4">Panduan Penggunaan</h2>
          <p className="mt-4 text-zinc-600 text-lg">Pelajari cara menavigasi dan berinteraksi di dalam museum virtual WarisanBudaya.</p>
        </div>

        {/* Right Column: Accordions */}
        <div className="w-full md:w-2/3 space-y-4">
          {guideItems.map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden group">
              <button
                className="w-full flex items-center justify-between p-6 text-left hover:bg-amber-50/50 transition-colors"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                aria-expanded={openIndex === idx}
                aria-controls={`panduan-panel-${idx}`}
              >
                <div className="flex items-center gap-4">
                  {item.icon && <span className="text-2xl">{item.icon}</span>}
                  <span className="text-lg font-semibold text-zinc-900">{item.title}</span>
                </div>
                <span className={`text-zinc-400 transition-transform duration-300 ${openIndex === idx ? 'rotate-180 text-amber-700' : 'group-hover:text-amber-700'}`}>
                  ▼
                </span>
              </button>

              <div
                id={`panduan-panel-${idx}`}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === idx ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="px-6 pb-6 pt-2 border-t border-zinc-100">
                  <ul className="space-y-3">
                    {item.steps.map((step, si) => (
                      <li key={si} className="flex gap-4 text-zinc-600 text-base">
                        <span className="text-amber-700 font-bold shrink-0">{si + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
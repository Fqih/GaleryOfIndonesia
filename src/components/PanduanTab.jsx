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
      'ESC — Pause / keluar dari mode penguncian mouse.',
    ],
  },
  {
    title: 'Interaksi dengan Objek Pajangan',
    icon: '',
    steps: [
      'Dekati meja pajangan di dalam museum.',
      'Panel informasi akan muncul otomatis.',
      'Audio narator akan membacakan informasi objek.',
      'Tingkatkan volume untuk menonaktifkan narator suara.',
    ],
  },
];

export default function PanduanTab() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="py-20 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Panduan Penggunaan</h2>
          <div className="w-24 h-1 bg-amber-600 mx-auto rounded" />
          <p className="mt-4 text-gray-600">Pelajari cara menggunakan aplikasi WarisanBudaya.</p>
        </div>

        <div className="space-y-4">
          {guideItems.map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-5 text-left hover:bg-amber-50 transition"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-semibold text-gray-900">{item.title}</span>
                </div>
                <span className={`text-amber-600 transition-transform duration-200 ${openIndex === idx ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {openIndex === idx && (
                <div className="px-5 pb-5 border-t border-gray-100">
                  <ul className="mt-4 space-y-2">
                    {item.steps.map((step, si) => (
                      <li key={si} className="flex gap-3 text-gray-700 text-sm">
                        <span className="text-amber-600 font-bold shrink-0">{si + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
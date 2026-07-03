export default function TentangTab() {
  return (
    <section className="py-20 px-4 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Tentang Aplikasi</h2>
          <div className="w-24 h-1 bg-amber-600 mx-auto rounded" />
        </div>

        {/* About description */}
        <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 mb-8">
          <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">Heritage: Gallery Of Indonesia </h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Gallery Of Indonesia adalah prototipe aplikasi web multimedia interaktif yang menyajikan pameran budaya
            dari 7 provinsi di Indonesia dalam bentuk Virtual Gallery 3D. Aplikasi ini dirancang sebagai
            media edukasi berbasis Metaverse yang ringan dan dapat diakses langsung melalui peramban web.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Pengguna dapat menjelajahi museum virtual dengan kontrol first-person, melihat objek pajangan
            budaya dari berbagai provinsi, dan mendengarkan narasi audio dari narator berbahasa indonesia.
          </p>
        </div>

        {/* Teknologi */}
        <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 mb-8">
          <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">Teknologi yang Digunakan</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'React', desc: 'UI Framework' },
              { name: 'Vite', desc: 'Build Tool' },
              { name: 'Three.js', desc: '3D Engine' },
              { name: 'Tailwind CSS', desc: 'Styling' },
              { name: 'WebGL', desc: 'Graphics' },
              { name: 'Web Speech API', desc: 'Text-to-Speech' },
              { name: 'GSAP', desc: 'Animations' },
              { name: 'Howler.js', desc: 'Audio Library' },
            ].map((tech) => (
              <div key={tech.name} className="bg-white rounded-lg p-3 text-center border border-gray-100 shadow-sm">
                <div className="font-bold text-amber-700 text-sm">{tech.name}</div>
                <div className="text-xs text-gray-500">{tech.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Credits */}
        <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
          <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">Tim Pengembang</h3>
          <div className="space-y-3">
            {[
              { role: 'Project Lead, Programmer, Designer, Collecting', name: 'Muhammad Faqih Hakim' },
              { role: 'Designer (UI/UX), Collecting', name: 'Andi Maulana Firmansyah' },
              { role: 'Voice Over , 3D Programmer, Designer (UI/UX), Collecting', name: 'Ferdy Agustian Prasetyo' },
              { role: 'Designer (UI/UX), Collecting', name: 'Muchammad Fadhli Rochman' },
              { role: 'Designer (UI/UX), Collecting', name: 'Muhammad Rifki' },
              { role: 'Designer (UI/UX), Collecting', name: 'Trevin Hart Neville ' },
            ].map((dev) => (
              <div key={dev.role} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <span className="text-gray-600 text-sm">{dev.role}</span>
                <span className="font-medium text-gray-900">{dev.name}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-6 text-center italic">
            * Nama developer akan diisi kemudian.
          </p>
        </div>

        {/* Lisensi */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>Proyek Prototipe Sistem Multimedia Interaktif</p>
          <p className="mt-1">Lisensi: Educational Use</p>
        </div>
      </div>
    </section>
  );
}

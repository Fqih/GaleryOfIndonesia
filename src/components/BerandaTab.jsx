import { useEffect } from 'react';
import gsap from 'gsap';

export default function BerandaTab({ onOpenMuseum }) {

  useEffect(() => {
    // GSAP entrance animation for the content
    gsap.fromTo(".hero-content",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );
    gsap.fromTo(".hero-video",
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 1, delay: 0.3, ease: "power3.out" }
    );
  }, []);

  return (
    <section className="h-screen pt-16 px-4 md:px-8 max-w-7xl mx-auto flex items-center">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

        {/* Left Content */}
        <div className="hero-content lg:col-span-6 flex flex-col justify-center items-start text-left z-10 bg-white/85 py-6 px-6 md:py-8 md:px-10 rounded-3xl backdrop-blur-md shadow-2xl border border-white/50 h-full">
          <span className="text-amber-700 font-bold tracking-widest uppercase text-[10px] md:text-xs mb-2 block">
            Media Edukasi Interaktif
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-zinc-900 mb-3 leading-[1.15]">
            Warisan Budaya:<br />
            <span className="text-amber-700">Warisan Nusantara</span>
          </h1>
          <p className="text-sm md:text-base text-zinc-700 mb-6 max-w-xl leading-relaxed">
            Jelajahi kekayaan adat, pakaian adat, senjata pusaka, dan falsafah dari{' '}
            <b className="text-zinc-900">7 provinsi</b> di Indonesia secara imersif. Dilengkapi dengan{' '}
            <b className="text-zinc-900">Audio Narator Berbahasa Indonesia</b> dan museum 3D interaktif.
          </p>
          <button
            onClick={onOpenMuseum}
            className="bg-amber-700 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-amber-800 transition-all shadow-xl hover:shadow-2xl active:scale-95 flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            Masuk Museum 3D
          </button>
        </div>

        {/* Right Content - HTML5 Video */}
        <div className="hero-video lg:col-span-6 h-full min-h-[35vh] lg:min-h-0 w-full relative rounded-3xl overflow-hidden shadow-2xl border border-white/20">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-900/40 to-transparent z-10 pointer-events-none mix-blend-overlay"></div>

          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            poster="/images/1883209.jpg" /* Fallback image */
          >
            <source src="/videos/cuplikan.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Subtle Decorative Element */}
          <div className="absolute bottom-6 left-6 z-20 flex items-center gap-3 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-white/90 text-xs font-medium tracking-wider uppercase">Cuplikan Museum</span>
          </div>
        </div>

      </div>
    </section>
  );
}
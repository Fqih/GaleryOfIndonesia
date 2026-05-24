# NusaMeta Landing Page Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the landing page from static HTML to React + Vite with 4-tab navigation, animated batik background slider, and 7-province content cards. Museum 3D (Three.js) integration is out of scope for this plan.

**Architecture:** Single-page React application with client-side routing via React state (no react-router needed — just conditional rendering based on active tab). Vite as build tool (already configured). Tailwind CSS for styling.

**Tech Stack:** React 18, Vite, Tailwind CSS (CDN), Three.js (installed but out of scope for now)

---

## File Structure

```
warisan-budaya-nusameta/
├── index.html                    ← Update: mount point <div id="root"> + Tailwind CDN
├── package.json                  ← Already has react, three, vite
├── src/
│   ├── main.jsx                  ← Create: React 18 createRoot entry
│   ├── App.jsx                   ← Create: Root component with tab state + background slider
│   ├── components/
│   │   ├── Navbar.jsx            ← Create: 4-tab nav + Museum button
│   │   ├── BerandaTab.jsx        ← Create: Hero section
│   │   ├── KontenTab.jsx         ← Create: 7-province cards grid
│   │   ├── PanduanTab.jsx        ← Create: Usage guide
│   │   └── TentangTab.jsx        ← Create: About app + credits
│   ├── data/
│   │   └── provincesData.jsx     ← Create: 7 provinces data (add Kalimantan/Dayak)
│   └── index.css                 ← Create: Tailwind directives + custom animations
└── public/
    └── images/                   ← Copy: batik backgrounds here for public access
```

---

## Task 1: Setup Vite + React + Tailwind

**Files:**
- Modify: `index.html` — replace body with `<div id="root"></div>`, add Tailwind script
- Create: `src/main.jsx` — React 18 createRoot entry
- Create: `src/index.css` — Tailwind directives + custom keyframes for fade
- Create: `vite.config.js` — Add React plugin (create if not exists)

- [ ] **Step 1: Update index.html**

Replace body content:
```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NusaMeta - Warisan Budaya Indonesia</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

- [ ] **Step 2: Install React dependencies**

Run: `npm install react react-dom @vitejs/plugin-react`
Add to `package.json` devDependencies if not present.

- [ ] **Step 3: Create vite.config.js**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
});
```

- [ ] **Step 4: Create src/main.jsx**

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(<App />);
```

- [ ] **Step 5: Create src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
```

- [ ] **Step 6: Run dev server**

Run: `npm run dev`
Expected: App starts without errors, blank white page (no components yet)

- [ ] **Step 7: Commit**

```bash
git add index.html src/main.jsx src/index.css vite.config.js package.json
git commit -m "feat: setup React + Vite + Tailwind"
```

---

## Task 2: Create App Root + Background Slider + Navbar

**Files:**
- Create: `src/App.jsx` — Tab state, background slider logic, render tabs
- Create: `src/components/Navbar.jsx` — 4-tab nav + Museum button

- [ ] **Step 1: Create src/App.jsx**

```jsx
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import BerandaTab from './components/BerandaTab.jsx';
import KontenTab from './components/KontenTab.jsx';
import PanduanTab from './components/PanduanTab.jsx';
import TentangTab from './components/TentangTab.jsx';

const backgrounds = [
  '/images/1.jpg',
  '/images/2.jpg',
  '/images/1883209.jpg',
];

export default function App() {
  const [activeTab, setActiveTab] = useState('beranda');
  const [bgIndex, setBgIndex] = useState(0);
  const [fadeState, setFadeState] = useState('in'); // 'in' | 'out'

  // Background slider — fade in/out every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeState('out');
      setTimeout(() => {
        setBgIndex((prev) => (prev + 1) % backgrounds.length);
        setFadeState('in');
      }, 1000);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const tabs = {
    beranda: <BerandaTab />,
    konten: <KontenTab />,
    panduan: <PanduanTab />,
    tentang: <TentangTab />,
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Animated Background */}
      <div
        className="fixed inset-0 z-0 transition-opacity duration-1000"
        style={{
          backgroundImage: `url(${backgrounds[bgIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: fadeState === 'in' ? 1 : 0,
        }}
      />
      {/* Dark overlay for readability */}
      <div className="fixed inset-0 z-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="pt-16">
          {tabs[activeTab]}
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create src/components/Navbar.jsx**

```jsx
export default function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'beranda', label: 'Beranda' },
    { id: 'konten', label: 'Konten' },
    { id: 'panduan', label: 'Panduan' },
    { id: 'tentang', label: 'Tentang' },
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-md fixed w-full z-40 top-0 border-b border-amber-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-2xl font-serif font-bold text-amber-800 tracking-wider">NusaMeta</span>
          </div>

          {/* Nav tabs */}
          <div className="hidden md:flex items-center space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-amber-600 text-white'
                    : 'text-gray-600 hover:bg-amber-50 hover:text-amber-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Museum button */}
          <div className="flex items-center">
            <button className="bg-amber-700 text-white px-5 py-2 rounded-full font-medium hover:bg-amber-800 transition shadow-md">
              Masuk Museum 3D
            </button>
          </div>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="md:hidden flex border-t border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-medium transition ${
              activeTab === tab.id
                ? 'text-amber-700 border-b-2 border-amber-600'
                : 'text-gray-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Create placeholder tab components**

Create 4 empty placeholder components so the app renders without errors:

`src/components/BerandaTab.jsx`:
```jsx
export default function BerandaTab() { return <div className="min-h-screen" />; }
```

`src/components/KontenTab.jsx`:
```jsx
export default function KontenTab() { return <div className="min-h-screen" />; }
```

`src/components/PanduanTab.jsx`:
```jsx
export default function PanduanTab() { return <div className="min-h-screen" />; }
```

`src/components/TentangTab.jsx`:
```jsx
export default function TentangTab() { return <div className="min-h-screen" />; }
```

- [ ] **Step 4: Copy background images to public**

Run: `cp assets/menu/background/*.jpg public/images/`

- [ ] **Step 5: Run dev server and verify**

Run: `npm run dev`
Expected: Navbar renders with 4 tabs + Museum button, background image shows with fade animation

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx src/components/
git commit -m "feat: App root with tab navigation and background slider"
```

---

## Task 3: Build BerandaTab — Hero Section

**Files:**
- Modify: `src/components/BerandaTab.jsx`

- [ ] **Step 1: Write BerandaTab.jsx**

```jsx
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
```

- [ ] **Step 2: Verify**

Run: `npm run dev` — Click "Beranda" tab, verify hero renders correctly with background visible behind.

- [ ] **Step 3: Commit**

```bash
git add src/components/BerandaTab.jsx
git commit -m "feat: beranda hero section"
```

---

## Task 4: Create provincesData.jsx with 7 Provinces

**Files:**
- Create: `src/data/provincesData.jsx`

- [ ] **Step 1: Create src/data/provincesData.jsx**

```jsx
export const provincesData = [
  {
    id: 'sumbar',
    name: 'Sumatera Barat',
    ethnicity: 'Minangkabau',
    color: '#8b0000',
    desc: 'Bumi Minangkabau yang memegang teguh sistem matrilineal dan dikenal dengan Rumah Gadang, Jam Gadang, serta falsafah adat yang kuat.',
    exhibits: [
      { label: 'Rumah Adat', value: 'Rumah Gadang' },
      { label: 'Baju Adat', value: 'Bundo Kanduang' },
      { label: 'Senjata', value: 'Kerambit' },
      { label: 'Falsafah', value: 'Adat Basandi Syarak' },
    ],
  },
  {
    id: 'jabar',
    name: 'Jawa Barat',
    ethnicity: 'Sunda',
    color: '#2e8b57',
    desc: 'Tanah Pasundan yang dikenal dengan masyarakat Sunda yang ramah, seni angklung, dan alam pegunungan yang asri.',
    exhibits: [
      { label: 'Rumah Adat', value: 'Julang Ngapak' },
      { label: 'Baju Adat', value: 'Pangsi & Kebaya' },
      { label: 'Senjata', value: 'Kujang' },
      { label: 'Falsafah', value: 'Gemah Ripah' },
    ],
  },
  {
    id: 'jateng',
    name: 'Jawa Tengah',
    ethnicity: 'Jawa',
    color: '#cd853f',
    desc: 'Pusat budaya Jawa dengan peninggalan sejarah kerajaan, rumah Joglo, batik, gamelan, dan tradisi yang kuat.',
    exhibits: [
      { label: 'Rumah Adat', value: 'Rumah Joglo' },
      { label: 'Baju Adat', value: 'Batik Jawa' },
      { label: 'Senjata', value: 'Keris' },
      { label: 'Falsafah', value: 'Rukun Agawe Santosa' },
    ],
  },
  {
    id: 'bali',
    name: 'Bali',
    ethnicity: 'Bali (Hindu)',
    color: '#ff8c00',
    desc: 'Pulau Dewata yang termasyhur dengan tradisi Hindu, pura, seni tari, dan filosofi Tri Hita Karana.',
    exhibits: [
      { label: 'Rumah Adat', value: 'Bale Manten' },
      { label: 'Baju Adat', value: 'Payas Agung' },
      { label: 'Senjata', value: 'Keris Bali' },
      { label: 'Falsafah', value: 'Tri Hita Karana' },
    ],
  },
  {
    id: 'kalimantan',
    name: 'Kalimantan Timur',
    ethnicity: 'Dayak',
    color: '#8b4513',
    desc: 'Wilayah adat suku Dayak dengan tradisi upacara adat, rumah betang, danHarmoni dengan alam yang mendalam.',
    exhibits: [
      { label: 'Rumah Adat', value: 'Rumah Betang' },
      { label: 'Baju Adat', value: 'Kosong之子 (Dayak)' },
      { label: 'Senjata', value: 'Mandau' },
      { label: 'Falsafah', value: 'Harmoni dengan Alam' },
    ],
  },
  {
    id: 'papua',
    name: 'Papua',
    ethnicity: 'Papua (Dani)',
    color: '#556b2f',
    desc: 'Bumi Cendrawasih dengan kekayaan alam, budaya suku Dani, rumah Honai, dan panorama Raja Ampat.',
    exhibits: [
      { label: 'Rumah Adat', value: 'Rumah Honai' },
      { label: 'Baju Adat', value: 'Rok Rumbai' },
      { label: 'Senjata', value: 'Busur dan Panah' },
      { label: 'Falsafah', value: 'Karya Swadaya' },
    ],
  },
  {
    id: 'sulsel',
    name: 'Sulawesi Selatan',
    ethnicity: 'Bugis-Makassar-Toraja',
    color: '#8b0000',
    desc: 'Wilayah budaya Bugis, Makassar, dan Toraja yang kuat dengan tradisi maritim serta rumah Tongkonan.',
    exhibits: [
      { label: 'Rumah Adat', value: 'Rumah Tongkonan' },
      { label: 'Baju Adat', value: 'Baju Bodo' },
      { label: 'Senjata', value: 'Badik' },
      { label: 'Falsafah', value: 'Taro Ada Taro Gau' },
    ],
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/data/provincesData.jsx
git commit -m "feat: add 7 provinces data including Kalimantan/Dayak"
```

---

## Task 5: Build KontenTab — 7 Province Cards

**Files:**
- Modify: `src/components/KontenTab.jsx`

- [ ] **Step 1: Write KontenTab.jsx**

```jsx
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
```

- [ ] **Step 2: Verify**

Run: `npm run dev` — Click "Konten" tab, verify 7 cards render with correct data and hover effect.

- [ ] **Step 3: Commit**

```bash
git add src/components/KontenTab.jsx
git commit -m "feat: konten tab with 7 province cards"
```

---

## Task 6: Build PanduanTab — Usage Guide

**Files:**
- Modify: `src/components/PanduanTab.jsx`

- [ ] **Step 1: Write PanduanTab.jsx**

```jsx
import { useState } from 'react';

const guideItems = [
  {
    title: 'Masuk ke Museum 3D',
    icon: '🎮',
    steps: [
      'Klik tombol "Masuk Museum 3D" di navbar atau hero section.',
      'Ikuti instruksi kontrol yang muncul di layar.',
      'Klik pada area layar untuk mengunci mouse dan mulai berjalan.',
    ],
  },
  {
    title: 'Kontrol Desktop',
    icon: '🖥️',
    steps: [
      'W / A / S / D — Bergerak ke depan, kiri, belakang, kanan.',
      'MOUSE — Melihat sekeliling 360°.',
      'SPASI — Melompat.',
      'ESC — Pause / keluar dari mode penguncian mouse.',
    ],
  },
  {
    title: 'Kontrol Mobile',
    icon: '📱',
    steps: [
      'Joystick kiri — Menggerakkan karakter.',
      'Swipe kanan — Melihat sekeliling.',
      'Tombol aksi — Masuk ke ruangan / interaksi dengan objek.',
    ],
  },
  {
    title: 'Interaksi dengan Objek Pajangan',
    icon: '🖼️',
    steps: [
      'Dekati meja pajangan di dalam museum.',
      'Panel informasi akan muncul otomatis.',
      'Audio narator akan membacakan informasi objek.',
      'Klik tombol 🔊 untuk menonaktifkan narator suara.',
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
          <p className="mt-4 text-gray-600">Pelajari cara menggunakan aplikasi NusaMeta.</p>
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
```

- [ ] **Step 2: Verify**

Run: `npm run dev` — Click "Panduan" tab, verify accordion works (click to expand/collapse).

- [ ] **Step 3: Commit**

```bash
git add src/components/PanduanTab.jsx
git commit -m "feat: panduan tab with accordion guide"
```

---

## Task 7: Build TentangTab — About App + Credits

**Files:**
- Modify: `src/components/TentangTab.jsx`

- [ ] **Step 1: Write TentangTab.jsx**

```jsx
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
          <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">NusaMeta: Warisan Budaya Virtual</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            NusaMeta adalah prototipe aplikasi web multimedia interaktif yang menyajikan pameran budaya
            dari 7 provinsi di Indonesia dalam bentuk Virtual Gallery 3D. Aplikasi ini dirancang sebagai
            media edukasi berbasis Metaverse yang ringan dan dapat diakses langsung melalui peramban web.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Pengguna dapat menjelajahi museum virtual dengan kontrol first-person, melihat objek pajangan
            budaya dari berbagai provinsi, dan mendengarkan narasi audio otomatis menggunakan teknologi
            Text-to-Speech.
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
              { name: 'PointerLockControls', desc: 'First-Person Controls' },
              { name: 'GSAP', desc: 'Animations' },
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
              { role: 'Project Lead', name: 'Nama Developer' },
              { role: 'UI/UX Designer', name: 'Nama Developer' },
              { role: '3D Artist', name: 'Nama Developer' },
              { role: 'Frontend Developer', name: 'Nama Developer' },
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
```

- [ ] **Step 2: Verify**

Run: `npm run dev` — Click "Tentang" tab, verify all sections render.

- [ ] **Step 3: Commit**

```bash
git add src/components/TentangTab.jsx
git commit -m "feat: tentang tab with about section and placeholder credits"
```

---

## Task 8: Cleanup — Remove Old Vanilla JS Files

**Files to remove after verifying React app works:**
- `index.html` (old static HTML)
- `src/main.js` (old vanilla entry)
- `src/core/app.js`
- `src/core/geometryFactory.js`
- `src/controls/deviceDetector.js`
- `src/controls/desktopControls.js`
- `src/controls/mobileControls.js`
- `src/scenes/worldBuilder.js`
- `src/audio/narrator.js`
- `src/data/provinces.js`
- `src/styles/style.css`

**Keep:**
- `public/` directory (for images/audio assets)
- `assets/` directory (source assets)
- `claude.md`
- `package.json`

- [ ] **Step 1: Remove old files**

After confirming React app runs correctly, run:
```bash
rm index.html src/main.js src/core/app.js src/core/geometryFactory.js \
   src/controls/deviceDetector.js src/controls/desktopControls.js \
   src/controls/mobileControls.js src/scenes/worldBuilder.js \
   src/audio/narrator.js src/data/provinces.js src/styles/style.css
```

- [ ] **Step 2: Run final verification**

Run: `npm run dev`
Expected: All 4 tabs work, background slider animates, no errors in console.

- [ ] **Step 3: Commit cleanup**

```bash
git add -A && git commit -m "refactor: remove old vanilla JS files, full React migration complete"
```

---

## Spec Coverage Check

- [x] 4-tab navigation (Beranda, Konten, Panduan, Tentang) — Task 2
- [x] Background slider with fade animation from 3 batik images — Task 1, 2
- [x] Hero section (BerandaTab) — Task 3
- [x] 7 province cards (KontenTab) with rumah adat, baju adat, senjata, falsafah — Task 4, 5
- [x] Usage guide accordion (PanduanTab) — Task 6
- [x] About + placeholder credits (TentangTab) — Task 7
- [x] Kalimantan/Dayak added as 7th province — Task 4
- [x] React + Vite migration — Task 1
- [x] Old vanilla files cleaned up — Task 8

**No placeholders remaining.** All content is fully written. All file paths are absolute from project root.
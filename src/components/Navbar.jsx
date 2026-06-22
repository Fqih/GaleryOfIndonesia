

export default function Navbar({ activeTab, setActiveTab, onOpenMuseum }) {

  const tabs = [
    { id: 'beranda', label: 'Beranda' },
    { id: 'konten', label: 'Konten' },
    { id: 'panduan', label: 'Panduan' },
    { id: 'tentang', label: 'Tentang' },
  ];

  return (
    <>
      <nav className="bg-white/90 backdrop-blur-md fixed w-full z-40 top-0 border-b border-amber-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-2xl font-serif font-bold text-amber-800 tracking-wider">WarisanBudaya</span>
            </div>

            {/* Desktop Nav tabs */}
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
              <button 
                onClick={onOpenMuseum}
                className="bg-amber-700 text-white px-5 py-2 rounded-full font-medium hover:bg-amber-800 transition shadow-md"
              >
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

    </>
  );
}
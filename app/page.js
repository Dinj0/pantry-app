'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [namirnice, setNamirnice] = useState([]);
  const [arhiva, setArhiva] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(true);
  const [showArhiva, setShowArhiva] = useState(false);
  
  const [formData, setFormData] = useState({
    naziv: '',
    trenutnaKolicina: '',
    minKolicina: '',
    targetKolicina: '',
    kategorija: '',
    lokacija: 'Frižider',
    isLocked: true
  });

  useEffect(() => {
    fetchNamirnice();
    fetchArhiva();
  }, []);

  const fetchNamirnice = async () => {
    const res = await fetch('/api/namirnice');
    const data = await res.json();
    setNamirnice(data);
  };

  const fetchArhiva = async () => {
    const res = await fetch('/api/arhiva');
    const data = await res.json();
    setArhiva(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/namirnice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setShowModal(false);
    setFormData({
      naziv: '',
      trenutnaKolicina: '',
      minKolicina: '',
      targetKolicina: '',
      kategorija: '',
      lokacija: 'Frižider',
      isLocked: true
    });
    fetchNamirnice();
  };

  const toggleLock = async (id, currentLockStatus) => {
    await fetch('/api/namirnice', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isLocked: !currentLockStatus })
    });
    fetchNamirnice();
  };

  const updateKolicina = async (id, novaKolicina) => {
    const result = await fetch('/api/namirnice', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, trenutnaKolicina: novaKolicina })
    });
    
    const data = await result.json();
    if (data.archived) {
      fetchArhiva();
    }
    fetchNamirnice();
  };

  const deleteNamirnica = async (id) => {
    if (confirm('Jeste li sigurni da želite obrisati ovu namirnicu?')) {
      await fetch('/api/namirnice', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchNamirnice();
    }
  };

  const deleteArhiva = async (id) => {
    if (confirm('Obrisati ovu stavku iz arhive?')) {
      await fetch('/api/arhiva', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchArhiva();
    }
  };

  const groupByLocation = (location) => {
    return namirnice.filter(n => n.lokacija === location);
  };

  const shoppingList = namirnice.filter(n => n.trenutnaKolicina <= n.minKolicina);

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
        🏠 Pantry Manager
      </h1>
      
      <div className="flex gap-6">
        {/* LIJEVA STRANA - 3 Lokacije */}
        <div className="flex-1 grid grid-cols-3 gap-4">
          {['Frižider', 'Led', 'Spajza'].map(lokacija => (
            <div key={lokacija} className="bg-gray-800 rounded-lg shadow-xl border border-gray-700">
              <h2 className="text-xl font-bold text-center text-cyan-400 py-3 border-b border-gray-700 bg-gray-900">
                {lokacija === 'Frižider' && '🧊'} 
                {lokacija === 'Led' && '❄️'} 
                {lokacija === 'Spajza' && '🏺'} 
                {lokacija}
              </h2>
              
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {groupByLocation(lokacija).map(item => (
                  <div key={item.id} className="bg-gray-700 p-3 rounded border border-gray-600 hover:border-cyan-500 transition-all">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-white">{item.naziv}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleLock(item.id, item.isLocked)}
                          className="text-xl hover:scale-110 transition-transform"
                          title={item.isLocked ? 'Locked' : 'Unlocked'}
                        >
                          {item.isLocked ? '🔒' : '🔓'}
                        </button>
                        <button
                          onClick={() => deleteNamirnica(item.id)}
                          className="text-xl hover:scale-110 transition-transform"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-300 mb-3">
                      📂 {item.kategorija}
                    </div>
                    
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => updateKolicina(item.id, Math.max(0, item.trenutnaKolicina - 1))}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded font-bold shadow-lg"
                      >
                        −
                      </button>
                      <span className={`font-bold text-lg ${item.trenutnaKolicina <= item.minKolicina ? 'text-red-400' : 'text-green-400'}`}>
                        {item.trenutnaKolicina} / {item.targetKolicina}
                      </span>
                      <button
                        onClick={() => updateKolicina(item.id, item.trenutnaKolicina + 1)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded font-bold shadow-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* DESNA STRANA - Shopping List + Arhiva */}
        <div className="w-80 space-y-4">
          {/* Shopping List */}
          <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
            <button
              onClick={() => setShowShoppingList(!showShoppingList)}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white p-4 font-bold text-lg flex justify-between items-center transition-all"
            >
              <span>🛒 Lista za Kupovinu ({shoppingList.length})</span>
              <span className="text-2xl">{showShoppingList ? '▼' : '▶'}</span>
            </button>
            
            {showShoppingList && (
              <div className="p-4 max-h-96 overflow-y-auto">
                {shoppingList.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Sve je na stanju! ✅</p>
                ) : (
                  <ul className="space-y-3">
                    {shoppingList.map(item => (
                      <li key={item.id} className="bg-gray-700 p-3 rounded border border-orange-500">
                        <div className="font-bold text-white">{item.naziv}</div>
                        <div className="text-sm text-orange-400 font-semibold">
                          📦 Kupi: {item.targetKolicina - item.trenutnaKolicina} kom
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {item.lokacija} • {item.kategorija}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Arhiva */}
          <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
            <button
              onClick={() => setShowArhiva(!showArhiva)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white p-4 font-bold text-lg flex justify-between items-center transition-all"
            >
              <span>📦 Arhiva Potrošenog ({arhiva.length})</span>
              <span className="text-2xl">{showArhiva ? '▼' : '▶'}</span>
            </button>
            
            {showArhiva && (
              <div className="p-4 max-h-96 overflow-y-auto">
                {arhiva.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Arhiva je prazna</p>
                ) : (
                  <ul className="space-y-3">
                    {arhiva.map(item => (
                      <li key={item.id} className="bg-gray-700 p-3 rounded border border-purple-500 flex justify-between items-start">
                        <div>
                          <div className="font-bold text-white">{item.naziv}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {item.lokacija} • {item.kategorija}
                          </div>
                          <div className="text-xs text-purple-400 mt-1">
                            📅 {new Date(item.potrosenoDatum).toLocaleDateString('hr-HR')}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteArhiva(item.id)}
                          className="text-xl hover:scale-110 transition-transform"
                        >
                          🗑️
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 bg-cyan-500 hover:bg-cyan-600 text-white p-5 rounded-full shadow-2xl text-3xl hover:scale-110 transition-transform drop-shadow-[0_0_20px_rgba(34,211,238,0.7)]"
      >
        ➕
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border-2 border-cyan-500">
            <h2 className="text-3xl font-bold mb-6 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
              Dodaj Namirnicu
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Naziv"
                className="w-full p-3 bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none placeholder-gray-400"
                value={formData.naziv}
                onChange={(e) => setFormData({...formData, naziv: e.target.value})}
                required
              />
              
              <input
                type="number"
                placeholder="Trenutna količina"
                className="w-full p-3 bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none placeholder-gray-400"
                value={formData.trenutnaKolicina}
                onChange={(e) => setFormData({...formData, trenutnaKolicina: e.target.value})}
                required
              />
              
              <input
                type="number"
                placeholder="Min količina (prag)"
                className="w-full p-3 bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none placeholder-gray-400"
                value={formData.minKolicina}
                onChange={(e) => setFormData({...formData, minKolicina: e.target.value})}
                required
              />
              
              <input
                type="number"
                placeholder="Target količina"
                className="w-full p-3 bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none placeholder-gray-400"
                value={formData.targetKolicina}
                onChange={(e) => setFormData({...formData, targetKolicina: e.target.value})}
                required
              />
              
              <input
                type="text"
                placeholder="Kategorija"
                className="w-full p-3 bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none placeholder-gray-400"
                value={formData.kategorija}
                onChange={(e) => setFormData({...formData, kategorija: e.target.value})}
                required
              />
              
              <select
                className="w-full p-3 bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                value={formData.lokacija}
                onChange={(e) => setFormData({...formData, lokacija: e.target.value})}
              >
                <option value="Frižider">🧊 Frižider</option>
                <option value="Led">❄️ Led</option>
                <option value="Spajza">🏺 Spajza</option>
              </select>

              <div className="flex items-center gap-3 bg-gray-700 p-3 rounded-lg border-2 border-cyan-500">
                <input
                  type="checkbox"
                  id="isLocked"
                  checked={formData.isLocked}
                  onChange={(e) => setFormData({...formData, isLocked: e.target.checked})}
                  className="w-5 h-5"
                />
                <label htmlFor="isLocked" className="text-sm font-medium text-white">
                  🔒 Zaključaj (ostaje na listi kad dođe na 0)
                </label>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold shadow-lg"
                >
                  ✅ Dodaj
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold shadow-lg"
                >
                  ❌ Odustani
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
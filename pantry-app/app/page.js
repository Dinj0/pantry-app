'use client'
import { useState } from 'react';

export default function Home() {
  // State za formu
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    ime: '',
    trenutnaKolicina: '',
    minKolicina: '',
    ciljanaKolicina: '',
    kategorija: '',
    lokacija: ''
  });

  // State za namirnice (ovdje se spremaju - zasad u memoriji)
  const [namirnice, setNamirnice] = useState([]);

  const kategorije = [
    'Umaci', 'Konzerve', 'Začini', 'Napici', 'Grickalice', 
    'Tjestenina', 'Pecivo', 'Ostalo'
  ];

  const lokacije = ['Frižider', 'Led', 'Spajza'];

  // Funkcija za promjenu input polja
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Funkcija za spremanje namirnice
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const novaNamirnica = {
      id: Date.now(), // Privremeni ID
      ime: formData.ime,
      trenutnaKolicina: Number(formData.trenutnaKolicina),
      minKolicina: Number(formData.minKolicina),
      ciljanaKolicina: Number(formData.ciljanaKolicina),
      kategorija: formData.kategorija,
      lokacija: formData.lokacija
    };

    // Dodaj u listu
    setNamirnice([...namirnice, novaNamirnica]);
    
    console.log('Dodao namirnicu:', novaNamirnica);
    
    setShowForm(false);
    
    // Reset forme
    setFormData({
      ime: '',
      trenutnaKolicina: '',
      minKolicina: '',
      ciljanaKolicina: '',
      kategorija: '',
      lokacija: ''
    });
  };

  // Funkcija za generiranje shopping liste
  const getShoppingList = () => {
    return namirnice
      .filter(n => n.trenutnaKolicina <= n.minKolicina)
      .map(n => ({
        ...n,
        trebaNabaviti: n.ciljanaKolicina - n.trenutnaKolicina
      }));
  };

  // Filtriraj namirnice po lokaciji
  const getNamirnicePoLokaciji = (lokacija) => {
    return namirnice.filter(n => n.lokacija === lokacija);
  };

  const shoppingList = getShoppingList();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">🏠 Moja Riznica</h1>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-bold text-lg transition"
          >
            {showForm ? 'ZATVORI' : '+ DODAJ'}
          </button>
        </div>

        {/* Forma za dodavanje */}
        {showForm && (
          <div className="bg-gray-800 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-bold mb-4">Dodaj novu namirnicu</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Ime */}
              <div>
                <label className="block mb-2 font-semibold">Ime namirnice</label>
                <input 
                  type="text"
                  name="ime"
                  value={formData.ime}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                  placeholder="npr. Majoneza"
                />
              </div>

              {/* Količine u grid-u */}
              <div className="grid grid-cols-3 gap-4">
                
                <div>
                  <label className="block mb-2 font-semibold">Trenutna količina</label>
                  <input 
                    type="number"
                    name="trenutnaKolicina"
                    value={formData.trenutnaKolicina}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold">Min. količina</label>
                  <input 
                    type="number"
                    name="minKolicina"
                    value={formData.minKolicina}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold">Ciljna količina</label>
                  <input 
                    type="number"
                    name="ciljanaKolicina"
                    value={formData.ciljanaKolicina}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

              </div>

              {/* Kategorija */}
              <div>
                <label className="block mb-2 font-semibold">Kategorija</label>
                <input 
                  type="text"
                  name="kategorija"
                  value={formData.kategorija}
                  onChange={handleInputChange}
                  list="kategorije"
                  required
                  className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                  placeholder="Odaberi ili upiši..."
                />
                <datalist id="kategorije">
                  {kategorije
                    .filter(kat => kat.toLowerCase().includes(formData.kategorija.toLowerCase()))
                    .map(kat => <option key={kat} value={kat} />)
                  }
                </datalist>
              </div>

              {/* Lokacija */}
              <div>
                <label className="block mb-2 font-semibold">Lokacija</label>
                <select 
                  name="lokacija"
                  value={formData.lokacija}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                >
                  <option value="">Odaberi lokaciju...</option>
                  {lokacije.map(lok => (
                    <option key={lok} value={lok}>{lok}</option>
                  ))}
                </select>
              </div>

              {/* Submit button */}
              <button 
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg font-bold text-lg transition"
              >
                SPREMI NAMIRNICU
              </button>

            </form>
          </div>
        )}

        {/* Main layout - 2 stupca */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* LIJEVI DIO - Lokacije (3 stupca) */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* FRIŽIDER */}
            <div className="bg-blue-900/30 border-2 border-blue-500 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-blue-400 flex items-center gap-2">
                🧊 Frižider
              </h2>
              <div className="space-y-3">
                {getNamirnicePoLokaciji('Frižider').length === 0 ? (
                  <p className="text-gray-400 text-sm">Prazno...</p>
                ) : (
                  getNamirnicePoLokaciji('Frižider').map(namirnica => (
                    <div key={namirnica.id} className="bg-gray-800 p-3 rounded">
                      <p className="font-bold">{namirnica.ime}</p>
                      <p className="text-sm text-gray-400">{namirnica.kategorija}</p>
                      <p className="text-sm mt-1">
                        <span className={namirnica.trenutnaKolicina <= namirnica.minKolicina ? 'text-red-400' : 'text-green-400'}>
                          {namirnica.trenutnaKolicina}
                        </span>
                        <span className="text-gray-500"> / {namirnica.ciljanaKolicina}</span>
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* LED */}
            <div className="bg-cyan-900/30 border-2 border-cyan-500 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-cyan-400 flex items-center gap-2">
                ❄️ Led
              </h2>
              <div className="space-y-3">
                {getNamirnicePoLokaciji('Led').length === 0 ? (
                  <p className="text-gray-400 text-sm">Prazno...</p>
                ) : (
                  getNamirnicePoLokaciji('Led').map(namirnica => (
                    <div key={namirnica.id} className="bg-gray-800 p-3 rounded">
                      <p className="font-bold">{namirnica.ime}</p>
                      <p className="text-sm text-gray-400">{namirnica.kategorija}</p>
                      <p className="text-sm mt-1">
                        <span className={namirnica.trenutnaKolicina <= namirnica.minKolicina ? 'text-red-400' : 'text-green-400'}>
                          {namirnica.trenutnaKolicina}
                        </span>
                        <span className="text-gray-500"> / {namirnica.ciljanaKolicina}</span>
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SPAJZA */}
            <div className="bg-orange-900/30 border-2 border-orange-500 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-orange-400 flex items-center gap-2">
                🏺 Spajza
              </h2>
              <div className="space-y-3">
                {getNamirnicePoLokaciji('Spajza').length === 0 ? (
                  <p className="text-gray-400 text-sm">Prazno...</p>
                ) : (
                  getNamirnicePoLokaciji('Spajza').map(namirnica => (
                    <div key={namirnica.id} className="bg-gray-800 p-3 rounded">
                      <p className="font-bold">{namirnica.ime}</p>
                      <p className="text-sm text-gray-400">{namirnica.kategorija}</p>
                      <p className="text-sm mt-1">
                        <span className={namirnica.trenutnaKolicina <= namirnica.minKolicina ? 'text-red-400' : 'text-green-400'}>
                          {namirnica.trenutnaKolicina}
                        </span>
                        <span className="text-gray-500"> / {namirnica.ciljanaKolicina}</span>
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* DESNI DIO - Shopping Lista */}
          <div className="lg:col-span-1">
            <div className="bg-red-900/30 border-2 border-red-500 rounded-lg p-6 sticky top-8">
              <h2 className="text-2xl font-bold mb-4 text-red-400 flex items-center gap-2">
                🛒 Shopping Lista
              </h2>
              <div className="space-y-3">
                {shoppingList.length === 0 ? (
                  <p className="text-gray-400 text-sm">Sve je OK! ✅</p>
                ) : (
                  shoppingList.map(item => (
                    <div key={item.id} className="bg-gray-800 p-3 rounded border-l-4 border-red-500">
                      <p className="font-bold">{item.ime}</p>
                      <p className="text-sm text-gray-400">{item.kategorija}</p>
                      <p className="text-sm mt-1 text-red-400 font-bold">
                        Nabavi: {item.trebaNabaviti} kom
                      </p>
                      <p className="text-xs text-gray-500">
                        Trenutno: {item.trenutnaKolicina} / Min: {item.minKolicina}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
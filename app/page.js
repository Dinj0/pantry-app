"use client";
import { useState, useEffect } from "react";

const DEFAULTNE_KATEGORIJE = [
  "Hrana",
  "Umaci",
  "Sokovi",
  "Mliječni",
  "Meso",
  "Voće i povrće",
  "Slatkiši",
  "Higijena",
  "Ostalo",
];

export default function Home() {
  const [namirnice, setNamirnice] = useState([]);
  const [arhiva, setArhiva] = useState([]);
  const [kategorije, setKategorije] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(true);
  const [showArhiva, setShowArhiva] = useState(false);
  const [showKategorijeModal, setShowKategorijeModal] = useState(false);
  const [novaKategorija, setNovaKategorija] = useState("");
  const [brisanjeKat, setBrisanjeKat] = useState(null); // { id, naziv }
  const [zamjenaKatId, setZamjenaKatId] = useState("");
  const [editNamirnica, setEditNamirnica] = useState(null); // namirnica za edit kategorije
  const [editKatId, setEditKatId] = useState("");
  const [expandedLokacija, setExpandedLokacija] = useState(null);
  const [editKolicine, setEditKolicine] = useState(null);

  const [formData, setFormData] = useState({
    naziv: "",
    trenutnaKolicina: "",
    minKolicina: "",
    targetKolicina: "",
    kategorija: "",
    lokacija: "Frižider",
    isLocked: true,
  });

  useEffect(() => {
    fetchNamirnice();
    fetchArhiva();
    fetchKategorije();
  }, []);

  const fetchNamirnice = async () => {
    const res = await fetch("/api/namirnice");
    const data = await res.json();
    setNamirnice(data);
  };

  const fetchArhiva = async () => {
    const res = await fetch("/api/arhiva");
    const data = await res.json();
    setArhiva(data);
  };

  const fetchKategorije = async () => {
    const res = await fetch("/api/kategorije");
    const data = await res.json();
    setKategorije(data);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  let konacnaKategorija = formData.kategorija.trim();

  // Provjeri postoji li kategorija (samo ako nije prazna)
  if (konacnaKategorija !== "") {
    const postoji = kategorije.find(
      (k) => k.naziv.toLowerCase() === konacnaKategorija.toLowerCase()
    );

    if (!postoji) {
      const resKat = await fetch("/api/kategorije", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ naziv: konacnaKategorija }),
      });
      const novaKat = await resKat.json();
      konacnaKategorija = novaKat.naziv;
      fetchKategorije();
    }
  }

  // Ovo mora biti IZVAN if bloka da bi se namirnica uvijek spremila
  await fetch("/api/namirnice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...formData, kategorija: konacnaKategorija }),
  });

  setShowModal(false);
  setFormData({
    naziv: "",
    trenutnaKolicina: "",
    minKolicina: "",
    targetKolicina: "",
    kategorija: "",
    lokacija: "Frižider",
    isLocked: true,
  });
  fetchNamirnice();
};

  const toggleLock = async (id, currentLockStatus) => {
    await fetch("/api/namirnice", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isLocked: !currentLockStatus }),
    });
    fetchNamirnice();
  };

  const updateKolicina = async (id, novaKolicina) => {
    const result = await fetch("/api/namirnice", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, trenutnaKolicina: novaKolicina }),
    });
    const data = await result.json();
    if (data.archived) fetchArhiva();
    fetchNamirnice();
  };

  const spremiKolicine = async () => {
    if (!editKolicine) return;

    await fetch("/api/namirnice", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editKolicine.id,
        trenutnaKolicina: parseInt(editKolicine.trenutnaKolicina),
        minKolicina: parseInt(editKolicine.minKolicina),
        targetKolicina: parseInt(editKolicine.targetKolicina),
        kategorija: editKolicine.kategorija, // DODAJ OVO
      }),
    });

    setEditKolicine(null);
    fetchNamirnice();
  };

  const deleteNamirnica = async (id) => {
    if (confirm("Jeste li sigurni da želite obrisati ovu namirnicu?")) {
      await fetch("/api/namirnice", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchNamirnice();
    }
  };

  const deleteArhiva = async (id) => {
    if (confirm("Obrisati ovu stavku iz arhive?")) {
      await fetch("/api/arhiva", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchArhiva();
    }
  };

  const dodajKategoriju = async () => {
    if (!novaKategorija.trim()) return;
    await fetch("/api/kategorije", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naziv: novaKategorija.trim() }),
    });
    setNovaKategorija("");
    fetchKategorije();
  };

  const obrisiKategoriju = async () => {
    if (!brisanjeKat || !zamjenaKatId) return;
    await fetch("/api/kategorije", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: brisanjeKat.id,
        novaKategorijaId: parseInt(zamjenaKatId),
      }),
    });
    setBrisanjeKat(null);
    setZamjenaKatId("");
    fetchKategorije();
    fetchNamirnice();
  };

  const promijeniKategorijuNamirnice = async () => {
    if (!editNamirnica || !editKatId) return;
    const kat = kategorije.find((k) => k.id === parseInt(editKatId));
    if (!kat) return;
    await fetch("/api/namirnice", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editNamirnica.id, kategorija: kat.naziv }),
    });
    setEditNamirnica(null);
    setEditKatId("");
    fetchNamirnice();
  };

  const groupByLocation = (location) =>
    namirnice.filter((n) => n.lokacija === location);
  const shoppingList = namirnice.filter(
    (n) => n.trenutnaKolicina <= n.minKolicina,
  );

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <h1 className="text-2xl md:text-4xl font-bold text-center mb-6 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
        🏠 Pantry Manager
      </h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* LIJEVA STRANA */}
        <div className="flex-1 flex flex-col md:flex-row gap-4">
          {["Frižider", "Led", "Spajza"].map((lokacija) => {
            const isExpanded = expandedLokacija === lokacija;
            return (
              <div
                key={lokacija}
                className={`bg-gray-800 rounded-lg shadow-xl border border-gray-700 transition-all duration-300 flex flex-col min-h-[70vh] ${
                  isExpanded ? "flex-[3]" : "flex-1"
                }`}
              >
                <h2
                  className="text-xl font-bold text-center text-cyan-400 py-3 border-b border-gray-700 bg-gray-900 cursor-pointer hover:bg-gray-800 transition-colors select-none"
                  onClick={() =>
                    setExpandedLokacija(isExpanded ? null : lokacija)
                  }
                  title={
                    isExpanded
                      ? "Klikni za sužavanje"
                      : "Klikni za proširivanje"
                  }
                >
                  {lokacija === "Frižider" && "🧊"} {lokacija === "Led" && "❄️"}{" "}
                  {lokacija === "Spajza" && "🏺"} {lokacija}
                  <span className="ml-2 text-sm text-gray-400">
                    {isExpanded ? "◀" : "▶"}
                  </span>
                </h2>
                <div
                  className={`p-4 space-y-3 overflow-y-auto transition-all duration-300 ${isExpanded ? "max-h-[70vh]" : "max-h-[calc(8*5.5rem)]"}`}
                >
                  {groupByLocation(lokacija).map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-700 p-3 rounded border border-gray-600 hover:border-cyan-500 transition-all"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span
                          className="font-bold text-white cursor-pointer hover:text-cyan-400 transition-colors"
                          onClick={() =>
                            setEditKolicine({
                              id: item.id,
                              naziv: item.naziv,
                              trenutnaKolicina: item.trenutnaKolicina,
                              minKolicina: item.minKolicina,
                              targetKolicina: item.targetKolicina,
                              kategorija: item.kategorija,
                            })
                          }
                        >
                          {item.naziv}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLock(item.id, item.isLocked);
                            }}
                            className="text-xl hover:scale-110 transition-transform"
                          >
                            {item.isLocked ? "🔒" : "🔓"}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNamirnica(item.id);
                            }}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            updateKolicina(
                              item.id,
                              Math.max(0, item.trenutnaKolicina - 1),
                            );
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded font-bold shadow-lg"
                        >
                          −
                        </button>
                        <span
                          className={`font-bold text-lg ${item.trenutnaKolicina <= item.minKolicina ? "text-red-400" : "text-green-400"}`}
                        >
                          {item.trenutnaKolicina} / {item.targetKolicina}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateKolicina(item.id, item.trenutnaKolicina + 1);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded font-bold shadow-lg"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* DESNA STRANA */}
        <div className="w-full md:w-80 space-y-4">
          <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
            <button
              onClick={() => setShowShoppingList(!showShoppingList)}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white p-4 font-bold text-lg flex justify-between items-center transition-all"
            >
              <span>🛒 Lista za Kupovinu ({shoppingList.length})</span>
              <span className="text-2xl">{showShoppingList ? "▼" : "▶"}</span>
            </button>
            {showShoppingList && (
              <div className="p-4 max-h-96 overflow-y-auto">
                {shoppingList.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    Sve je na stanju! ✅
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {shoppingList.map((item) => (
                      <li
                        key={item.id}
                        className="bg-gray-700 p-3 rounded border border-orange-500"
                      >
                        <div className="font-bold text-white">{item.naziv}</div>
                        <div className="text-sm text-orange-400 font-semibold">
                          📦 Kupi: {item.targetKolicina - item.trenutnaKolicina}{" "}
                          kom
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

          <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
            <button
              onClick={() => setShowArhiva(!showArhiva)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white p-4 font-bold text-lg flex justify-between items-center transition-all"
            >
              <span>📦 Arhiva Potrošenog ({arhiva.length})</span>
              <span className="text-2xl">{showArhiva ? "▼" : "▶"}</span>
            </button>
            {showArhiva && (
              <div className="p-4 max-h-96 overflow-y-auto">
                {arhiva.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    Arhiva je prazna
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {arhiva.map((item) => (
                      <li
                        key={item.id}
                        className="bg-gray-700 p-3 rounded border border-purple-500 flex justify-between items-start"
                      >
                        <div>
                          <div className="font-bold text-white">
                            {item.naziv}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {item.lokacija} • {item.kategorija}
                          </div>
                          <div className="text-xs text-purple-400 mt-1">
                            📅{" "}
                            {new Date(item.potrosenoDatum).toLocaleDateString(
                              "hr-HR",
                            )}
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

      {/* Floating gumbi */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 bg-cyan-500 hover:bg-cyan-600 text-white p-4 md:p-5 rounded-full shadow-2xl text-2xl md:text-3xl hover:scale-110 transition-transform drop-shadow-[0_0_20px_rgba(34,211,238,0.7)]"
      >
        ➕
      </button>
      <button
        onClick={() => setShowKategorijeModal(true)}
        className="fixed bottom-6 right-20 md:right-28 bg-indigo-500 hover:bg-indigo-600 text-white p-4 md:p-5 rounded-full shadow-2xl text-2xl md:text-3xl hover:scale-110 transition-transform"
      >
        🏷️
      </button>

      {/* Modal - Dodaj Namirnicu */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border-2 border-cyan-500">
            <h2 className="text-3xl font-bold mb-6 text-cyan-400">
              Dodaj Namirnicu
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Naziv"
                className="w-full p-3 bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none placeholder-gray-400"
                value={formData.naziv}
                onChange={(e) =>
                  setFormData({ ...formData, naziv: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Trenutna količina"
                className="w-full p-3 bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none placeholder-gray-400"
                value={formData.trenutnaKolicina}
                onChange={(e) =>
                  setFormData({ ...formData, trenutnaKolicina: e.target.value })
                }
                required
              />
              <input
                type="number"
                placeholder="Min količina (prag)"
                className="w-full p-3 bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none placeholder-gray-400"
                value={formData.minKolicina}
                onChange={(e) =>
                  setFormData({ ...formData, minKolicina: e.target.value })
                }
                required
              />
              <input
                type="number"
                placeholder="Target količina"
                className="w-full p-3 bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none placeholder-gray-400"
                value={formData.targetKolicina}
                onChange={(e) =>
                  setFormData({ ...formData, targetKolicina: e.target.value })
                }
                required
              />

              <div className="space-y-2">
                <select
                  className="w-full p-3 bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                  value={formData.kategorija}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kategorija:
                        e.target.value === "__nova__" ? "" : e.target.value,
                    })
                  }
                >
                  <option value="">-- Odaberi kategoriju --</option>
                  {kategorije.map((k) => (
                    <option key={k.id} value={k.naziv}>
                      {k.naziv}
                    </option>
                  ))}
                  <option value="__nova__">➕ Dodaj novu kategoriju...</option>
                </select>
                {!kategorije.find((k) => k.naziv === formData.kategorija) && (
                  <input
                    type="text"
                    placeholder="Upiši naziv nove kategorije"
                    className="w-full p-3 bg-gray-700 text-white border-2 border-cyan-500 rounded-lg focus:outline-none placeholder-gray-400"
                    value={formData.kategorija}
                    onChange={(e) =>
                      setFormData({ ...formData, kategorija: e.target.value })
                    }
                  
                  />
                )}
              </div>

              <select
                className="w-full p-3 bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                value={formData.lokacija}
                onChange={(e) =>
                  setFormData({ ...formData, lokacija: e.target.value })
                }
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
                  onChange={(e) =>
                    setFormData({ ...formData, isLocked: e.target.checked })
                  }
                  className="w-5 h-5"
                />
                <label
                  htmlFor="isLocked"
                  className="text-sm font-medium text-white"
                >
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

      {/* Modal - Upravljanje kategorijama */}
      {showKategorijeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border-2 border-indigo-500">
            <h2 className="text-2xl font-bold mb-4 text-indigo-400">
              🏷️ Upravljanje kategorijama
            </h2>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Nova kategorija..."
                className="flex-1 p-3 bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-indigo-500 focus:outline-none placeholder-gray-400"
                value={novaKategorija}
                onChange={(e) => setNovaKategorija(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && dodajKategoriju()}
              />
              <button
                onClick={dodajKategoriju}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-lg font-bold"
              >
                Dodaj
              </button>
            </div>

            <ul className="space-y-2 max-h-64 overflow-y-auto mb-4">
              {kategorije.map((k) => (
                <li
                  key={k.id}
                  className="flex justify-between items-center bg-gray-700 p-3 rounded-lg border border-gray-600"
                >
                  <span className="text-white">{k.naziv}</span>
                  <button
                    onClick={() => {
                      setBrisanjeKat(k);
                      setZamjenaKatId("");
                    }}
                    className="text-red-400 hover:text-red-300 text-sm font-bold"
                  >
                    Obriši
                  </button>
                </li>
              ))}
            </ul>

            {brisanjeKat && (
              <div className="bg-gray-900 border border-red-500 rounded-lg p-4 mb-4">
                <p className="text-red-400 font-bold mb-2">
                  Brišeš: „{brisanjeKat.naziv}"
                </p>
                <p className="text-gray-300 text-sm mb-2">
                  Odaberi kategoriju u koju prebaciti sve namirnice:
                </p>
                <select
                  className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-lg mb-3"
                  value={zamjenaKatId}
                  onChange={(e) => setZamjenaKatId(e.target.value)}
                >
                  <option value="">-- Odaberi --</option>
                  {kategorije
                    .filter((k) => k.id !== brisanjeKat.id)
                    .map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.naziv}
                      </option>
                    ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={obrisiKategoriju}
                    disabled={!zamjenaKatId}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white py-2 rounded-lg font-bold"
                  >
                    Prebaci i obriši
                  </button>
                  <button
                    onClick={() => setBrisanjeKat(null)}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded-lg"
                  >
                    Odustani
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setShowKategorijeModal(false);
                setBrisanjeKat(null);
              }}
              className="w-full bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg font-bold"
            >
              Zatvori
            </button>
          </div>
        </div>
      )}

      {/* Modal - Promjena kategorije namirnice */}
      {editNamirnica && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl border-2 border-cyan-500">
            <h2 className="text-xl font-bold mb-4 text-cyan-400">
              Promjena kategorije
            </h2>
            <p className="text-white mb-4">
              Namirnica: <strong>{editNamirnica.naziv}</strong>
            </p>
            <p className="text-gray-400 text-sm mb-2">
              Trenutna kategorija: {editNamirnica.kategorija}
            </p>
            <select
              className="w-full p-3 bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none mb-4"
              value={editKatId}
              onChange={(e) => setEditKatId(e.target.value)}
            >
              <option value="">-- Odaberi novu kategoriju --</option>
              {kategorije.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.naziv}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                onClick={promijeniKategorijuNamirnice}
                disabled={!editKatId}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white py-3 rounded-lg font-bold"
              >
                Spremi
              </button>
              <button
                onClick={() => setEditNamirnica(null)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg font-bold"
              >
                Odustani
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Uređivanje količina */}
      {editKolicine && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl border-2 border-cyan-500">
            <h2 className="text-2xl font-bold mb-2 text-cyan-400">
              Uredi namirnicu
            </h2>

            <p className="text-white mb-5">
              <strong>{editKolicine.naziv}</strong>
            </p>

            <div className="space-y-4">
              <label className="block text-gray-300">
                Trenutna količina
                <input
                  type="number"
                  min="0"
                  className="w-full mt-1 p-3 bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                  value={editKolicine.trenutnaKolicina}
                  onChange={(e) =>
                    setEditKolicine({
                      ...editKolicine,
                      trenutnaKolicina: e.target.value,
                    })
                  }
                />
              </label>

              <label className="block text-gray-300">
                Minimalna količina
                <input
                  type="number"
                  min="0"
                  className="w-full mt-1 p-3 bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                  value={editKolicine.minKolicina}
                  onChange={(e) =>
                    setEditKolicine({
                      ...editKolicine,
                      minKolicina: e.target.value,
                    })
                  }
                />
              </label>

              <label className="block text-gray-300">
                Target količina
                <input
                  type="number"
                  min="0"
                  className="w-full mt-1 p-3 bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                  value={editKolicine.targetKolicina}
                  onChange={(e) =>
                    setEditKolicine({
                      ...editKolicine,
                      targetKolicina: e.target.value,
                    })
                  }
                />
              </label>
            </div>
            <label className="block text-gray-300">
              Kategorija
              <select
                className="w-full mt-1 p-3 bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                value={editKolicine.kategorija}
                onChange={(e) =>
                  setEditKolicine({
                    ...editKolicine,
                    kategorija: e.target.value,
                  })
                }
              >
                <option value="">-- Bez kategorije --</option>
                {kategorije.map((k) => (
                  <option key={k.id} value={k.naziv}>
                    {k.naziv}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex gap-3 mt-6">
              <button
                onClick={spremiKolicine}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold"
              >
                ✅ Spremi
              </button>

              <button
                onClick={() => setEditKolicine(null)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg font-bold"
              >
                Odustani
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

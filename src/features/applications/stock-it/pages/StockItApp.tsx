import React, { useState, useEffect } from 'react';
import { fetchStockData, pushStockData, parseJsonToState } from '../services/githubService';
import { 
  Search, Plus, Save, Loader2, AlertCircle, RefreshCw, Box, 
  AlertTriangle, CheckCircle, Edit, Trash2, FolderPlus 
} from 'lucide-react';

export function StockItApp() {
  // États de chargement et notifications
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Données
  const [categories, setCategories] = useState<{name: string}[]>([]);
  const [items, setItems] = useState<any[]>([]);
  
  // Filtres
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('ALL');
  const [activeStatus, setActiveStatus] = useState('ALL');

  // États pour les modales
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Formulaires
  const [itemForm, setItemForm] = useState({
    category: '',
    subcategory: '',
    name: '',
    qte: 1,
    status: 'Fonctionnel',
    note: ''
  });
  const [catForm, setCatForm] = useState({ name: '' });

  // Chargement initial depuis GitHub
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const rawData = await fetchStockData();
      const parsed = parseJsonToState(rawData);
      setCategories(parsed.categories);
      setItems(parsed.items);
    } catch (err: any) {
      setError("Impossible de charger le stock depuis GitHub.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      await pushStockData({ categories, items });
      setSuccessMsg('Stock sauvegardé avec succès sur GitHub !');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError("Erreur lors de la sauvegarde sur GitHub.");
    } finally {
      setSaving(false);
    }
  };

  // --- CRUD ÉQUIPEMENTS ---
  const updateItemQty = (id: string, delta: number) => {
    setItems(items.map(item => {
      if (item.id === id) return { ...item, qte: Math.max(0, item.qte + delta) };
      return item;
    }));
  };

  const openNewItemModal = () => {
    setEditingItem(null);
    setItemForm({ 
      category: categories.length > 0 ? categories[0].name : '', 
      subcategory: '', 
      name: '', 
      qte: 1, 
      status: 'Fonctionnel', 
      note: '' 
    });
    setIsItemModalOpen(true);
  };

  const openEditItemModal = (item: any) => {
    setEditingItem(item);
    setItemForm({ ...item });
    setIsItemModalOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet équipement ?')) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setItems(items.map(i => i.id === editingItem.id ? { ...i, ...itemForm } : i));
    } else {
      const newItem = { ...itemForm, id: "item_" + Math.random().toString(36).substr(2, 9) };
      setItems([...items, newItem]);
    }
    setIsItemModalOpen(false);
  };

  // --- CRUD CATÉGORIES ---
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (catForm.name.trim() !== '' && !categories.some(c => c.name.toLowerCase() === catForm.name.toLowerCase())) {
      setCategories([...categories, { name: catForm.name.trim() }]);
    }
    setIsCatModalOpen(false);
    setCatForm({ name: '' });
  };

  // --- STATISTIQUES & FILTRES ---
  const totalItems = items.length;
  const totalQty = items.reduce((s, i) => s + i.qte, 0);
  const functionalCount = items.filter(i => i.status.toLowerCase().includes('fonctionnel')).length;
  const brokenCount = items.filter(i => i.status.toLowerCase().includes('panne')).length;

  const filteredItems = items.filter(i => {
    if (activeCat !== 'ALL' && i.category !== activeCat) return false;
    
    if (activeStatus !== 'ALL') {
      const s = i.status.toLowerCase();
      if (activeStatus === 'Fonctionnel' && !s.includes('fonctionnel')) return false;
      if (activeStatus === 'Non vérifié' && !s.includes('non')) return false;
      if (activeStatus === 'Réserve' && !s.includes('scotché') && !s.includes('réserve')) return false;
      if (activeStatus === 'En panne' && !s.includes('panne')) return false;
    }

    if (search) {
      const q = search.toLowerCase();
      const matchName = i.name.toLowerCase().includes(q);
      const matchCat = i.category.toLowerCase().includes(q);
      const matchSub = (i.subcategory || '').toLowerCase().includes(q);
      const matchNote = (i.note || '').toLowerCase().includes(q);
      const matchStatus = i.status.toLowerCase().includes(q);
      if (!matchName && !matchCat && !matchSub && !matchNote && !matchStatus) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-mcd-green">
        <Loader2 className="animate-spin w-8 h-8 mb-4" />
        <p className="font-semibold">Synchronisation avec GitHub...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 border border-mcd-border rounded-sm shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-mcd-text flex items-center gap-2">
            <Box className="text-mcd-green" /> STOCK IT
          </h1>
          <p className="text-sm text-mcd-muted mt-1">Gestion matérielle connectée à GitHub</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setIsCatModalOpen(true)} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-mcd-text font-semibold text-sm border border-mcd-border flex items-center gap-2 transition-colors rounded-sm">
            <FolderPlus size={16} /> + Catégorie
          </button>
          <button onClick={openNewItemModal} className="px-3 py-2 bg-mcd-green hover:bg-[#005135] text-white font-semibold text-sm border border-[#00402a] flex items-center gap-2 transition-colors rounded-sm">
            <Plus size={16} /> Article
          </button>
          <div className="w-px h-8 bg-gray-300 mx-1 hidden md:block"></div>
          <button onClick={loadData} className="px-3 py-2 bg-mcd-light hover:bg-gray-200 text-mcd-text font-semibold text-sm border border-mcd-border flex items-center gap-2 transition-colors rounded-sm">
            <RefreshCw size={16} /> Recharger
          </button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-mcd-yellow hover:bg-yellow-500 text-black font-bold text-sm border border-yellow-600 flex items-center gap-2 transition-colors rounded-sm shadow-sm disabled:opacity-70">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Pousser vers GitHub
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && <div className="bg-red-50 text-red-700 p-3 border border-red-200 rounded-sm flex items-center gap-2"><AlertCircle size={18} />{error}</div>}
      {successMsg && <div className="bg-emerald-50 text-mcd-green p-3 border border-emerald-200 rounded-sm flex items-center gap-2"><CheckCircle size={18} />{successMsg}</div>}

      {/* Métriques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-mcd-border border-t-4 border-t-gray-500 rounded-sm shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase">Références</p>
          <h3 className="text-2xl font-black text-mcd-text mt-1">{totalItems}</h3>
        </div>
        <div className="bg-white p-4 border border-mcd-border border-t-4 border-t-blue-500 rounded-sm shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase">Quantité globale</p>
          <h3 className="text-2xl font-black text-mcd-text mt-1">{totalQty}</h3>
        </div>
        <div className="bg-white p-4 border border-mcd-border border-t-4 border-t-mcd-green rounded-sm shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase">Fonctionnels</p>
          <h3 className="text-2xl font-black text-mcd-green mt-1">{functionalCount}</h3>
        </div>
        <div className="bg-white p-4 border border-mcd-border border-t-4 border-t-red-600 rounded-sm shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase">En Panne</p>
          <h3 className="text-2xl font-black text-red-600 mt-1">{brokenCount}</h3>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-3 border border-mcd-border shadow-sm rounded-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Rechercher (nom, note, sous-groupe)..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-mcd-border focus:border-mcd-green focus:bg-white outline-none rounded-sm text-sm"
          />
        </div>
        <select value={activeCat} onChange={(e) => setActiveCat(e.target.value)} className="bg-gray-50 border border-mcd-border px-4 py-2 outline-none focus:border-mcd-green rounded-sm text-sm font-semibold">
          <option value="ALL">Toutes les catégories</option>
          {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
        <select value={activeStatus} onChange={(e) => setActiveStatus(e.target.value)} className="bg-gray-50 border border-mcd-border px-4 py-2 outline-none focus:border-mcd-green rounded-sm text-sm font-semibold">
          <option value="ALL">Tous les états</option>
          <option value="Fonctionnel">Fonctionnel (OK)</option>
          <option value="Non vérifié">Non vérifié</option>
          <option value="Réserve">Réserve / Scotché</option>
          <option value="En panne">En panne</option>
        </select>
      </div>

      {/* Grille */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white border border-mcd-border hover:border-mcd-green transition-colors rounded-sm shadow-sm flex flex-col">
            <div className="p-3 border-b border-mcd-border bg-gray-50 flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase bg-white border border-mcd-border px-1.5 py-0.5 text-gray-600 rounded-sm">
                {item.subcategory || item.category}
              </span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm border ${
                item.status.toLowerCase().includes('fonctionnel') && !item.status.toLowerCase().includes('scotché') ? 'bg-emerald-100 text-mcd-green border-emerald-300' :
                item.status.toLowerCase().includes('panne') ? 'bg-red-100 text-red-700 border-red-300' :
                'bg-amber-100 text-amber-700 border-amber-300'
              }`}>
                {item.status}
              </span>
            </div>
            
            <div className="p-3 flex-1">
              <h4 className="text-sm font-bold text-mcd-text leading-tight">{item.name}</h4>
              {item.note && (
                <p className="mt-2 text-[11px] bg-amber-50 text-amber-800 border border-amber-200 p-1.5 rounded-sm flex items-start gap-1">
                  <AlertTriangle size={12} className="mt-0.5 shrink-0" /> {item.note}
                </p>
              )}
            </div>

            <div className="p-3 border-t border-mcd-border bg-gray-50 flex items-center justify-between">
              <div className="flex gap-1">
                <button onClick={() => openEditItemModal(item)} className="p-1.5 text-gray-500 hover:text-mcd-green hover:bg-white border border-transparent hover:border-gray-200 rounded transition"><Edit size={14} /></button>
                <button onClick={() => handleDeleteItem(item.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white border border-transparent hover:border-gray-200 rounded transition"><Trash2 size={14} /></button>
              </div>
              <div className="flex items-center bg-white border border-mcd-border rounded-sm">
                <button onClick={() => updateItemQty(item.id, -1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100 font-bold">-</button>
                <span className="px-3 text-sm font-black text-mcd-text border-x border-mcd-border">{item.qte}</span>
                <button onClick={() => updateItemQty(item.id, 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100 font-bold">+</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredItems.length === 0 && (
        <div className="py-12 text-center bg-white border border-mcd-border rounded-sm shadow-sm">
          <p className="text-gray-500 font-semibold">Aucun équipement trouvé.</p>
        </div>
      )}

      {/* --- MODALES --- */}
      
      {/* Modale Article */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={handleSaveItem} className="bg-white border-t-4 border-mcd-green w-full max-w-lg shadow-2xl rounded-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-mcd-text">{editingItem ? "Modifier l'article" : "Nouvel Article"}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase">Catégorie *</label>
                  <select required value={itemForm.category} onChange={e => setItemForm({...itemForm, category: e.target.value})} className="w-full border border-gray-300 bg-gray-50 p-2 mt-1 rounded-sm text-sm outline-none focus:border-mcd-green">
                    <option value="" disabled>Sélectionner...</option>
                    {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase">Sous-groupe / Marque</label>
                  <input type="text" value={itemForm.subcategory} onChange={e => setItemForm({...itemForm, subcategory: e.target.value})} placeholder="Ex: Encre, RJ45" className="w-full border border-gray-300 bg-gray-50 p-2 mt-1 rounded-sm text-sm outline-none focus:border-mcd-green" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase">Nom de l'équipement *</label>
                <input type="text" required value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} className="w-full border border-gray-300 bg-gray-50 p-2 mt-1 rounded-sm text-sm outline-none focus:border-mcd-green" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase">Quantité *</label>
                  <input type="number" min="0" required value={itemForm.qte} onChange={e => setItemForm({...itemForm, qte: parseInt(e.target.value) || 0})} className="w-full border border-gray-300 bg-gray-50 p-2 mt-1 rounded-sm text-sm outline-none focus:border-mcd-green" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase">État *</label>
                  <select value={itemForm.status} onChange={e => setItemForm({...itemForm, status: e.target.value})} className="w-full border border-gray-300 bg-gray-50 p-2 mt-1 rounded-sm text-sm outline-none focus:border-mcd-green">
                    <option value="Fonctionnel">Fonctionnel (OK)</option>
                    <option value="Non vérifié">Non vérifié</option>
                    <option value="Fonctionnel mais scotché">Réserve / Scotché</option>
                    <option value="En panne">En panne</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase">Remarque / Précision</label>
                <textarea rows={2} value={itemForm.note} onChange={e => setItemForm({...itemForm, note: e.target.value})} placeholder="Ex: Manque câble d'alimentation..." className="w-full border border-gray-300 bg-gray-50 p-2 mt-1 rounded-sm text-sm outline-none focus:border-mcd-green"></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
              <button type="button" onClick={() => setIsItemModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 font-bold text-sm rounded-sm hover:bg-gray-300 transition">Annuler</button>
              <button type="submit" className="px-4 py-2 bg-mcd-green text-white font-bold text-sm rounded-sm hover:bg-[#005135] transition">Enregistrer</button>
            </div>
          </form>
        </div>
      )}

      {/* Modale Catégorie */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={handleAddCategory} className="bg-white border-t-4 border-mcd-green w-full max-w-sm shadow-2xl rounded-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-bold text-lg text-mcd-text">Nouvelle Catégorie</h3>
            </div>
            <div className="p-6">
              <label className="text-xs font-bold text-gray-600 uppercase">Nom de la catégorie *</label>
              <input type="text" required value={catForm.name} onChange={e => setCatForm({name: e.target.value})} placeholder="Ex: Écrans & Affichage" className="w-full border border-gray-300 bg-gray-50 p-2 mt-1 rounded-sm text-sm outline-none focus:border-mcd-green" />
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
              <button type="button" onClick={() => setIsCatModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 font-bold text-sm rounded-sm hover:bg-gray-300 transition">Annuler</button>
              <button type="submit" className="px-4 py-2 bg-mcd-green text-white font-bold text-sm rounded-sm hover:bg-[#005135] transition">Créer</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
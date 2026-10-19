import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Wrench, 
  ShieldAlert, 
  UserCheck, 
  ChevronRight, 
  ArrowLeft, 
  RefreshCw, 
  Tag, 
  X,
  CheckCircle2
} from 'lucide-react';
import type { WikiData, Tutorial, Equipment, TargetRole } from '../types/wiki';
import { fetchWikiData } from '../services/wikiService';

export function WikiApp() {
  const [data, setData] = useState<WikiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // État des filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<'all' | TargetRole>('all');
  
  // Vue détaillée d'un tuto
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const wikiData = await fetchWikiData();
      setData(wikiData);
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtrage combiné : Recherche + Équipement + Rôle
  const filteredTutorials = useMemo(() => {
    if (!data) return [];

    return data.tutorials.filter((tuto) => {
      // 1. Filtre Équipement
      if (selectedEquipment !== 'all' && tuto.equipmentId !== selectedEquipment) {
        return false;
      }

      // 2. Filtre Rôle (Manager vs IT)
      if (selectedRole !== 'all' && tuto.targetRole !== selectedRole) {
        return false;
      }

      // 3. Recherche textuelle (Titre, Description, Tags, Catégorie)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = tuto.title.toLowerCase().includes(query);
        const matchDesc = tuto.description.toLowerCase().includes(query);
        const matchCategory = tuto.category.toLowerCase().includes(query);
        const matchTags = tuto.tags.some((tag) => tag.toLowerCase().includes(query));

        return matchTitle || matchDesc || matchCategory || matchTags;
      }

      return true;
    });
  }, [data, searchQuery, selectedEquipment, selectedRole]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="animate-spin text-mcd-green" size={32} />
        <p className="text-sm text-mcd-muted">Chargement des fiches de panne...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md text-center max-w-md mx-auto my-8">
        <ShieldAlert className="mx-auto text-red-600 mb-2" size={36} />
        <h3 className="font-bold text-red-800">Erreur de chargement</h3>
        <p className="text-xs text-red-600 mt-1 mb-4">{error}</p>
        <button
          onClick={loadData}
          className="bg-red-600 text-white px-4 py-2 rounded text-xs font-semibold hover:bg-red-700 transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw size={14} /> Réessayer
        </button>
      </div>
    );
  }

  // --- VUE DÉTAILLÉE DU TUTO ---
  if (activeTutorial) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <button
          onClick={() => setActiveTutorial(null)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-mcd-green hover:underline mb-2"
        >
          <ArrowLeft size={18} /> Retour à la recherche
        </button>

        <div className="bg-mcd-white rounded-lg border border-mcd-border shadow-sm overflow-hidden">
          <div className="p-6 bg-mcd-light border-b border-mcd-border flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                  activeTutorial.targetRole === 'manager' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {activeTutorial.targetRole === 'manager' ? '🟢 Action Manager' : '🔴 Technicien IT'}
                </span>
                <span className="text-xs text-mcd-muted font-medium bg-gray-200/60 px-2 py-0.5 rounded">
                  {activeTutorial.category}
                </span>
              </div>
              <h1 className="text-xl font-bold text-mcd-text">{activeTutorial.title}</h1>
              <p className="text-sm text-mcd-muted mt-1">{activeTutorial.description}</p>
            </div>
          </div>

          {/* Liste des étapes */}
          <div className="p-6 space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-mcd-muted">
              Étapes de résolution ({activeTutorial.steps.length})
            </h2>

            <div className="space-y-6">
              {activeTutorial.steps.map((step) => (
                <div key={step.stepNumber} className="flex gap-4 p-4 rounded-lg bg-gray-50 border border-mcd-border">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-mcd-green text-white font-bold flex items-center justify-center text-sm shadow">
                    {step.stepNumber}
                  </div>
                  <div className="space-y-2 flex-grow">
                    <h3 className="font-bold text-mcd-text text-base">{step.title}</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{step.description}</p>
                    {step.imageUrl && (
                      <img 
                        src={step.imageUrl} 
                        alt={step.title} 
                        className="mt-3 rounded border border-mcd-border max-h-56 object-cover"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VUE PRINCIPALE : RECHERCHE & FILTRES ---
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold text-mcd-text">Fiches Panne & Wiki</h1>
          <p className="text-sm text-mcd-muted">Base de connaissances pour le dépannage rapide du restaurant</p>
        </div>
        <button
          onClick={loadData}
          className="text-xs text-mcd-muted hover:text-mcd-green flex items-center gap-1 bg-white px-2.5 py-1.5 rounded border border-mcd-border shadow-sm"
        >
          <RefreshCw size={12} /> Actualiser
        </button>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="bg-mcd-white p-4 rounded-lg border border-mcd-border shadow-sm space-y-4">
        {/* Champ de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-mcd-muted" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une panne, un équipement, un mot-clé (ex: écran noir, papier, KDS...)"
            className="w-full pl-10 pr-10 py-2.5 border border-mcd-border rounded-md text-sm focus:outline-none focus:border-mcd-green focus:ring-1 focus:ring-mcd-green transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-mcd-muted hover:text-mcd-text"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Filtres par boutons/badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-mcd-border/60 text-xs">
          {/* Filtre Rôle */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-mcd-muted mr-1">Attribution :</span>
            <button
              onClick={() => setSelectedRole('all')}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                selectedRole === 'all'
                  ? 'bg-mcd-text text-white'
                  : 'bg-gray-100 text-mcd-muted hover:bg-gray-200'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setSelectedRole('manager')}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors flex items-center gap-1 ${
                selectedRole === 'manager'
                  ? 'bg-green-700 text-white'
                  : 'bg-green-50 text-green-800 border border-green-200 hover:bg-green-100'
              }`}
            >
              <UserCheck size={12} /> Manager
            </button>
            <button
              onClick={() => setSelectedRole('it')}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors flex items-center gap-1 ${
                selectedRole === 'it'
                  ? 'bg-red-700 text-white'
                  : 'bg-red-50 text-red-800 border border-red-200 hover:bg-red-100'
              }`}
            >
              <Wrench size={12} /> IT
            </button>
          </div>

          {/* Sélecteur d'équipement */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-mcd-muted">Équipement :</span>
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="p-1.5 border border-mcd-border rounded bg-white font-medium focus:outline-none focus:border-mcd-green"
            >
              <option value="all">Tous les équipements</option>
              {data.equipments.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Liste des tutoriels filtrés */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs text-mcd-muted px-1">
          <span>{filteredTutorials.length} tuto(s) trouvé(s)</span>
        </div>

        {filteredTutorials.length === 0 ? (
          <div className="bg-mcd-white p-8 rounded-lg border border-mcd-border text-center space-y-2">
            <Tag className="mx-auto text-mcd-muted" size={32} />
            <p className="text-sm font-semibold text-mcd-text">Aucun tutoriel ne correspond à votre recherche.</p>
            <p className="text-xs text-mcd-muted">Essaye de modifier tes filtres ou d'effacer le terme de recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTutorials.map((tuto) => (
              <div
                key={tuto.id}
                onClick={() => setActiveTutorial(tuto)}
                className="bg-mcd-white rounded-lg border border-mcd-border hover:border-mcd-green p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      tuto.targetRole === 'manager' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tuto.targetRole === 'manager' ? '🟢 Manager' : '🔴 Technicien IT'}
                    </span>
                    <span className="text-[11px] text-mcd-muted font-medium bg-gray-100 px-2 py-0.5 rounded">
                      {tuto.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-mcd-text group-hover:text-mcd-green transition-colors text-base line-clamp-2">
                    {tuto.title}
                  </h3>
                  <p className="text-xs text-mcd-muted mt-1 line-clamp-2 leading-relaxed">
                    {tuto.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-mcd-muted">
                  <span className="flex items-center gap-1 font-medium">
                    <CheckCircle2 size={14} className="text-mcd-green" /> {tuto.steps.length} étapes
                  </span>
                  <span className="text-mcd-green font-semibold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    Voir la fiche <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
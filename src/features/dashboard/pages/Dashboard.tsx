import { Grid, Activity } from 'lucide-react';
import { Link } from 'react-router-dom'; // <-- Ajout de Link pour la navigation
import { applicationsRegistry } from '../../applications/registry';

export function Dashboard() {
  return (
    <main className="w-full space-y-6">
      {/* Panneau de bienvenue vert avec statut intégré */}
      <div className="bg-mcd-green text-white p-6 rounded-sm shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tableau de bord IT Hub</h1>
          <p className="text-green-100 text-sm mt-1">
            Sélectionnez un outil interne ci-dessous pour commencer.
          </p>
        </div>
        
        {/* Badge de statut système */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-sm text-xs font-medium w-fit">
          <Activity size={16} className="text-mcd-yellow" />
          <span>Tous les services sont en ligne</span>
        </div>
      </div>

      {/* Section principale */}
      <section className="bg-mcd-white p-6 rounded-sm border border-mcd-border shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-mcd-border">
          <div className="p-1.5 bg-mcd-green text-white rounded-sm">
            <Grid size={18} />
          </div>
          <h2 className="text-lg font-bold text-mcd-text">Applications & Outils Internes</h2>
        </div>

        {applicationsRegistry.length === 0 ? (
          <div className="border-2 border-dashed border-mcd-border rounded-sm p-10 text-center bg-mcd-light/50">
            <div className="mx-auto w-12 h-12 bg-mcd-green/10 text-mcd-green rounded-sm flex items-center justify-center mb-3">
              <Grid size={24} />
            </div>
            <h3 className="font-semibold text-mcd-text">Aucune application configurée</h3>
            <p className="text-sm text-mcd-muted mt-1 max-w-md mx-auto">
              Ce module est actuellement vide. Les applications métier seront enregistrées dans le registre modulaire.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Rendu dynamique des cartes d'applications */}
            {applicationsRegistry.map((app) => (
              <Link 
                key={app.id} 
                to={app.path}
                className="group block bg-white border border-mcd-border hover:border-mcd-green p-4 rounded-sm shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-mcd-light group-hover:bg-mcd-green group-hover:text-white text-mcd-green rounded-sm flex items-center justify-center transition-colors shrink-0 border border-mcd-border group-hover:border-[#00402a]">
                    <app.icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-mcd-text group-hover:text-mcd-green transition-colors">
                      {app.name}
                    </h3>
                    <p className="text-xs text-mcd-muted mt-1 line-clamp-2">
                      {app.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
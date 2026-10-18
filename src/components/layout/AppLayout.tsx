import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { LogOut, Home, User as UserIcon } from 'lucide-react';
import { BrandLogo } from '../branding/BrandLogo';
import { logoutUser, getCurrentUser } from '../../features/auth/services/authService';

export function AppLayout() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  
  // Vérifie si un token de session existe bien
  const isAuthenticated = Boolean(localStorage.getItem('auth_token'));

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-mcd-light">
      {/* Navigation globale avec fond vert structurel */}
      <header className="bg-mcd-green text-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo className="w-8 h-8 text-sm shadow" />
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wide">McDonald's</span>
              <span className="bg-mcd-yellow text-mcd-text text-xs px-2 py-0.5 rounded font-semibold uppercase">
                IT Hub
              </span>
            </div>
          </div>
          
          <nav className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-sm font-medium bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded transition-colors"
            >
              <Home size={16} />
              <span>Accueil</span>
            </button>

            {/* Badge de l'utilisateur connecté */}
            {currentUser && (
              <span className="text-xs bg-white/10 px-2.5 py-1 rounded text-green-100 flex items-center gap-1.5 ml-2">
                <UserIcon size={14} />
                <span className="font-medium">{currentUser.username}</span>
              </span>
            )}

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-red-200 hover:text-white hover:bg-red-700/50 px-3 py-1.5 rounded transition-colors ml-2"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Zone de contenu principal */}
      <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { LogOut, Home, User as UserIcon, Menu, X } from 'lucide-react';
import { BrandLogo } from '../branding/BrandLogo';
import { logoutUser, getCurrentUser } from '../../features/auth/services/authService';

export function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      <header className="bg-mcd-green text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          
          {/* Logo & Titre */}
          <div 
            onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }} 
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <BrandLogo className="w-8 h-8 text-sm shadow shrink-0" />
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wide">McDonald's</span>
              <span className="bg-mcd-yellow text-mcd-text text-xs px-2 py-0.5 rounded font-semibold uppercase">
                IT Hub
              </span>
            </div>
          </div>
          
          {/* Navigation Desktop (Masquée sur mobile) */}
          <nav className="hidden md:flex items-center gap-2">
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
                <UserIcon size={14} className="text-mcd-yellow" />
                <span className="font-medium">{currentUser.username}</span>
              </span>
            )}

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-red-200 hover:text-white hover:bg-red-700/50 px-3 py-1.5 rounded transition-colors ml-2"
            >
              <LogOut size={16} />
              <span>Déconnexion</span>
            </button>
          </nav>

          {/* Bouton Hamburger Mobile (Visible uniquement sur mobile) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 text-white hover:bg-white/10 rounded transition-colors focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Menu Déroulant Mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#00402a] px-4 py-3 space-y-3 shadow-lg">
            <button
              onClick={() => {
                navigate('/');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 rounded transition-colors text-left"
            >
              <Home size={18} />
              <span>Accueil</span>
            </button>

            {currentUser && (
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-green-100 bg-white/5 rounded">
                <UserIcon size={16} className="text-mcd-yellow" />
                <span>Connecté : <strong className="text-white font-bold">{currentUser.username}</strong></span>
              </div>
            )}

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-200 hover:text-white hover:bg-red-700/50 rounded transition-colors text-left border-t border-white/10 pt-3"
            >
              <LogOut size={18} />
              <span>Se déconnecter</span>
            </button>
          </div>
        )}
      </header>

      {/* Zone de contenu principal */}
      <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </div>
    </div>
  );
}
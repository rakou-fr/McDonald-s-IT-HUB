import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { BrandLogo } from '../../../components/branding/BrandLogo';
import { loginUser } from '../services/authService';
import packageJson from '../../../../package.json';

// Composant icône GitHub inline (remplace l'export absent de lucide-react)
function GithubIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginUser(username, password);

      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Identifiant ou mot de passe incorrect.');
      }
    } catch (err: any) {
      setError('Erreur inattendue lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-mcd-light relative">
      <div className="bg-mcd-white rounded-md shadow-md border border-mcd-border w-full max-w-sm overflow-hidden">
        
        {/* En-tête vert McDonald's */}
        <div className="bg-mcd-green p-6 text-white text-center flex flex-col items-center">
          <BrandLogo className="w-12 h-12 text-xl mb-3 shadow" />
          <h1 className="text-xl font-bold tracking-tight">McDonald's IT Hub</h1>
          <p className="text-xs text-green-100 mt-1">Portail d'authentification interne</p>
        </div>

        {/* Formulaire de connexion */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm border border-red-200 rounded flex items-start gap-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-mcd-text">Identifiant</label>
              <input
                type="text"
                required
                autoComplete="username"
                className="w-full p-2 border border-mcd-border rounded focus:outline-none focus:border-mcd-green focus:ring-1 focus:ring-mcd-green transition-colors"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: admin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-mcd-text">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className="w-full p-2 border border-mcd-border rounded focus:outline-none focus:border-mcd-green focus:ring-1 focus:ring-mcd-green transition-colors pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-mcd-muted hover:text-mcd-text transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-mcd-green pt-1">
              <ShieldCheck size={14} />
              <span>Vérification d'accès GitHub sécurisée</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-mcd-yellow hover:bg-[#E5B227] text-mcd-text font-bold py-2.5 px-4 rounded transition-colors flex items-center justify-center shadow-sm disabled:opacity-70 mt-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  <span>Vérification...</span>
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        </div>

      </div>

      {/* Badge de version et lien GitHub en bas à droite */}
      <div className="fixed bottom-4 right-4 flex items-center gap-2 text-xs bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-mcd-border shadow-sm text-mcd-muted hover:text-mcd-text transition-all">
        <span className="text-gray-300">•</span>
        <a
          href="https://github.com/rakou-fr"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-mcd-green font-medium transition-colors"
        >
          <GithubIcon className="w-3.5 h-3.5" />
          <span>GitHub</span>
        </a>
      </div>
    </div>
  );
}
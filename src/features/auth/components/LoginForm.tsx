import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { BrandLogo } from '../../../components/branding/BrandLogo';
import { loginUser } from '../services/authService';

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-mcd-light">
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
    </div>
  );
}
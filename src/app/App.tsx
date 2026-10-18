import { useState } from 'react';
import { LoginForm } from '../features/auth/components/LoginForm';
import { Dashboard } from '../features/dashboard/pages/Dashboard';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return isAuthenticated ? (
    <Dashboard onLogout={() => setIsAuthenticated(false)} />
  ) : (
    <LoginForm onLogin={() => setIsAuthenticated(true)} />
  );
}
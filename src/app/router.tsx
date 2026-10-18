import { createBrowserRouter } from 'react-router-dom';
import { LoginForm } from '../features/auth/components/LoginForm';
import { Dashboard } from '../features/dashboard/pages/Dashboard';
import { AppLayout } from '../components/layout/AppLayout';
import { StockItApp } from '../features/applications/stock-it/pages/StockItApp';
import { ActivityReportApp } from '../features/applications/reports/pages/ActivityReportApp'; // <-- Import de la page

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginForm />
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: 'apps/stock-it',
        element: <StockItApp />
      },
      {
        path: 'apps/reports', // <-- Ajout de la nouvelle route
        element: <ActivityReportApp />
      }
    ]
  }
]);
import { createBrowserRouter } from 'react-router-dom';
import { LoginForm } from '../features/auth/components/LoginForm';
import { Dashboard } from '../features/dashboard/pages/Dashboard';
import { AppLayout } from '../components/layout/AppLayout';
import { StockItApp } from '../features/applications/stock-it/pages/StockItApp';
import { WikiApp } from '../features/applications/wiki/pages/WikiApp';
import { ActivityReportApp } from '../features/applications/reports/pages/ActivityReportApp';
import { TodoApp } from '../features/applications/todo/pages/TodoApp';

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
        path: 'apps/reports',
        element: <ActivityReportApp />
      },
      {
        path: 'apps/wiki',
        element: <WikiApp />
      },
      {
        path: 'apps/todo',
        element: <TodoApp />
      }
    ]
  }
]);
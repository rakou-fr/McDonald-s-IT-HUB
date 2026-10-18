import { Box } from 'lucide-react';

export interface HubApp {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  path: string;
  isActive: boolean;
  category: 'admin' | 'tools' | 'monitoring';
}

export const applicationsRegistry: HubApp[] = [
  {
    id: 'stock-it',
    name: 'Stock IT',
    description: 'Gestion centralisée du matériel informatique avec sauvegarde GitHub.',
    icon: Box,
    path: '/apps/stock-it',
    isActive: true,
    category: 'tools'
  }
];
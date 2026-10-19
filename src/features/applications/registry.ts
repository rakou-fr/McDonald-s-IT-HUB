import { Box, FileText } from 'lucide-react';

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
    description: 'Gestion centralisée du matériel informatique par restaurant et vue globale.',
    icon: Box,
    path: '/apps/stock-it',
    isActive: true,
    category: 'tools'
  },
  {
    id: 'rapport-it',
    name: "Rapports d'Activité IT",
    description: "Générateur de comptes-rendus journaliers d'intervention et export PDF A4.",
    icon: FileText,
    path: '/apps/reports',
    isActive: true,
    category: 'tools'
  },
    {
    id: 'wiki',
    name: "Wiki IT",
    description: "Base de connaissances pour la résolution des problèmes techniques.",
    icon: FileText,
    path: '/apps/wiki',
    isActive: true,
    category: 'tools'
  }
];
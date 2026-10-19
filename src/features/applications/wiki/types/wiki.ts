export type TargetRole = 'manager' | 'it';

export interface Step {
  stepNumber: number;
  title: string;
  description: string;
  imageUrl?: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
}

export interface Tutorial {
  id: string;
  equipmentId: string;
  title: string;
  description: string;
  imageUrl: string;
  targetRole: TargetRole;
  category: string;
  tags: string[];
  steps: Step[];
}

export interface WikiData {
  equipments: Equipment[];
  tutorials: Tutorial[];
}
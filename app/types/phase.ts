export interface Phase {
  idphase?: number; // Campo real del backend (minúsculas)
  IDPhase?: number; // Campo del modelo Java
  idPhase?: number; // Compatibilidad con frontend
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  percentageProgress?: number;
  budget?: number;
  cost?: number;
  project?: { idProject: number; name?: string };
  phaseStatus?: { idPhaseStatus: number; name?: string };
  IDProjectRef?: number;
  IDPhaseStatusRef?: number;
}

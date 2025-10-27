export interface Phase {
  idPhase?: number;
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

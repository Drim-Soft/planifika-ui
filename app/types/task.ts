export interface Task {
  idTask?: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  timeInvested?: number;
  percentageProgress?: number;
  budget?: number;
  cost?: number;
  fileURL?: string;
  score?: number;
  feedback?: string;
  phase?: { idPhase: number; name?: string };
  taskStatus?: { idTaskStatus: number; name?: string };
  taskPriority?: { idTaskPriority: number; name?: string };
  user?: { idUser: number; name?: string };
  IDPhaseRef?: number;
  IDTaskStatusRef?: number;
  IDTaskPriorityRef?: number;
  IDUserRef?: number;
}

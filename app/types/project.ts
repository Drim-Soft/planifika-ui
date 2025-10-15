export interface UserRoleProjectId {
  IDUser: number;
  IDRole: number;
  IDProject: number;
}

export interface UserRoleProject {
  IDUser: number;
  IDRole: number;
  IDProject: number;
}

export interface Role {
  IDRole: number;
  methodology: Methodology;
  name: string;
}

export interface ProjectStatus {
  IDProjectStatus: number;
  name: string;
}

export interface Methodology {
  IDMethodology: number;
  name: string;
  roles?: Role[];
}

export interface Project {
  IDProject?: number;
  methodology?: Methodology;
  projectStatus?: ProjectStatus;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  percentageProgress?: number;
  budget?: number;
  cost?: number;
  percentageBudgetExecution?: number;
  IDMethodologyRef?: number;
  IDProjectStatusRef?: number;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  budget?: number;
  IDMethodologyRef: number;
  IDProjectStatusRef: number;
}

export interface ProjectFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: string;
  methodology: string;
  status: string;
}

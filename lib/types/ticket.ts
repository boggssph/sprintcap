export enum WorkType {
  BACKEND = 'BACKEND',
  FRONTEND = 'FRONTEND',
  TESTING = 'TESTING',
}

export enum ParentType {
  BUG = 'BUG',
  STORY = 'STORY',
  TASK = 'TASK',
}

export enum PlannedUnplanned {
  PLANNED = 'PLANNED',
  UNPLANNED = 'UNPLANNED',
}

export interface Ticket {
  id: string;
  jiraId: string;
  hours: number;
  workType: WorkType;
  parentType: ParentType;
  plannedUnplanned: PlannedUnplanned;
  memberId: string | null;
  sprintId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTicketRequest {
  jiraId: string;
  hours: number;
  workType: WorkType;
  parentType: ParentType;
  plannedUnplanned: PlannedUnplanned;
  memberId?: string;
}

export interface UpdateTicketRequest {
  jiraId?: string;
  hours?: number;
  workType?: WorkType;
  parentType?: ParentType;
  plannedUnplanned?: PlannedUnplanned;
  memberId?: string | null;
}
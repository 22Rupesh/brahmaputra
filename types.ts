export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface Kpi {
  name: string;
  target: string;
  targetScore: string;
  actual: string;
  weight: string;
  weightedScore: string;
  evidence: string;
  evidenceMeta?: string;
}

export interface QualitativeKpi {
  name: string;
  score: string;
  scoreValue: string;
  weight: string;
  evidence: string;
  evidenceMeta?: string;
}

export interface Task {
  id: number;
  name: string;
  projectName: string;
  dueDate: string;
  status: 'Pending' | 'Completed' | 'Overdue';
}

export interface ActivityLogEntry {
  date: string;
  count: number;
}

export interface UserProfile {
  id: number;
  name: string;
  title: string;
  email: string;
  avatar_url: string;
  score: number;
  activityLog: ActivityLogEntry[];
  performance_data: ChartDataPoint[];
  quantitativeKpis: Kpi[];
  qualitativeKpis: QualitativeKpi[];
  division: string;
  region: string;
  tasks: Task[];
  badges: any[]; // Define properly if needed
  feedback: any[]; // Define properly if needed
}

export interface Project {
    id: number;
    name: string;
    status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'On Time' | 'Slight Delay' | 'Behind Schedule';
    progress: number;
    budget_utilization: number;
    budgetUtilization?: number; // alias for camelCase used in some components
    milestones: { name: string, status: string, dueDate: string }[];
    team: number[]; // array of user IDs
}

export interface FileItem {
  id: string;
  name: string;
  metadata: {
    size: number;
    mimetype: string;
  };
  created_at: string;
}

export interface Report {
    id: number;
    name: string;
    date: string;
    format: 'PDF' | 'CSV' | 'XLSX';
    generated_by_id: number;
    generatedById?: number; // alias
}

export interface Appeal {
    id: number;
    subject: string;
    recipientId: number;
    date: string;
    status: 'Pending Review' | 'In Progress' | 'Completed';
    assigned: string; // Name of assigner
}

export interface Sepeal {
  id: number;
  subject: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'New' | 'Under Review' | 'Resolved' | 'Closed';
  assignedToId: number | null;
  createdAt: string;
}

export interface KpiPolicy {
    id: number;
    name: string;
    description: string;
    default_weight: number;
}

export interface AppraisalContent {
    id: number;
    message: string;
    events: { name: string }[];
}

export interface DprTask {
    id: number;
    userId: number;
    taskDate: string;
    description: string;
    projectId: number;
    status: 'Pending' | 'Completed' | 'Approved' | 'Rejected';
    evidenceUrl?: string | null;
    mentorNotes?: string | null;
}

export interface Broadcast {
  id: number;
  title: string;
  message: string;
  targetAudience: number[];
  createdAt: string;
}

export interface AttendanceRecord {
    id: number;
    userId: number;
    createdAt: string;
    latitude: number;
    longitude: number;
}

export interface Alert {
  id: number;
  createdAt: string;
  userId: number;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  suggestion?: string | null;
}
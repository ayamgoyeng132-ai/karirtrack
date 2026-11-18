export type StageCategory =
  | 'wishlist'
  | 'active'
  | 'interview'
  | 'offer'
  | 'accepted'
  | 'rejected';

export type StageColor =
  | 'slate'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'amber'
  | 'emerald'
  | 'teal'
  | 'rose'
  | 'cyan'
  | 'orange';

export interface StageConfig {
  id: string;
  label: string;
  color: StageColor;
  category: StageCategory;
  order: number;
}

export interface UserProfile {
  name: string;
  roleTarget: string;
  email: string;
  phone: string;
  portfolioUrl: string;
  linkedinUrl: string;
}

export interface UserPreferences {
  weeklyGoal: number;
  followUpDays: number;
  defaultCurrency: string;
  theme: 'light' | 'dark';
  density: 'comfortable' | 'compact';
  showSampleBanner?: boolean;
}

export interface AppSettings {
  profile: UserProfile;
  preferences: UserPreferences;
  stages: StageConfig[];
  platforms: string[];
  workModes: string[];
  employmentTypes: string[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface InterviewItem {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  locationOrLink: string;
  interviewer: string;
  status: 'scheduled' | 'done' | 'cancelled';
  notes: string;
}

export interface HistoryItem {
  id: string;
  stage: string;
  note: string;
  timestamp: string;
}

export type PriorityLevel = 'high' | 'medium' | 'low';

export interface JobApplication {
  id: string;
  company: string;
  position: string;
  department: string;
  location: string;
  workMode: string;
  employmentType: string;
  stage: string;
  priority: PriorityLevel;
  pinned: boolean;
  platform: string;
  jobUrl: string;
  companyUrl: string;
  currency: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryExpected: number | null;
  salaryOffered: number | null;
  benefits: string;
  appliedDate: string;
  deadlineDate: string;
  followUpDate: string;
  documentId: string;
  coverLetterUsed: boolean;
  hrName: string;
  hrRole: string;
  hrContact: string;
  referrerName: string;
  skills: string[];
  jobDescription: string;
  notes: string;
  checklist: ChecklistItem[];
  interviews: InterviewItem[];
  history: HistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  type: string;
  version: string;
  targetRole: string;
  url: string;
  notes: string;
  isDefault: boolean;
  updatedAt: string;
}

export interface MessageTemplate {
  id: string;
  title: string;
  category: string;
  subject: string;
  body: string;
  updatedAt: string;
}

export interface AppState {
  settings: AppSettings;
  jobs: JobApplication[];
  documents: DocumentItem[];
  templates: MessageTemplate[];
}

export type NavTab =
  | 'dashboard'
  | 'kanban'
  | 'table'
  | 'calendar'
  | 'documents'
  | 'settings';

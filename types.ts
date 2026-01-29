export interface SimulationConfig {
  githubToken: string;
  owner: string;
  repo: string;
  branch: string;
  startDate: string; // ISO Date string
  endDate: string;   // ISO Date string
  minCommitsPerDay: number;
  maxCommitsPerDay: number;
  weekendIntensity: number; // 0-1
  useGemini: boolean;
  apiKey?: string;
  simulatePRs: boolean;
  simulateIssues: boolean;
  branchingStrategy: 'gitflow' | 'simple';
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

export interface CommitPlan {
  date: Date;
  count: number;
  messages: string[];
}

export interface SimulationStats {
  totalCommits: number;
  totalDays: number;
  estimatedDuration: number; // seconds
}

export enum SimulationStatus {
  IDLE = 'IDLE',
  PLANNING = 'PLANNING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
  PAUSED = 'PAUSED'
}

export interface GithubFile {
  path: string;
  content: string;
}
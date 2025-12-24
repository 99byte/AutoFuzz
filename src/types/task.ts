export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'crashed' | 'timeout';

export type CrashSeverity = 'critical' | 'high' | 'medium' | 'low';

export type CrashType = 'native_crash' | 'ANR' | 'java_exception' | 'process_dead';

export interface CreateTaskInput {
  name: string;
  targetApp: string;
  appDescription?: string;
  testConfig: TestConfig;
}

export interface TestConfig {
  testDepth: number;
  focusAreas: string[];
}

export interface FuzzTask {
  id: string;
  name: string;
  targetApp: string;
  appDescription: string | null;
  testCases: string;
  testConfig: string;
  status: TaskStatus;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  executions?: TestExecution[];
  crashReports?: CrashReport[];
  result?: TestResult | null;
}

export interface TestExecution {
  id: string;
  taskId: string;
  testCaseIndex: number;
  status: ExecutionStatus;
  startTime: Date;
  endTime: Date | null;
  duration: number | null;
  logs: string | null;
  screenshotUrl: string | null;
  crashReport?: CrashReport | null;
}

export interface CrashReport {
  id: string;
  executionId: string;
  taskId: string;
  crashType: CrashType;
  stackTrace: string | null;
  package: string;
  severity: CrashSeverity;
  description: string | null;
  screenshotPath: string | null;
  logcatPath: string | null;
  createdAt: Date;
}

export interface TestResult {
  id: string;
  taskId: string;
  totalCases: number;
  passedCases: number;
  failedCases: number;
  crashCount: number;
  timeoutCount: number;
  executionTime: number;
  summary: string | null;
  createdAt: Date;
  updatedAt: Date;
}

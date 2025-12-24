export type ActionType = 'Launch' | 'Tap' | 'Type' | 'Swipe' | 'Back' | 'Home' | 'LongPress' | 'Wait';

export interface AutoGLMConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface FuzzAction {
  action: ActionType;
  description: string;
  params: Record<string, any>;
}

export interface FuzzResult {
  success: boolean;
  action: FuzzAction;
  screenshot?: string;
  error?: string;
  timestamp: number;
}

export interface ExecuteFuzzInput {
  taskId: string;
  targetApp: string;
  testCases: FuzzAction[][];
}

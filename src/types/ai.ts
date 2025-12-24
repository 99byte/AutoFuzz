export interface TestCaseGenerationConfig {
  targetApp: string;
  appDescription: string;
  testDepth: number;
  focusAreas: string[];
}

export interface FuzzActionDetail {
  action: string;
  description: string;
  params: {
    app?: string;
    element?: string;
    text?: string;
    direction?: string;
    duration?: number;
  };
}

export interface GeneratedTestCase {
  id: string;
  description: string;
  category: string;
  actions: FuzzActionDetail[];
  expectedBehavior: string;
  crashProbability: 'high' | 'medium' | 'low';
}

export interface AIAnalysisResult {
  summary: string;
  crashPatterns: string[];
  recommendations: string[];
}

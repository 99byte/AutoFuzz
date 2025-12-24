import { Node, Edge } from '@xyflow/react';

export type NodeStatus = 'completed' | 'failed' | 'crashed';

export interface TestCaseSummary {
  id: string;
  testCaseIndex: number;
  totalActions: number;
  successCount: number;
  failedCount: number;
  crashCount: number;
  totalDuration: number;
  finalScreenshotUrl: string;
  isCollapsed: boolean;
  position: { x: number; y: number };
}

export interface TestStateNode extends Node {
  testCaseIndex: number;
  actionIndex: number;
  actionType: string;
  actionDescription: string;
  screenshotUrl: string;
  timestamp: number;
  duration: number;
  success: boolean;
  status: NodeStatus;
  position: { x: number; y: number };
}

export interface FlowEdge extends Edge {
  source: string;
  target: string;
  type?: 'smoothstep' | 'straight';
  animated?: boolean;
  style?: React.CSSProperties;
}

export interface FlowState {
  nodes: TestStateNode[];
  edges: FlowEdge[];
  testCaseSummaries: TestCaseSummary[];
  testCaseCollapsed: Map<number, boolean>;
  viewport: { x: number; y: number; zoom: number };
}

export interface ActionCompletedEvent {
  type: 'action_completed_with_state';
  testCaseIndex: number;
  actionIndex: number;
  action: {
    type: string;
    description: string;
    params: any;
  };
  screenshotUrl: string;
  timestamp: number;
  duration: number;
  success: boolean;
  status: NodeStatus;
}

export interface CrashWithStateEvent {
  type: 'crash_with_state';
  testCaseIndex: number;
  actionIndex: number;
  screenshotUrl: string;
  timestamp: number;
  crash: {
    type: string;
    package: string;
    stackTrace: string;
    severity: string;
  };
}

export interface TestCaseCompletedEvent {
  type: 'test_case_completed';
  testCaseIndex: number;
  totalActions: number;
  successCount: number;
  failedCount: number;
  crashCount: number;
  totalDuration: number;
  finalScreenshotUrl: string;
}

export type FlowEvent = ActionCompletedEvent | CrashWithStateEvent | TestCaseCompletedEvent;

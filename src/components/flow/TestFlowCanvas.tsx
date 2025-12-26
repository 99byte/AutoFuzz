'use client';

import { useCallback, memo } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useReactFlow,
  Edge,
  Node,
  NodeTypes
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ActionNode } from './nodes/ActionNode';
import { CrashNode } from './nodes/CrashNode';
import { SummaryNode } from './nodes/SummaryNode';
import { NodeTooltip } from './NodeTooltip';
import { TestStateNode, TestCaseSummary } from '@/types/flow';
import { useState } from 'react';

interface TestFlowCanvasProps {
  nodes: (TestStateNode | TestCaseSummary)[];
  edges: Edge[];
  viewport: { x: number; y: number; zoom: number };
  onViewportChange: (viewport: { x: number; y: number; zoom: number }) => void;
  onToggleCollapse: (testCaseIndex: number) => void;
  onClear: () => void;
  onFitView: () => void;
}

const nodeTypes: NodeTypes = {
  actionNode: ActionNode,
  crashNode: CrashNode,
  summaryNode: SummaryNode
};

const FlowContent = memo(({
  nodes,
  edges,
  onViewportChange,
  onToggleCollapse
}: TestFlowCanvasProps) => {
  const { fitView, zoomIn, zoomOut, setViewport } = useReactFlow();
  const [tooltipNode, setTooltipNode] = useState<Node | null>(null);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.type === 'summaryNode') {
      const data = node.data as unknown as TestCaseSummary;
      onToggleCollapse(data.testCaseIndex);
    }
  }, [onToggleCollapse]);

  const handleNodeMouseEnter = useCallback((event: React.MouseEvent, node: Node) => {
    setTooltipNode(node);
  }, []);

  const handleNodeMouseLeave = useCallback(() => {
    setTooltipNode(null);
  }, []);


  return (
    <>
      <ReactFlow
        nodes={nodes as unknown as Node[]}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
        onViewportChange={onViewportChange}
        fitView
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.25}
        maxZoom={4}
        snapToGrid
        snapGrid={[20, 20]}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="#cbd5e1"
          gap={20}
          size={2}
          variant={BackgroundVariant.Dots}
          style={{ backgroundColor: '#f1f5f9' }}
        />

        <Controls />

        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'crashNode') return '#ef4444';
            if (node.type === 'actionNode') {
              const data = node.data as unknown as TestStateNode;
              if (data.status === 'failed') return '#fbbf24';
              return '#22c55e';
            }
            return '#94a3b8';
          }}
          className="!bg-white/90 !backdrop-blur-sm"
          maskColor="rgba(0, 0, 0, 0.1)"
        />

      </ReactFlow>

      {tooltipNode && (
        <NodeTooltip
          node={tooltipNode.data}
          visible={true}
          onClose={() => setTooltipNode(null)}
        />
      )}
    </>
  );
});

FlowContent.displayName = 'FlowContent';

export const TestFlowCanvas = memo((props: TestFlowCanvasProps) => {
  return (
    <div className="w-full h-full relative">
      <FlowContent {...props} />
    </div>
  );
});

TestFlowCanvas.displayName = 'TestFlowCanvas';

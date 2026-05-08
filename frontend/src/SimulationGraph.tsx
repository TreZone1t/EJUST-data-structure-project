import React, { useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  MarkerType
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { CustomerData } from './CustomerTable';

// Custom Server Node
const ServerNode = ({ data }: any) => {
  return (
    <div className="relative flex flex-col items-center justify-center p-4 bg-white border-2 border-blue-500 rounded-lg shadow-lg min-w-[120px]">
      <Handle type="target" position={Position.Top} className="!bg-blue-500" />
      
      {/* Service Area Halo */}
      <div className="absolute inset-0 -m-8 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50 bg-opacity-30 pointer-events-none animate-pulse"></div>
      
      <div className="text-3xl mb-2 z-10">👨‍💻</div>
      <div className="font-bold text-gray-800 z-10">{data.label}</div>
      <div className="text-xs text-gray-500 z-10">Service Area Active</div>
      
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </div>
  );
};

// Custom Customer Node
const CustomerNode = ({ data }: any) => {
  return (
    <div className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-full shadow-md min-w-[60px] min-h-[60px]">
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      <div className="font-bold text-gray-800">#{data.ticket}</div>
      <div className="text-[10px] text-amber-600 font-medium">Wait: {data.wait}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  );
};

const nodeTypes = {
  server: ServerNode,
  customer: CustomerNode,
};

interface SimulationGraphProps {
  numServers: number;
  customers: CustomerData[];
}

export const SimulationGraph: React.FC<SimulationGraphProps> = ({ numServers, customers }) => {
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    // Create Server Nodes at the top
    const serverSpacingX = 300;
    const startX = -((numServers - 1) * serverSpacingX) / 2;
    
    for (let i = 0; i < numServers; i++) {
      nodes.push({
        id: `server-${i}`,
        type: 'server',
        position: { x: startX + i * serverSpacingX, y: 50 },
        data: { label: `Server ${i + 1}` },
      });
    }

    // Group customers by server
    const serverQueues: Record<number, CustomerData[]> = {};
    for (let i = 0; i < numServers; i++) serverQueues[i] = [];
    
    customers.forEach(c => {
      if (serverQueues[c.serverId]) {
        serverQueues[c.serverId].push(c);
      }
    });

    // Create Customer Nodes and connect them
    Object.keys(serverQueues).forEach(serverIdStr => {
      const serverId = parseInt(serverIdStr);
      const queue = serverQueues[serverId];
      
      // Sort queue by arrival time
      queue.sort((a, b) => a.arrivalTime - b.arrivalTime);

      queue.forEach((c, index) => {
        const customerNodeId = `customer-${c.ticketNumber}`;
        const serverX = startX + serverId * serverSpacingX;
        
        // Vertical spacing based on wait time / queue position
        // Distance is simulated by wait time + index offset to avoid overlap
        const yOffset = 250 + (index * 100);
        
        nodes.push({
          id: customerNodeId,
          type: 'customer',
          position: { x: serverX, y: yOffset },
          data: { 
            ticket: c.ticketNumber,
            wait: c.queueWaitTime
          },
        });

        // Edge connecting customer to previous customer (or server)
        const targetId = index === 0 ? `server-${serverId}` : `customer-${queue[index - 1].ticketNumber}`;
        
        edges.push({
          id: `e-${customerNodeId}-${targetId}`,
          source: customerNodeId,
          target: targetId,
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#3b82f6',
          },
        });
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [numServers, customers]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update state when props change
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div style={{ width: '100%', height: '600px' }} className="border border-gray-200 rounded-xl overflow-hidden shadow-inner bg-gray-50/50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Background gap={16} size={1} />
        <MiniMap zoomable pannable nodeColor={(n) => {
          if (n.type === 'server') return '#3b82f6';
          return '#9ca3af';
        }} />
        <Controls />
      </ReactFlow>
    </div>
  );
};

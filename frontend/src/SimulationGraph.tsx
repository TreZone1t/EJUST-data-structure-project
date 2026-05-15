import { useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { ServerData } from './App';

export interface CustomerData {
  id: number;
  x: number;
  y: number;
  arrivalTime: number;
  transactionTime: number;
  queueWaitTime: number;
  windowOpenTime: number;
  serviceEndTime: number;
  serverId: number;
}



const ServerNode = ({ data }: any) => {
  return (
    <div className="relative flex flex-col items-center justify-center w-20 h-20 bg-slate-900 border-2 border-cyan-400 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.4)] z-50 group">
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <div className="absolute inset-0 bg-cyan-500/10 rounded-2xl"></div>
      <div className="text-3xl z-10">📡</div>
      {/* Coverage Area */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-cyan-500/30 bg-cyan-900/10 flex items-center justify-center pointer-events-none -z-10"
        style={{ width: data.radius * 2, height: data.radius * 2 }}
      >
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 bg-cyan-900/10"></div>
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-cyan-400 text-[10px] font-bold tracking-[0.2em] uppercase bg-slate-950/90 px-3 py-1 rounded-full border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)] whitespace-nowrap">
          {data.label} Coverage
        </div>
      </div>

      {/* Server Label */}
      <div className="absolute -bottom-8 whitespace-nowrap font-bold text-cyan-300 text-sm z-10 bg-slate-900 px-3 py-1 rounded-full border border-cyan-500/50 shadow-md">
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
    </div>
  );
};

const CustomerNode = ({ data }: any) => {
  return (
    <div 
      className="relative group flex items-center justify-center w-4 h-4 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] cursor-pointer z-40 border border-white/20"
      style={{ backgroundColor: data.color || '#ec4899' }}
    >
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <div className="absolute -top-12 hidden group-hover:flex flex-col items-center bg-slate-900 text-xs text-white p-2 rounded-lg border border-slate-700 whitespace-nowrap z-[100] shadow-2xl">
        <span className="font-bold mb-0.5" style={{ color: data.color || '#ec4899' }}>User #{data.ticket}</span>
        <span className="text-[10px] text-slate-400">Wait: {data.wait}ms</span>
        <div className="absolute -bottom-1.5 w-3 h-3 bg-slate-900 border-b border-r border-slate-700 rotate-45"></div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
    </div>
  );
};

const nodeTypes = {
  server: ServerNode,
  customer: CustomerNode,
};

interface SimulationGraphProps {
  servers: ServerData[];
  customers: CustomerData[];
  isRunning: boolean;
}

export const SimulationGraph: React.FC<SimulationGraphProps> = ({ servers, customers, isRunning }) => {
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const coverageRadius = 350;

    servers.forEach((s) => {
      const cx = s.x;
      const cy = s.y;

      nodes.push({
        id: `server-${s.id}`,
        type: 'server',
        position: { x: cx - 40, y: cy - 40 },
        data: { label: `Server ${s.id}`, radius: coverageRadius, isRunning },
        style: { zIndex: 50 },
      });
    });

    // Build a lookup map: serverId -> server canvas position
    const serverPos: Record<number, { cx: number; cy: number }> = {};
    servers.forEach((s) => {
      serverPos[s.id] = { cx: s.x, cy: s.y };
    });

    // Group customers by serverId
    const grouped: Record<number, CustomerData[]> = {};
    customers.forEach((c) => {
      if (c.serverId === -1) return; // skip unassigned
      if (!grouped[c.serverId]) grouped[c.serverId] = [];
      grouped[c.serverId].push(c);
    });

    // Place each group in a circle around the server
    Object.entries(grouped).forEach(([serverIdStr, group]) => {
      const serverId = parseInt(serverIdStr);
      const pos = serverPos[serverId];
      if (!pos) return;

      group.forEach((c, idx) => {
        const customerNodeId = `customer-${c.id}`;
        
        // Use a pseudo-random seed based on customer ID for stable "randomness"
        const seed = (c.id * 1337) % 1000 / 1000;
        const jitterX = (seed * 100 - 50);
        const jitterY = (((seed * 1234) % 1000) / 1000 * 100 - 50);

        const angle = (idx * (360 / Math.max(group.length, 8))) * (Math.PI / 180);
        const baseRadius = 180 + Math.floor(idx / 8) * 70;
        
        const px = pos.cx + Math.cos(angle) * baseRadius + jitterX;
        const py = pos.cy + Math.sin(angle) * baseRadius + jitterY;

        nodes.push({
          id: customerNodeId,
          type: 'customer',
          position: { x: px, y: py },
          data: {
            ticket: c.id,
            wait: c.queueWaitTime,
            color: (c as any).color,
            isRunning
          },
          style: { zIndex: 40 },
          draggable: true,
        });

        edges.push({
          id: `e-${customerNodeId}-server-${serverId}`,
          source: customerNodeId,
          target: `server-${serverId}`,
          animated: isRunning,
          style: { stroke: 'rgba(217, 70, 239, 0.25)', strokeWidth: 1.5 },
        });
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [servers, customers, isRunning]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div className="absolute inset-0">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        colorMode="dark"
        minZoom={0.05}
        maxZoom={1.5}
        className="bg-slate-950"
      >
        <Background gap={40} size={1.5} color="rgba(148, 163, 184, 0.05)" />
        <Controls
          className="bg-slate-800/80 backdrop-blur-md border border-slate-700 fill-slate-300 rounded-xl overflow-hidden shadow-2xl"
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
};

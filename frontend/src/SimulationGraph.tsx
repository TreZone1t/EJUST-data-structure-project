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
import type { CustomerData } from './CustomerTable';

const CoverageNode = ({ data }: any) => {
  return (
    <div
      className="rounded-full border-2 border-dashed border-cyan-500/30 bg-cyan-900/10 flex items-center justify-center pointer-events-none"
      style={{ width: data.radius * 2, height: data.radius * 2 }}
    >
      <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 bg-cyan-900/10"></div>
      <div className="absolute top-8 text-cyan-400 text-sm font-bold tracking-[0.2em] uppercase bg-slate-900/80 px-4 py-1 rounded-full border border-cyan-500/30">
        {data.label} Coverage
      </div>
    </div>
  );
};

const ServerNode = ({ data }: any) => {
  return (
    <div className="relative flex flex-col items-center justify-center w-20 h-20 bg-slate-900 border-2 border-cyan-400 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.4)] z-50 group">
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <div className="absolute inset-0 bg-cyan-500/10 rounded-2xl"></div>
      <div className="text-3xl z-10">📡</div>

      <div className="absolute -bottom-8 whitespace-nowrap font-bold text-cyan-300 text-sm z-10 bg-slate-900 px-3 py-1 rounded-full border border-cyan-500/50 shadow-md">
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
    </div>
  );
};

const CustomerNode = ({ data }: any) => {
  return (
    <div className="relative group flex items-center justify-center w-4 h-4 bg-fuchsia-500 border border-fuchsia-300 rounded-full shadow-[0_0_8px_rgba(217,70,239,0.8)] cursor-pointer z-40">
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <div className="absolute -top-12 hidden group-hover:flex flex-col items-center bg-slate-900 text-xs text-white p-2 rounded-lg border border-slate-700 whitespace-nowrap z-[100] shadow-2xl">
        <span className="font-bold text-fuchsia-300 mb-0.5">User #{data.ticket}</span>
        <span className="text-[10px] text-slate-400">Wait: {data.wait}s</span>
        <div className="absolute -bottom-1.5 w-3 h-3 bg-slate-900 border-b border-r border-slate-700 rotate-45"></div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
    </div>
  );
};

const nodeTypes = {
  coverage: CoverageNode,
  server: ServerNode,
  customer: CustomerNode,
};

interface SimulationGraphProps {
  numServers: number;
  customers: CustomerData[];
  isRunning: boolean;
}

export const SimulationGraph: React.FC<SimulationGraphProps> = ({ numServers, customers, isRunning }) => {
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const coverageRadius = 350;
    const serverSpacingX = 850;
    const startX = -((numServers - 1) * serverSpacingX) / 2;
    for (let i = 0; i < numServers; i++) {
      const cx = startX + i * serverSpacingX;
      const cy = 0;
      nodes.push({
        id: `coverage-${i}`,
        type: 'coverage',
        position: { x: cx - coverageRadius, y: cy - coverageRadius },
        data: { label: `Zone ${i + 1}`, radius: coverageRadius, isRunning },
        style: { zIndex: -1 },
        draggable: false,
        selectable: false,
      });
      nodes.push({
        id: `server-${i}`,
        type: 'server',
        position: { x: cx - 40, y: cy - 40 },
        data: { label: `Server ${i + 1}`, isRunning },
        style: { zIndex: 50 },
      });
    }
    const serverQueues: Record<number, CustomerData[]> = {};
    for (let i = 0; i < numServers; i++) serverQueues[i] = [];
    customers.forEach(c => {
      if (serverQueues[c.serverId]) {
        serverQueues[c.serverId].push(c);
      } else if (numServers > 0) {
        serverQueues[c.serverId % numServers].push(c);
      }
    });
    Object.keys(serverQueues).forEach(serverIdStr => {
      const serverId = parseInt(serverIdStr);
      const queue = serverQueues[serverId];
      const cx = startX + serverId * serverSpacingX;
      const cy = 0;
      queue.forEach((c) => {
        const customerNodeId = `customer-${c.ticketNumber}`;
        const minRadius = 90;
        const maxRadius = coverageRadius - 40;
        const angle = (c.ticketNumber * 137.5) * (Math.PI / 180);
        const pseudoRandom = ((c.ticketNumber * 9301 + 49297) % 233280) / 233280;
        const r = minRadius + Math.sqrt(pseudoRandom) * (maxRadius - minRadius);
        const px = cx + r * Math.cos(angle) - 8;
        const py = cy + r * Math.sin(angle) - 8;
        nodes.push({
          id: customerNodeId,
          type: 'customer',
          position: { x: px, y: py },
          data: {
            ticket: c.ticketNumber,
            wait: c.queueWaitTime,
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
          style: { stroke: 'rgba(217, 70, 239, 0.15)', strokeWidth: 1.5 },
        });
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [numServers, customers, isRunning]);

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

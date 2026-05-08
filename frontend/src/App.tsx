import { useState, useEffect } from 'react';
import { SimulationGraph } from './SimulationGraph';
import axios from 'axios';

export interface CustomerData {
  ticketNumber: number;
  arrivalTime: number;
  transactionTime: number;
  queueWaitTime: number;
  windowOpenTime: number;
  serviceEndTime: number;
  serverId: number;
}

export interface ServerData {
  id: number;
  queueLength: number;
  isBusy: boolean;
  totalServed: number;
  totalBusyTime: number;
  avgWaitTime: number;
}

export interface SimulationState {
  time: number;
  isRunning: boolean;
  servers: ServerData[];
  customers: CustomerData[];
}

function App() {
  const [data, setData] = useState<SimulationState>({ time: 0, isRunning: false, servers: [], customers: [] });
  const [numServers, setNumServers] = useState<number | string>(3);
  const [maxCustomers, setMaxCustomers] = useState<number | string>("-1");
  const [error, setError] = useState<string | null>(null);

  // Use absolute URL in dev mode, and relative URL in production (when served by C++)
  const backendUrl = import.meta.env.DEV ? `http://${window.location.hostname}:8080` : '';

  const startSimulation = async () => {
    try {
      const serversCount = numServers === '' ? 1 : Number(numServers);
      const custLimit = maxCustomers === '' ? -1 : Number(maxCustomers);
      await axios.get(`${backendUrl}/api/start?servers=${serversCount}&customers=${custLimit}`);
      fetchSimulationData();
    } catch (err) {
      console.error("Failed to start", err);
      setError("Failed to start simulation. Is the C++ server running?");
    }
  };

  const stopSimulation = async () => {
    try {
      await axios.get(`${backendUrl}/api/stop`);
    } catch (err) {
      console.error("Failed to stop", err);
    }
  };

  const fetchSimulationData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/data`);
      if (response.data) {
        setData(response.data);
        setError(null);
      }
    } catch (err) {
      setError(`Failed to connect to C++ Backend (${backendUrl})`);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchSimulationData();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-950 font-sans text-slate-200 flex flex-col">
      <header className="p-4 border-b border-slate-800/50 bg-slate-900/60 backdrop-blur-xl sticky top-0 w-full z-50 shadow-lg shadow-black/20 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 tracking-tight">
            Network Topology & Server Load
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-medium flex items-center gap-2">
            Status: {data.isRunning ? 'Live' : 'Stopped'}
            <span className={`w-2 h-2 rounded-full block ${data.isRunning ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`}></span>
            Time: {data.time}s
          </p>
          {error && <p className="text-red-400 text-xs mt-1 font-bold animate-pulse">{error}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-slate-800/50 p-2 rounded-xl border border-slate-700/50">
          <div className="flex flex-col">
            <label className="text-[10px] text-slate-400 font-bold tracking-wider mb-1">SERVERS</label>
            <input
              type="number"
              min={1} max={10}
              value={numServers}
              onChange={(e) => setNumServers(e.target.value === '' ? '' : parseInt(e.target.value))}
              className="bg-slate-900 border border-slate-600 rounded px-2 py-1 w-16 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] text-slate-400 font-bold tracking-wider mb-1">MAX CUSTOMERS</label>
            <input
              type="number"
              min={-1}
              value={maxCustomers}
              onChange={(e) => setMaxCustomers(e.target.value === '' ? '' : parseInt(e.target.value))}
              className="bg-slate-900 border border-slate-600 rounded px-2 py-1 w-20 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              title="-1 for infinite"
            />
          </div>
          <div className="flex gap-2 items-end h-full">
            <button
              onClick={startSimulation}
              className="bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold py-1.5 px-4 rounded-lg transition-all shadow-[0_0_10px_rgba(8,145,178,0.4)] hover:shadow-[0_0_20px_rgba(34,211,238,0.6)] active:scale-95 cursor-pointer"
            >
              Start / Restart
            </button>
            <button
              onClick={stopSimulation}
              className="bg-red-600 hover:bg-red-500 text-white text-sm font-bold py-1.5 px-4 rounded-lg transition-all shadow-[0_0_10px_rgba(220,38,38,0.4)] hover:shadow-[0_0_20px_rgba(248,113,113,0.6)] active:scale-95 cursor-pointer"
            >
              Stop
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full relative min-h-[60vh] border-b border-slate-800">
        <SimulationGraph numServers={data.servers.length} customers={data.customers} isRunning={data.isRunning} />
      </main>
      <section className="p-6 bg-slate-900/40">
        <h2 className="text-xl font-bold mb-4 text-slate-300 flex items-center gap-2">
          <span className="text-fuchsia-400">📊</span> Server Performance Analytics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.servers.map(server => (
            <div key={server.id} className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 shadow-lg hover:border-cyan-500/50 transition-colors relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/10 rounded-bl-full -z-10 group-hover:scale-150 transition-transform"></div>

              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-cyan-400">Server {server.id}</h3>
                <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full border ${server.isBusy ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30 animate-pulse' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}`}>
                  {server.isBusy ? 'Busy' : 'Idle'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Queue Length:</span>
                  <span className="font-mono text-white bg-slate-900 px-2 rounded border border-slate-700">{server.queueLength}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Total Served:</span>
                  <span className="font-mono text-white">{server.totalServed}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Avg Wait Time:</span>
                  <span className="font-mono text-amber-400">{server.avgWaitTime}s</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Throughput:</span>
                  <span className="font-mono text-emerald-400">
                    {(server.totalServed / Math.max(1, data.time)).toFixed(2)} /s
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Utilization:</span>
                  <span className="font-mono text-blue-400">
                    {Math.min(100, (server.totalBusyTime / Math.max(1, data.time)) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
          {data.servers.length === 0 && (
            <div className="col-span-full text-center py-8 text-slate-500 italic">
              Click "Start" to begin the simulation.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;

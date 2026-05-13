import { useState, useEffect, useRef } from 'react';
import { SimulationGraph } from './SimulationGraph';
import axios from 'axios';

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

export interface ServerData {
  id: number;
  x: number;
  y: number;
  queueLength: number;
  isBusy: boolean;
  totalServed: number;
  totalBusyTime: number;
  avgWaitTime: number;
}

export interface SimulationState {
  time: number;
  isRunning: boolean;
  isFinished: boolean;
  servers: ServerData[];
  customers: CustomerData[];
  completedCustomers: CustomerData[];
}

function App() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [data, setData] = useState<SimulationState>({ time: 0, isRunning: false, isFinished: false, servers: [], customers: [], completedCustomers: [] });
  const [numServers, setNumServers] = useState<number | string>(3);
  const [Squeue, setSqueue] = useState<number | string>("3");
  const [maxCustomers, setMaxCustomers] = useState<number | string>("100");
  const [arrivalRate, setArrivalRate] = useState<number | string>("2");
  const [error, setError] = useState<string | null>(null);
  const [finishTime, setFinishTime] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  // Use absolute URL in dev mode, and relative URL in production (when served by C++)
  const backendUrl = import.meta.env.DEV ? `http://${window.location.hostname}:8081` : '';

  const startSimulation = async () => {
    try {
      const serversCount = numServers === '' ? 1 : Number(numServers);
      const custLimit = maxCustomers === '' ? 100 : Number(maxCustomers);
      const rate = arrivalRate === '' ? 2 : Number(arrivalRate);
      setFinishTime(null);
      await axios.get(`${backendUrl}/api/start?servers=${serversCount}&Squeue=${Squeue}&customers=${custLimit}&arrivalRate=${rate}`);
      // Start polling
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(fetchSimulationData, 300);
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

  // When simulation finishes: stop polling, call stop API, record finish time
  useEffect(() => {
    if (data.isFinished && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setFinishTime(data.time);
      setReportOpen(true);
      axios.get(`${backendUrl}/api/stop`).catch(() => { });
    }
  }, [data.isFinished]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-950 font-sans text-slate-200 flex flex-col">
      <header className="p-4 border-b border-slate-800/50 bg-slate-900/60 backdrop-blur-xl sticky top-0 w-full z-50 shadow-lg shadow-black/20 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 tracking-tight">
            Network Topology & Server Load
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-medium flex items-center gap-2">
            {data.isFinished
              ? <span className="text-emerald-400 font-bold">✓ Completed</span>
              : <>Status: {data.isRunning ? 'Live' : 'Stopped'}
                <span className={`w-2 h-2 rounded-full block ${data.isRunning ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`}></span>
              </>}
            {' '}·{' '}
            {finishTime !== null
              ? <>
                <span className="text-emerald-300 font-bold">Finished at tick {finishTime}</span>
                <button onClick={() => setReportOpen(true)} className="ml-2 px-2 py-0.5 text-xs bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition-all font-bold">📋 View Report</button>
              </>
              : <>Time: {data.time}s</>}
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
          <div className="flex flex-col">
            <label className="text-[10px] text-slate-400 font-bold tracking-wider mb-1">ARRIVAL RATE <span className="text-slate-600">/tick</span></label>
            <input
              type="number"
              min={1} max={50}
              value={arrivalRate}
              onChange={(e) => setArrivalRate(e.target.value === '' ? '' : parseInt(e.target.value))}
              className="bg-slate-900 border border-slate-600 rounded px-2 py-1 w-16 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              title="New customers arriving per tick"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] text-slate-400 font-bold tracking-wider mb-1">Queue Size</label>
            <input
              type="number"
              min={-1}
              value={Squeue}
              onChange={(e) => setSqueue(e.target.value === '' ? '' : parseInt(e.target.value))}
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
        <SimulationGraph servers={data.servers} customers={data.customers} isRunning={data.isRunning} />
      </main>
      <section className="p-6 bg-slate-900/40">
        <h2 className="text-xl font-bold mb-4 text-slate-300 flex items-center gap-2">
          <span className="text-fuchsia-400">📊</span> Server Performance Analytics
          <button
            onClick={() => setDrawerOpen(true)}
            className="ml-auto flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all"
          >
            <span>👥</span> Customer Data
            <span className="bg-cyan-500/30 text-cyan-200 rounded-full px-1.5 py-0.5 text-[10px]">{data.customers.length}</span>
          </button>
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

              <button
                onClick={() => startSimulation()}
              >Click "Start" or here to begin the simulation.
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Customer Data Drawer */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-3xl bg-slate-900 border-l border-slate-700 z-50 flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/80">
              <div>
                <h3 className="text-lg font-bold text-white">👥 Customer Data</h3>
                <p className="text-xs text-slate-400 mt-0.5">{data.customers.length} customers in queues · Tick {data.time}</p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-slate-400 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700 transition-colors"
              >✕</button>
            </div>
            {/* Table */}
            <div className="flex-1 overflow-auto p-4">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-slate-800 text-slate-300 text-xs uppercase tracking-wider">
                  <tr>
                    {['Ticket', 'Server', 'Status', 'Arrival', 'Tx Time', 'Waiting', 'Start', 'End', 'Total'].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-semibold border-b border-slate-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data.customers.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-10 text-slate-500 italic">No customers yet. Start the simulation.</td></tr>
                  ) : data.customers.map((c) => {
                    const isServed = c.windowOpenTime > 0;
                    const currentWait = isServed ? c.queueWaitTime : (data.time - c.arrivalTime);
                    return (
                      <tr key={c.id} className="hover:bg-slate-800/60 transition-colors">
                        <td className="px-3 py-2 font-mono text-cyan-400 font-bold">#{c.id}</td>
                        <td className="px-3 py-2 text-slate-300">Server ID: {c.serverId}</td>
                        <td className="px-3 py-2">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${isServed
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                            }`}>
                            {isServed ? 'Served' : 'Waiting'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-400">{c.arrivalTime}</td>
                        <td className="px-3 py-2 text-slate-400">{c.transactionTime}</td>
                        <td className={`px-3 py-2 font-mono font-bold ${currentWait > 10 ? 'text-red-400' : currentWait > 0 ? 'text-amber-400' : 'text-slate-500'
                          }`}>
                          {currentWait}s {!isServed && <span className="text-[10px] text-slate-500">(live)</span>}
                        </td>
                        <td className="px-3 py-2 text-slate-400">{isServed ? c.windowOpenTime : '—'}</td>
                        <td className="px-3 py-2 text-emerald-400 font-mono">{c.serviceEndTime || '—'}</td>
                        <td className="px-3 py-2 text-blue-400 font-mono">
                          {c.serviceEndTime ? c.serviceEndTime - c.arrivalTime : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Footer stats */}
            <div className="px-6 py-3 border-t border-slate-700 bg-slate-800/50 flex gap-6 text-xs text-slate-400">
              <span>Total: <strong className="text-white">{data.customers.length}</strong></span>
              <span>Avg Wait: <strong className="text-amber-400">
                {data.customers.length > 0
                  ? (data.customers.reduce((s, c) =>
                    s + (c.windowOpenTime > 0 ? c.queueWaitTime : (data.time - c.arrivalTime))
                    , 0) / data.customers.length).toFixed(1)
                  : 0}s
              </strong></span>
              <span>Avg Tx: <strong className="text-cyan-400">
                {data.customers.length > 0
                  ? (data.customers.reduce((s, c) => s + c.transactionTime, 0) / data.customers.length).toFixed(1)
                  : 0}s
              </strong></span>
            </div>
          </div>
        </>
      )}
      {reportOpen && (() => {
        const done = data.completedCustomers;
        const totalServed = done.length;
        const avgWait = totalServed > 0 ? (done.reduce((s, c) => s + c.queueWaitTime, 0) / totalServed) : 0;
        const avgTx = totalServed > 0 ? (done.reduce((s, c) => s + c.transactionTime, 0) / totalServed) : 0;
        const avgTotal = totalServed > 0 ? (done.reduce((s, c) => s + (c.serviceEndTime - c.arrivalTime), 0) / totalServed) : 0;
        const maxWait = totalServed > 0 ? Math.max(...done.map(c => c.queueWaitTime)) : 0;
        const minWait = totalServed > 0 ? Math.min(...done.map(c => c.queueWaitTime)) : 0;
        return (
          <>
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={() => setReportOpen(false)} />
            <div className="fixed inset-4 md:inset-10 bg-slate-900 border border-slate-700 rounded-2xl z-50 flex flex-col shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-gradient-to-r from-emerald-900/40 to-slate-800/80">
                <div>
                  <h2 className="text-xl font-bold text-white">📋 Simulation Report</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Completed at tick {finishTime} · {totalServed} customers served</p>
                </div>
                <button onClick={() => setReportOpen(false)} className="text-slate-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700 transition-colors text-xl font-bold">✕</button>
              </div>
              <div className="flex-1 overflow-auto p-6 space-y-6">
                {/* Global KPIs */}
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Global Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {[
                      { label: 'Total Served', value: totalServed, color: 'text-white' },
                      { label: 'Total Time (ticks)', value: finishTime ?? 0, color: 'text-cyan-400' },
                      { label: 'Avg Wait', value: avgWait.toFixed(1) + 's', color: 'text-amber-400' },
                      { label: 'Max Wait', value: maxWait + 's', color: 'text-red-400' },
                      { label: 'Min Wait', value: minWait + 's', color: 'text-emerald-400' },
                      { label: 'Avg Service', value: avgTx.toFixed(1) + 's', color: 'text-blue-400' },
                      { label: 'Avg Total Time', value: avgTotal.toFixed(1) + 's', color: 'text-fuchsia-400' },
                      { label: 'Throughput', value: ((totalServed / Math.max(1, finishTime ?? 1))).toFixed(2) + '/tick', color: 'text-emerald-400' },
                    ].map(kpi => (
                      <div key={kpi.label} className="bg-slate-800 border border-slate-700 rounded-xl p-3">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">{kpi.label}</div>
                        <div className={`text-lg font-bold font-mono ${kpi.color}`}>{kpi.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Per-server breakdown */}
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Per Server Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {data.servers.map(srv => {
                      const srvDone = done.filter(c => c.serverId === srv.id);
                      const sAvg = srvDone.length > 0 ? (srvDone.reduce((s, c) => s + c.queueWaitTime, 0) / srvDone.length) : 0;
                      return (
                        <div key={srv.id} className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
                          <h4 className="text-cyan-400 font-bold mb-2">Server {srv.id}</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between"><span className="text-slate-400">Customers Served</span><span className="font-mono text-white">{srvDone.length}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Avg Wait</span><span className="font-mono text-amber-400">{sAvg.toFixed(1)}s</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Total Busy Time</span><span className="font-mono text-blue-400">{srv.totalBusyTime}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Utilization</span><span className="font-mono text-fuchsia-400">{Math.min(100, (srv.totalBusyTime / Math.max(1, finishTime ?? 1)) * 100).toFixed(1)}%</span></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* All completed customers table */}
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">All Completed Customers ({totalServed})</h3>
                  <div className="rounded-xl border border-slate-700 overflow-hidden">
                    <table className="min-w-full text-xs">
                      <thead className="bg-slate-800 text-slate-300 uppercase tracking-wider">
                        <tr>{['#', 'Server', 'Arrival', 'Tx', 'Queue Wait', 'Start', 'End', 'Total Time'].map(h => (
                          <th key={h} className="px-3 py-2 text-left border-b border-slate-700 font-semibold">{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {done.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                            <td className="px-3 py-1.5 font-mono text-cyan-400">#{c.id}</td>
                            <td className="px-3 py-1.5 text-slate-300">S{c.serverId}</td>
                            <td className="px-3 py-1.5 text-slate-400">{c.arrivalTime}</td>
                            <td className="px-3 py-1.5 text-slate-400">{c.transactionTime}</td>
                            <td className={`px-3 py-1.5 font-mono font-bold ${c.queueWaitTime > 10 ? 'text-red-400' : c.queueWaitTime > 0 ? 'text-amber-400' : 'text-slate-500'}`}>{c.queueWaitTime}s</td>
                            <td className="px-3 py-1.5 text-slate-400">{c.windowOpenTime}</td>
                            <td className="px-3 py-1.5 text-emerald-400">{c.serviceEndTime}</td>
                            <td className="px-3 py-1.5 text-blue-400 font-bold">{c.serviceEndTime - c.arrivalTime}s</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}

export default App;

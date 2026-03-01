import { useState, useEffect, useRef } from "react";
import { buildApiUrl } from "../services/api";

const SEVERITY_STYLES = {
  critical: { bg: "bg-rose-500/15 text-rose-300 border-rose-500/30", dot: "bg-rose-400" },
  high: { bg: "bg-red-500/15 text-red-300 border-red-500/30", dot: "bg-red-400" },
  medium: { bg: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30", dot: "bg-yellow-400" },
  low: { bg: "bg-green-500/15 text-green-300 border-green-500/30", dot: "bg-green-400" },
};

export default function Admin() {
  const [generatorRunning, setGeneratorRunning] = useState(false);
  const [settings, setSettings] = useState({ interval: 3, anomalyRate: 30 });
  const [stats, setStats] = useState({ generated: 0, totalToday: 0, lastIncident: null });
  const [logs, setLogs] = useState([]);
  const statusCheckInterval = useRef(null);

  useEffect(() => {
    checkGeneratorStatus();
    statusCheckInterval.current = setInterval(() => {
      checkGeneratorStatus();
    }, 2000);
    return () => {
      if (statusCheckInterval.current) clearInterval(statusCheckInterval.current);
    };
  }, []);

  const checkGeneratorStatus = async () => {
    try {
      const response = await fetch(buildApiUrl("/admin/generator/status"));
      if (response.ok) {
        const data = await response.json();
        setGeneratorRunning(data.running);
        setStats((prev) => ({ ...prev, generated: data.generated }));
      }
    } catch {
      /* silently ignore */
    }
  };

  const fetchAdminStats = async () => {
    try {
      const response = await fetch(buildApiUrl("/admin/stats"));
      if (response.ok) {
        const data = await response.json();
        setStats((prev) => ({
          ...prev,
          totalToday: data.today_count,
          lastIncident: data.last_incident,
        }));
      }
    } catch {
      /* silently ignore */
    }
  };

  useEffect(() => {
    fetchAdminStats();
    const interval = setInterval(fetchAdminStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const startGenerator = async () => {
    try {
      const response = await fetch(buildApiUrl("/admin/generator/start"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        setGeneratorRunning(true);
        addLog("Generator started in background", "success");
        addLog(`Interval: ${settings.interval}s  —  Anomaly rate: ${settings.anomalyRate}%`, "info");
      } else {
        const data = await response.json();
        addLog(data.message, "warning");
      }
    } catch {
      addLog("Error starting generator", "error");
    }
  };

  const stopGenerator = async () => {
    try {
      const response = await fetch(buildApiUrl("/admin/generator/stop"), { method: "POST" });
      if (response.ok) {
        const data = await response.json();
        setGeneratorRunning(false);
        addLog(data.message, "info");
      }
    } catch {
      addLog("Error stopping generator", "error");
    }
  };

  const generateExact = async (count) => {
    addLog(`Generating ${count} incidents...`, "info");
    try {
      const response = await fetch(buildApiUrl("/admin/generate-test"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count }),
      });
      if (response.ok) {
        const data = await response.json();
        addLog(`${data.generated} incidents generated successfully`, "success");
        fetchAdminStats();
      }
    } catch {
      addLog("Error generating incidents", "error");
    }
  };

  const createCrisis = async () => {
    addLog("Simulating system crisis scenario...", "warning");
    try {
      const response = await fetch(buildApiUrl("/admin/crisis-scenario"), { method: "POST" });
      if (response.ok) {
        const data = await response.json();
        addLog(`Crisis simulated: ${data.critical} critical incidents`, "warning");
        fetchAdminStats();
      }
    } catch {
      addLog("Error creating crisis scenario", "error");
    }
  };

  const clearDatabase = async () => {
    if (!window.confirm("Delete ALL incidents?\n\nThis action is irreversible.")) return;
    try {
      const response = await fetch(buildApiUrl("/admin/clear-database"), { method: "DELETE" });
      if (response.ok) {
        const data = await response.json();
        addLog(`${data.deleted} incidents deleted`, "success");
        setStats({ generated: 0, totalToday: 0, lastIncident: null });
        fetchAdminStats();
      }
    } catch {
      addLog("Error clearing database", "error");
    }
  };

  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString("en-US");
    setLogs((prev) => [{ timestamp, message, type }, ...prev.slice(0, 99)]);
  };

  const LOG_COLORS = {
    success: "text-green-400",
    error: "text-red-400",
    warning: "text-yellow-400",
    info: "text-slate-300",
  };

  const LOG_ICONS = {
    success: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M5 13l4 4L19 7" />
    ),
    error: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M6 18L18 6M6 6l12 12" />
    ),
    warning: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    ),
    info: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  };

  const severity = stats.lastIncident?.severity;
  const severityStyle = SEVERITY_STYLES[severity] || SEVERITY_STYLES.low;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">

      {/* ===== Header ===== */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent mb-1">
          Administration Panel
        </h1>
        <p className="text-slate-400 text-sm">
          Control the system and generate test data &mdash; generator persists across page changes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ===== Left column ===== */}
        <div className="lg:col-span-2 space-y-6">

          {/* Generator control */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-200">Continuous Generator</h2>
              </div>
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
                generatorRunning
                  ? "bg-green-500/10 border-green-500/30 text-green-400"
                  : "bg-slate-800/60 border-slate-700/50 text-slate-500"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${generatorRunning ? "bg-green-400 animate-pulse" : "bg-slate-600"}`} />
                <span>{generatorRunning ? "Running" : "Stopped"}</span>
              </div>
            </div>

            {generatorRunning && (
              <div className="mb-5 p-4 bg-green-500/8 border border-green-500/25 rounded-xl flex items-center space-x-3">
                <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-green-400">
                  Generator is running in the background. You can navigate freely.
                </p>
              </div>
            )}

            {/* Stats counter */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-800/40 rounded-xl p-5 text-center border border-slate-700/30">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Session (backend)</p>
                <p className="text-4xl font-bold text-cyan-400">{stats.generated}</p>
                <p className="text-xs text-slate-600 mt-1">since start</p>
              </div>
              <div className="bg-slate-800/40 rounded-xl p-5 text-center border border-slate-700/30">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total today</p>
                <p className="text-4xl font-bold text-blue-400">{stats.totalToday}</p>
                <p className="text-xs text-slate-600 mt-1">in database</p>
              </div>
            </div>

            {/* Start / Stop buttons */}
            <div className="flex space-x-3 mb-5">
              <button
                onClick={startGenerator}
                disabled={generatorRunning}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-green-500/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Start</span>
              </button>
              <button
                onClick={stopGenerator}
                disabled={!generatorRunning}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-red-500/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                <span>Stop</span>
              </button>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Interval (seconds)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.interval}
                  onChange={(e) => setSettings({ ...settings, interval: parseInt(e.target.value) })}
                  disabled={generatorRunning}
                  className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700/60 rounded-xl text-slate-200 text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/40 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Anomaly rate (%)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.anomalyRate}
                  onChange={(e) =>
                    setSettings({ ...settings, anomalyRate: parseInt(e.target.value) })
                  }
                  disabled={generatorRunning}
                  className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700/60 rounded-xl text-slate-200 text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/40 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-200">Quick Actions</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Generate 10 */}
              <button
                onClick={() => generateExact(10)}
                className="group p-5 bg-gradient-to-br from-blue-600/80 to-indigo-600/80 hover:from-blue-500/90 hover:to-indigo-500/90 rounded-xl text-left transition-all hover:shadow-lg hover:shadow-blue-500/20 border border-blue-500/20"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <svg className="w-7 h-7 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <p className="text-white font-bold text-sm group-hover:translate-x-0.5 transition-transform">Generate 10</p>
                <p className="text-blue-200/70 text-xs mt-0.5">Small test batch</p>
              </button>

              {/* Generate 50 */}
              <button
                onClick={() => generateExact(50)}
                className="group p-5 bg-gradient-to-br from-cyan-600/80 to-blue-600/80 hover:from-cyan-500/90 hover:to-blue-500/90 rounded-xl text-left transition-all hover:shadow-lg hover:shadow-cyan-500/20 border border-cyan-500/20"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <svg className="w-7 h-7 text-cyan-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-white font-bold text-sm group-hover:translate-x-0.5 transition-transform">Generate 50</p>
                <p className="text-cyan-200/70 text-xs mt-0.5">Medium dataset</p>
              </button>

              {/* Crisis scenario */}
              <button
                onClick={createCrisis}
                className="group p-5 bg-gradient-to-br from-red-600/80 to-rose-600/80 hover:from-red-500/90 hover:to-rose-500/90 rounded-xl text-left transition-all hover:shadow-lg hover:shadow-red-500/20 border border-red-500/20"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <svg className="w-7 h-7 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-white font-bold text-sm group-hover:translate-x-0.5 transition-transform">Crisis Scenario</p>
                <p className="text-red-200/70 text-xs mt-0.5">20 critical incidents</p>
              </button>

              {/* Clear DB */}
              <button
                onClick={clearDatabase}
                className="group p-5 bg-gradient-to-br from-slate-700/80 to-slate-600/80 hover:from-slate-600/90 hover:to-slate-500/90 rounded-xl text-left transition-all hover:shadow-lg border border-slate-600/30"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <p className="text-white font-bold text-sm group-hover:translate-x-0.5 transition-transform">Clear Database</p>
                <p className="text-slate-400 text-xs mt-0.5">Delete all incidents</p>
              </button>
            </div>
          </div>

          {/* Last incident */}
          {stats.lastIncident && (
            <div className="bg-slate-900/80 rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-slate-700/50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-200">Last Incident</h2>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-bold border ${severityStyle.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${severityStyle.dot}`} />
                  <span className="uppercase">{severity}</span>
                </span>
                <div>
                  <p className="text-slate-400 text-sm">
                    {new Date(stats.lastIncident.timestamp).toLocaleString("en-US")}
                  </p>
                  {stats.lastIncident.source && (
                    <p className="text-xs text-slate-600 font-mono mt-0.5">{stats.lastIncident.source}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== Right column — Console ===== */}
        <div>
          <div className="bg-slate-900/80 rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                <h2 className="text-base font-bold text-slate-200">Console</h2>
              </div>
              <button
                onClick={() => setLogs([])}
                className="text-xs px-3 py-1.5 bg-slate-800/60 hover:bg-slate-700/60 rounded-lg transition-colors text-slate-400 hover:text-slate-200 border border-slate-700/40"
              >
                Clear
              </button>
            </div>

            <div className="bg-slate-950/70 rounded-xl p-4 h-[700px] overflow-y-auto font-mono text-xs space-y-1.5 border border-slate-800/50">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-2">
                  <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>No events recorded</p>
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-2 border-b border-slate-800/40 pb-1.5 group"
                  >
                    <span className="text-slate-700 w-16 flex-shrink-0 pt-0.5">{log.timestamp}</span>
                    <svg
                      className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${LOG_COLORS[log.type]}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {LOG_ICONS[log.type]}
                    </svg>
                    <span className={LOG_COLORS[log.type]}>{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

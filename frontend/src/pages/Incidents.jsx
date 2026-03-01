import { useState, useEffect } from "react";
import Loader from "../components/Loader";
import LiveIndicator from "../components/LiveIndicator";
import { useLiveIncidents } from "../hooks/useLiveIncidents";

const SEVERITY_CONFIG = {
  critical: { label: "Critical", dot: "bg-rose-400", badge: "bg-rose-500/15 text-rose-300 border-rose-500/40" },
  high:     { label: "High",     dot: "bg-red-400",  badge: "bg-red-500/15  text-red-300  border-red-500/40"  },
  medium:   { label: "Medium",   dot: "bg-yellow-400",badge: "bg-yellow-500/15 text-yellow-300 border-yellow-500/40" },
  low:      { label: "Low",      dot: "bg-green-400", badge: "bg-green-500/15 text-green-300 border-green-500/40" },
};

const SEVERITIES = [
  { value: "all",      label: "All"      },
  { value: "critical", label: "Critical", dot: "bg-rose-400"   },
  { value: "high",     label: "High",     dot: "bg-red-400"    },
  { value: "medium",   label: "Medium",   dot: "bg-yellow-400" },
  { value: "low",      label: "Low",      dot: "bg-green-400"  },
];

const SORT_OPTIONS = [
  { value: "timestamp", label: "Date"     },
  { value: "severity",  label: "Severity" },
  { value: "score",     label: "Score"    },
];

export default function Incidents() {
  const {
    incidents,
    loading,
    error,
    lastUpdate,
    newIncidentsCount,
    refresh,
  } = useLiveIncidents({ refreshInterval: 10000, autoRefresh: true });

  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [filters, setFilters] = useState({
    severity: "all",
    search: "",
    type: "all",
    sortBy: "timestamp",
    sortOrder: "desc",
  });

  const uniqueTypes = [...new Set(incidents.map((inc) => inc.type).filter(Boolean))];

  useEffect(() => {
    let filtered = [...incidents];

    if (filters.severity !== "all") {
      filtered = filtered.filter((inc) => inc.severity === filters.severity);
    }
    if (filters.type !== "all") {
      filtered = filtered.filter((inc) => inc.type === filters.type);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (inc) =>
          inc.message?.toLowerCase().includes(q) ||
          inc.source?.toLowerCase().includes(q) ||
          inc.id?.toString().includes(q)
      );
    }

    filtered.sort((a, b) => {
      const mod = filters.sortOrder === "asc" ? 1 : -1;
      if (filters.sortBy === "timestamp") return mod * (new Date(a.timestamp) - new Date(b.timestamp));
      if (filters.sortBy === "severity") {
        const order = { critical: 4, high: 3, medium: 2, low: 1 };
        return mod * ((order[a.severity] || 0) - (order[b.severity] || 0));
      }
      if (filters.sortBy === "score") return mod * ((a.score || 0) - (b.score || 0));
      return 0;
    });

    setFilteredIncidents(filtered);
  }, [filters, incidents]);

  const formatScore = (score) => {
    if (score === undefined || score === null || Number.isNaN(score)) return "N/A";
    return Number(score).toFixed(4);
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  if (loading && incidents.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (error && incidents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <p className="text-red-400 font-semibold">Unable to load incidents</p>
        <p className="text-slate-500 text-sm">{error}</p>
        <button
          onClick={refresh}
          className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent mb-1">
            Incident Management
          </h1>
          <p className="text-slate-400 text-sm">
            {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <LiveIndicator lastUpdate={lastUpdate} newCount={newIncidentsCount} />
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 text-slate-300 rounded-xl transition-all disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-5 mb-6 shadow-2xl space-y-4">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by ID, message or source…"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-950/50 border border-slate-700/60 rounded-xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ ...filters, search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          {/* Severity pills */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Severity</p>
            <div className="flex items-center bg-slate-950/50 border border-slate-800/60 rounded-xl p-1 gap-0.5">
              {SEVERITIES.map(({ value, label, dot }) => (
                <button
                  key={value}
                  onClick={() => setFilters({ ...filters, severity: value })}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filters.severity === value
                      ? "bg-slate-700 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sort pills */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sort by</p>
            <div className="flex items-center bg-slate-950/50 border border-slate-800/60 rounded-xl p-1 gap-0.5">
              {SORT_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFilters({ ...filters, sortBy: value })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filters.sortBy === value
                      ? "bg-slate-700 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort direction */}
          <button
            onClick={() => setFilters({ ...filters, sortOrder: filters.sortOrder === "asc" ? "desc" : "asc" })}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-950/50 border border-slate-800/60 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {filters.sortOrder === "asc"
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
              }
            </svg>
            <span>{filters.sortOrder === "asc" ? "Ascending" : "Descending"}</span>
          </button>

          {/* Type filter */}
          {uniqueTypes.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Type</p>
              <div className="flex items-center bg-slate-950/50 border border-slate-800/60 rounded-xl p-1 gap-0.5 flex-wrap">
                <button
                  onClick={() => setFilters({ ...filters, type: "all" })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filters.type === "all" ? "bg-slate-700 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  All types
                </button>
                {uniqueTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilters({ ...filters, type })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      filters.type === type ? "bg-slate-700 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Incident list */}
      <div className="space-y-3">
        {filteredIncidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <svg className="w-14 h-14 text-slate-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-lg font-semibold text-slate-500">No incidents found</p>
            <p className="text-sm text-slate-600 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const cfg = SEVERITY_CONFIG[incident.severity] || SEVERITY_CONFIG.low;
            return (
              <div
                key={incident.id}
                onClick={() => setSelectedIncident(incident)}
                className="group bg-slate-900/60 hover:bg-slate-800/60 rounded-xl border border-slate-700/40 hover:border-cyan-500/40 p-5 cursor-pointer transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-slate-600">#{incident.id}</span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                      {incident.type && (
                        <span className="px-2.5 py-0.5 bg-slate-800/60 border border-slate-700/40 rounded-full text-xs font-mono text-slate-400">
                          {incident.type}
                        </span>
                      )}
                      {incident.is_anomaly && (
                        <span className="px-2.5 py-0.5 bg-purple-500/10 border border-purple-500/30 rounded-full text-xs font-semibold text-purple-400">
                          Anomaly
                        </span>
                      )}
                    </div>
                    <p className="text-slate-200 font-medium text-sm leading-snug mb-2 truncate">{incident.message}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                        </svg>
                        {incident.source}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(incident.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {incident.score != null && (
                      <div className="text-right">
                        <p className="text-xs text-slate-600 mb-0.5">Score</p>
                        <p className="text-sm font-bold text-cyan-400 font-mono">{incident.score.toFixed(3)}</p>
                      </div>
                    )}
                    <svg className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail modal */}
      {selectedIncident && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedIncident(null)}
        >
          <div
            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs font-mono text-slate-500 mb-1">Incident #{selectedIncident.id}</p>
                <h2 className="text-2xl font-bold text-slate-100">Incident Details</h2>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {(() => {
                    const cfg = SEVERITY_CONFIG[selectedIncident.severity] || SEVERITY_CONFIG.low;
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    );
                  })()}
                  {selectedIncident.type && (
                    <span className="px-3 py-1 rounded-full text-xs font-mono bg-slate-800/60 border border-slate-700/60 text-slate-300">
                      {selectedIncident.type}
                    </span>
                  )}
                  {selectedIncident.is_anomaly && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/40">
                      Anomaly detected
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-700/50 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Grid details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {[
                { label: "Source",    value: selectedIncident.source    || "N/A" },
                { label: "Timestamp", value: formatDateTime(selectedIncident.timestamp) },
                { label: "ML Score",  value: formatScore(selectedIncident.score), mono: true, highlight: true },
                { label: "Status",    value: selectedIncident.is_anomaly ? "Anomaly" : "Normal" },
              ].map(({ label, value, mono, highlight }) => (
                <div key={label} className="rounded-xl border border-slate-700/60 p-4 bg-slate-900/40">
                  <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">{label}</div>
                  <div className={`text-sm font-semibold ${mono ? "font-mono" : ""} ${highlight ? "text-cyan-400" : "text-slate-200"}`}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Message */}
            <div className="mb-6">
              <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-2">Message</h3>
              <div className="rounded-xl border border-slate-700/60 p-4 bg-slate-900/40 text-sm text-slate-200 leading-relaxed">
                {selectedIncident.message || "N/A"}
              </div>
            </div>

            {/* Sensor values */}
            {selectedIncident.values && typeof selectedIncident.values === "object" && (
              <div className="mb-6">
                <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-2">Sensor Values</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(selectedIncident.values).map(([key, value]) => (
                    <div key={key} className="rounded-xl border border-slate-700/60 p-3 bg-slate-900/40">
                      <div className="text-xs uppercase tracking-wider text-slate-500 mb-0.5">{key}</div>
                      <div className="text-sm font-semibold font-mono text-slate-200">
                        {typeof value === "number" ? value.toFixed(3) : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Raw JSON */}
            <details className="rounded-xl border border-slate-700/60 bg-slate-900/40 overflow-hidden">
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                View raw JSON
              </summary>
              <pre className="px-4 pb-4 pt-2 text-xs text-slate-300 whitespace-pre-wrap overflow-x-auto border-t border-slate-700/40">
                {JSON.stringify(selectedIncident, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}

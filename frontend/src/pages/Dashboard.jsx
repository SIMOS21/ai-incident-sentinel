import { useState, useEffect } from "react";
import Card from "../components/Card";
import Loader from "../components/Loader";
import IncidentTable from "../components/IncidentTable";
import FilterBar from "../components/FilterBar";
import ExportButton from "../components/ExportButton";
import NotificationSystem from "../components/NotificationSystem";
import LiveIndicator from "../components/LiveIndicator";
import { useLiveIncidents } from "../hooks/useLiveIncidents";

const CARD_ICONS = {
  total: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  critical: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  medium: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  low: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  trend: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export default function Dashboard() {
  const { incidents, loading, error, lastUpdate, isLive, newIncidentsCount, refresh } =
    useLiveIncidents({ refreshInterval: 5000, autoRefresh: true });

  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [filters, setFilters] = useState({ severity: "all", search: "", dateRange: "all" });

  useEffect(() => {
    let filtered = [...incidents];
    if (filters.severity !== "all") {
      filtered = filtered.filter((inc) => inc.severity === filters.severity);
    }
    if (filters.search) {
      filtered = filtered.filter(
        (inc) =>
          inc.message?.toLowerCase().includes(filters.search.toLowerCase()) ||
          inc.source?.toLowerCase().includes(filters.search.toLowerCase()) ||
          inc.type?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.dateRange !== "all") {
      const ranges = { today: 1, week: 7, month: 30 };
      const days = ranges[filters.dateRange];
      if (days) {
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        filtered = filtered.filter((inc) => new Date(inc.timestamp) >= cutoff);
      }
    }
    setFilteredIncidents(filtered);
  }, [filters, incidents]);

  if (loading && incidents.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (error && incidents.length === 0) {
    return (
      <div className="text-center mt-20 p-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-red-400 text-lg font-semibold mb-2">Unable to load data</p>
        <p className="text-sm text-slate-500 mb-1">Error: {error}</p>
        <p className="text-slate-500 text-sm mb-6">
          Make sure the <span className="font-bold text-indigo-400">backend</span> is running.
        </p>
        <button
          onClick={refresh}
          className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = {
    total:  filteredIncidents.length,
    high:   filteredIncidents.filter((x) => x.severity === "high" || x.severity === "critical").length,
    medium: filteredIncidents.filter((x) => x.severity === "medium").length,
    low:    filteredIncidents.filter((x) => x.severity === "low").length,
  };

  const last24h   = incidents.filter((inc) => new Date(inc.timestamp) >= new Date(Date.now() - 24 * 60 * 60 * 1000)).length;
  const yesterday = incidents.filter((inc) => {
    const d = new Date(inc.timestamp);
    return d >= new Date(Date.now() - 48 * 60 * 60 * 1000) && d < new Date(Date.now() - 24 * 60 * 60 * 1000);
  }).length;
  const trend = yesterday > 0 ? (((last24h - yesterday) / yesterday) * 100).toFixed(1) : 0;
  const lastHour = incidents.filter((inc) => new Date(inc.timestamp) >= new Date(Date.now() - 60 * 60 * 1000)).length;
  const thisWeek = incidents.filter((inc) => new Date(inc.timestamp) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <NotificationSystem incidents={incidents} />

      {/* ===== Sticky header ===== */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50">
        <div className="px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                Command Center
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Real-time monitoring &mdash; {last24h} incident{last24h !== 1 ? "s" : ""} detected today
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <LiveIndicator lastUpdate={lastUpdate} newCount={newIncidentsCount} />
              <button
                onClick={refresh}
                disabled={loading}
                title="Refresh now"
                className="p-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <ExportButton incidents={filteredIncidents} />
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Filters */}
        <FilterBar filters={filters} setFilters={setFilters} />

        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          <Card title="Total"    value={stats.total}  subtitle={`of ${incidents.length} total`} color="text-cyan-400"   icon={CARD_ICONS.total}    />
          <Card title="Critical" value={stats.high}   subtitle="high severity"   color="text-red-400"    icon={CARD_ICONS.critical} trend={stats.high > 5 ? "Alert" : "Normal"} />
          <Card title="Medium"   value={stats.medium} subtitle="medium severity" color="text-yellow-400" icon={CARD_ICONS.medium}   />
          <Card title="Low"      value={stats.low}    subtitle="low severity"    color="text-green-400"  icon={CARD_ICONS.low}      />
          <Card title="Last 24h" value={last24h}      subtitle="past 24 hours"   color="text-purple-400" icon={CARD_ICONS.trend}    trend={trend > 0 ? `+${trend}%` : `${trend}%`} />
        </div>

        {/* Critical alert banner */}
        {stats.high > 0 && (
          <div className="bg-red-900/15 border-2 border-red-500/40 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-red-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-red-400">
                    {stats.high} critical incident{stats.high !== 1 ? "s" : ""} require immediate attention
                  </h3>
                  <p className="text-slate-400 text-sm">Review and respond to high severity incidents</p>
                </div>
              </div>
              <button
                onClick={() => setFilters({ ...filters, severity: "high" })}
                className="flex-shrink-0 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-red-500/30 text-sm"
              >
                View critical &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Activity summary */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-200">Activity Overview</h3>
            {isLive && (
              <div className="flex items-center space-x-2 text-xs text-green-400">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span>Auto-updating</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Last hour", value: lastHour, color: "text-cyan-400"   },
              { label: "Today",     value: last24h,  color: "text-blue-400"   },
              { label: "This week", value: thisWeek, color: "text-indigo-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/30 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                <p className={`text-3xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Incidents table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-200">Recent Incidents</h2>
            <a
              href="/incidents"
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center space-x-1.5 transition-colors"
            >
              <span>View all incidents</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
          <IncidentTable incidents={filteredIncidents.slice(0, 20)} />
        </div>
      </div>
    </div>
  );
}

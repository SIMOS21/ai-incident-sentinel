import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useLiveIncidents } from "../hooks/useLiveIncidents";

const KpiCard = ({ icon, label, value, accent }) => (
  <div className="bg-slate-900/80 rounded-2xl border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all">
    <div className="flex items-center justify-between mb-3">
      <span className="text-slate-400 text-sm font-medium">{label}</span>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon}
        </svg>
      </div>
    </div>
    <div className="text-3xl font-bold text-slate-100">{value}</div>
  </div>
);

export default function Analytics() {
  const { incidents, loading } = useLiveIncidents(30000);
  const [selectedPeriod, setSelectedPeriod] = useState("30j");

  // Filtrer par période
  const getFilteredIncidents = () => {
    const now = new Date();
    const periods = { "7j": 7, "30j": 30, "90j": 90, all: 36500 };
    const days = periods[selectedPeriod];
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return incidents.filter((inc) => new Date(inc.timestamp) >= cutoff);
  };

  const filteredIncidents = getFilteredIncidents();

  // KPIs
  const totalIncidents = filteredIncidents.length;
  const criticalIncidents = filteredIncidents.filter(
    (i) => i.severity === "high" || i.severity === "critical"
  ).length;
  const anomalies = filteredIncidents.filter((i) => i.is_anomaly).length;
  const avgScore =
    filteredIncidents.length > 0
      ? (
          filteredIncidents.reduce((sum, i) => sum + (i.score || 0), 0) /
          filteredIncidents.length
        ).toFixed(3)
      : 0;

  // 1. Évolution par sévérité
  const getSeverityEvolution = () => {
    const days = {};
    filteredIncidents.forEach((inc) => {
      const date = new Date(inc.timestamp).toLocaleDateString("fr-FR");
      if (!days[date]) days[date] = { date, critical: 0, high: 0, medium: 0, low: 0 };
      days[date][inc.severity]++;
    });
    return Object.values(days).sort((a, b) => {
      const dateA = a.date.split("/").reverse().join("-");
      const dateB = b.date.split("/").reverse().join("-");
      return dateA.localeCompare(dateB);
    });
  };

  // 2. Répartition par type
  const getTypeDistribution = () => {
    const types = {};
    filteredIncidents.forEach((inc) => {
      types[inc.type] = (types[inc.type] || 0) + 1;
    });
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  };

  // 3. Distribution horaire
  const getHourlyDistribution = () => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: `${String(i).padStart(2, "0")}h`,
      count: 0,
    }));
    filteredIncidents.forEach((inc) => {
      const hour = new Date(inc.timestamp).getHours();
      hours[hour].count++;
    });
    return hours;
  };

  // 4. Top sources
  const getTopSources = () => {
    const sources = {};
    filteredIncidents.forEach((inc) => {
      sources[inc.source] = (sources[inc.source] || 0) + 1;
    });
    return Object.entries(sources)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  };

  const SEVERITY_COLORS = {
    critical: "#e11d48",
    high: "#ef4444",
    medium: "#f59e0b",
    low: "#10b981",
  };
  const PIE_COLORS = ["#3b82f6", "#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

  const CHART_STYLE = {
    tooltip: {
      contentStyle: {
        backgroundColor: "#0f172a",
        border: "1px solid #1e293b",
        borderRadius: "10px",
        fontSize: "12px",
        color: "#e2e8f0",
      },
    },
  };

  const periods = [
    { key: "7j", label: "7 days" },
    { key: "30j", label: "30 days" },
    { key: "90j", label: "90 days" },
    { key: "all", label: "All time" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="flex items-center space-x-3 text-slate-400">
          <svg className="animate-spin w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">

      {/* ===== Header ===== */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent mb-1">
            Advanced Analytics
          </h1>
          <p className="text-slate-400 text-sm">
            Detailed reports and trend analysis &middot; {filteredIncidents.length} incidents in period
          </p>
        </div>

        {/* Period selector */}
        <div className="flex items-center bg-slate-900/70 border border-slate-700/50 rounded-xl p-1 space-x-1">
          {periods.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSelectedPeriod(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                selectedPeriod === key
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== KPI Cards ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <KpiCard
          label="Total Incidents"
          value={totalIncidents}
          accent="bg-cyan-500/10 text-cyan-400"
          icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          }
        />
        <KpiCard
          label="Critical"
          value={criticalIncidents}
          accent="bg-red-500/10 text-red-400"
          icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          }
        />
        <KpiCard
          label="Anomalies"
          value={anomalies}
          accent="bg-yellow-500/10 text-yellow-400"
          icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          }
        />
        <KpiCard
          label="Avg ML Score"
          value={avgScore}
          accent="bg-indigo-500/10 text-indigo-400"
          icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          }
        />
      </div>

      {/* ===== Charts ===== */}
      <div className="space-y-6">

        {/* Severity Evolution */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-200">Severity Evolution</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getSeverityEvolution()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 11 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
              <Tooltip {...CHART_STYLE.tooltip} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="critical" stroke={SEVERITY_COLORS.critical} strokeWidth={2} dot={false} name="Critical+" />
              <Line type="monotone" dataKey="high" stroke={SEVERITY_COLORS.high} strokeWidth={2} dot={false} name="High" />
              <Line type="monotone" dataKey="medium" stroke={SEVERITY_COLORS.medium} strokeWidth={2} dot={false} name="Medium" />
              <Line type="monotone" dataKey="low" stroke={SEVERITY_COLORS.low} strokeWidth={2} dot={false} name="Low" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie + Hourly */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Type distribution */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-200">Type Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={getTypeDistribution()}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {getTypeDistribution().map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...CHART_STYLE.tooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Hourly distribution */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-200">Hourly Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={getHourlyDistribution()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#475569" tick={{ fontSize: 10 }} interval={3} />
                <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
                <Tooltip {...CHART_STYLE.tooltip} />
                <Bar dataKey="count" fill="#06b6d4" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Sources */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-200">Top 10 Sources</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getTopSources()} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#475569" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" stroke="#475569" width={100} tick={{ fontSize: 11 }} />
              <Tooltip {...CHART_STYLE.tooltip} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

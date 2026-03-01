const SEVERITIES = [
  { value: "all", label: "All" },
  { value: "critical", label: "Critical", dot: "bg-rose-400" },
  { value: "high",     label: "High",     dot: "bg-red-400"  },
  { value: "medium",   label: "Medium",   dot: "bg-yellow-400" },
  { value: "low",      label: "Low",      dot: "bg-green-400"  },
];

const PERIODS = [
  { value: "all",   label: "All time" },
  { value: "today", label: "Today"    },
  { value: "week",  label: "7 days"   },
  { value: "month", label: "30 days"  },
];

export default function FilterBar({ filters, setFilters }) {
  const hasActive =
    filters.search || filters.severity !== "all" || filters.dateRange !== "all";

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 px-5 py-4 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">

        {/* ===== Search ===== */}
        <div className="relative flex-1 min-w-0">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by source, message or type…"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/40 transition-all text-sm"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ ...filters, search: "" })}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-600 hover:text-slate-300 transition-colors"
              title="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* ===== Severity pill buttons ===== */}
        <div className="flex items-center space-x-1 bg-slate-950/50 border border-slate-800/60 rounded-xl p-1 overflow-x-auto">
          {SEVERITIES.map(({ value, label, dot }) => (
            <button
              key={value}
              onClick={() => setFilters({ ...filters, severity: value })}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                filters.severity === value
                  ? "bg-slate-700 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {dot && (
                <span className={`w-1.5 h-1.5 rounded-full ${dot} flex-shrink-0`} />
              )}
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* ===== Period pill buttons ===== */}
        <div className="flex items-center space-x-1 bg-slate-950/50 border border-slate-800/60 rounded-xl p-1 overflow-x-auto">
          {PERIODS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilters({ ...filters, dateRange: value })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                filters.dateRange === value
                  ? "bg-slate-700 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ===== Reset ===== */}
        {hasActive && (
          <button
            onClick={() => setFilters({ severity: "all", search: "", dateRange: "all" })}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs text-slate-500 hover:text-slate-200 border border-slate-700/50 hover:border-slate-600 rounded-xl transition-all whitespace-nowrap"
            title="Clear all filters"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Active filter hint */}
      {hasActive && (
        <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs text-cyan-400 font-medium">Filters active</span>
          {filters.severity !== "all" && (
            <span className="px-2 py-0.5 bg-slate-800/80 border border-slate-700/50 rounded-md text-xs text-slate-400">
              severity: {filters.severity}
            </span>
          )}
          {filters.dateRange !== "all" && (
            <span className="px-2 py-0.5 bg-slate-800/80 border border-slate-700/50 rounded-md text-xs text-slate-400">
              period: {PERIODS.find(p => p.value === filters.dateRange)?.label}
            </span>
          )}
          {filters.search && (
            <span className="px-2 py-0.5 bg-slate-800/80 border border-slate-700/50 rounded-md text-xs text-slate-400 font-mono truncate max-w-32">
              "{filters.search}"
            </span>
          )}
        </div>
      )}
    </div>
  );
}

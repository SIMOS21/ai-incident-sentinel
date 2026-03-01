import { useState } from "react";

const SEVERITY_CONFIG = {
  critical: { text: "text-rose-400", bg: "bg-rose-950/50", border: "border-rose-900/60", dot: "bg-rose-400" },
  high:     { text: "text-red-400",  bg: "bg-red-950/50",  border: "border-red-900/60",  dot: "bg-red-400"  },
  medium:   { text: "text-yellow-400", bg: "bg-yellow-950/50", border: "border-yellow-900/60", dot: "bg-yellow-400" },
  low:      { text: "text-green-400", bg: "bg-green-950/50", border: "border-green-900/60", dot: "bg-green-400" },
};

const ChevronIcon = ({ direction }) => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d={direction === "asc" ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
    />
  </svg>
);

const SortHeader = ({ label, field, sortBy, sortOrder, onSort }) => (
  <th
    className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-cyan-400 transition-colors select-none"
    onClick={() => onSort(field)}
  >
    <div className="flex items-center space-x-1.5">
      <span>{label}</span>
      <span className={`transition-opacity ${sortBy === field ? "opacity-100 text-cyan-400" : "opacity-0"}`}>
        <ChevronIcon direction={sortOrder} />
      </span>
    </div>
  </th>
);

export default function IncidentTable({ incidents }) {
  const [sortBy, setSortBy] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("desc");

  const sortedIncidents = [...incidents].sort((a, b) => {
    const mod = sortOrder === "asc" ? 1 : -1;
    if (sortBy === "timestamp") return mod * (new Date(a.timestamp) - new Date(b.timestamp));
    if (sortBy === "severity") {
      const order = { critical: 4, high: 3, medium: 2, low: 1 };
      return mod * ((order[a.severity] || 0) - (order[b.severity] || 0));
    }
    if (sortBy === "score") return mod * (a.score - b.score);
    return 0;
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm shadow-2xl overflow-hidden">

      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-700/50 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-200">Recent Incidents</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {incidents.length > 0
              ? `Showing ${Math.min(incidents.length, 20)} of ${incidents.length} incidents`
              : "No incidents to display"}
          </p>
        </div>
        {incidents.length > 0 && (
          <span className="px-2.5 py-1 text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg">
            {incidents.length} total
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/40 bg-slate-950/40">
              <SortHeader
                label="Date & Time"
                field="timestamp"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
              <SortHeader
                label="Severity"
                field="severity"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Message
              </th>
              <SortHeader
                label="Score"
                field="score"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-700/20">
            {sortedIncidents.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                      <svg className="w-7 h-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">No incidents found</p>
                    <p className="text-slate-700 text-xs">Try adjusting your filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedIncidents.map((incident) => {
                const cfg = SEVERITY_CONFIG[incident.severity] || SEVERITY_CONFIG.low;
                const scoreWidth = Math.min(Math.abs(incident.score || 0) * 10, 100);

                return (
                  <tr
                    key={incident.id}
                    className="hover:bg-slate-800/25 transition-colors duration-150 group"
                  >
                    {/* Timestamp */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-300">
                        {new Date(incident.timestamp).toLocaleDateString("fr-FR")}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        {new Date(incident.timestamp).toLocaleTimeString("fr-FR")}
                      </div>
                    </td>

                    {/* Severity */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.text} ${cfg.bg} ${cfg.border} transition-transform duration-200 group-hover:scale-105`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />
                        <span className="capitalize">{incident.severity}</span>
                      </span>
                    </td>

                    {/* Source */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse flex-shrink-0" />
                        <span className="text-slate-300 font-mono text-xs">{incident.source}</span>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-slate-500 bg-slate-800/60 border border-slate-700/40 px-2 py-1 rounded-lg text-xs font-mono">
                        {incident.type}
                      </span>
                    </td>

                    {/* Message */}
                    <td className="px-6 py-4 text-xs text-slate-400 max-w-xs">
                      <div className="truncate">{incident.message}</div>
                    </td>

                    {/* Score */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden"
                          title={`Score: ${incident.score?.toFixed(3)}`}
                        >
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${scoreWidth}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-600 font-mono tabular-nums">
                          {incident.score?.toFixed(2)}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {sortedIncidents.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-700/40 bg-slate-950/30 flex items-center justify-between">
          <div className="text-xs text-slate-600">
            {sortedIncidents.length} incident{sortedIncidents.length !== 1 ? "s" : ""} displayed
          </div>
          <div className="flex items-center space-x-1 text-xs text-slate-600">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <span>Click column headers to sort</span>
          </div>
        </div>
      )}
    </div>
  );
}

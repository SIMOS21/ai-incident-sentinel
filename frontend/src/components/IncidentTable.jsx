import { useState } from "react";

export default function IncidentTable({ incidents }) {
  const [sortBy, setSortBy] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("desc");

  const sortedIncidents = [...incidents].sort((a, b) => {
    const modifier = sortOrder === "asc" ? 1 : -1;
    if (sortBy === "timestamp") {
      return (
        modifier * (new Date(a.timestamp) - new Date(b.timestamp))
      );
    }
    if (sortBy === "severity") {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return (
        modifier *
        ((severityOrder[a.severity] || 0) - (severityOrder[b.severity] || 0))
      );
    }
    if (sortBy === "score") {
      return modifier * (a.score - b.score);
    }
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

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "text-red-400 bg-red-950/50 border-red-900/50";
      case "medium":
        return "text-yellow-400 bg-yellow-950/50 border-yellow-900/50";
      case "low":
        return "text-green-400 bg-green-950/50 border-green-900/50";
      default:
        return "text-slate-400 bg-slate-950/50 border-slate-900/50";
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "high":
        return "🔴";
      case "medium":
        return "🟡";
      case "low":
        return "🟢";
      default:
        return "⚪";
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm shadow-2xl overflow-hidden">
      {/* En-tête */}
      <div className="p-6 border-b border-slate-700/50">
        <h3 className="text-xl font-bold text-slate-200 mb-1">
          📋 Incidents récents
        </h3>
        <p className="text-sm text-slate-500">
          Les {Math.min(incidents.length, 10)} derniers incidents détectés
        </p>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50 bg-slate-950/50">
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-cyan-400 transition-colors"
                onClick={() => handleSort("timestamp")}
              >
                <div className="flex items-center space-x-2">
                  <span>Date & Heure</span>
                  {sortBy === "timestamp" && (
                    <span className="text-cyan-400">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-cyan-400 transition-colors"
                onClick={() => handleSort("severity")}
              >
                <div className="flex items-center space-x-2">
                  <span>Sévérité</span>
                  {sortBy === "severity" && (
                    <span className="text-cyan-400">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Message
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-cyan-400 transition-colors"
                onClick={() => handleSort("score")}
              >
                <div className="flex items-center space-x-2">
                  <span>Score</span>
                  {sortBy === "score" && (
                    <span className="text-cyan-400">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {sortedIncidents.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="text-slate-500">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="text-sm">Aucun incident trouvé</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedIncidents.map((incident) => (
                <tr
                  key={incident.id}
                  className="hover:bg-slate-800/30 transition-colors duration-200 group"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    <div className="font-medium">
                      {new Date(incident.timestamp).toLocaleDateString("fr-FR")}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(incident.timestamp).toLocaleTimeString("fr-FR")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(
                        incident.severity
                      )} transition-all duration-300 group-hover:scale-105`}
                    >
                      <span>{getSeverityIcon(incident.severity)}</span>
                      <span className="capitalize">{incident.severity}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                      <span className="text-slate-300 font-mono text-xs">
                        {incident.source}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="text-slate-400 bg-slate-800/50 px-2 py-1 rounded text-xs font-mono">
                      {incident.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300 max-w-md">
                    <div className="truncate">{incident.message}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden"
                        title={`Score: ${incident.score?.toFixed(2)}`}
                      >
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                          style={{
                            width: `${Math.abs(incident.score || 0) * 10}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 font-mono">
                        {incident.score?.toFixed(2)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination (placeholder) */}
      {sortedIncidents.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-700/50 flex items-center justify-between bg-slate-950/50">
          <div className="text-sm text-slate-500">
            Affichage de {sortedIncidents.length} incidents
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-slate-800/50 text-slate-400 rounded-lg text-sm hover:bg-slate-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              ← Précédent
            </button>
            <button className="px-3 py-1 bg-slate-800/50 text-slate-400 rounded-lg text-sm hover:bg-slate-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Suivant →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
